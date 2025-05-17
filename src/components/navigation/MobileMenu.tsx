
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import NavLinks from './NavLinks';
import { useAuth } from '@/hooks';
import UserMenu from './UserMenu';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="mobile-menu">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Logo />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <NavLinks mobile onClick={onClose} />
      </div>
      
      <div className="p-5 border-t border-white/10">
        {user ? (
          <UserMenu mobile onAction={onClose} />
        ) : (
          <div className="flex gap-3 justify-center">
            <Button onClick={onClose} variant="gradient" asChild>
              <a href="/login" className="flex items-center gap-2">
                <span>Entrar</span>
              </a>
            </Button>
            <Button onClick={onClose} variant="outline" asChild>
              <a href="/signup">Criar Conta</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
