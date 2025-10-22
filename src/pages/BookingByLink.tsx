import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingService } from '@/services/bookingService';
import { Booking } from './Booking';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const BookingByLink: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const validateBarber = async () => {
      if (!barberId) {
        setError('ID do barbeiro não fornecido');
        return;
      }

      try {
        const response = await BookingService.getBarberByLinkId(barberId);
        
        if (response.error || !response.data) {
          setError('Barbeiro não encontrado ou inativo');
          toast({
            title: "Erro",
            description: "Link de agendamento inválido ou expirado.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados do barbeiro');
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do barbeiro.",
          variant: "destructive",
        });
      }
    };

    validateBarber();
  }, [barberId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p>Carregando dados do barbeiro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <Booking initialBarberId={barberId} />;
};