import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login"); // Redirection vers la page login
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-200 via-white to-green-200">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/Group.png" // Remplacez par le chemin de votre logo
            alt="Logo"
            className="w-20 h-20"
          />
        </div>

        {/* Bouton */}
        <button
          onClick={handleLoginRedirect}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-lg"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
