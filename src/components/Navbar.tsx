import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div
      className="h-screen w-64 flex flex-col justify-between"
      style={{
        background: `
          linear-gradient(
            to bottom,
            rgba(3, 1, 50, 1),
            rgba(2, 129, 180, 0.69)
          ),
          url('/sidebar-bg.png') no-repeat bottom`,
        backgroundSize: "cover",
      }}
    >
      <div>
        <div className="flex items-center gap-2 p-4">
          <img src="/Group.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-lg font-bold text-white">Gestion Hospital</h1>
        </div>
        <nav>
          <ul className="mt-4 text-white">
            <li className="flex items-center gap-3 p-4 hover:bg-blue-500 cursor-pointer rounded">
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className="flex items-center gap-3 p-4 hover:bg-blue-500 cursor-pointer rounded">
              <Link href="/dashboard/user">Utilisateurs</Link>
            </li>
            <li className="flex items-center gap-3 p-4 hover:bg-blue-500 cursor-pointer rounded">
              <Link href="/dashboard/role">Rôles</Link>
            </li>
            <li className="flex items-center gap-3 p-4 hover:bg-blue-500 cursor-pointer rounded">
              <Link href="/dashboard/patients">patients</Link>
            </li>
            <li className="flex items-center gap-3 p-4 hover:bg-blue-500 cursor-pointer rounded">
              <Link href="/dashboard/consultation">Consultations</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-white">
        <Link
          href="/logout"
          className="flex items-center gap-3 hover:text-red-400 text-white"
        >
          Déconnexion
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
