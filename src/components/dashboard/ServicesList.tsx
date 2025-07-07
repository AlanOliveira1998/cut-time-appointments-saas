
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  barber_id: string;
  name: string;
  duration: number;
  price: number;
  created_at: string;
}

export const ServicesList: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: ''
  });

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    if (!user) return;
    
    try {
      // Buscar o barbeiro owner do usuário atual
      const { data: ownerBarber, error: barberError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', user.id)
        .eq('role', 'owner')
        .single();

      if (barberError || !ownerBarber) {
        // Se não existe barbeiro owner, criar um
        const { data: newOwnerBarber, error: createBarberError } = await supabase
          .from('barbers')
          .insert([{
            profile_id: user.id,
            specialty: 'Geral',
            experience_years: 0,
            is_active: true,
            role: 'owner'
          }])
          .select()
          .single();

        if (createBarberError) {
          console.error('Error creating owner barber:', createBarberError);
          setServices([]);
          return;
        }

        setServices([]);
        return;
      }

      // Buscar todos os barbeiros da barbearia (owner + funcionários)
      const { data: allBarbers, error: allBarbersError } = await supabase
        .from('barbers')
        .select('id')
        .or(`id.eq.${ownerBarber.id},owner_id.eq.${ownerBarber.id}`);

      if (allBarbersError) {
        console.error('Error loading barbers:', allBarbersError);
        setServices([]);
        return;
      }

      const barberIds = allBarbers?.map(b => b.id) || [ownerBarber.id];

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .in('barber_id', barberIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading services:', error);
        toast({
          title: "Erro ao carregar serviços",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      if (editingService) {
        // Editar serviço existente
        const { error } = await supabase
          .from('services')
          .update({
            name: formData.name,
            duration: parseInt(formData.duration),
            price: parseFloat(formData.price)
          })
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: "Serviço atualizado!",
          description: "O serviço foi atualizado com sucesso.",
        });
      } else {
        // Buscar o barbeiro owner do usuário
        const { data: ownerBarber, error: barberError } = await supabase
          .from('barbers')
          .select('id')
          .eq('profile_id', user.id)
          .eq('role', 'owner')
          .single();

        if (barberError || !ownerBarber) {
          throw new Error('Você precisa ser um barbeiro owner para criar serviços');
        }

        // Criar novo serviço
        const { error } = await supabase
          .from('services')
          .insert({
            barber_id: ownerBarber.id,
            name: formData.name,
            duration: parseInt(formData.duration),
            price: parseFloat(formData.price)
          });

        if (error) throw error;

        toast({
          title: "Serviço criado!",
          description: "O novo serviço foi adicionado com sucesso.",
        });
      }
      
      loadServices();
      resetForm();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Erro ao salvar serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      loadServices();
      toast({
        title: "Serviço removido!",
        description: "O serviço foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro ao remover serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', duration: '', price: '' });
    setEditingService(null);
    setIsDialogOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="barber-card">
        <CardContent className="p-6">
          <div className="text-center">Carregando serviços...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="barber-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Meus Serviços</CardTitle>
            <CardDescription>
              Gerencie os serviços oferecidos em sua barbearia
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="barber-button-primary" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Nome do serviço</Label>
                  <Input
                    id="serviceName"
                    placeholder="Ex: Corte + Barba"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Ex: 45"
                    min="15"
                    max="180"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 35.00"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1 barber-button-primary">
                    {editingService ? 'Salvar' : 'Criar Serviço'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Nenhum serviço cadastrado ainda</p>
            <p className="text-sm text-gray-400">
              Adicione seus primeiros serviços para começar a receber agendamentos
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-lg">{service.name}</h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{service.duration}min</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatPrice(service.price)}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
