'use client';

import { IUser } from '@/types/user.types';
import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/http/api';

type AuthContextType = {
  user: IUser | null;
  isLoadingUser: boolean;
  isError: boolean;
  refetchUser: () => void;
  setUser: (user: IUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data as IUser;
    },
    retry: false,

    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,

    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (data) setUser(data);
    if (isError) setUser(null);
  }, [data, isError]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoadingUser: isLoading,
        isError,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
