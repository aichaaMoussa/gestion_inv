import Table from "@/components/Table";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { Column } from "react-table";
import { CircularProgress } from "@mui/material";

interface User {
  _id: string;
  nom: string;
  prenom: string;
  phone: string;
  role: string;
}

interface UserResponse {
  users: User[];
}

const TablePage = () => {
  const { mutate: deleteMutation } = useMutation({
    mutationKey: ["role"],
    mutationFn: async (_id: string) => {
      const response = await axios.delete("/api/user/" + _id);
      return response.data;
    },
    onSuccess: () => {
      toast.success("user supprimé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du rôle.");
    },
  });

  const { data, isLoading, error } = useQuery<UserResponse>(["user"], async () => {
    const response = await axios.get("/api/user");
    return response.data;
  });

  const columns = React.useMemo<Column<User>[]>(
    () => [
      {
        Header: "Nom",
        accessor: "nom",
      },
      {
        Header: "Prénom",
        accessor: "prenom",
      },
      {
        Header: "Téléphone",
        accessor: "phone",
      },
      {
        Header: "Rôle",
        accessor: "role",
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ row }: { row: { original: User } }) => (
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/user/add/${row.original._id?.toString() || ""}`}
              className="text-balck hover:underline"
            >
              <Pencil size={20} />
            </Link>
            <button
              onClick={() => deleteMutation(row.original._id?.toString() || "")}
              className="px-3 py-1  text-white rounded"
            >
              <Trash className="text-black" size={20} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        </div>
        <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
          <CircularProgress size={60} />
          <p className="text-lg">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        </div>
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-red-500">Erreur lors du chargement des utilisateurs</p>
        </div>
      </div>
    );
  }

  if (!data?.users?.length) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
          <Link href="/dashboard/user/add">
            <button className="w-[146px] h-[47px] bg-sky-800 border-[0.6px] border-[#0281B4] rounded-[2px] font-medium shadow-md hover:bg-[#0281B4] text-white transition">
              Ajouter
            </button>
          </Link>
        </div>
        <div className="flex justify-center items-center h-[50vh] flex-col gap-2">
          <p className="text-xl text-gray-600">Aucun utilisateur trouvé</p>
          <p className="text-gray-500">Commencez par ajouter un nouvel utilisateur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        <Link href="/dashboard/user/add">
          <button className="w-[146px] h-[47px] bg-sky-800 border-[0.6px] border-[#0281B4] rounded-[2px] font-medium shadow-md hover:bg-[#0281B4] text-white transition">
            Ajouter
          </button>
        </Link>
      </div>
      <Table columns={columns} data={data?.users || []} />
    </div>
  );
};

export default TablePage;
