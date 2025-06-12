import Table from "@/components/Table";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { Column } from "react-table";
import { CircularProgress } from "@mui/material";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  telephone: string;
  age: string;
  adress: string;
}

const TablePage = () => {
  const { mutate: deleteMutation } = useMutation({
    mutationKey: ["role"],
    mutationFn: async (_id: string) => {
      const response = await axios.delete("/api/patients/" + _id);
      return response.data;
    },
    onSuccess: () => {
      toast.success("patients supprimé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du patients.");
    },
  });

  const { data, isLoading, error } = useQuery(["user"], async () => {
    const session = await axios.get("/api/auth/session");
    const userId = session.data?.user?.id;

    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.get("/api/patients", {
      params: { user: userId },
    });

    return response.data;
  });

  const columns = React.useMemo<Column<Patient>[]>(
    () => [
      {
        Header: "nom",
        accessor: "firstName",
      },
      {
        Header: "prenom",
        accessor: "lastName",
      },
      {
        Header: "telephone",
        accessor: "telephone",
      },
      {
        Header: "age",
        accessor: "age",
      },
      {
        Header: "adress",
        accessor: "adress",
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ row }: { row: { original: Patient } }) => (
          <div className="flex space-x-2">
            <Link href={`/dashboard/patients/${row.original._id?.toString() || ""}`}>
              <button className="text-blue-500 hover:text-blue-600">
                Dossier
              </button>
            </Link>
            <Link
              href={`/dashboard/patients/add/${row.original._id?.toString() || ""}`}
            >
              <Pencil size={20} />
            </Link>
            <button
              onClick={() => deleteMutation(row.original._id?.toString())}
              className="px-3 py-1  text-white rounded"
            >
              <Trash className="text-black" size={20} />
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Gestion des Patients</h1>
        </div>
        <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
          <CircularProgress size={60} />
          <p className="text-lg">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Gestion des Patients</h1>
        </div>
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-red-500">Erreur lors du chargement des patients</p>
        </div>
      </div>
    );
  }

  if (!data?.roles?.length) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Gestion des Patients</h1>
          <Link href="/dashboard/patients/add">
            <button className="w-[146px] h-[47px] bg-sky-800 border-[0.6px] border-[#0281B4] rounded-[2px] font-medium shadow-md hover:bg-[#0281B4] text-white transition">
              Ajouter
            </button>
          </Link>
        </div>
        <div className="flex justify-center items-center h-[50vh] flex-col gap-2">
          <p className="text-xl text-gray-600">Aucun patient trouvé</p>
          <p className="text-gray-500">Commencez par ajouter un nouveau patient</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gestion des Patients</h1>
        <Link href="/dashboard/patients/add">
          <button className="w-[146px] h-[47px] bg-sky-800 border-[0.6px] border-[#0281B4] rounded-[2px] font-medium shadow-md hover:bg-[#0281B4] text-white transition">
            Ajouter
          </button>
        </Link>
      </div>
      <Table columns={columns} data={data?.roles || []} />
    </div>
  );
};

export default TablePage;
