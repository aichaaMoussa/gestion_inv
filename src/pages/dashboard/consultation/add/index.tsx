"use client";
import React, { useState } from 'react';
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
import { useQuery } from 'react-query';

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

const AddConsultationPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    patientId: '',
    dateConsultation: '',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    dateRendezVous: '',
  });

  const { data, isLoading: isLoadingPatients } = useQuery(['patients'], async () => {
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

  const patients = data?.roles || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, patientId: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await axios.get("/api/auth/session");
      const userId = session.data?.user?.id;

      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const consultationData = {
        ...formData,
        doctorId: userId,
        dateConsultation: new Date(formData.dateConsultation),
        dateRendezVous: formData.dateRendezVous ? new Date(formData.dateRendezVous) : null,
      };

      await axios.post('/api/consultations', consultationData);
      toast.success('Consultation ajoutée avec succès');
      router.push('/dashboard/consultation');
    } catch (error: unknown) {
      console.error('Erreur lors de l\'ajout de la consultation:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout de la consultation');
      } else {
        toast.error('Une erreur inattendue est survenue');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ajouter une Consultation
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                name="patientId"
                value={formData.patientId}
                onChange={handleSelectChange}
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
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
            </Box>

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

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
                Ajouter
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddConsultationPage;
