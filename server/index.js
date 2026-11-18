import "dotenv/config";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { resolveSrv } from "node:dns/promises";
import express from "express";
import MongoStore from "connect-mongo";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Enquiry from "./models/Enquiry.js";
import Facility from "./models/Facility.js";
import Program from "./models/Program.js";
import Gallery from "./models/Gallery.js";
import News from "./models/News.js";
import Contact from "./models/Contact.js";
import defaultFacilities from "../src/facilities.js";
import defaultPrograms from "../src/programs.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.ADMIN_SESSION_SECRET;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminConfigured = Boolean(
  mongoUri && sessionSecret && sessionSecret.length >= 32 && adminUsername && adminPassword,
);
let sessionMiddleware = null;
const allowedGrades = new Set([
  "Nursery–KG",
  "Grades 1–5",
  "Grades 6–8",
  "Grades 9–12",
]);
const allowedTopics = new Set([
  "Admission",
  "Fees and scholarships",
  "School transport",
  "Campus visit",
  "Something else",
]);
const allowedStatuses = new Set(["new", "reviewing", "contacted", "enrolled", "closed"]);
const enquiryStatuses = [...allowedStatuses];

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

function requireDatabase(_request, response, next) {
  if (!isDatabaseReady()) {
    return response.status(503).json({
      error: mongoUri
        ? "Database unavailable. Check the MongoDB connection."
        : "MongoDB is not configured. Copy .env.example to .env and set MONGODB_URI.",
    });
  }
  return next();
}

function requireAdminConfiguration(_request, response, next) {
  if (!adminConfigured || !sessionMiddleware) {
    return response.status(503).json({
      error: "Admin setup is incomplete. Configure MongoDB and admin credentials in .env.",
    });
  }
  return sessionMiddleware(_request, response, next);
}

function initializeAdminSessions() {
  if (!adminConfigured) return;
  sessionMiddleware = session({
    name: "bfa.admin",
    secret: sessionSecret,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: "adminSessions",
      ttl: 60 * 60 * 8,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8,
    },
  });
}

async function initializeDatabase() {
  const database = mongoose.connection.db;
  const requiredCollections = [
    Enquiry.collection.collectionName,
    Program.collection.collectionName,
    Facility.collection.collectionName,
    Gallery.collection.collectionName,
    News.collection.collectionName,
    Contact.collection.collectionName,
    "schoolContentMetadata",
    ...(adminConfigured ? ["adminSessions"] : []),
  ];

  for (const name of requiredCollections) {
    const exists = await database.listCollections({ name }, { nameOnly: true }).hasNext();
    if (!exists) await database.createCollection(name);
  }

  await Enquiry.createIndexes();
  await Promise.all([
    Program.createIndexes(),
    Facility.createIndexes(),
    Gallery.createIndexes(),
    News.createIndexes(),
    Contact.createIndexes(),
  ]);
  await seedSchoolContent(database);
  return requiredCollections;
}

async function seedSchoolContent(database) {
  const metadata = database.collection("schoolContentMetadata");
  const markerId = "initial-school-content-v1";
  await metadata.updateOne(
    { _id: markerId },
    { $setOnInsert: { status: "pending" } },
    { upsert: true },
  );
  const marker = await metadata.findOne({ _id: markerId });
  if (marker.status === "complete") return;

  if (await Program.countDocuments() === 0) {
    await Program.insertMany(defaultPrograms.map(([grades, title, description], index) => ({
      grades,
      title,
      description,
      order: index + 1,
    })));
  }
  if (await Facility.countDocuments() === 0) {
    await Facility.insertMany(defaultFacilities.map(([icon, title, description, detail], index) => ({
      icon,
      title,
      description,
      detail,
      order: index + 1,
    })));
  }
  if (await Gallery.countDocuments() === 0) {
    const defaultGallery = [
      ["academics", "Library reading hour", "#2b4cb3", "#16224a"],
      ["events", "Annual Science Fair", "#8a3fb0", "#3b1d6b"],
      ["academics", "Robotics lab session", "#0b7285", "#0a3a4a"],
      ["sports", "Sports Day relay", "#0f7a5c", "#0a3f43"],
      ["sports", "Football team practice", "#2f8f2f", "#1a4d2a"],
      ["arts", "Art exhibition", "#b4560f", "#6b2d12"],
      ["arts", "Annual concert", "#b02a5b", "#5c1535"],
      ["events", "Grade 12 farewell", "#5a4fcf", "#2a2569"],
    ];
    await Gallery.insertMany(defaultGallery.map(([category, title, colorOne, colorTwo], index) => ({
      category,
      title,
      colorOne,
      colorTwo,
      imageUrl: "",
      order: index + 1,
    })));
  }
  if (await News.countDocuments() === 0) {
    const defaultNews = [
      ["28 OCT 2026", "Grade 10 team wins inter-school quiz", "Our students took first place at the national championship held in Lalitpur."],
      ["15 OCT 2026", "New robotics lab opens", "The lab is open to Grades 6 and above, with weekly coding and building sessions."],
      ["02 OCT 2026", "Admissions open for 2027", "Applications are being accepted for all grades. Seats are limited."],
    ];
    await News.insertMany(defaultNews.map(([date, title, description], index) => ({
      date,
      title,
      description,
      order: index + 1,
    })));
  }
  if (await Contact.countDocuments() === 0) {
    await Contact.create({
      address: "Bright Future Academy, Kathmandu, Bagmati Province, Nepal",
      phone: "9843978644",
      email: "info@brightfuture.edu.np",
      officeHours: "Sunday to Friday, 9:00 AM to 4:00 PM\nClosed on Saturdays and public holidays",
      campusName: "Kathmandu campus",
      campusDescription: "We look forward to welcoming your family.",
    });
  }

  await metadata.updateOne({ _id: markerId }, { $set: { status: "complete" } });
}

function contentFields(body, type) {
  const fields = type === "program"
    ? ["grades", "title", "description"]
    : type === "gallery"
      ? ["category", "title", "colorOne", "colorTwo", "imageUrl"]
      : type === "news"
        ? ["date", "title", "description"]
        : ["icon", "title", "description", "detail"];
  const limits = {
    grades: 60,
    icon: 8,
    title: 100,
    description: 1000,
    date: 30,
    detail: 100,
    category: 20,
    colorOne: 20,
    colorTwo: 20,
    imageUrl: 500,
  };
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Provide valid content fields." };
  }

  const values = {};
  for (const field of fields) {
    if (typeof body[field] !== "string") return { error: `Enter a valid ${field}.` };
    values[field] = body[field].trim();
    if (field === "imageUrl") {
      if (values[field].length > limits[field]) return { error: "Image URL must be 500 characters or fewer." };
    } else if (!values[field] || values[field].length > limits[field]) {
      return { error: `${field} is required and must be ${limits[field]} characters or fewer.` };
    }
  }
  if (type === "gallery") {
    if (!["academics", "sports", "arts", "events"].includes(values.category)) {
      return { error: "Select a valid gallery category." };
    }
  }

  if (body.order !== undefined) {
    const order = Number(body.order);
    if (!Number.isInteger(order) || order < 1 || order > 10000) {
      return { error: "Display order must be a whole number between 1 and 10,000." };
    }
    values.order = order;
  }
  return { values };
}

function registerContentRoutes(routeName, type, Model) {
  app.get(`/api/${routeName}`, requireDatabase, async (_request, response, next) => {
    try {
      const items = await Model.find().sort({ order: 1, createdAt: 1 }).lean();
      return response.json({ items });
    } catch (error) {
      return next(error);
    }
  });

  app.get(`/api/admin/${routeName}`, requireAdmin, async (_request, response, next) => {
    try {
      const items = await Model.find().sort({ order: 1, createdAt: 1 }).lean();
      return response.json({ items });
    } catch (error) {
      return next(error);
    }
  });

  app.post(`/api/admin/${routeName}`, requireAdmin, requireCsrf, async (request, response, next) => {
    const result = contentFields(request.body, type);
    if (result.error) return response.status(400).json({ error: result.error });

    try {
      const values = result.values;
      if (values.order === undefined) {
        const lastItem = await Model.findOne().sort({ order: -1 }).select("order").lean();
        values.order = (lastItem?.order ?? 0) + 1;
      }
      const item = await Model.create(values);
      return response.status(201).json({ item });
    } catch (error) {
      return next(error);
    }
  });

  app.patch(`/api/admin/${routeName}/:id`, requireAdmin, requireCsrf, async (request, response, next) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: `Invalid ${type} ID.` });
    }
    const result = contentFields(request.body, type);
    if (result.error) return response.status(400).json({ error: result.error });
    if (result.values.order === undefined) {
      return response.status(400).json({ error: "Display order is required." });
    }

    try {
      const item = await Model.findByIdAndUpdate(
        request.params.id,
        { $set: result.values },
        { new: true, runValidators: true },
      ).lean();
      if (!item) return response.status(404).json({ error: `${type} not found.` });
      return response.json({ item });
    } catch (error) {
      return next(error);
    }
  });

  app.delete(`/api/admin/${routeName}/:id`, requireAdmin, requireCsrf, async (request, response, next) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: `Invalid ${type} ID.` });
    }
    try {
      const item = await Model.findByIdAndDelete(request.params.id);
      if (!item) return response.status(404).json({ error: `${type} not found.` });
      return response.status(204).end();
    } catch (error) {
      return next(error);
    }
  });
}

function requireAdmin(request, response, next) {
  if (!request.session?.admin) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }
  return next();
}

function requireCsrf(request, response, next) {
  const submittedToken = request.get("x-csrf-token");
  const sessionToken = request.session?.csrfToken;
  if (
    typeof submittedToken !== "string" ||
    typeof sessionToken !== "string" ||
    !timingSafeEqual(
      createHash("sha256").update(submittedToken).digest(),
      createHash("sha256").update(sessionToken).digest(),
    )
  ) {
    return response.status(403).json({ error: "Your session expired. Refresh the page and try again." });
  }
  return next();
}

function constantTimeEqual(actual, expected) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait 15 minutes and try again." },
});

app.get("/api/health", (_request, response) => {
  const database = isDatabaseReady() ? "connected" : "disconnected";
  response.status(database === "connected" ? 200 : 503).json({
    status: database === "connected" ? "ok" : "unavailable",
    database,
    adminConfigured,
  });
});

app.post("/api/enquiries", requireDatabase, async (request, response, next) => {
  const { studentName, grade, phone, topic, email, message = "" } =
    request.body ?? {};
  const fields = { studentName, grade, phone, topic, email, message };

  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== "string") {
      return response.status(400).json({ error: `Invalid ${name}.` });
    }
    fields[name] = value.trim();
  }

  if (!fields.studentName || fields.studentName.length > 120) {
    return response
      .status(400)
      .json({ error: "Student name is required and must be under 120 characters." });
  }
  if (!allowedGrades.has(fields.grade)) {
    return response.status(400).json({ error: "Select a valid grade." });
  }
  if (!fields.phone || fields.phone.length > 40) {
    return response
      .status(400)
      .json({ error: "Phone is required and must be under 40 characters." });
  }
  if (!allowedTopics.has(fields.topic)) {
    return response.status(400).json({ error: "Select a valid enquiry topic." });
  }
  if (
    fields.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
  ) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }
  if (fields.message.length > 2000) {
    return response
      .status(400)
      .json({ error: "Message must be under 2,000 characters." });
  }

  try {
    await Enquiry.create(fields);
    return response.status(201).json({
      message: "Your enquiry has been received. Our admissions office will be in touch.",
    });
  } catch (error) {
    return next(error);
  }
});

app.use("/api/admin", requireDatabase, requireAdminConfiguration);

app.get("/api/admin/session", (request, response) => {
  request.session.csrfToken ??= randomBytes(32).toString("hex");
  response.json({
    authenticated: Boolean(request.session.admin),
    csrfToken: request.session.csrfToken,
    username: request.session.admin ? adminUsername : null,
  });
});

app.post("/api/admin/login", loginLimiter, requireCsrf, (request, response, next) => {
  const { username, password } = request.body ?? {};
  const validCredentials =
    typeof username === "string" &&
    typeof password === "string" &&
    constantTimeEqual(username, adminUsername) &&
    constantTimeEqual(password, adminPassword);

  if (!validCredentials) {
    return response.status(401).json({ error: "Incorrect username or password." });
  }

  request.session.regenerate((error) => {
    if (error) return next(error);
    request.session.admin = true;
    request.session.csrfToken = randomBytes(32).toString("hex");
    request.session.save((saveError) => {
      if (saveError) return next(saveError);
      return response.json({
        authenticated: true,
        csrfToken: request.session.csrfToken,
        username: adminUsername,
      });
    });
  });
});

app.post("/api/admin/logout", requireAdmin, requireCsrf, (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);
    response.clearCookie("bfa.admin", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    return response.json({ authenticated: false });
  });
});

app.get("/api/admin/stats", requireAdmin, async (_request, response, next) => {
  try {
    const [total, grouped] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    const counts = Object.fromEntries(enquiryStatuses.map((status) => [status, 0]));
    for (const item of grouped) counts[item._id] = item.count;
    return response.json({ total, counts });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/enquiries", requireAdmin, async (request, response, next) => {
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = 20;
  const status = typeof request.query.status === "string" ? request.query.status : "all";
  const search = typeof request.query.search === "string" ? request.query.search.trim().slice(0, 100) : "";

  if (status !== "all" && !allowedStatuses.has(status)) {
    return response.status(400).json({ error: "Select a valid enquiry status." });
  }

  const filter = {};
  if (status !== "all") filter.status = status;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["studentName", "email", "phone", "topic"].map((field) => ({
      [field]: { $regex: escapedSearch, $options: "i" },
    }));
  }

  try {
    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Enquiry.countDocuments(filter),
    ]);
    return response.json({
      enquiries: enquiries.map(({ __v, ...enquiry }) => enquiry),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
});

app.patch("/api/admin/enquiries/:id", requireAdmin, requireCsrf, async (request, response, next) => {
  const { status } = request.body ?? {};
  if (!mongoose.isValidObjectId(request.params.id) || !allowedStatuses.has(status)) {
    return response.status(400).json({ error: "Select a valid enquiry and status." });
  }
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      request.params.id,
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean();
    if (!enquiry) return response.status(404).json({ error: "Enquiry not found." });
    const { __v, ...result } = enquiry;
    return response.json({ enquiry: result });
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/admin/enquiries/:id", requireAdmin, requireCsrf, async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ error: "Invalid enquiry ID." });
  }
  try {
    const enquiry = await Enquiry.findByIdAndDelete(request.params.id);
    if (!enquiry) return response.status(404).json({ error: "Enquiry not found." });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

registerContentRoutes("programs", "program", Program);
registerContentRoutes("facilities", "facility", Facility);
registerContentRoutes("gallery", "gallery", Gallery);
registerContentRoutes("news", "news", News);

const defaultContact = {
  address: "Bright Future Academy, Kathmandu, Bagmati Province, Nepal",
  phone: "9843978644",
  email: "info@brightfuture.edu.np",
  officeHours: "Sunday to Friday, 9:00 AM to 4:00 PM\nClosed on Saturdays and public holidays",
  campusName: "Kathmandu campus",
  campusDescription: "We look forward to welcoming your family.",
};

app.get("/api/contact", requireDatabase, async (_request, response, next) => {
  try {
    const contact = await Contact.findOne().sort({ createdAt: 1 }).lean();
    return response.json({ contact: contact ?? defaultContact });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/contact", requireAdmin, async (_request, response, next) => {
  try {
    const contact = await Contact.findOne().sort({ createdAt: 1 }).lean();
    return response.json({ contact: contact ?? defaultContact });
  } catch (error) {
    return next(error);
  }
});

app.put("/api/admin/contact", requireAdmin, requireCsrf, async (request, response, next) => {
  const fields = ["address", "phone", "email", "officeHours", "campusName", "campusDescription"];
  const limits = { address: 300, phone: 40, email: 254, officeHours: 300, campusName: 100, campusDescription: 300 };
  const values = {};

  for (const field of fields) {
    if (typeof request.body?.[field] !== "string") {
      return response.status(400).json({ error: `Enter a valid ${field}.` });
    }
    values[field] = request.body[field].trim();
    if (!values[field] || values[field].length > limits[field]) {
      return response.status(400).json({ error: `${field} is required and must be ${limits[field]} characters or fewer.` });
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }

  try {
    const current = await Contact.findOne();
    const contact = current
      ? await Contact.findByIdAndUpdate(current._id, { $set: values }, { new: true, runValidators: true }).lean()
      : await Contact.create(values);
    return response.json({ contact });
  } catch (error) {
    return next(error);
  }
});

if (process.env.NODE_ENV === "production") {
  const clientBuildDirectory = path.join(projectDirectory, "..", "dist");
  app.use(express.static(clientBuildDirectory));
  app.get("/{*path}", (_request, response, next) => {
    response.sendFile(path.join(clientBuildDirectory, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

app.use((error, _request, response, _next) => {
  console.error("Request failed:", error);
  if (response.headersSent) return;
  const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
  response.status(status).json({
    error: status === 413
      ? "Request is too large."
      : status === 400
        ? "Request body must be valid JSON."
        : "The request could not be completed. Please try again.",
  });
});

app.listen(port, async () => {
  console.log(`Bright Future Academy API listening on http://localhost:${port}`);
  if (!mongoUri) {
    console.error("MongoDB is not configured. Set MONGODB_URI in .env to enable the API and admin panel.");
    return;
  }

  if (mongoUri.startsWith("mongodb+srv://")) {
    try {
      const clusterHostname = new URL(mongoUri).hostname;
      const records = await resolveSrv(`_mongodb._tcp.${clusterHostname}`);
      if (records.length === 0) {
        console.error("MongoDB SRV lookup returned no cluster records. Check the Atlas connection URI.");
        return;
      }
    } catch (error) {
      console.error(`MongoDB SRV lookup failed for the configured Atlas hostname: ${error.message}`);
      return;
    }
  }
  try {
    await mongoose.connect(mongoUri);
    const collections = await initializeDatabase();
    initializeAdminSessions();
    console.log(
      `Connected to MongoDB database "${mongoose.connection.name}" and initialized: ${collections.join(", ")}.`,
    );
    if (!adminConfigured) {
      console.warn("Admin panel is disabled. Configure ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.");
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
});
