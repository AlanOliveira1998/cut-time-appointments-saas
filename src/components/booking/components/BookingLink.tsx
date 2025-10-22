import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Share2, Copy, MessageSquare } from 'lucide-react';
import { BookingService } from '@/services/bookingService';

interface BookingLinkProps {
  barberId: string;
  barberName: string;
}

export const BookingLink: React.FC<BookingLinkProps> = ({ barberId, barberName }) => {
  const bookingLink = BookingService.getBookingLink(barberId);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      toast({
        title: "Link copiado!",
        description: "O link de agendamento foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Por favor, copie manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Olá! Agende seu horário com ${barberName} através do link: ${bookingLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Link de Agendamento</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={bookingLink}
            readOnly
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </Button>
        </div>

        <Button
          variant="default"
          onClick={handleShareWhatsApp}
          className="w-full flex items-center justify-center gap-2"
        >
            <MessageSquare className="w-5 h-5" />
          Compartilhar no WhatsApp
        </Button>

        <p className="text-sm text-gray-500">
          Compartilhe este link com seus clientes para que eles possam agendar horários diretamente.
        </p>
      </div>
    </div>
  );
};