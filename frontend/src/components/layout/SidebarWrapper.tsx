'use client';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/context/userContext';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoadingUser, isError } = useAuth();

  if ((!user && !isLoadingUser) || isError) {
    return <p className="text-red-500">Not autheticated</p>;
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {isLoadingUser ? (
                <Loader2 className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
