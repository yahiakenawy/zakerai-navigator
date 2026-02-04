import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe, LogOut, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 glass-card"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow-sm">
              <span className="text-xl font-bold text-white">Z</span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Zaker AI</h1>
            <p className="text-xs text-muted-foreground">{t('questions.title')}</p>
          </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Globe className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-bold uppercase">
                  {language}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border">
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={cn(language === 'en' && 'bg-secondary')}
              >
                <span className="me-2">🇺🇸</span> English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('ar')}
                className={cn(language === 'ar' && 'bg-secondary')}
              >
                <span className="me-2">🇸🇦</span> العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.div>
          </Button>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-start">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border">
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 me-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" className="gradient-bg text-white">
              {t('nav.login')}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
