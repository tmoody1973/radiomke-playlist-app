
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmbedDemoErrorProps {
  error: string;
}

const EmbedDemoError = ({ error }: EmbedDemoErrorProps) => {
  const is404Error = error.includes('404') || error.includes('not found');
  const isNetworkError = error.includes('network') || error.includes('fetch') || error.includes('failed to connect');
  const isAuthError = error.includes('401') || error.includes('403') || error.includes('unauthorized');
  const isWordPressError = error.includes('WordPress') || error.includes('plugin') || error.includes('theme');
  
  // Determine the most likely cause of the error
  const errorTitle = is404Error 
    ? 'API Endpoint Not Found' 
    : isNetworkError 
      ? 'Network Connection Error'
      : isAuthError 
        ? 'Authentication Error'
        : isWordPressError
          ? 'WordPress Integration Error'
          : 'Embed Error';
  
  // Generate appropriate troubleshooting steps
  const troubleshootingSteps = [
    is404Error && 'Verify the Supabase edge function "spinitron-proxy" is correctly deployed',
    isNetworkError && 'Check your internet connection and any firewall or security settings',
    isAuthError && 'Ensure your authentication token is valid and has not expired',
    isWordPressError && 'Make sure your WordPress installation allows external scripts',
    isWordPressError && 'Try disabling any plugin that might be blocking external JavaScript',
    'Try refreshing the page',
    'Clear your browser cache and cookies',
    'Try using a different browser',
  ].filter(Boolean);

  // Add WordPress-specific guidance
  const wordPressGuidance = isWordPressError ? (
    <div className="bg-card p-4 rounded-lg border mb-4">
      <h4 className="text-md font-medium mb-2">WordPress Integration Tips</h4>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Use a shortcode plugin if available for better WordPress integration</li>
        <li>Make sure your theme's Content Security Policy allows scripts from our domain</li>
        <li>Try loading the embed in an iframe instead of direct script injection</li>
        <li>If using Gutenberg, try our dedicated Gutenberg block if available</li>
      </ul>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {wordPressGuidance}
        
        <div className="bg-card p-6 rounded-lg border mb-8">
          <div className="flex items-start mb-4">
            <Info className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
            <h3 className="text-lg font-medium">Troubleshooting Steps</h3>
          </div>
          
          <ul className="list-disc pl-6 space-y-2 mb-6">
            {troubleshootingSteps.map((step, index) => (
              <li key={index} className="text-muted-foreground">{step}</li>
            ))}
          </ul>
          
          <div className="text-center space-y-4">
            <Button onClick={() => window.location.reload()} className="mr-2">
              Try Again
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Technical Details</AlertTitle>
          <AlertDescription className="font-mono text-xs mt-2 whitespace-pre-wrap">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default EmbedDemoError;
