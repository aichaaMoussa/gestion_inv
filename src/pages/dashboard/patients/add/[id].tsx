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
import { PatientSchema, userShemas } from "@/schemas/schemas";
import { useSession } from "next-auth/react";

export default function UpdateForm() {
  const queryClient = new QueryClient();
  const { query, push } = useRouter();
  const { id } = query;

  const { data } = useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      if (!id) return null; // Évite un appel API avec un id null
      const response = await axios.get(`/api/patients/${id}`);
      console.log("response", response);
      return response.data;
    },
    enabled: !!id, // Empêche la requête si `id` est undefined
  });

  useEffect(() => {
    console.log("patients ID:", id);
  }, [id]);

  const { mutate, isLoading } = useMutation({
    mutationKey: ["patients"],
    mutationFn: async (formData: any) => {
      console.log("Données envoyées:", formData);
      const res = await axios.put(`/api/patients/${id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      push("/dashboard/patients");
      toast.success("patients modifier avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du patients.");
    },
  });

  // React Hook Form avec Zod Resolver
  const methods = useForm({
    resolver: zodResolver(PatientSchema),
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
    const { data: session, status } = useSession(); // Vérifie le statut de la session
  console.log("Session status:", status, "Session data:", session);
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
          setValue("doctorId", session.user.id);
        }
      }, [session, status, setValue]);
  useEffect(() => {
    if (data) {
      console.log("Données utilisateur avant mise à jour:", data);
      reset();
      setValue("firstName", data?.firstName, { shouldValidate: true });
      setValue("lastName", data?.lastName, { shouldValidate: true });
      setValue("nni", data?.nni, { shouldValidate: true });
      setValue("telephone", data?.telephone, { shouldValidate: true });
     
      setValue("adress", data?.adress || "", { shouldValidate: true });
      setValue("age",data?.age || "", { shouldValidate: true }); // Mot de passe vide par sécurité
    }
  }, [data, reset, setValue]);
  console.log("🔹 useForm initialisé", methods);
  const { errors } = formState;

  console.log("⚠️ Erreurs du formulaire:", errors);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mettre à jour patients</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 grid grid-cols-2"
        >
           <Input
              type="text"
              label="French Name"
              id="firstName"
              name="firstName"
              placeholder="Enter name in French"
              error={!!errors.nom}
              register={register}
            />
            <Input
              type="text"
              label="Arabic Name"
              id="lastName"
              name="lastName"
              placeholder="Enter name in Arabic"
              error={!!errors.prenom}
              register={register}
            />
            <Input
              type="text"
              label="NNI"
              id="nni"
              name="nni"
              placeholder="Enter NNI"
              error={!!errors.nni}
              register={register}
            />
             <Input
              type="number"
              label="telephone"
              id="telephone"
              name="telephone"
              placeholder="Enter telephone"
              error={!!errors.phone}
              register={register}
            /> 
            <Input
              type="text"
              label="adress"
              id="adress"
              name="adress"
              placeholder="Enter adress"
              error={!!errors.nni}
              register={register}
            />
            <Input
              type="number"
              label="age"
              id="age"
              name="age"
              placeholder="Enter adress"
              error={!!errors.nni}
              register={register}
            />
          <div className="col-span-2 flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              onClick={() => push("/dashboard/patients")}
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
