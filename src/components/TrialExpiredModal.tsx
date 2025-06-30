
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Crown } from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ isOpen, onClose }) => {
  const handleActivatePlan = () => {
    window.open('https://pay.kiwify.com.br/jhpskLr', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00657C] to-[#004A5A] rounded-full">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Período gratuito expirado
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Seu período gratuito de 7 dias expirou. Para continuar utilizando o BarberTime, 
            ative seu plano e desfrute de todas as funcionalidades.
          </p>
          
          <div className="bg-gradient-to-r from-[#00657C]/10 to-[#004A5A]/10 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-[#00657C]" />
              <span className="font-semibold text-[#00657C]">Plano Premium</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
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
          
          <p className="text-xs text-gray-500">
            Você será redirecionado para nossa página de pagamento segura
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
