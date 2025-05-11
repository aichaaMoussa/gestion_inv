import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useEffect } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";

interface LoginFormData {
  username: string;
  password: string;
}

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const router = useRouter();
  const { data: session, status } = useSession();
  const callbackUrl = router.query.callbackUrl as string || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      console.log("User is authenticated, redirecting to:", callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("Attempting to sign in...");
      const res = await signIn("credentials", {
        redirect: false,
        username: data.username,
        password: data.password,
        callbackUrl: callbackUrl
      });

      console.log("Sign in response:", res);

      if (res?.error) {
        console.error("Sign in error:", res.error);
        toast.error(res.error);
      } else if (res?.ok) {
        console.log("Sign in successful, redirecting to:", callbackUrl);
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  if (status === "authenticated") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin" size={24} />
          <span>Redirection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/logors.png"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto h-24 object-contain"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                {...register("username", { required: "Le nom d'utilisateur est requis" })}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nom d'utilisateur"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Le mot de passe est requis" })}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <Loader className="animate-spin text-white" size={20} />
              ) : (
                "Se connecter"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
