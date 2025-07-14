import React from 'react';
import BarbershopsAdminList from '../components/admin/BarbershopsAdminList';
import SubscriptionsAdminList from '../components/admin/SubscriptionsAdminList';
import UsersAdminList from '../components/admin/UsersAdminList';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAIL = 'alan.pires.oliveira@gmail.com'; // ajuste para o e-mail do dono
const ADMIN_ID = '5446e96c-49ac-4a7f-86eb-5107ee94ef82'; // UID do admin

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
    return <div className="text-center mt-20 text-red-600 font-bold">Acesso restrito ao administrador.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Painel Administrativo</h1>
      <div className="space-y-10">
        <BarbershopsAdminList />
        <SubscriptionsAdminList />
        <UsersAdminList />
      </div>
    </div>
  );
};

export default AdminDashboard; 