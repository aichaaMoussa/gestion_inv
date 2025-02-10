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
      const response = await axios.put("/api/user", updatedRole);
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
      const response = await axios.delete("/api/user/" + _id);
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
  const { data } = useQuery(["user"], async () => {
    const reponse = await axios.get("/api/user", { params: {} });
    return reponse.data;
  });
  console.log("data", data);
  const columns = React.useMemo(
    () => [
      {
        Header: "Index",
        accessor: (row, i) => i + 1, // Génère un index automatiquement
      },
      {
        Header: "namefr",
        accessor: "nom", // Correspond à la clé `name` dans les données
      },
      {
        Header: "namear",
        accessor: "prenom",
      },
      {
        Header: "phone",
        accessor: "phone",
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
      <h1 className="text-2xl font-semibold mb-4">Tableau avec Pagination</h1>
      <Table columns={columns} data={data?.roles || []} />
    </div>
  );
};

export default TablePage;
