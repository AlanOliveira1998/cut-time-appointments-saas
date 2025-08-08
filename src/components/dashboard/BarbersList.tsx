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
import { Plus, Edit, Trash2, User, ExternalLink, Copy } from 'lucide-react';

interface Barber {
  id: string;
  profile_id: string | null;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  owner_id?: string;
  role: 'owner' | 'employee';
  employee_name?: string;
  employee_phone?: string;
  profiles?: {
    name: string;
    phone?: string;
  } | null;
}

interface BarbersListProps {
  barbers?: Barber[];
  onEditBarber?: (id: string) => void;
  onDeleteBarber?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  showActions?: boolean;
  showAddButton?: boolean;
}

export const BarbersList: React.FC<BarbersListProps> = ({
  barbers: externalBarbers,
  onEditBarber,
  onDeleteBarber,
  onToggleStatus,
  showActions = true,
  showAddButton = true
}) => {
  const [internalBarbers, setInternalBarbers] = useState<Barber[]>([]);
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

  // Usar barbeiros externos se fornecidos, senão buscar internamente
  const barbers = externalBarbers || internalBarbers;

  useEffect(() => {
    if (!externalBarbers) {
      fetchBarbers();
    } else {
      setIsLoading(false);
    }
  }, [externalBarbers]);

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
      setInternalBarbers((data || []) as Barber[]);
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
        console.log('🆕 Modo criação - Cadastrando novo barbeiro');
        
        // Criar novo profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            name: formData.name,
            phone: formData.phone
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ Erro ao criar profile:', profileError);
          throw profileError;
        }

        console.log('✅ Profile criado:', profileData);

        // Criar novo barbeiro
        const { error: barberError } = await supabase
          .from('barbers')
          .insert({
            profile_id: profileData.id,
            specialty: formData.specialty,
            experience_years: formData.experience_years,
            is_active: formData.is_active,
            owner_id: user?.id,
            role: 'employee'
          });

        if (barberError) {
          console.error('❌ Erro ao criar barbeiro:', barberError);
          throw barberError;
        }

        console.log('✅ Barbeiro criado com sucesso');
        toast({
          title: "Sucesso!",
          description: "Barbeiro cadastrado com sucesso",
        });
      }

      // Limpar formulário e fechar dialog
      setFormData({
        name: '',
        phone: '',
        specialty: '',
        experience_years: 0,
        is_active: true
      });
      setEditingBarber(null);
      setIsDialogOpen(false);

      // Recarregar lista se não estiver usando barbeiros externos
      if (!externalBarbers) {
        fetchBarbers();
      }
    } catch (error: any) {
      console.error('💥 Erro ao salvar barbeiro:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar o barbeiro: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (barber: Barber) => {
    if (onEditBarber) {
      onEditBarber(barber.id);
    } else {
      setEditingBarber(barber);
      setFormData({
        name: barber.profiles?.name || barber.employee_name || '',
        phone: barber.profiles?.phone || barber.employee_phone || '',
        specialty: barber.specialty || '',
        experience_years: barber.experience_years || 0,
        is_active: barber.is_active
      });
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (barberId: string) => {
    if (onDeleteBarber) {
      onDeleteBarber(barberId);
      return;
    }

    if (confirm('Tem certeza que deseja excluir este barbeiro?')) {
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

        // Recarregar lista se não estiver usando barbeiros externos
        if (!externalBarbers) {
          fetchBarbers();
        }
      } catch (error: any) {
        toast({
          title: "Erro",
          description: `Não foi possível excluir o barbeiro: ${error.message}`,
          variant: "destructive",
        });
      }
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

  const getBarberBookingUrl = (barber: Barber) => {
    const baseUrl = window.location.origin;
    const barberName = barber.profiles?.name || barber.employee_name || 'barbeiro';
    const normalizedName = barberName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `${baseUrl}/booking/${normalizedName}`;
  };

  const copyBarberLink = (barber: Barber) => {
    const url = getBarberBookingUrl(barber);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "Link do barbeiro copiado para a área de transferência",
    });
  };

  const openBarberLink = (barber: Barber) => {
    const url = getBarberBookingUrl(barber);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {showAddButton && (
        <div className="mb-6">
          <Button onClick={openNewBarberDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Barbeiro
          </Button>
        </div>
      )}

      {/* Dialog para adicionar/editar barbeiro */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBarber ? 'Editar Barbeiro' : 'Adicionar Novo Barbeiro'}
            </DialogTitle>
            <DialogDescription>
              {editingBarber 
                ? 'Atualize as informações do barbeiro' 
                : 'Preencha as informações para cadastrar um novo barbeiro'
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
                placeholder="Nome completo"
                required
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
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                placeholder="Ex: Barba, Cabelo, Sombrancelha"
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Anos de Experiência</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
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

      {barbers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum barbeiro cadastrado</h3>
          <p className="text-gray-500 mb-4">Comece adicionando o primeiro barbeiro da sua equipe.</p>
          {showAddButton && (
            <Button onClick={openNewBarberDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Barbeiro
            </Button>
          )}
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
                    <CardTitle className="text-base">
                      {barber.profiles?.name || barber.employee_name || 'Nome não informado'}
                    </CardTitle>
                    <CardDescription>
                      {barber.profiles?.phone || barber.employee_phone || 'Sem telefone'}
                    </CardDescription>
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
                {showActions && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyBarberLink(barber)}
                      title="Copiar link do barbeiro"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBarberLink(barber)}
                      title="Abrir página do barbeiro"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
