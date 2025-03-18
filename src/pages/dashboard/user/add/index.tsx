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
import router, { useRouter } from "next/router";
import { toast } from "react-toastify";

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
  const {
    data: roles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      const response = await axios.get("/api/role");
      return response.data;
    },
  });

  const { mutate, isLoading: load } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data) => {
      return axios.post("/api/user", data);
    },
    onSuccess: () => {
      push("/dashboard/user"); // ✅ Redirection après succès
      toast.success("Utilisateur créé avec succès !");
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      toast.error("Échec de la création de l'utilisateur. Veuillez réessayer.");
    },
  });
  const roleOptions = roles?.roles
    ? roles.roles.map((role: any) => ({
        value: role._id,
        label: role.namefr,
      }))
    : [];

  register("roleId", { required: "Veuillez sélectionner un rôle." });

  const onSubmit = (data: any) => {
    if (!data.roleId) {
      alert("Veuillez sélectionner un rôle.");
      return;
    }
    console.log("Form data submitted:", data);
    mutate(data);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex items-center justify-center min-h-screen ">
        <div className=" p-2 rounded-2xl  max-w-4xl w-full">
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">
            Créer un utilisateur
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <Input
              type="text"
              label="French Name"
              id="nom"
              name="nom"
              placeholder="Enter name in French"
              error={!!errors.nom}
              register={register}
            />
            <Input
              type="text"
              label="Arabic Name"
              id="prenom"
              name="prenom"
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
              type="text"
              label="Phone"
              id="phone"
              name="phone"
              placeholder="Enter phone"
              error={!!errors.phone}
              register={register}
            />

            <Input
              type="text"
              label="Username"
              id="username"
              name="username"
              placeholder="Enter username"
              error={!!errors.username}
              register={register}
            />
            <Input
              type="password"
              label="Password"
              id="password"
              name="password"
              placeholder="Enter password"
              error={!!errors.password}
              register={register}
            />
            <Select
              id="roleId"
              options={roleOptions}
              placeholder={isLoading ? "Loading roles..." : "Select a role"}
              isDisabled={isLoading || error}
              onChange={(value) => {
                setValue("roleId", value);
                console.log("Role selected:", value);
              }}
              className=""
              errorMessage={errors.roleId?.message}
            />
            <div className="col-span-2 flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={() => router.push("/dashboard/user")}
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
