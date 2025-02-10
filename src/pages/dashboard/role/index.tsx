import React from "react";

import Table from "@/components/Table"; // Importez votre composant Table
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";

const TablePage = () => {
  const { mutate: deleteMutation } = useMutation({
    mutationFn: async (_id) => {
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
        Header: "Index",
        accessor: (row, i) => i + 1,
      },
      {
        Header: "Nom (FR)",
        accessor: "namefr",
      },
      {
        Header: "Nom (AR)",
        accessor: "namear",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => deleteMutation(row.original._id)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Supprimer
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className=" flex h-screen">
      {/* Main Content */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-semibold ">Tableau des Rôles</h1>
        <Table columns={columns} data={data?.roles || []} />
      </div>
    </div>
  );
};

export default TablePage;
