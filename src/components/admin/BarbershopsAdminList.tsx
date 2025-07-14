import React, { useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

interface Barbershop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  owner_id: string;
  created_at: string;
  owner_profile?: { name: string; email: string };
}

const BarbershopsAdminList: React.FC = () => {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbershops = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('barbershops')
        .select('*, owner_profile:profiles(name, email)')
        .order('created_at', { ascending: false });
      if (!error && data) setBarbershops(data);
      setLoading(false);
    };
    fetchBarbershops();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Barbearias</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Dono</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            {barbershops.map(shop => (
              <tr key={shop.id} className="border-b">
                <td>{shop.name}</td>
                <td>{shop.owner_profile?.name || shop.owner_id}</td>
                <td>{shop.phone || '-'}</td>
                <td>{shop.address || '-'}</td>
                <td>{new Date(shop.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BarbershopsAdminList; 