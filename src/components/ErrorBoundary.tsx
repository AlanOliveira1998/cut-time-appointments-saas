import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    // Implementar relatório de erro
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('Error Report:', errorReport);
    // Aqui você pode enviar para um endpoint de relatório de erros
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Algo deu errado</AlertTitle>
              <AlertDescription>
                Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato conosco se o problema persistir.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button 
                onClick={this.handleRetry} 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReportError}
                className="w-full"
              >
                Reportar erro
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs overflow-auto mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar em componentes funcionais
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// Componente de fallback padrão
export const DefaultErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Erro inesperado</h1>
      <p className="text-gray-600 mb-6">
        Algo deu errado. Tente novamente ou entre em contato conosco.
      </p>
      {retry && (
        <Button onClick={retry} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  </div>
); 