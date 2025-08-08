import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardAppointments } from '@/components/dashboard/DashboardAppointments';
import { ProfileDebug } from '@/components/debug/ProfileDebug';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Plus } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, stats, loading, error, daysRemaining, refreshData } = useDashboardData();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNewAppointment = () => {
    navigate('/dashboard/appointments');
  };

  const handleViewAppointment = (id: string) => {
    navigate(`/dashboard/appointments/${id}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar 
        mobileMenuOpen={mobileMenuOpen} 
        onCloseMobileMenu={closeMobileMenu} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          onToggleMobileMenu={toggleMobileMenu}
          mobileMenuOpen={mobileMenuOpen}
        />
        
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          <DashboardOverview 
            stats={stats} 
            loading={loading}
          />
          
          <DashboardAppointments 
            appointments={stats.recentAppointments}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
