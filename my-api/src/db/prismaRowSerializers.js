const toIso = (value) => {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
};

const toDecimalNumber = (value) => {
  if (value == null) return null;
  if (typeof value === "object" && value !== null && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toPatientRow = (p) => {
  if (!p) return null;
  return {
    patient_id: p.patientId,
    full_name: p.fullName ?? null,
    birth_date: toIso(p.birthDate),
    gender: p.gender ?? null,
    national_id: p.nationalId ?? null,
    nationality: p.nationality ?? null,
    language_spoken: p.languageSpoken ?? null,
    blood_type: p.bloodType ?? null,
    profile_photo_path: p.profilePhotoPath ?? null,
  };
};

const toContactInfoRow = (c) => {
  if (!c) return null;
  return {
    contact_id: c.contactId,
    patient_id: c.patientId ?? null,
    phone: c.phone ?? null,
    email: c.email ?? null,
    address: c.address ?? null,
    emergency_name: c.emergencyName ?? null,
    emergency_relation: c.emergencyRelation ?? null,
    emergency_phone: c.emergencyPhone ?? null,
    created_at: toIso(c.createdAt),
  };
};

const toMedicalHistoryRow = (m) => {
  if (!m) return null;
  return {
    history_id: m.historyId,
    patient_id: m.patientId ?? null,
    allergies: m.allergies ?? null,
    current_medications: m.currentMedications ?? null,
    past_medical_history: m.pastMedicalHistory ?? null,
    surgical_history: m.surgicalHistory ?? null,
    family_history: m.familyHistory ?? null,
    immunization_records: m.immunizationRecords ?? null,
    chronic_conditions: m.chronicConditions ?? null,
    mental_health_conditions: m.mentalHealthConditions ?? null,
    created_at: toIso(m.createdAt),
  };
};

const toVitalRow = (v) => {
  if (!v) return null;
  return {
    vital_id: v.vitalId,
    patient_id: v.patientId ?? null,
    temperature: toDecimalNumber(v.temperature),
    blood_pressure: v.bloodPressure ?? null,
    heart_rate: v.heartRate ?? null,
    height_cm: toDecimalNumber(v.heightCm),
    weight_kg: toDecimalNumber(v.weightKg),
    notes: v.notes ?? null,
    recorded_at: toIso(v.recordedAt),
  };
};

const toVisitRow = (v) => {
  if (!v) return null;
  return {
    visit_id: v.visitId,
    patient_id: v.patientId ?? null,
    visit_date: toIso(v.visitDate),
    doctor_name: v.doctorName ?? null,
    reason: v.reason ?? null,
    diagnosis: v.diagnosis ?? null,
    treatment: v.treatment ?? null,
  };
};

const toClinicalDocumentRow = (d) => {
  if (!d) return null;
  return {
    document_id: d.documentId,
    patient_id: d.patientId ?? null,
    document_name: d.documentName ?? null,
    upload_date: toIso(d.uploadDate),
    file_type: d.fileType ?? null,
    file_path: d.filePath ?? null,
  };
};

module.exports = {
  toPatientRow,
  toContactInfoRow,
  toMedicalHistoryRow,
  toVitalRow,
  toVisitRow,
  toClinicalDocumentRow,
};
