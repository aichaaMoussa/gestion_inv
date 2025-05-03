import Input from "@/components/Input";
import axios from "axios";
import { useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function App() {
  const { push } = useRouter();
  const { mutate, isLoading } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data: { namear: string; namefr: string }) => {
      return axios.post("/api/role", data);
    },
    onSuccess: () => {
      push("/dashboard/role"); // ✅ Redirection après succès
      toast.success("role créé avec succès !");
    },
    onError: (error: unknown) => {
      console.error("Erreur lors de la création de role :", error);
      toast.error("Échec de la création de role. Veuillez réessayer.");
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ namear: string; namefr: string }>();

  const onSubmit = async (data: { namear: string; namefr: string }) => {
    mutate(data);
  };

  console.log(watch("namefr")); // Watch input value by passing its name

  return (
    <QueryClientProvider client={new QueryClient()}>
      <div className="flex items-center justify-center  ">
        <div className=" p-2 rounded-2xl  max-w-4xl w-full">
          <h1 className="text-2xl font-semibold text-gray-700 ">
            Créer un role
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <Input
              type="text"
              label="French Name"
              id="namefr"
              name="namefr"
              placeholder="Enter name in French"
              error={!!errors.namefr}
              register={register}
            />
            <Input
              type="text"
              label="Arabic Name"
              id="namear"
              name="namear"
              placeholder="Enter name in Arabic"
              error={!!errors.namear}
              register={register}
            />

            {/* Show error messages dynamically */}
            {errors.namefr && <span>This field is required</span>}
            {errors.namear && <span>This field is required</span>}

            <input type="submit" />
          </form>
        </div>
      </div>
    </QueryClientProvider>
  );
}
