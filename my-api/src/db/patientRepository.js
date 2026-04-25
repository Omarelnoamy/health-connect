const { Prisma } = require("@prisma/client");
const { prisma } = require("./prismaClient");
const serializers = require("./prismaRowSerializers");

const parsePatientId = (patientId) => {
  const n = Number(patientId);
  return Number.isInteger(n) ? n : null;
};

/** Trim string fields; empty string -> null (avoids accidental "" duplicates on unique columns). */
const normalizeOptionalString = (value) => {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
};

const parseBirthDate = (value) => {
  if (value == null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** For visit_date / timestamps: accept Date instance or parseable string. */
const parseOptionalDateTime = (value) => {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Empty / whitespace-only -> null; otherwise parse number or null if invalid. */
const parseOptionalDecimal = (value) => {
  if (value == null) return null;
  const s = String(value).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const parseOptionalInt = (value) => {
  if (value == null) return null;
  const s = String(value).trim();
  if (s === "") return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};

const handlePrismaWriteErrors = (err, context) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      const fk = new Error("Invalid patient reference");
      fk.code = "FOREIGN_KEY_VIOLATION";
      fk.prismaCode = err.code;
      fk.context = context;
      throw fk;
    }
  }
  throw err;
};

/** WRITE: Prisma (Neon) + same API row shape as reads */
const createPatient = async (payload) => {
  try {
    const row = await prisma.patient.create({
      data: {
        fullName: normalizeOptionalString(payload.full_name),
        birthDate: parseBirthDate(payload.birth_date),
        gender: normalizeOptionalString(payload.gender),
        nationalId: normalizeOptionalString(payload.national_id),
        nationality: normalizeOptionalString(payload.nationality),
        languageSpoken: normalizeOptionalString(payload.language_spoken),
        bloodType: normalizeOptionalString(payload.blood_type),
        profilePhotoPath:
          payload.profile_photo_path == null
            ? null
            : normalizeOptionalString(payload.profile_photo_path),
      },
    });
    return serializers.toPatientRow(row);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = err.meta?.target;
      const fields = Array.isArray(target) ? target : target != null ? [target] : [];
      const dup = new Error(
        fields.includes("national_id") || fields.includes("patients_national_id_key")
          ? "national_id already exists"
          : "Unique constraint failed"
      );
      dup.code = "P2002";
      dup.prismaCode = err.code;
      dup.meta = err.meta;
      throw dup;
    }
    throw err;
  }
};

/** WRITE: Prisma (Neon) + same API row shape as reads */
const updatePatientPhoto = async (patientId, profilePhotoPath) => {
  const id = parsePatientId(patientId);
  if (id == null) {
    const err = new Error("Invalid patient id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }
  try {
    const row = await prisma.patient.update({
      where: { patientId: id },
      data: {
        profilePhotoPath: profilePhotoPath == null ? null : String(profilePhotoPath),
      },
    });
    return serializers.toPatientRow(row);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      const notFound = new Error("Patient not found");
      notFound.code = "PATIENT_NOT_FOUND";
      notFound.prismaCode = err.code;
      throw notFound;
    }
    throw err;
  }
};

/** READ: Prisma + snake_case serializers (Neon/Postgres source of truth) */
const getPatients = async () => {
  const rows = await prisma.patient.findMany({
    orderBy: { patientId: "asc" },
  });
  return rows.map(serializers.toPatientRow);
};

/** READ */
const getPatientById = async (patientId) => {
  const id = parsePatientId(patientId);
  if (id == null) return null;
  const row = await prisma.patient.findUnique({ where: { patientId: id } });
  return serializers.toPatientRow(row);
};

/** READ */
const getLatestVitals = async (patientId) => {
  const id = parsePatientId(patientId);
  if (id == null) return null;
  const row = await prisma.vital.findFirst({
    where: { patientId: id },
    orderBy: [
      { recordedAt: "desc" },
      { vitalId: "desc" },
    ],
  });
  return serializers.toVitalRow(row);
};

/** WRITE: Prisma (Neon) + snake_case API row */
const addVitals = async (patientId, payload) => {
  const id = parsePatientId(patientId);
  if (id == null) {
    const err = new Error("Invalid patient id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }
  try {
    const row = await prisma.vital.create({
      data: {
        patientId: id,
        temperature: parseOptionalDecimal(payload.temperature),
        bloodPressure: normalizeOptionalString(payload.blood_pressure),
        heartRate: parseOptionalInt(payload.heart_rate),
        heightCm: parseOptionalDecimal(payload.height_cm),
        weightKg: parseOptionalDecimal(payload.weight_kg),
        notes: normalizeOptionalString(payload.notes),
        recordedAt: new Date(),
      },
    });
    return serializers.toVitalRow(row);
  } catch (err) {
    handlePrismaWriteErrors(err, "addVitals");
  }
};

/** READ */
const getLatestMedicalHistory = async (patientId) => {
  const id = parsePatientId(patientId);
  if (id == null) return null;
  const row = await prisma.medicalHistory.findFirst({
    where: { patientId: id },
    orderBy: [
      { createdAt: "desc" },
      { historyId: "desc" },
    ],
  });
  return serializers.toMedicalHistoryRow(row);
};

/** WRITE: Prisma (Neon) + snake_case API row */
const addMedicalHistory = async (patientId, payload) => {
  const id = parsePatientId(patientId);
  if (id == null) {
    const err = new Error("Invalid patient id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }
  try {
    const row = await prisma.medicalHistory.create({
      data: {
        patientId: id,
        allergies: normalizeOptionalString(payload.allergies),
        currentMedications: normalizeOptionalString(payload.current_medications),
        pastMedicalHistory: normalizeOptionalString(payload.past_medical_history),
        surgicalHistory: normalizeOptionalString(payload.surgical_history),
        familyHistory: normalizeOptionalString(payload.family_history),
        immunizationRecords: normalizeOptionalString(payload.immunization_records),
        chronicConditions: normalizeOptionalString(payload.chronic_conditions),
        mentalHealthConditions: normalizeOptionalString(payload.mental_health_conditions),
      },
    });
    return serializers.toMedicalHistoryRow(row);
  } catch (err) {
    handlePrismaWriteErrors(err, "addMedicalHistory");
  }
};

/** READ */
const getClinicalDocuments = async (patientId) => {
  const id = parsePatientId(patientId);
  if (id == null) return [];
  const rows = await prisma.clinicalDocument.findMany({
    where: { patientId: id },
    orderBy: { uploadDate: "desc" },
  });
  return rows.map(serializers.toClinicalDocumentRow);
};

/** WRITE: Prisma (Neon) only — storage upload stays in Express route */
const addClinicalDocument = async (payload) => {
  const pid = parsePatientId(payload.patient_id);
  if (pid == null) {
    const err = new Error("Invalid patient id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }
  const uploadDate =
    payload.upload_date instanceof Date && !Number.isNaN(payload.upload_date.getTime())
      ? payload.upload_date
      : parseOptionalDateTime(payload.upload_date) ?? new Date();
  try {
    const row = await prisma.clinicalDocument.create({
      data: {
        patientId: pid,
        documentName: normalizeOptionalString(payload.document_name),
        uploadDate,
        fileType: normalizeOptionalString(payload.file_type),
        filePath:
          payload.file_path == null
            ? null
            : String(payload.file_path).trim() === ""
              ? null
              : String(payload.file_path),
      },
    });
    return serializers.toClinicalDocumentRow(row);
  } catch (err) {
    console.error("[addClinicalDocument] insert failed:", {
      message: err?.message,
      code: err?.code,
      fileTypeLength: payload.file_type != null ? String(payload.file_type).length : null,
    });
    handlePrismaWriteErrors(err, "addClinicalDocument");
  }
};

/** DELETE: remove a clinical document for a patient */
const deleteClinicalDocument = async (patientId, documentId) => {
  const pid = parsePatientId(patientId);
  const did = Number(documentId);
  if (pid == null || !Number.isInteger(did) || did <= 0) {
    const err = new Error("Invalid patient or document id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }

  const existing = await prisma.clinicalDocument.findFirst({
    where: { patientId: pid, documentId: did },
  });
  if (!existing) {
    return null;
  }

  try {
    const row = await prisma.clinicalDocument.delete({
      where: { documentId: did },
    });
    return serializers.toClinicalDocumentRow(row);
  } catch (err) {
    handlePrismaWriteErrors(err, "deleteClinicalDocument");
  }
};

/** READ */
const getLatestContactInfo = async (patientId) => {
  const id = parsePatientId(patientId);
  if (id == null) return null;
  const row = await prisma.contactInfo.findFirst({
    where: { patientId: id },
    orderBy: [
      { createdAt: "desc" },
      { contactId: "desc" },
    ],
  });
  return serializers.toContactInfoRow(row);
};

/** WRITE: Prisma (Neon) + snake_case API row */
const addContactInfo = async (patientId, payload) => {
  const id = parsePatientId(patientId);
  if (id == null) {
    const err = new Error("Invalid patient id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }
  try {
    const row = await prisma.contactInfo.create({
      data: {
        patientId: id,
        phone: normalizeOptionalString(payload.phone),
        email: normalizeOptionalString(payload.email),
        address: normalizeOptionalString(payload.address),
        emergencyName: normalizeOptionalString(payload.emergency_name),
        emergencyRelation: normalizeOptionalString(payload.emergency_relation),
        emergencyPhone: normalizeOptionalString(payload.emergency_phone),
      },
    });
    return serializers.toContactInfoRow(row);
  } catch (err) {
    handlePrismaWriteErrors(err, "addContactInfo");
  }
};

/** READ */
const getVisits = async (patientId) => {
  const id = parsePatientId(patientId);
  if (id == null) return [];
  const rows = await prisma.visit.findMany({
    where: { patientId: id },
    orderBy: { visitDate: "desc" },
  });
  return rows.map(serializers.toVisitRow);
};

/** WRITE: Prisma (Neon) + snake_case API row */
const addVisit = async (patientId, payload) => {
  const id = parsePatientId(patientId);
  if (id == null) {
    const err = new Error("Invalid patient id");
    err.code = "INVALID_PATIENT_ID";
    throw err;
  }
  try {
    const row = await prisma.visit.create({
      data: {
        patientId: id,
        visitDate: parseOptionalDateTime(payload.visit_date),
        doctorName: normalizeOptionalString(payload.doctor_name),
        reason: normalizeOptionalString(payload.reason),
        diagnosis: normalizeOptionalString(payload.diagnosis),
        treatment: normalizeOptionalString(payload.treatment),
      },
    });
    return serializers.toVisitRow(row);
  } catch (err) {
    handlePrismaWriteErrors(err, "addVisit");
  }
};

module.exports = {
  createPatient,
  updatePatientPhoto,
  getPatients,
  getPatientById,
  getLatestVitals,
  addVitals,
  getLatestMedicalHistory,
  addMedicalHistory,
  getClinicalDocuments,
  addClinicalDocument,
  deleteClinicalDocument,
  getLatestContactInfo,
  addContactInfo,
  getVisits,
  addVisit,
};
