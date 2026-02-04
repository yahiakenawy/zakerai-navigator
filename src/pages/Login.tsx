import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { t } = useLanguage();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: 'Success',
          description: 'Login successful!',
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Login failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl float-animation" />
      <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl float-animation" style={{ animationDelay: '-3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card p-8 space-y-8">
          {/* Logo */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-2xl gradient-bg shadow-lg mb-4"
            >
              <GraduationCap className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">{t('auth.welcome')}</h1>
            <p className="text-muted-foreground mt-2">{t('auth.pleaseLogin')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading || isLoading}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading || isLoading}
                  className="bg-background/50 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || isLoading}
              className="w-full gradient-bg text-white h-12 text-base"
            >
              {(loading || isLoading) ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t('auth.loginBtn')
              )}
            </Button>
          </form>

          {/* Demo Notice */}
          <p className="text-center text-xs text-muted-foreground">
            Demo mode: Any credentials will work
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
