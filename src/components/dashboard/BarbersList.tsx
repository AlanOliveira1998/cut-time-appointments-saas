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
  owner_id?: string;
  role: 'owner' | 'employee';
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
      console.log('🔍 Iniciando busca de barbeiros...');
      
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

      console.log('📊 Resultado da busca:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar barbeiros:', error);
        throw error;
      }
      
      console.log('✅ Barbeiros carregados com sucesso:', data?.length || 0);
      setBarbers((data || []) as Barber[]);
    } catch (error: any) {
      console.error('💥 Erro crítico ao buscar barbeiros:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar a lista de barbeiros: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('🚀 Iniciando processo de cadastro/atualização...');
      console.log('📝 Dados do formulário:', formData);
      console.log('👤 Usuário atual:', user?.id);

      if (editingBarber) {
        console.log('✏️ Modo edição - Atualizando barbeiro existente');
        
        // Atualizar barbeiro existente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            phone: formData.phone
          })
          .eq('id', editingBarber.profile_id);

        if (profileError) {
          console.error('❌ Erro ao atualizar profile:', profileError);
          throw profileError;
        }

        const { error: barberError } = await supabase
          .from('barbers')
          .update({
            specialty: formData.specialty,
            experience_years: formData.experience_years,
            is_active: formData.is_active
          })
          .eq('id', editingBarber.id);

        if (barberError) {
          console.error('❌ Erro ao atualizar barbeiro:', barberError);
          throw barberError;
        }

        console.log('✅ Barbeiro atualizado com sucesso');
        toast({
          title: "Sucesso!",
          description: "Barbeiro atualizado com sucesso",
        });
      } else {
        console.log('➕ Modo criação - Cadastrando novo barbeiro funcionário');
        
        // Buscar o barbeiro owner atual
        const { data: ownerBarber, error: ownerError } = await supabase
          .from('barbers')
          .select('id, profile_id')
          .eq('profile_id', user?.id)
          .eq('role', 'owner')
          .single();

        if (ownerError || !ownerBarber) {
          console.error('❌ Usuário não é um barbeiro owner:', ownerError);
          throw new Error('Você precisa ser um barbeiro owner para cadastrar funcionários');
        }

        console.log('✅ Barbeiro owner encontrado:', ownerBarber.id);

        // Criar novo barbeiro funcionário (sem profile separado)
        console.log('💼 Criando novo barbeiro funcionário...');
        const { data: barberData, error: barberError } = await supabase
          .from('barbers')
          .insert([{
            profile_id: ownerBarber.profile_id, // Usar o profile_id do barbeiro owner como referência
            specialty: formData.specialty,
            experience_years: formData.experience_years,
            is_active: formData.is_active,
            role: 'employee',
            owner_id: ownerBarber.id,
            // Armazenar dados do funcionário diretamente na tabela barbers
            employee_name: formData.name,
            employee_phone: formData.phone
          }])
          .select()
          .single();

        if (barberError) {
          console.error('❌ Erro ao criar barbeiro funcionário:', barberError);
          console.error('📋 Detalhes do erro:', {
            code: barberError.code,
            message: barberError.message,
            details: barberError.details,
            hint: barberError.hint
          });
          throw barberError;
        }

        console.log('✅ Barbeiro funcionário criado com sucesso:', barberData);
        toast({
          title: "Sucesso!",
          description: "Barbeiro funcionário cadastrado com sucesso",
        });
      }

      // Resetar formulário e fechar dialog
      setIsDialogOpen(false);
      setEditingBarber(null);
      setFormData({
        name: '',
        phone: '',
        specialty: '',
        experience_years: 0,
        is_active: true
      });
      
      // Recarregar lista
      console.log('🔄 Recarregando lista de barbeiros...');
      fetchBarbers();
      
    } catch (error: any) {
      console.error('💥 Erro crítico no processo:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Não foi possível salvar o barbeiro";
      
      if (error.code === '42501') {
        errorMessage = "Erro de permissão: Verifique se você tem acesso para criar barbeiros";
      } else if (error.code === '23505') {
        errorMessage = "Já existe um barbeiro com esses dados";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (barber: Barber) => {
    console.log('✏️ Editando barbeiro:', barber);
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
      console.log('🗑️ Excluindo barbeiro:', barberId);
      
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', barberId);

      if (error) {
        console.error('❌ Erro ao excluir barbeiro:', error);
        throw error;
      }

      console.log('✅ Barbeiro excluído com sucesso');
      toast({
        title: "Sucesso!",
        description: "Barbeiro excluído com sucesso",
      });
      fetchBarbers();
    } catch (error: any) {
      console.error('💥 Erro ao excluir barbeiro:', error);
      toast({
        title: "Erro",
        description: `Não foi possível excluir o barbeiro: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const openNewBarberDialog = () => {
    console.log('➕ Abrindo dialog para novo barbeiro');
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

  // Debug: Verificar estado atual
  console.log('🔍 Estado atual:', {
    barbersCount: barbers.length,
    isLoading,
    user: user?.id,
    isDialogOpen
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando barbeiros...</p>
        </div>
      </div>
    );
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
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Digite o nome do barbeiro"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
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
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    experience_years: parseInt(e.target.value) || 0
                  }))}
                  placeholder="0"
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
              <div className="flex justify-end space-x-2 pt-4">
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

      {barbers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum barbeiro cadastrado</h3>
          <p className="text-gray-500 mb-4">Comece adicionando o primeiro barbeiro da sua equipe.</p>
          <Button onClick={openNewBarberDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Barbeiro
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <Card key={barber.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{barber.profiles.name}</CardTitle>
                    <CardDescription>{barber.profiles.phone || 'Sem telefone'}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Badge variant={barber.role === 'owner' ? "default" : "outline"}>
                    {barber.role === 'owner' ? 'Dono' : 'Funcionário'}
                  </Badge>
                  <Badge variant={barber.is_active ? "default" : "secondary"}>
                    {barber.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
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
      )}
    </div>
  );
};
