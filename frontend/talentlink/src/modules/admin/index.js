import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from '../../components/admin/AdminPanel';

export default function AdminApp({ user }) {
  // Vérifier si l'utilisateur est un admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminPanel user={user} />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}