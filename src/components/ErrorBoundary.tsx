import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Componente para capturar erros JavaScript em componentes filhos
 * 
 * Funcionalidades:
 * - Captura erros de renderização e lifecycle
 * - Exibe fallback UI quando há erro
 * - Loga erros para debugging
 * - Permite retry da aplicação
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre o fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Atualiza o state com informações do erro
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo);
  }

  /**
   * Loga o erro para serviços externos de monitoramento
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // Exemplo de envio para serviço de monitoramento
      // Sentry.captureException(error, { extra: errorInfo });
      
      // Por enquanto, apenas log no console
      console.group('🚨 Error Boundary Report');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Timestamp:', new Date().toISOString());
      console.error('User Agent:', navigator.userAgent);
      console.error('URL:', window.location.href);
      console.groupEnd();
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  }

  /**
   * Reseta o estado de erro
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Redireciona para a página inicial
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Recarrega a página
   */
  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Renderiza o fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderiza o fallback padrão
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Encontramos um problema inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para o Início
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                  variant="ghost"
                >
                  Recarregar Página
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Se o problema persistir, entre em contato conosco
                </p>
                <p className="text-xs text-gray-500">
                  suporte@cuttime.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar o ErrorBoundary em componentes funcionais
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Aqui você pode implementar lógica adicional de tratamento de erro
    // como enviar para serviços de monitoramento
    
    // Por enquanto, apenas re-throw para que o ErrorBoundary capture
    throw error;
  };

  return { handleError };
};

/**
 * HOC para adicionar tratamento de erro a componentes
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}; 