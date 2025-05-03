import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

interface LoginFormData {
  username: string;
  password: string;
}

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    const res = await signIn("credentials", {
      redirect: false, // Ne pas rediriger immédiatement
      username: data.username,
      password: data.password,
    });

    if (res?.error) {
      alert("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 max-w-md mx-auto"
    >
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          className="block w-full p-2 border rounded"
          {...register("username", { required: true })}
        />
        {errors.username && (
          <span className="text-red-500">Username is required</span>
        )}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="block w-full p-2 border rounded"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span className="text-red-500">Password is required</span>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Login
      </button>
    </form>
  );
}

export default Login;
