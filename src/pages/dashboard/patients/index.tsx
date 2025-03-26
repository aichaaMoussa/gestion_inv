import Table from "@/components/Table";
import axios from "axios";
import Link from "next/link";
import React from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import { isQueryKey } from "react-query/types/core/utils";
import { toast } from "react-toastify";

const TablePage = () => {
  const { mutate: updateMutation } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (updatedRole) => {
      const response = await axios.put("/api/patients", updatedRole);
      return response.data;
    },

    onSuccess: () => {
      QueryClient.invalidateQueries({ QueryKey: ["user"] });
      toast.success("Role modifié avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la modification du rôle.");
    },
  });

  const { mutate: delatMutation } = useMutation({
    mutationKey: ["role"],
    mutationFn: async (_id) => {
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

  const { data } = useQuery(["user"], async () => {
    const session = await axios.get("/api/auth/session"); // Récupérer la session
    const userId = session.data?.user?.id; // Extraire l'ID de l'utilisateur connecté

    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.get("/api/patients", {
      params: { user: userId }, // Envoyer l'ID du médecin
    });

    return response.data;
  });

  console.log("data", data);
  const columns = React.useMemo(
    () => [
      {
        Header: "Index",
        accessor: (row, i) => i + 1, // Génère un index automatiquement
      },
      {
        Header: "nom",
        accessor: "firstName", // Correspond à la clé `name` dans les données
      },
      {
        Header: "prenom",
        accessor: "lastName",
      },
      {
        Header: "phone",
        accessor: "phone",
      },
      {
        Header: "medicalHistory",
        accessor: "medicalHistory",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/user/add/${row.original._id?.toString() || ""}`}
            >
              iugu
            </Link>
            <button
              onClick={() => delatMutation(row.original._id?.toString())}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

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
