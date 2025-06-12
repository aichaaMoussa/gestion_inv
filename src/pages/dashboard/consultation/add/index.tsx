"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useQuery, useMutation } from 'react-query';
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/Input";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  nni: string;
  medicalHistory: string;
  telephone: string;
  adress: string;
  age: string;
}

const ConsultationSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  date: z.string(),
  description: z.string().min(1, "La description est requise"),
  diagnosis: z.string().min(1, "Le diagnostic est requis"),
  prescription: z.string().min(1, "La prescription est requise"),
});

type ConsultationFormData = z.infer<typeof ConsultationSchema>;

const AddConsultationPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(ConsultationSchema),
  });

  const { data: session } = useSession();
  const { patientId } = router.query;

  const { data, isLoading: isLoadingPatients } = useQuery(['patients'], async () => {
    try {
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await axios.get("/api/patients", {
        params: { user: userId },
      });
      console.log("Patients récupérés:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      toast.error("Erreur lors de la récupération des patients");
      return { roles: [] };
    }
  });

  const patients = data?.roles || [];

  useEffect(() => {
    if (session?.user?.id) {
      setValue("doctorId", session.user.id);
    }
    if (patientId) {
      setValue("patientId", patientId as string);
    }
    // Set today's date as default
    setValue("date", new Date().toISOString().split("T")[0]);
  }, [session, patientId, setValue]);

  const { mutate } = useMutation({
    mutationKey: ["consultation"],
    mutationFn: async (data: ConsultationFormData) => {
      return axios.post("/api/consultations", data);
    },
    onSuccess: () => {
      toast.success("Consultation ajoutée avec succès !");
      router.back();
    },
    onError: (error: any) => {
      console.error("Erreur lors de l'ajout de la consultation :", error);
      const errorMessage = error.response?.data?.message || "Échec de l'ajout de la consultation. Veuillez réessayer.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Nouvelle Consultation</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date de consultation
            </label>
            <input
              type="date"
              id="date"
              {...register("date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
              Diagnostic
            </label>
            <textarea
              id="diagnosis"
              {...register("diagnosis")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
            {errors.diagnosis && (
              <p className="text-red-500 text-sm">{errors.diagnosis.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="prescription" className="block text-sm font-medium text-gray-700">
              Prescription
            </label>
            <textarea
              id="prescription"
              {...register("prescription")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
            {errors.prescription && (
              <p className="text-red-500 text-sm">{errors.prescription.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConsultationPage;
