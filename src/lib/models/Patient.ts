import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicalHistory {
  date: Date;
  diagnosis: string;
  prescriptions: string[];
  notes: string;
}

export interface IPatient extends Document {
  doctorId: string;
  firstName: string;
  lastName: string;
  nni: string;
  dateOfBirth: Date;
  medicalHistory: IMedicalHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nni: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    medicalHistory: [
      {
        date: { type: Date, required: true },
        diagnosis: { type: String, required: true },
        prescriptions: [{ type: String }],
        notes: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
