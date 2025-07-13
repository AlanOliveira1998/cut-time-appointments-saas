import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
  it('should render input with basic props', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render input with different types', () => {
    render(<Input type="email" placeholder="Enter email" />);
    
    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should show error state', () => {
    render(
      <Input 
        error={true} 
        helperText="This field is required" 
        placeholder="Enter text" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    const helperText = screen.getByText('This field is required');
    
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(helperText).toHaveClass('text-destructive');
    expect(helperText).toHaveAttribute('role', 'alert');
  });

  it('should show helper text without error', () => {
    render(
      <Input 
        helperText="This is helpful information" 
        placeholder="Enter text" 
      />
    );
    
    const helperText = screen.getByText('This is helpful information');
    expect(helperText).toHaveClass('text-muted-foreground');
    expect(helperText).not.toHaveAttribute('role', 'alert');
  });

  it('should handle aria-describedby correctly', () => {
    render(
      <Input 
        aria-describedby="custom-description"
        placeholder="Enter text" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('should combine aria-describedby with helper text', () => {
    render(
      <Input 
        aria-describedby="custom-description"
        helperText="Helper text"
        placeholder="Enter text" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('should handle error with aria-describedby', () => {
    render(
      <Input 
        aria-describedby="custom-description"
        error={true}
        helperText="Error message"
        placeholder="Enter text" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('should apply error styles to input', () => {
    render(
      <Input 
        error={true}
        placeholder="Enter text" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('border-destructive');
    expect(input).toHaveClass('focus-visible:ring-destructive');
  });

  it('should not show helper text when not provided', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    
    // Não deve haver elementos de texto de ajuda
    const container = input.parentElement;
    expect(container?.querySelector('p')).not.toBeInTheDocument();
  });
}); 