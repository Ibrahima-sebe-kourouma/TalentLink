import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./Dashboard";

export default function AdminApp({ user }) {
  return (
    <Routes>
      <Route index element={<AdminDashboard user={user} />} />
      {/* Future: <Route path="users" element={<UsersList />} /> */}
    </Routes>
  );
}
