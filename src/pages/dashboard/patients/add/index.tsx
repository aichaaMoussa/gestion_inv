import { useForm } from "react-hook-form";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "react-query";
import axios from "axios";
import Select from "@/components/Select";
import Input from "@/components/Input";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const queryClient = new QueryClient();

export default function App() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const { push } = useRouter();
  const { mutate } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data) => {
      return axios.post("/api/patients", data);
    },
    onSuccess: () => {
      push("/dashboard/patients"); // ✅ Redirection après succès
      toast.success("Utilisateur créé avec succès !");
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      toast.error("Échec de la création de l'utilisateur. Veuillez réessayer.");
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form data submitted:", data);
    mutate(data);
  };
  const { data: session, status } = useSession(); // Vérifie le statut de la session
  console.log("Session status:", status, "Session data:", session);
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setValue("doctorId", session.user.id);
    }
  }, [session, status, setValue]);

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
            {/* <Input
              type="text"
              label="Phone"
              id="phone"
              name="phone"
              placeholder="Enter phone"
              error={!!errors.phone}
              register={register}
            /> */}
            <Input
              type="text"
              label="medicamennt"
              id="medicalHistory"
              name="medicalHistory"
              placeholder="Enter medicamennt"
              error={!!errors.nni}
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
