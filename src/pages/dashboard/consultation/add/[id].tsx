"use client";
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';

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

const UpdateConsultationPage: React.FC = () => {
  const queryClient = new QueryClient();
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    patientId: '',
    dateConsultation: '',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    dateRendezVous: '',
  });

  // Récupération des patients
  const { data: patientsData, isLoading: isLoadingPatients } = useQuery(['patients'], async () => {
    try {
      const session = await axios.get("/api/auth/session");
      const userId = session.data?.user?.id;

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

  // Récupération des données de la consultation
  const { data: consultationData, isLoading: isLoadingConsultation } = useQuery(
    ['consultation', id],
    async () => {
      if (!id) return null;
      try {
        const response = await axios.get(`/api/consultations/${id}`);
        console.log("Consultation récupérée:", response.data);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération de la consultation:", error);
        toast.error("Erreur lors de la récupération de la consultation");
        return null;
      }
    },
    {
      enabled: !!id,
    }
  );

  // Mise à jour du formulaire lorsque les données de la consultation sont récupérées
  useEffect(() => {
    if (consultationData) {
      setFormData({
        patientId: consultationData.patientId || '',
        dateConsultation: consultationData.dateConsultation 
          ? new Date(consultationData.dateConsultation).toISOString().slice(0, 16) 
          : '',
        symptoms: consultationData.symptoms || '',
        diagnosis: consultationData.diagnosis || '',
        prescription: consultationData.prescription || '',
        notes: consultationData.notes || '',
        dateRendezVous: consultationData.dateRendezVous 
          ? new Date(consultationData.dateRendezVous).toISOString().slice(0, 16) 
          : '',
      });
    }
  }, [consultationData]);

  const patients = patientsData?.roles || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await axios.get("/api/auth/session");
      const userId = session.data?.user?.id;

      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const consultationUpdateData = {
        ...formData,
        doctorId: userId,
        dateConsultation: new Date(formData.dateConsultation),
        dateRendezVous: formData.dateRendezVous ? new Date(formData.dateRendezVous) : null,
      };

      await axios.put(`/api/consultations/${id}`, consultationUpdateData);
      toast.success('Consultation mise à jour avec succès');
      router.push('/dashboard/consultation');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la consultation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour de la consultation');
    }
  };

  if (isLoadingConsultation) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-lg">Chargement des données de la consultation...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Modifier la Consultation</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value as string }))}
                  required
                  disabled={isLoadingPatients}
                >
                  {isLoadingPatients ? (
                    <MenuItem value="" disabled>
                      Chargement des patients...
                    </MenuItem>
                  ) : patients && patients.length > 0 ? (
                    patients.map((patient: Patient) => (
                      <MenuItem key={patient._id} value={patient._id}>
                        {`${patient.firstName} ${patient.lastName} - ${patient.telephone}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      Aucun patient trouvé
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <TextField
                  fullWidth
                  label="Date de Consultation"
                  type="datetime-local"
                  name="dateConsultation"
                  value={formData.dateConsultation}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
              <div>
                <TextField
                  fullWidth
                  label="Date de Rendez-vous"
                  type="datetime-local"
                  name="dateRendezVous"
                  value={formData.dateRendezVous}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <TextField
                fullWidth
                label="Symptômes"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </div>

            <div className="mb-4">
              <TextField
                fullWidth
                label="Diagnostic"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </div>

            <div className="mb-4">
              <TextField
                fullWidth
                label="Prescription"
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </div>

            <div className="mb-4">
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outlined"
                onClick={() => router.push('/dashboard/consultation')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Mettre à jour
              </Button>
            </div>
          </form>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default UpdateConsultationPage;
