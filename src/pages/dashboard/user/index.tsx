import Table from "@/components/Table";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";

interface User {
  _id: string;
  nom: string;
  prenom: string;
  phone: string;
  role: string;
}

const TablePage = () => {
  // const { mutate: updateMutation } = useMutation({
  //   mutationKey: ["user"],
  //   mutationFn: async (updatedRole) => {
  //     const response = await axios.put("/api/user", updatedRole);
  //     return response.data;
  //   },

  //   onSuccess: () => {
  //     QueryClient.invalidateQueries({ queryKey: ["user"] });
  //     toast.success("Role modifié avec succès !");
  //   },
  //   onError: () => {
  //     toast.error("Erreur lors de la modification du rôle.");
  //   },
  // });

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

  const { data } = useQuery(["user"], async () => {
    const response = await axios.get("/api/user");
    return response.data;
  });

  console.log("data", data);

  const columns = React.useMemo(
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
        accessor: "actions",
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
      <Table columns={columns} data={data?.roles || []} />
    </div>
  );
};

export default TablePage;
