'use client';

import { IUser } from '@/types/user.types';
import { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<IUser | null>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data as IUser;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const setUser = useCallback(
    (user: IUser | null) => {
      queryClient.setQueryData(['auth-user'], user);
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      user: data ?? null,
      setUser,
      isLoadingUser: isLoading,
      isError,
      refetchUser: refetch,
    }),
    [data, setUser, isLoading, isError, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
