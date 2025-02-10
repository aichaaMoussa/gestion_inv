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
import { useEffect } from "react";
import { useRouter } from "next/router";
import Select from "@/components/Select";
import { userShemas } from "@/schemas/schemas";

export default function UpdateForm() {
  const queryClient = new QueryClient();
  const { query } = useRouter();
  const { id } = query;

  const { data } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await axios.get(`/api/user/${id}`);
      console.log("response", response);
      return response.data;
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data: any) => {
      const res = await axios.put(`/api/user/${id}`, {
        ...data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }); // Rafraîchir les données
      toast.success("Le rôle a été mis à jour avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du rôle.");
    },
  });

  // React Hook Form with Zod resolver

  const methods = useForm({
    resolver: zodResolver(userShemas),
  });
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(userShemas),
  });

  const onSubmit = (data: any) => {
    console.log("onSubmit called!"); // Ajoutez cette ligne
    console.log("hhhh", data);
    mutate(data); // Appeler la mutation avec les données du formulaire
  };
  const {
    data: roles,

    error,
  } = useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      const response = await axios.get("/api/role");
      return response.data;
    },
  });
  const roleOptions = roles?.roles
    ? roles.roles.map((role: any) => ({
        value: role._id,
        label: role.namefr,
      }))
    : [];

  useEffect(() => {
    if (data) {
      console.log("aicha", data);
      methods.reset();
      methods.setValue("nom", data?.nom);
      methods.setValue("prenom", data?.prenom);
      methods.setValue("nni", data?.nni);
      methods.setValue("phone", data?.phone);
      methods.setValue("roleId", data?.roleId.toString());
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
            id="nom"
            name="nom"
            placeholder="Entrez le nom en français"
            register={methods.register}
            error={methods.formState.errors.namefr}
          />
          <Input
            type="text"
            label="Nom en Arabe"
            id="prenom"
            name="prenom"
            placeholder="Entrez le nom en arabe"
            register={methods.register}
            error={methods.formState.errors.namear}
          />
          <Input
            type="text"
            label="Nom en Arabe"
            id="nni"
            name="nni"
            placeholder="Entrez le nom en arabe"
            register={methods.register}
            error={methods.formState.errors.namear}
          />
          <Input
            type="text"
            label="Nom en Arabe"
            id="phone"
            name="phone"
            placeholder="Entrez le nom en arabe"
            register={methods.register}
            error={methods.formState.errors.namear}
          />
          <Select
            id="roleId"
            options={roleOptions}
            placeholder={isLoading ? "Loading roles..." : "Select a role"}
            isDisabled={isLoading || error}
            onChange={(value) => {
              setValue("roleId", value); // Update roleId in the form
              console.log("Role selected:", value);
            }}
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
