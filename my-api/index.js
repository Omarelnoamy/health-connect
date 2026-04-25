require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { env } = require("./src/config/env");
const repo = require("./src/db/patientRepository");
const {
  uploadProfilePhoto: uploadProfilePhotoFile,
  uploadClinicalDocument: uploadClinicalDocumentFile,
  deleteClinicalDocumentFile,
  resolveProfilePhotoUrl,
  resolveClinicalDocumentUrl,
} = require("./src/services/fileStorageService");
const { mapRepoHttpError } = require("./src/lib/repoHttpError");

const app = express();
const PORT = Number(process.env.PORT || 3002);

/// 🛠 Local upload folders are needed for development fallback only.
if (env.nodeEnv !== "production") {
  const clinicalDocsDir = path.join(__dirname, "uploads", "clinicaldocs");
  const profilePhotosDir = path.join(__dirname, "uploads", "profilephotos");
  fs.mkdirSync(clinicalDocsDir, { recursive: true });
  fs.mkdirSync(profilePhotosDir, { recursive: true });
}

// 🎯 Profile photos: any image/* plus HEIC/HEIF often sent as application/octet-stream
const profileImageFileFilter = (req, file, cb) => {
  const name = (file.originalname || "").toLowerCase();
  const mime = file.mimetype || "";
  if (mime.startsWith("image/")) {
    return cb(null, true);
  }
  if (
    mime === "application/octet-stream" &&
    /\.(heic|heif|jpe?g|png|webp|gif|bmp|tiff?)$/i.test(name)
  ) {
    return cb(null, true);
  }
  console.warn("[upload] Rejected profile photo", {
    mimetype: mime,
    originalname: file.originalname,
  });
  cb(new Error("Invalid file type. Only image files are allowed."), false);
};

// 📄 Clinical documents: PDF + images (incl. HEIC/HEIF) + common text/docs + mobile octet-stream
const clinicalDocFileFilter = (req, file, cb) => {
  const name = (file.originalname || "").toLowerCase();
  const mime = file.mimetype || "";
  if (mime === "application/pdf") return cb(null, true);
  if (mime.startsWith("image/")) return cb(null, true);
  if (mime === "text/plain") return cb(null, true);
  if (mime === "application/msword") return cb(null, true);
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return cb(null, true);
  }
  if (
    mime === "application/octet-stream" &&
    /\.(pdf|heic|heif|png|jpe?g|jpeg|webp|txt|doc|docx)$/i.test(name)
  ) {
    return cb(null, true);
  }
  console.warn("[upload] Rejected clinical document", {
    mimetype: mime,
    originalname: file.originalname,
  });
  cb(
    new Error(
      "Unsupported file type for clinical document (allowed: PDF, images including HEIC/HEIF, plain text, and Word documents)."
    ),
    false
  );
};

// 📁 Multer storage for clinical documents
const uploadClinicalDoc = multer({
  storage: multer.memoryStorage(),
  fileFilter: clinicalDocFileFilter,
});

// 📸 Multer storage for profile photos
const uploadProfilePhotoMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: profileImageFileFilter,
});

const mapPatientForResponse = async (patient) => {
  if (!patient) return patient;
  if (!patient.profile_photo_path) return patient;

  const resolvedPhotoPath = await resolveProfilePhotoUrl(patient.profile_photo_path);
  return {
    ...patient,
    profile_photo_path: resolvedPhotoPath || patient.profile_photo_path,
  };
};

const mapClinicalDocForResponse = async (doc) => {
  if (!doc?.file_path) return doc;
  const resolvedPath = await resolveClinicalDocumentUrl(doc.file_path);
  return {
    ...doc,
    file_path: resolvedPath || doc.file_path,
  };
};

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets).flat()) {
    if (iface.family === "IPv4" && !iface.internal) return iface.address;
  }
  return "localhost";
}
app.get("/server-info", (req, res) => {
  res.json({
    host: getLanIp(), // e.g. "10.0.113.116"
    apiPort: env.apiPort,
    appPort: env.appPort,
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "health-connect-api" });
});
// ✅ Enable CORS (merge env list + common local CRA ports for dev)
const localDevCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3003",
];
const allowedOrigins = [
  ...new Set([...localDevCorsOrigins, ...env.corsAllowedOrigins]),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Body parser for JSON
app.use(bodyParser.json());

if (env.nodeEnv !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Dev-only static mounts for local upload fallback.
  app.use(
    "/clinicaldocs",
    express.static(path.join(__dirname, "uploads", "clinicaldocs"))
  );

  app.use(
    "/profilephotos",
    express.static(path.join(__dirname, "uploads", "profilephotos"))
  );
}

// Create new patient with profile photo upload
app.post(
  "/patients",
  uploadProfilePhotoMiddleware.single("profile_photo"),
  async (req, res) => {
    const {
      full_name,
      birth_date,
      gender,
      national_id,
      nationality,
      language_spoken,
      blood_type,
    } = req.body;

    try {
      const uploaded = await uploadProfilePhotoFile({
        file: req.file,
        patientId: "new",
      });

      const newPatient = await repo.createPatient({
        full_name,
        birth_date,
        gender,
        national_id,
        nationality,
        language_spoken,
        blood_type,
        profile_photo_path: uploaded?.storagePath || null,
      });

      res.status(201).json(await mapPatientForResponse(newPatient));
    } catch (err) {
      console.error("Error inserting patient:", err);
      const { status, error } = mapRepoHttpError(err, "Failed to add patient");
      res.status(status).json({ error });
    }
  }
);

app.delete("/patients/:id/clinical_documents/:documentId", async (req, res) => {
  const { id, documentId } = req.params;
  try {
    const docs = await repo.getClinicalDocuments(id);
    const target = docs.find((d) => Number(d.document_id) === Number(documentId));
    if (!target) {
      return res.status(404).json({ error: "Clinical document not found" });
    }

    const deleted = await repo.deleteClinicalDocument(id, documentId);
    if (!deleted) {
      return res.status(404).json({ error: "Clinical document not found" });
    }

    // Best effort: remove file from blob storage after DB row deletion.
    if (target.file_path) {
      await deleteClinicalDocumentFile(target.file_path);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting clinical document:", error);
    const { status, error: msg } = mapRepoHttpError(
      error,
      "Failed to delete clinical document"
    );
    return res.status(status).json({ error: msg });
  }
});

app.post(
  "/patients/:id/photo",
  uploadProfilePhotoMiddleware.single("photo"),
  async (req, res) => {
    const patientId = req.params.id;

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploaded = await uploadProfilePhotoFile({
        file: req.file,
        patientId,
      });

      if (!uploaded?.storagePath) {
        console.error(
          "[POST /patients/:id/photo] No storage path after upload (check BLOB_READ_WRITE_TOKEN / Vercel Blob, or local ./uploads in dev).",
          {
            patientId,
            mimetype: req.file.mimetype,
            size: req.file.size,
            provider: uploaded?.provider,
          }
        );
        return res.status(500).json({ error: "Failed to upload profile photo" });
      }

      await repo.updatePatientPhoto(patientId, uploaded.storagePath);
      res.json({ success: true, profile_photo_path: uploaded.url });
    } catch (error) {
      console.error("Error updating DB with profile photo path:", error);
      const { status, error: msg } = mapRepoHttpError(
        error,
        "Failed to update profile photo"
      );
      res.status(status).json({ error: msg });
    }
  }
);

// Get all patients
app.get("/patients", async (req, res) => {
  try {
    const patients = await repo.getPatients();
    const mappedPatients = await Promise.all(patients.map(mapPatientForResponse));
    res.json(mappedPatients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single patient by ID
app.get("/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await repo.getPatientById(id);
    if (!patient) {
      return res.json({}); // Return empty object instead of 404
    }

    res.json(await mapPatientForResponse(patient));
  } catch (error) {
    console.error("Error fetching patient info:", error);
    res.status(500).json({ error: "Failed to fetch patient info" });
  }
});

// Get full patient profile
app.get("/patients/:id/full", async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await repo.getPatientById(id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const [contactInfo, clinicalDocs, medicalHistory, visits, latestVitals] =
      await Promise.all([
        repo.getLatestContactInfo(id),
        repo.getClinicalDocuments(id),
        repo.getLatestMedicalHistory(id),
        repo.getVisits(id),
        repo.getLatestVitals(id),
      ]);

    const mappedClinicalDocs = await Promise.all(
      clinicalDocs.map(mapClinicalDocForResponse)
    );

    res.json({
      patient: await mapPatientForResponse(patient),
      contact_info: contactInfo || null,
      clinical_documents: mappedClinicalDocs,
      medical_history: medicalHistory ? [medicalHistory] : [],
      visits,
      vitals: latestVitals,
    });
  } catch (err) {
    console.error("Error fetching full patient profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get latest vitals for a patient
app.get("/patients/:id/vitals", async (req, res) => {
  const { id } = req.params;
  try {
    const vitals = await repo.getLatestVitals(id);
    if (!vitals) {
      return res.json({}); // empty object
    }
    res.json(vitals);
  } catch (err) {
    console.error("Error fetching vitals:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Insert new vitals for a patient
app.put("/patients/:id/vitals", async (req, res) => {
  const { id } = req.params;
  const {
    temperature,
    blood_pressure,
    heart_rate,
    height_cm,
    weight_kg,
    notes,
  } = req.body;

  try {
    const savedVitals = await repo.addVitals(id, {
      temperature,
      blood_pressure,
      heart_rate,
      height_cm,
      weight_kg,
      notes,
    });
    res.json(savedVitals);
  } catch (err) {
    console.error("Error saving vitals:", err);
    const { status, error } = mapRepoHttpError(err, "Failed to save vitals");
    res.status(status).json({ error });
  }
});

app.get("/patients/:id/medical_history", async (req, res) => {
  const { id } = req.params;
  try {
    const medicalHistory = await repo.getLatestMedicalHistory(id);
    if (!medicalHistory) {
      return res.json({});
    }
    res.json(medicalHistory);
  } catch (error) {
    console.error("Error fetching medical_history:", error);
    res.status(500).json({ error: "Failed to fetch medical_history" });
  }
});

// Insert new medical history for a patient
app.put("/patients/:id/medical_history", async (req, res) => {
  const { id } = req.params;
  const {
    allergies,
    current_medications,
    past_medical_history,
    surgical_history,
    family_history,
    immunization_records,
    chronic_conditions,
    mental_health_conditions,
  } = req.body;

  try {
    const medicalHistory = await repo.addMedicalHistory(id, {
      allergies,
      current_medications,
      past_medical_history,
      surgical_history,
      family_history,
      immunization_records,
      chronic_conditions,
      mental_health_conditions,
    });
    res.json(medicalHistory);
  } catch (error) {
    console.error("Error inserting medical history:", error);
    const { status, error: msg } = mapRepoHttpError(
      error,
      "Failed to insert medical history"
    );
    res.status(status).json({ error: msg });
  }
});

app.get("/patients/:id/clinical_documents", async (req, res) => {
  const { id } = req.params;
  try {
    const docs = await repo.getClinicalDocuments(id);
    const mappedDocs = await Promise.all(docs.map(mapClinicalDocForResponse));
    return res.json(mappedDocs);
  } catch (error) {
    console.error("Error fetching clinical_documents:", error);
    res.status(500).json({ error: "Failed to fetch clinical_documents" });
  }
});

// POST /patients/:id/clinical-documents
app.post(
  "/patients/:id/clinical_documents",
  uploadClinicalDoc.single("file"),
  async (req, res) => {
    let uploaded = null;
    try {
      const { id } = req.params;
      const { document_name } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      uploaded = await uploadClinicalDocumentFile({
        file,
        patientId: id,
      });

      if (!uploaded?.storagePath) {
        console.error(
          "[POST /patients/:id/clinical_documents] No storage path after upload (check BLOB_READ_WRITE_TOKEN / Vercel Blob, or local ./uploads in dev).",
          {
            patientId: id,
            mimetype: file.mimetype,
            size: file.size,
            provider: uploaded?.provider,
          }
        );
        return res.status(500).json({ error: "Failed to upload clinical document" });
      }

      const newDoc = {
        patient_id: id,
        document_name,
        upload_date: new Date(),
        file_type: file.mimetype,
        file_path: uploaded.storagePath,
      };

      const savedDoc = await repo.addClinicalDocument(newDoc);
      res.status(201).json(await mapClinicalDocForResponse(savedDoc));
    } catch (err) {
      if (uploaded?.storagePath) {
        console.error(
          "[POST /patients/:id/clinical_documents] File was written to disk but metadata insert failed (orphan file on disk; consider deleting or re-linking).",
          {
            storagePath: uploaded.storagePath,
            patientId: req.params.id,
            fileType: req.file?.mimetype,
            fileTypeLength: req.file?.mimetype?.length,
            prismaCode: err?.code,
          }
        );
      }
      console.error(
        "[POST /patients/:id/clinical_documents] pipeline error:",
        err?.message || err,
        err?.meta ? { meta: err.meta } : undefined,
        err?.stack
      );
      const mapped = mapRepoHttpError(
        err,
        "Database error inserting document"
      );
      const code = err && err.code;
      const msg = String(err && err.message ? err.message : "");
      const looksLikeDbError =
        code === "P2002" ||
        code === "FOREIGN_KEY_VIOLATION" ||
        code === "INVALID_PATIENT_ID" ||
        code === "PATIENT_NOT_FOUND" ||
        (typeof code === "string" && code.startsWith("P")) ||
        msg.includes("Unique constraint") ||
        msg.includes("Foreign key constraint") ||
        msg.includes("violates foreign key");

      if (mapped.status !== 500 || looksLikeDbError) {
        if (!res.headersSent) {
          res.status(mapped.status).json({ error: mapped.error });
        }
        return;
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to upload clinical document" });
      }
    }
  }
);

app.get("/patients/:id/contact_info", async (req, res) => {
  const { id } = req.params;
  try {
    const contactInfo = await repo.getLatestContactInfo(id);
    if (!contactInfo) {
      return res.json({}); // empty object
    }
    res.json(contactInfo);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ error: "Failed to fetch contact info" });
  }
});

app.put("/patients/:id/contact_info", async (req, res) => {
  const { id } = req.params;
  const {
    phone,
    email,
    address,
    emergency_name,
    emergency_relation,
    emergency_phone,
  } = req.body;

  try {
    const savedContact = await repo.addContactInfo(id, {
      phone,
      email,
      address,
      emergency_name,
      emergency_relation,
      emergency_phone,
    });

    res.json(savedContact);
  } catch (error) {
    console.error("Error saving contact info:", error);
    const { status, error: msg } = mapRepoHttpError(
      error,
      "Failed to save contact info"
    );
    res.status(status).json({ error: msg });
  }
});

// Get all visit history for a patient
app.get("/patients/:id/visits", async (req, res) => {
  const { id } = req.params;
  try {
    const visits = await repo.getVisits(id);
    return res.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ error: "Failed to fetch visits" });
  }
});

// Insert new visit history for a patient
app.put("/patients/:id/visits", async (req, res) => {
  const { id } = req.params;
  const { visit_date, doctor_name, reason, diagnosis, treatment } = req.body;

  try {
    const savedVisit = await repo.addVisit(id, {
      visit_date,
      doctor_name,
      reason,
      diagnosis,
      treatment,
    });
    res.json(savedVisit);
  } catch (error) {
    console.error("Error inserting visit history:", error);
    const { status, error: msg } = mapRepoHttpError(
      error,
      "Failed to insert visit history"
    );
    res.status(status).json({ error: msg });
  }
});

// Multer / upload validation errors (runs after routes that call next(err))
app.use((err, req, res, next) => {
  if (!err) return next();
  const msg = String(err.message || "");
  const isUploadReject =
    err.name === "MulterError" ||
    msg.includes("Invalid file type") ||
    msg.includes("Unsupported file type for clinical document");
  if (isUploadReject) {
    console.error("[upload]", err.name || "Error", msg, { path: req.path });
    return res.status(400).json({ error: msg || "Invalid upload" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (!err) return next();
  console.error("[unhandled]", err?.message || err, err?.stack);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export app for serverless runtimes (e.g. Vercel).
module.exports = app;

// Start local dev server only when this file is executed directly.
// In serverless runtimes, this module is imported and should NOT call listen().
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${PORT}`);
    if (env.blobReadWriteToken) {
      console.log("[storage] Vercel Blob uploads enabled.");
    } else if (env.nodeEnv !== "production") {
      console.log(
        "[storage] Using local ./uploads for uploads (set BLOB_READ_WRITE_TOKEN for Blob)."
      );
    }
  });
}
