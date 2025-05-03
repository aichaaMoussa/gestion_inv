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

interface Role {
  _id: string;
  namefr: string;
}

interface FormData {
  roleId: string;
  nom: string;
  prenom: string;
  [key: string]: string;
}

interface RoleResponse {
  roles: Role[];
}

const queryClient = new QueryClient();

export default function App() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const {
    data: roles,
    isLoading,
  } = useQuery<RoleResponse>({
    queryKey: ["role"],
    queryFn: async () => {
      const response = await axios.get("/api/role");
      return response.data;
    },
  });
  const { push } = useRouter();

  const roleId = watch("roleId");

  const { mutate } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data: FormData) => {
      return axios.post("/api/user", data);
    },
    onSuccess: () => {
      push("/dashboard/user");
      toast.success("Utilisateur créé avec succès !");
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      toast.error("Échec de la création de l'utilisateur. Veuillez réessayer.");
    },
  });

  const roleOptions = roles?.roles
    ? roles.roles.map((role: Role) => ({
        value: role._id,
        label: role.namefr,
      }))
    : [];

  register("roleId", { required: "Veuillez sélectionner un rôle." });

  const onSubmit = (data: FormData) => {
    if (!data.roleId) {
      toast.error("Veuillez sélectionner un rôle.");
      return;
    }
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
              register={register}
              placeholder="Enter name in French"
              error={errors.nom ? { message: errors.nom.message } : undefined}
            />
            <Input
              type="text"
              label="Last Name"
              id="prenom"
              name="prenom"
              register={register}
              placeholder="Enter surname in French"
              error={errors.prenom ? { message: errors.prenom.message } : undefined}
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
              label="Phone"
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              error={errors.phone ? { message: errors.phone.message } : undefined}
              register={register}
            />
            <Input
              type="text"
              label="Email"
              id="email"
              name="email"
              placeholder="Enter email"
              error={errors.email ? { message: errors.email.message } : undefined}
              register={register}
            />
            <Input
              type="password"
              label="Password"
              id="password"
              name="password"
              placeholder="Enter password"
              error={errors.password ? { message: errors.password.message } : undefined}
              register={register}
            />
            <Input
              type="password"
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm password"
              error={errors.confirmPassword ? { message: errors.confirmPassword.message } : undefined}
              register={register}
            />
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Role</label>
              <Select
                options={roleOptions}
                value={roleId || ""}
                onChange={(value: string | string[]) => setValue("roleId", value as string)}
                errorMessage={errors.roleId?.message}
                placeholder="Select a role"
                isDisabled={isLoading}
              />
              {errors.roleId?.message && (
                <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
              )}
            </div>
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
