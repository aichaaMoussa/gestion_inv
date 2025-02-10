import { z } from "zod";
import Input from "@/components/Input";
import axios from "axios";
import { useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";

export default function App() {
  const { mutate } = useMutation({
    mutationKey: ["role"],
    mutationFn: async (data) => {
      return axios.post("/api/role", data); // Enveloppez les données dans un objet `data`
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    mutate(data); // Envoi de l'objet avec la clé 'data'
  };

  console.log(watch("namefr")); // Watch input value by passing its name

  return (
    <QueryClientProvider client={new QueryClient()}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
    </QueryClientProvider>
  );
}
