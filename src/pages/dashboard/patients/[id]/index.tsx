import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  telephone: string;
  age: string;
  adress: string;
  nni: string;
}

interface Consultation {
  _id: string;
  date: string;
  description: string;
  diagnosis: string;
  prescription: string;
}

const PatientDossier = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: patient, isLoading: patientLoading } = useQuery(
    ["patient", id],
    async () => {
      if (!id) return null;
      const response = await axios.get(`/api/patients/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const { data: consultations, isLoading: consultationsLoading } = useQuery(
    ["consultations", id],
    async () => {
      if (!id) return [];
      const response = await axios.get(`/api/consultations`, {
        params: { patientId: id },
      });
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  if (patientLoading || consultationsLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[50vh]">
          <CircularProgress size={60} />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-red-500">Patient non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Dossier Patient</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informations Personnelles</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Nom</p>
              <p className="font-medium">{patient.firstName}</p>
            </div>
            <div>
              <p className="text-gray-600">Prénom</p>
              <p className="font-medium">{patient.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">NNI</p>
              <p className="font-medium">{patient.nni}</p>
            </div>
            <div>
              <p className="text-gray-600">Téléphone</p>
              <p className="font-medium">{patient.telephone}</p>
            </div>
            <div>
              <p className="text-gray-600">Âge</p>
              <p className="font-medium">{patient.age}</p>
            </div>
            <div>
              <p className="text-gray-600">Adresse</p>
              <p className="font-medium">{patient.adress}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Consultations</h2>
          <Link href={`/dashboard/consultation/add?patientId=${id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Plus size={20} />
              Nouvelle Consultation
            </button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {consultations?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune consultation enregistrée
            </div>
          ) : (
            <div className="divide-y">
              {consultations?.map((consultation: Consultation) => (
                <div key={consultation._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">
                        Consultation du {new Date(consultation.date).toLocaleDateString()}
                      </h3>
                    </div>
                    <Link href={`/dashboard/consultation/${consultation._id}`}>
                      <button className="text-blue-500 hover:text-blue-600">
                        Voir détails
                      </button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Diagnostic</p>
                      <p className="font-medium">{consultation.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prescription</p>
                      <p className="font-medium">{consultation.prescription}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDossier; 