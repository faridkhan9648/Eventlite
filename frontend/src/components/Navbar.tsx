import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { Button } from './ui';
import { cn } from '../utils/cn';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Roles', href: '#roles' },
    { name: 'About', href: '#about' }
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-dark">EventLite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">
                <UserPlus className="h-4 w-4 mr-1" />
                Sign Up
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200">
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-neutral-600 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button 
                size="sm" 
                className="w-full" 
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link to="/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navbar };
