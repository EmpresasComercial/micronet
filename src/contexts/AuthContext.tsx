import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useToast } from '../components/Toast';

interface AuthContextType {
  session: Session | null;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, ready: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // 1) Verifica sessão inicial em background (sem bloquear UI)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    // 2) Ouve eventos de auth (login/logout, expiração, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);

        if (event === 'SIGNED_OUT') {
          showToast('Sessão expirada ou encerrada. Faça login novamente.', 'info');
          navigate('/login', { replace: true });
        }
        
        if (event === 'SIGNED_IN') {
          navigate('/home', { replace: true });
        }
      }
    );

    // Limpeza ao desmontar
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
