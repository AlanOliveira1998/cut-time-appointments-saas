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
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/10">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={bookingLink}
              readOnly
              className="flex-1 bg-background"
            />
            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="flex items-center gap-2 shrink-0"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </Button>
          </div>

          <Button
            variant="default"
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <MessageSquare className="w-5 h-5" />
            Enviar Link pelo WhatsApp
          </Button>

          <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
            💡 Compartilhe este link com seus clientes para que eles possam ver sua agenda e marcar horários diretamente, sem precisar entrar em contato.
          </p>
        </div>
      </div>
    </div>
  );
};