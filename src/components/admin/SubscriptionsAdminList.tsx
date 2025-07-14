import React, { useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

interface SubscriptionProfile {
  id: string;
  name: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  last_payment_date?: string;
}

const SubscriptionsAdminList: React.FC = () => {
  const [profiles, setProfiles] = useState<SubscriptionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, subscription_status, subscription_start_date, subscription_end_date, last_payment_date')
        .order('subscription_status', { ascending: false });
      if (!error && data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Assinaturas</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Último Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} className="border-b">
                <td>{profile.name}</td>
                <td>{profile.subscription_status}</td>
                <td>{profile.subscription_start_date ? new Date(profile.subscription_start_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{profile.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{profile.last_payment_date ? new Date(profile.last_payment_date).toLocaleDateString('pt-BR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubscriptionsAdminList; 