import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { Button, Avatar, Container } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showNavigation = true, 
  className 
}) => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard', roles: ['attendee', 'staff', 'event_creator', 'super_admin'] },
    { label: 'Events', href: '/events', roles: ['attendee', 'staff', 'event_creator', 'super_admin'] },
    { label: 'Admin', href: '/admin', roles: ['staff', 'event_creator', 'super_admin'] },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <header className={cn(
      'bg-white border-b border-neutral-200 sticky top-0 z-50',
      className
    )}>
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-semibold text-neutral-900">
                {title || 'EventLite'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {showNavigation && user && (
            <nav className="hidden md:flex items-center space-x-6">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <Avatar 
                  size="sm" 
                />
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-neutral-900">{user.username}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={isLoading}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="sm:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && user && (
          <div className="sm:hidden border-t border-neutral-200 py-4">
            <nav className="flex flex-col space-y-3">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-3 border-t border-neutral-200 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={isLoading}
                  className="justify-start w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};

export { Header };
