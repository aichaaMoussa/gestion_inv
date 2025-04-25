import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Print as PrintIcon, Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  nni: string;
  medicalHistory: string;
  telephone: string;
  adress: string;
  age: string;
  createdAt: string;
  updatedAt: string;
}

interface Consultation {
  _id: string;
  patient: Patient;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ConsultationPage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data, isLoading, error } = useQuery(['consultations'], async () => {
    try {
      const session = await axios.get("/api/auth/session"); // Récupérer la session
      const userId = session.data?.user?.id; // Extraire l'ID de l'utilisateur connecté

      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await axios.get("/api/consultations", {
        params: { user: userId }, // Envoyer l'ID de l'utilisateur
      });
      console.log("dataconsultation",response.data)
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/login');
        return;
      }
      throw error;
    }
  });

  const filteredConsultations = data?.consultations?.filter(
    (consultation: Consultation) =>
      (consultation?.patient?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (consultation?.patient?.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (consultation?.patient?.telephone || '').includes(searchTerm)
  ) || [];

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setOpenDialog(true);
  };

  const handleEditConsultation = (consultationId: string) => {
    router.push(`/dashboard/consultation/add/${consultationId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    toast.error('Erreur lors de la récupération des consultations');
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Erreur lors de la récupération des consultations</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Consultations
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher par nom ou numéro de téléphone"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom du Patient</TableCell>
              <TableCell>Numéro de Téléphone</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConsultations.map((consultation: Consultation) => (
              <TableRow key={consultation._id}>
                <TableCell>{`${consultation.patient.firstName} ${consultation.patient.lastName}`}</TableCell>
                <TableCell>{consultation.patient.telephone}</TableCell>
                <TableCell>{consultation.createdAt}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewConsultation(consultation)}
                      size="small"
                      title="Voir les détails"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleEditConsultation(consultation._id)}
                      size="small"
                      title="Modifier la consultation"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails de la Consultation</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {selectedConsultation && (
              <>
                <Typography variant="h6" gutterBottom>
                  Informations du Patient
                </Typography>
                <Typography>Nom: {`${selectedConsultation.patient.firstName} ${selectedConsultation.patient.lastName}`}</Typography>
                <Typography>NNI: {selectedConsultation.patient.nni}</Typography>
                <Typography>Numéro de téléphone: {selectedConsultation.patient.telephone}</Typography>
                <Typography>Adresse: {selectedConsultation.patient.adress}</Typography>
                <Typography>Âge: {selectedConsultation.patient.age}</Typography>
                <Typography>Antécédents médicaux: {selectedConsultation.patient.medicalHistory}</Typography>
                <Typography>Date: {selectedConsultation.date}</Typography>

                <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                  Détails de la Consultation
                </Typography>
                <Typography>Symptômes: {selectedConsultation.symptoms}</Typography>
                <Typography>Diagnostic: {selectedConsultation.diagnosis}</Typography>
                <Typography>Prescription: {selectedConsultation.prescription}</Typography>
                <Typography>Notes: {selectedConsultation.notes}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.print()} startIcon={<PrintIcon />}>
            Imprimer
          </Button>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultationPage;
