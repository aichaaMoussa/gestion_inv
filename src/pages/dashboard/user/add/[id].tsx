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
  const { query, push } = useRouter();
  const { id } = query;

  const { data } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null; // Évite un appel API avec un id null
      const response = await axios.get(`/api/user/${id}`);
      console.log("response", response);
      return response.data;
    },
    enabled: !!id, // Empêche la requête si `id` est undefined
  });

  useEffect(() => {
    console.log("User ID:", id);
  }, [id]);

  const { mutate, isLoading } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (formData: any) => {
      console.log("Données envoyées:", formData);
      const res = await axios.put(`/api/user/${id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Utilisateur mis à jour avec succès !");

      setTimeout(() => {
        push("/dashboard/user");
      }, 1000); // Attendre 1 seconde pour que le toast s'affiche avant la redirection
    },

    onError: (error) => {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      toast.error("Échec de la création de l'utilisateur. Veuillez réessayer.");
    },
  });

  // React Hook Form avec Zod Resolver
  const methods = useForm({
    resolver: zodResolver(userShemas),
  });

  const { setValue, watch, handleSubmit, register, formState, reset } = methods;

  const onSubmit = (formData: any) => {
    console.log("✅ Formulaire soumis avec les données:", formData);
    mutate(formData);
  };

  const { data: roles, error } = useQuery({
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
      console.log("Données utilisateur avant mise à jour:", data);
      reset();
      setValue("nom", data?.nom, { shouldValidate: true });
      setValue("prenom", data?.prenom, { shouldValidate: true });
      setValue("nni", data?.nni, { shouldValidate: true });
      setValue("phone", data?.phone, { shouldValidate: true });
      setValue("roleId", data?.roleId.toString(), { shouldValidate: true });
      setValue("username", data?.username || "", { shouldValidate: true });
      setValue("password", "", { shouldValidate: true }); // Mot de passe vide par sécurité
    }
  }, [data, reset, setValue]);
  console.log("🔹 useForm initialisé", methods);
  const { errors } = formState;
  const selectedRoleId = watch("roleId");
  console.log("⚠️ Erreurs du formulaire:", errors);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mettre à jour utilisateur</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 grid grid-cols-2"
        >
          <Input
            type="text"
            label="Nom en Français"
            id="nom"
            name="nom"
            placeholder="Entrez le nom en français"
            register={register}
            error={formState.errors.nom}
          />
          <Input
            type="text"
            label="Prénom"
            id="prenom"
            name="prenom"
            placeholder="Entrez le prénom"
            register={register}
            error={formState.errors.prenom}
          />
          <Input
            type="text"
            label="NNI"
            id="nni"
            name="nni"
            placeholder="Entrez le NNI"
            register={register}
            error={formState.errors.nni}
          />
          <Input
            type="text"
            label="Téléphone"
            id="phone"
            name="phone"
            placeholder="Entrez le numéro de téléphone"
            register={register}
            error={formState.errors.phone}
          />
          <Input
            type="text"
            label="Nom d'utilisateur"
            id="username"
            name="username"
            placeholder="Entrez le nom d'utilisateur"
            register={register}
            error={formState.errors.username}
          />

          <Input
            type="password"
            label="Mot de passe"
            id="password"
            name="password"
            placeholder="Entrez le mot de passe"
            register={register}
            error={formState.errors.password}
          />

          <Select
            id="roleId"
            options={roleOptions}
            value={selectedRoleId} // ✅ Prend la valeur actuelle
            placeholder={isLoading ? "Loading roles..." : "Select a role"}
            isDisabled={isLoading || error}
            onChange={(value) => {
              setValue("roleId", value.toString()); // ✅ Assure la conversion en chaîne
              console.log("Role sélectionné:", value);
            }}
          />
          <div className="col-span-2 flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              onClick={() => push("/dashboard/user")}
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
    </QueryClientProvider>
  );
}
