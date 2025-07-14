import React, { useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  subscription_status: string;
  created_at: string;
}

const UsersAdminList: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, subscription_status, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Usuários</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td>{user.name}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.subscription_status}</td>
                <td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersAdminList; 