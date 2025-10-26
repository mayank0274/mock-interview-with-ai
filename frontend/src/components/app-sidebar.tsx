'use client';

import * as React from 'react';
import {
  IconInnerShadowTop,
  IconPlus,
  IconHistory,
  IconBriefcase,
} from '@tabler/icons-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/userContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const sidebarData = {
  navMain: [
    {
      title: 'Create Interview',
      url: '/dashboard/create-interview',
      icon: IconPlus,
    },
    {
      title: 'Past Interviews',
      url: '/dashboard/past-interviews',
      icon: IconHistory,
    },
    { title: 'Job applications', url: '#', icon: IconBriefcase },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: userData, isLoadingUser, isError } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isError) {
      router.replace(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`);
    }
  }, [isError, router]);

  if (isLoadingUser) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href="/">
                  <IconInnerShadowTop className="!size-5 animate-pulse" />
                  <span className="text-base font-semibold animate-pulse">
                    Loading...
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <p className="p-4 text-gray-400 animate-pulse">Loading menu...</p>
        </SidebarContent>
        <SidebarFooter>
          <p className="p-4 text-gray-400 animate-pulse">Loading user...</p>
        </SidebarFooter>
      </Sidebar>
    );
  }

  if (!userData) return null;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Interviewly</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
