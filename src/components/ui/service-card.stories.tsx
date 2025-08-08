import type { Meta, StoryObj } from '@storybook/react';
import { ServiceCard } from './service-card';

const meta: Meta<typeof ServiceCard> = {
  title: 'UI/ServiceCard',
  component: ServiceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'selectable', 'compact'],
    },
    showActions: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockService = {
  id: '1',
  barber_id: '1',
  name: 'Corte Masculino',
  duration: 30,
  price: 35.00,
  created_at: '2024-01-01T00:00:00Z',
};

const mockBarber = {
  id: '1',
  name: 'João Silva',
  specialty: 'Cortes Modernos',
};

export const Default: Story = {
  args: {
    service: mockService,
    barber: mockBarber,
  },
};

export const Selectable: Story = {
  args: {
    service: mockService,
    barber: mockBarber,
    variant: 'selectable',
    onSelect: (service) => console.log('Selected service:', service),
  },
};

export const Compact: Story = {
  args: {
    service: mockService,
    barber: mockBarber,
    variant: 'compact',
  },
};

export const WithoutBarber: Story = {
  args: {
    service: mockService,
  },
};

export const WithEditAndDelete: Story = {
  args: {
    service: mockService,
    barber: mockBarber,
    onEdit: (service) => console.log('Edit service:', service),
    onDelete: (service) => console.log('Delete service:', service),
  },
};

export const CompactWithActions: Story = {
  args: {
    service: mockService,
    barber: mockBarber,
    variant: 'compact',
    onEdit: (service) => console.log('Edit service:', service),
    onDelete: (service) => console.log('Delete service:', service),
  },
};

export const WithoutActions: Story = {
  args: {
    service: mockService,
    barber: mockBarber,
    showActions: false,
  },
};

export const MultipleServices: Story = {
  render: () => (
    <div className="grid gap-4 w-full max-w-2xl">
      <ServiceCard
        service={{
          id: '1',
          barber_id: '1',
          name: 'Corte Masculino',
          duration: 30,
          price: 35.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        barber={{
          id: '1',
          name: 'João Silva',
          specialty: 'Cortes Modernos',
        }}
        variant="selectable"
        onSelect={(service) => console.log('Selected:', service)}
      />
      <ServiceCard
        service={{
          id: '2',
          barber_id: '1',
          name: 'Barba',
          duration: 20,
          price: 25.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        barber={{
          id: '1',
          name: 'João Silva',
          specialty: 'Cortes Modernos',
        }}
        variant="selectable"
        onSelect={(service) => console.log('Selected:', service)}
      />
      <ServiceCard
        service={{
          id: '3',
          barber_id: '1',
          name: 'Corte + Barba',
          duration: 45,
          price: 50.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        barber={{
          id: '1',
          name: 'João Silva',
          specialty: 'Cortes Modernos',
        }}
        variant="selectable"
        onSelect={(service) => console.log('Selected:', service)}
      />
    </div>
  ),
};

export const CompactGrid: Story = {
  render: () => (
    <div className="grid gap-3 grid-cols-2 w-full max-w-2xl">
      <ServiceCard
        service={{
          id: '1',
          barber_id: '1',
          name: 'Corte Masculino',
          duration: 30,
          price: 35.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        variant="compact"
        onSelect={(service) => console.log('Selected:', service)}
      />
      <ServiceCard
        service={{
          id: '2',
          barber_id: '1',
          name: 'Barba',
          duration: 20,
          price: 25.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        variant="compact"
        onSelect={(service) => console.log('Selected:', service)}
      />
      <ServiceCard
        service={{
          id: '3',
          barber_id: '1',
          name: 'Corte + Barba',
          duration: 45,
          price: 50.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        variant="compact"
        onSelect={(service) => console.log('Selected:', service)}
      />
      <ServiceCard
        service={{
          id: '4',
          barber_id: '1',
          name: 'Hidratação',
          duration: 15,
          price: 20.00,
          created_at: '2024-01-01T00:00:00Z',
        }}
        variant="compact"
        onSelect={(service) => console.log('Selected:', service)}
      />
    </div>
  ),
};

