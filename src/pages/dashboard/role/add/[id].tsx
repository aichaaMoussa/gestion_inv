import Input from "@/components/Input";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { MedicalHistorySchema } from "@/schemas/roleshemas";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function UpdateForm() {
  const queryClient = new QueryClient();
  const { query, push } = useRouter();
  const id = query?.id || ""; // ✅ Empêche les erreurs si `id` est undefined

  // 🔍 Récupération des données du rôle
  const { data } = useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      if (!id) return null; // ✅ Empêche une requête API avec `undefined`
      const response = await axios.get(`/api/role/${id}`);
      console.log("📥 Données reçues:", response.data);
      return response.data;
    },
    enabled: !!id, // ✅ Active la requête uniquement si l'id est valide
  });

  // 📌 Initialisation de `useForm`
  const {
    setValue,
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(MedicalHistorySchema),
  });

  // 🔄 Remplir les champs lorsque les données sont chargées
  useEffect(() => {
    if (data) {
      console.log("📌 Remplissage des valeurs du formulaire", data);
      reset({
        namear: data?.namear || "",
        namefr: data?.namefr || "",
      });
    }
  }, [data, reset]);

  // 🔄 Mise à jour du rôle
  const { mutate, isLoading } = useMutation({
    mutationKey: ["role", id],
    mutationFn: async (formData: any) => {
      console.log("📤 Envoi des données:", formData);
      const res = await axios.put(`/api/role/${id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("✅ Rôle modifié avec succès !");
      push("/dashboard/role");
    },
    onError: (error) => {
      console.error("❌ Erreur:", error);
      toast.error("❌ Erreur lors de la mise à jour du rôle.");
    },
  });

  const onSubmit = (formData: any) => {
    console.log("📨 Formulaire soumis:", formData);
    mutate(formData);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex items-center justify-center">
        <div className="p-4 rounded-2xl max-w-4xl w-full">
          <h1 className="text-2xl font-semibold text-gray-700">
            Modifier un rôle
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 grid grid-cols-2"
          >
            <Input
              type="text"
              label="French Name"
              id="namefr"
              name="namefr"
              placeholder="Enter name in French"
              error={errors.namefr}
              register={register}
            />
            <Input
              type="text"
              label="Arabic Name"
              id="namear"
              name="namear"
              placeholder="Enter name in Arabic"
              error={errors.namear}
              register={register}
            />

            <div className="col-span-2 flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={() => push("/dashboard/role")}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </QueryClientProvider>
  );
}
