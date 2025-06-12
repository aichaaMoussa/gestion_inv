import { useForm } from "react-hook-form";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "react-query";
import axios from "axios";
import Input from "@/components/Input";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { PatientSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

interface PatientFormData {
  doctorId: string;
  firstName: string;
  lastName: string;
  nni: string;
  adress: string;
  telephone: string;
  age: string;
}

const queryClient = new QueryClient();

export default function App() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema)
  });
  const { push } = useRouter();
  // const { mutate } = useMutation({
  //   mutationKey: ["patient"],
  //   mutationFn: async (data: PatientFormData) => {
  //     return axios.post("/api/patients", data);
  //   },
  //   onSuccess: () => {
  //     push("/dashboard/patients");
  //     toast.success("Patient créé avec succès !");
  //   },
  //   onError: (error: unknown) => {
  //     console.error("Erreur lors de la création de patient :", error);
  //     toast.error("Échec de la création de patient. Veuillez réessayer.");
  //   },
  // });
  const { mutate } = useMutation({
    mutationKey: ["patient"],
    mutationFn: async (data: PatientFormData) => {
      return axios.post("/api/patients", data);
    },
    onSuccess: (response) => {
      if (response.status === 201) {
        toast.success("Patient créé avec succès !");
        push("/dashboard/patients");
      }
    },
    onError: (error: any) => {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "Échec de la création de patient. Veuillez réessayer.";

      switch (status) {
        case 400:
          toast.warning(errorMessage);
          break;
        case 500:
          toast.error("Une erreur serveur est survenue. Veuillez réessayer plus tard.");
          break;
        default:
          toast.error(errorMessage);
      }
    },
  });
  const onSubmit = (data: PatientFormData) => {
    console.log("Form data submitted:", data);
    mutate(data);
  };

  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user?.id) {
      setValue("doctorId", session.user.id);
    }
  }, [session, setValue]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className=" p-2 rounded-2xl  max-w-4xl w-full">
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">
            ajouter un patients
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <Input
              type="text"
              label="Nom"
              id="firstName"
              name="firstName"
              placeholder="Enter nom"
              error={errors.firstName ? { message: errors.firstName.message } : undefined}
              register={register}
            />
            <Input
              type="text"
              label="Prenom"
              id="lastName"
              name="lastName"
              placeholder="Enter prenom"
              error={errors.lastName ? { message: errors.lastName.message } : undefined}
              register={register}
            />
            <Input
              type="text"
              label="NNI"
              id="nni"
              name="nni"
              placeholder="Enter NNI"
              error={errors.nni ? { message: errors.nni.message } : undefined}
              register={register}
            />
            <Input
              type="text"
              label="Telephone"
              id="telephone"
              name="telephone"
              placeholder="Enter telephone"
              error={errors.telephone ? { message: errors.telephone.message } : undefined}
              register={register}
            />
            <Input
              type="text"
              label="Adresse"
              id="adress"
              name="adress"
              placeholder="Enter adresse"
              error={errors.adress ? { message: errors.adress.message } : undefined}
              register={register}
            />
            <Input
              type="text"
              label="Age"
              id="age"
              name="age"
              placeholder="Enter age"
              error={errors.age ? { message: errors.age.message } : undefined}
              register={register}
            />

            <div className="col-span-2 flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <input
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                value="Submit"
              />
            </div>
          </form>
        </div>
      </div>
    </QueryClientProvider>
  );
}
