import { requireAuth } from "@/lib/auth";
import React from "react";
export const dynamic = "force-dynamic";
export default async function Admin_Dashboard() {
  const currentUser = await requireAuth();
  const name = currentUser.email.split("@");
  const role = "ADMIN";

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* User Profile Summary */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
          {currentUser.email.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{name[0]}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{currentUser.email}</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                role === "ADMIN"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
