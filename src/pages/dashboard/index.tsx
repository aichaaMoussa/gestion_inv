import Navbar from "@/components/Navbar";
import useSessionCheck from "../hooks/useSessionCheck";

export default function Dashboard() {
  useSessionCheck();
  return (
    <div>
      <h1 className="text-2xl font-bold">Tableau de Bord</h1>
      <p>
        Bienvenue sur votre tableau de bord. Sélectionnez une option dans la
        barre de navigation.
      </p>
    </div>
  );
}
