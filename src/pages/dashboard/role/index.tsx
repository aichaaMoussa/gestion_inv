import React from "react";

import Table from "@/components/Table"; // Importez votre composant Table
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

interface Role {
  _id: string;
  namefr: string;
  namear: string;
}

const TablePage = () => {
  const { mutate: deleteMutation } = useMutation({
    mutationFn: async (_id: string) => {
      const response = await axios.delete(`/api/role/${_id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Rôle supprimé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du rôle.");
    },
  });

  const { data } = useQuery(["role"], async () => {
    const response = await axios.get("/api/role");
    return response.data;
  });

  const columns = React.useMemo(
    () => [
      {
        Header: "Nom",
        accessor: "namefr",
      },
      {
        Header: "Nom en arabe",
        accessor: "namear",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }: { row: { original: Role } }) => (
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/role/add/${row.original._id?.toString() || ""}`}
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
    [deleteMutation]
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gestion des roles</h1>
        <Link href="/dashboard/role/add">
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
