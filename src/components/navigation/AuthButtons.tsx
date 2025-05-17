
import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthButtons = () => {
  return (
    <div className="hidden md:flex items-center space-x-3">
      <Button variant="nav" asChild size="sm">
        <Link to="/login" className="flex items-center gap-1.5">
          <LogIn className="h-3.5 w-3.5" />
          <span>Entrar</span>
        </Link>
      </Button>
      
      <Button variant="gradient" asChild size="sm">
        <Link to="/signup" className="flex items-center gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Criar Conta</span>
        </Link>
      </Button>
    </div>
  );
};

export default AuthButtons;
