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
  const { id } = query;

  const { data } = useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      const response = await axios.get(`/api/role/${id}`);
      console.log("response", response);
      return response.data;
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationKey: ["role"],
    mutationFn: async (data: any) => {
      const res = await axios.put(`/api/role/${id}`, {
        ...data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] }); // Rafraîchir les données
      toast.success("Le rôle a été mis à jour avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du rôle.");
    },
  });

  // React Hook Form with Zod resolver

  const methods = useForm({
    resolver: zodResolver(MedicalHistorySchema),
  });
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(MedicalHistorySchema),
  });

  const onSubmit = (data: any) => {
    console.log("onSubmit called!"); // Ajoutez cette ligne
    console.log("hhhh", data);
    mutate(data); // Appeler la mutation avec les données du formulaire
  };

  useEffect(() => {
    if (data) {
      console.log("aicha", data);
      methods.reset();
      methods.setValue("namear", data?.namear);
      methods.setValue("namefr", data?.namefr);
    }
  }, [data]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mettre à jour un rôle</h1>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="text"
            label="Nom en Français"
            id="namefr"
            name="namefr"
            placeholder="Entrez le nom en français"
            register={methods.register}
            error={methods.formState.errors.namefr}
          />
          <Input
            type="text"
            label="Nom en Arabe"
            id="namear"
            name="namear"
            placeholder="Entrez le nom en arabe"
            register={methods.register}
            error={methods.formState.errors.namear}
          />

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </QueryClientProvider>
  );
}
