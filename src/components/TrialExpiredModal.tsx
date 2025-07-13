import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ isOpen, onClose }) => {
  const handleActivatePlan = () => {
    window.open('https://kiwify.app/PYxzlNE', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4">
            <img 
              src="/lovable-Uploads/c508ab5e-7c1d-421f-b905-6c8b27ab36fe.png" 
              alt="BarberTime Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <DialogTitle className="text-center text-xl font-semibold barber-text-primary">
            Período gratuito expirado
          </DialogTitle>
          <DialogDescription className="text-center barber-text-secondary">
            Seu período gratuito de 7 dias expirou. Ative seu plano para continuar usando o BarberTime.
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="barber-text-secondary">
            Seu período gratuito de 7 dias expirou. Para continuar utilizando o BarberTime, 
            ative seu plano e desfrute de todas as funcionalidades.
          </p>
          
          <div className="bg-gradient-to-r from-[#004E64]/10 to-[#003A4A]/10 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-[#004E64]" />
              <span className="font-semibold text-[#004E64]">Plano Premium</span>
            </div>
            <ul className="text-sm barber-text-secondary space-y-1">
              <li>• Agendamentos ilimitados</li>
              <li>• Gestão completa de clientes</li>
              <li>• Página personalizada de agendamento</li>
              <li>• Suporte prioritário</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleActivatePlan}
            className="w-full barber-button-primary text-lg py-6"
          >
            <Crown className="w-5 h-5 mr-2" />
            Ativar plano agora
          </Button>
          
          <p className="text-xs barber-text-secondary">
            Você será redirecionado para nossa página de pagamento segura
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};