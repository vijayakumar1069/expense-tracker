import { requireAuth } from "@/lib/auth";
import React from "react";

export default async function Admin_Dashboard() {
  // Simulated user data (in production, fetch this from your authProvider)
  const user = {
    email: "user@example.com",
    role: "admin", // Could be 'admin', 'user', 'editor', etc.
    name: "Jane Smith",
    lastLogin: new Date().toLocaleString(),
  };
  const currentUser = await requireAuth();
  const name = currentUser.email.split("@");
  console.log(currentUser);
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
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
