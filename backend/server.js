import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5175";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "change-this-admin-token";
const DATA_FILE = path.join(__dirname, "data", "leads.json");

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const clean = (value, max = 3000) => String(value || "").trim().slice(0, max);
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));

async function readLeads() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, "utf8")); }
  catch { return []; }
}

async function saveLead(lead) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const leads = await readLeads();
  leads.unshift(lead);
  await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2));
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: "Unauthorized" });
  next();
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Tenth Avenue Web Design API" }));

app.post("/api/contact", async (req, res) => {
  const lead = {
    id: nanoid(), type: "contact", name: clean(req.body.name, 100),
    email: clean(req.body.email, 160), phone: clean(req.body.phone, 80),
    message: clean(req.body.message, 3000), createdAt: new Date().toISOString(),
  };
  if (!lead.name || !isEmail(lead.email) || !lead.message) {
    return res.status(400).json({ ok: false, error: "Name, valid email and message are required." });
  }
  await saveLead(lead);
  res.status(201).json({ ok: true, message: "Message received.", leadId: lead.id });
});

app.post("/api/quote", async (req, res) => {
  const lead = {
    id: nanoid(), type: "quote", name: clean(req.body.name, 100),
    email: clean(req.body.email, 160), phone: clean(req.body.phone, 80),
    business: clean(req.body.business, 160), details: clean(req.body.details, 3000),
    createdAt: new Date().toISOString(),
  };
  if (!lead.name || !isEmail(lead.email) || !lead.details) {
    return res.status(400).json({ ok: false, error: "Name, valid email and project details are required." });
  }
  await saveLead(lead);
  res.status(201).json({ ok: true, message: "Quote request received.", leadId: lead.id });
});

app.get("/api/leads", requireAdmin, async (_req, res) => {
  const leads = await readLeads();
  res.json({ ok: true, count: leads.length, leads });
});

app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
