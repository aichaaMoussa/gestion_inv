import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";

interface Consultation {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  description: string;
  diagnosis: string;
  prescription: string;
  createdAt: string;
  updatedAt: string;
}

const ConsultationDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: consultation, isLoading } = useQuery(
    ["consultation", id],
    async () => {
      if (!id) return null;
      const response = await axios.get(`/api/consultations/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[50vh]">
          <CircularProgress size={60} />
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-red-500">Consultation non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href={`/dashboard/patients/${consultation.patientId}`}>
          <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
            <ArrowLeft size={20} />
            Retour au dossier patient
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Détails de la Consultation</h1>
          <Link href={`/dashboard/consultation/edit/${id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Pencil size={20} />
              Modifier
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Date de consultation</h2>
            <p>{new Date(consultation.date).toLocaleDateString()}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Description</h2>
            <p className="whitespace-pre-wrap">{consultation.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Diagnostic</h2>
            <p className="whitespace-pre-wrap">{consultation.diagnosis}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Prescription</h2>
            <p className="whitespace-pre-wrap">{consultation.prescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p>Créée le : {new Date(consultation.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p>Dernière modification : {new Date(consultation.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails; 