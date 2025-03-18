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

  const methods = useForm({
    resolver: zodResolver(MedicalHistorySchema),
  });
  const { setValue, watch, register, formState } = methods;
  // React Hook Form with Zod resolver
  const { errors } = formState;
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
      <div className="flex items-center justify-center  ">
        <div className=" p-2 rounded-2xl  max-w-4xl w-full">
          <h1 className="text-2xl font-semibold text-gray-700 ">
            modifier un role
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
              error={formState.errors.namefr}
              register={register}
            />
            <Input
              type="text"
              label="Arabic Name"
              id="namear"
              name="namear"
              placeholder="Enter name in Arabic"
              error={formState.errors.namear}
              register={register}
            />

            <input type="submit" />
          </form>
        </div>
      </div>
    </QueryClientProvider>
  );
}
