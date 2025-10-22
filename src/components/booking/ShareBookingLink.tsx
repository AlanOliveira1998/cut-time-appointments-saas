import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import { BookingService } from '@/services/bookingService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShareBookingLinkProps {
  barberId: string;
  barberName: string;
}

export const ShareBookingLink: React.FC<ShareBookingLinkProps> = ({ barberId, barberName }) => {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar Link de Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link de Agendamento</DialogTitle>
          <DialogDescription>
            Compartilhe este link com seus clientes para que eles possam agendar horários diretamente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
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
            <MessageCircle className="w-5 h-5" />
            Compartilhar no WhatsApp
          </Button>

          <div className="text-sm text-muted-foreground mt-2">
            <p>Os clientes podem usar este link para:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Ver seus serviços disponíveis</li>
              <li>Escolher data e horário</li>
              <li>Fazer agendamento direto</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};