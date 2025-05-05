import React, { useState } from "react";
import Link from "next/link";
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/dashboard/user", label: "Utilisateurs", icon: UsersIcon },
    { href: "/dashboard/role", label: "Rôles", icon: ShieldCheckIcon },
    { href: "/dashboard/patients", label: "Patients", icon: UserGroupIcon },
    { href: "/dashboard/consultation", label: "Consultations", icon: ClipboardDocumentListIcon },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static h-screen w-64 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
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
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 p-4 hover:bg-blue-500/50 transition-colors duration-200 rounded"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="p-4 border-t border-white/20">
          <Link
            href="/logout"
            className="flex items-center gap-3 hover:text-red-400 text-white transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Déconnexion</span>
          </Link>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
