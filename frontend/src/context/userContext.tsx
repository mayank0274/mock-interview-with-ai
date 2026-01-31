'use client';

import { IUser } from '@/types/user.types';
import { createContext, useContext, useMemo, useCallback } from 'react';
import {
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/http/api';
import { toast } from 'sonner';

type AuthContextType = {
  user: IUser | null;
  isLoadingUser: boolean;
  isError: boolean;
  refetchUser: () => void;
  setUser: (user: IUser | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: UseMutateAsyncFunction<any, Error, void, unknown>;
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

  const { mutateAsync: login } = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/login');
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.auth_url;
    },
    onError: () => {
      toast('Something went wrong while login');
    },
  });

  const value = useMemo(
    () => ({
      user: data ?? null,
      setUser,
      isLoadingUser: isLoading,
      isError,
      refetchUser: refetch,
      login,
    }),
    [data, setUser, isLoading, isError, refetch, login],
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
