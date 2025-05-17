
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, TrendingUp, History, UserCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const NavLinks = ({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems: NavItem[] = [
    { title: 'Ínicio', path: '/', icon: <Home className="h-4 w-4" /> },
    { title: 'Filmes', path: '/movie', icon: <Film className="h-4 w-4" /> },
    { title: 'Séries & Animes', path: '/tv', icon: <Tv className="h-4 w-4" /> },
    { title: 'Tendência ', path: '/trending', icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Continuar Assistir', path: '/watch-history', icon: <History className="h-4 w-4" /> },
  ];

  const authItems: NavItem[] = user ? [
    { title: 'Perfil', path: '/profile', icon: <UserCircle className="h-4 w-4" /> },
  ] : [
    { title: 'Entrar', path: '/login', icon: <LogIn className="h-4 w-4" /> },
    { title: 'Criar Conta', path: '/signup', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <>
      {mobile ? (
        <div className="space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              } transition-all duration-200`}
              onClick={handleClick}
            >
              <span className={`${location.pathname === item.path ? 'text-purple-400' : ''}`}>
                {item.icon}
              </span>
              <span>{item.title}</span>
            </Link>
          ))}
          
          <div className="my-4 border-t border-white/10"></div>
          
          {!user && authItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              } transition-all duration-200`}
              onClick={handleClick}
            >
              <span className={`${location.pathname === item.path ? 'text-purple-400' : ''}`}>
                {item.icon}
              </span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? 'nav-link-active' : 'nav-link-inactive'
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default NavLinks;
