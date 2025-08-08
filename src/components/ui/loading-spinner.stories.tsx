import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './loading-spinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary'],
    },
    text: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const WithText: Story = {
  args: {
    text: 'Carregando...',
  },
};

export const LargeWithText: Story = {
  args: {
    size: 'lg',
    text: 'Processando dados...',
  },
};

export const PrimaryWithText: Story = {
  args: {
    variant: 'primary',
    text: 'Salvando alterações...',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="sm" />
        <span className="text-sm">Small</span>
      </div>
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="md" />
        <span className="text-sm">Medium</span>
      </div>
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="lg" />
        <span className="text-sm">Large</span>
      </div>
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="xl" />
        <span className="text-sm">Extra Large</span>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSpinner variant="default" />
        <span className="text-sm">Default</span>
      </div>
      <div className="flex items-center space-x-4">
        <LoadingSpinner variant="primary" />
        <span className="text-sm">Primary</span>
      </div>
      <div className="flex items-center space-x-4">
        <LoadingSpinner variant="secondary" />
        <span className="text-sm">Secondary</span>
      </div>
    </div>
  ),
};

