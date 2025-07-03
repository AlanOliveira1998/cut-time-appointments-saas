import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User } from 'lucide-react';

interface Barber {
  id: string;
  profile_id: string;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  profiles: {
    name: string;
    phone?: string;
  };
}

export const BarbersList: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    experience_years: 0,
    is_active: true
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de barbeiros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBarber) {
        // Atualizar barbeiro existente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            phone: formData.phone
          })
          .eq('id', editingBarber.profile_id);

        if (profileError) throw profileError;

        const { error: barberError } = await supabase
          .from('barbers')
          .update({
            specialty: formData.specialty,
            experience_years: formData.experience_years,
            is_active: formData.is_active
          })
          .eq('id', editingBarber.id);

        if (barberError) throw barberError;

        toast({
          title: "Sucesso!",
          description: "Barbeiro atualizado com sucesso",
        });
      } else {
        // Criar novo perfil primeiro
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: crypto.randomUUID(),
            name: formData.name,
            phone: formData.phone
          }])
          .select()
          .single();

        if (profileError) throw profileError;

        // Criar novo barbeiro
        const { error: barberError } = await supabase
          .from('barbers')
          .insert([{
            profile_id: profileData.id,
            specialty: formData.specialty,
            experience_years: formData.experience_years,
            is_active: formData.is_active
          }]);

        if (barberError) throw barberError;

        toast({
          title: "Sucesso!",
          description: "Barbeiro cadastrado com sucesso",
        });
      }

      setIsDialogOpen(false);
      setEditingBarber(null);
      setFormData({
        name: '',
        phone: '',
        specialty: '',
        experience_years: 0,
        is_active: true
      });
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao salvar barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o barbeiro",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.profiles.name,
      phone: barber.profiles.phone || '',
      specialty: barber.specialty || '',
      experience_years: barber.experience_years,
      is_active: barber.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (barberId: string) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;

    try {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', barberId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Barbeiro excluído com sucesso",
      });
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao excluir barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o barbeiro",
        variant: "destructive",
      });
    }
  };

  const openNewBarberDialog = () => {
    setEditingBarber(null);
    setFormData({
      name: '',
      phone: '',
      specialty: '',
      experience_years: 0,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Carregando barbeiros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Barbeiros</h2>
          <p className="text-gray-600">Gerencie os profissionais da sua barbearia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewBarberDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Barbeiro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
              </DialogTitle>
              <DialogDescription>
                {editingBarber 
                  ? 'Edite as informações do barbeiro' 
                  : 'Adicione um novo barbeiro à sua equipe'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidade</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corte Masculino">Corte Masculino</SelectItem>
                    <SelectItem value="Barba">Barba</SelectItem>
                    <SelectItem value="Corte + Barba">Corte + Barba</SelectItem>
                    <SelectItem value="Corte Infantil">Corte Infantil</SelectItem>
                    <SelectItem value="Todos os Serviços">Todos os Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Anos de Experiência</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    experience_years: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBarber ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <Card key={barber.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{barber.profiles.name}</CardTitle>
                  <CardDescription>{barber.profiles.phone}</CardDescription>
                </div>
              </div>
              <Badge variant={barber.is_active ? "default" : "secondary"}>
                {barber.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Especialidade:</strong> {barber.specialty || 'Não informado'}
                </p>
                <p className="text-sm">
                  <strong>Experiência:</strong> {barber.experience_years} anos
                </p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(barber)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(barber.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};