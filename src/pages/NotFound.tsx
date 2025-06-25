
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from '@/components/Navigation';
import { Heart } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground border-t py-4">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by Tarik aka the Architect
        </p>
      </div>
    </div>
  );
};

export default NotFound;
