'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/userContext';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import {
  User,
  Mail,
  CreditCard,
  Calendar,
  Activity,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <SidebarWrapper>
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </SidebarWrapper>
    );
  }

  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastUpdateDate = new Date(user.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SidebarWrapper>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-8">
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-block">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary font-medium">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {user.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="font-normal">
                      {user.role}
                    </Badge>
                    <Badge
                      variant={
                        user.subscription_tier === 'Premium'
                          ? 'default'
                          : 'outline'
                      }
                      className={
                        user.subscription_tier === 'Premium'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                      }
                    >
                      {user.subscription_tier}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">
                        Status
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                        <span className="text-sm font-medium">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">
                        Joined
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(user.created_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Account Overview
                </CardTitle>
                <CardDescription>
                  Your account activity and usage statistics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Credits
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {user.credits_remaining}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Remaining for this cycle
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Joined
                      </span>
                    </div>
                    <p className="text-sm font-medium pt-1">{joinedDate}</p>
                    <p className="text-xs text-muted-foreground">
                      Member since
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Last Update
                      </span>
                    </div>
                    <p className="text-sm font-medium pt-1">{lastUpdateDate}</p>
                    <p className="text-xs text-muted-foreground">
                      Profile updated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  General Information
                </CardTitle>
                <CardDescription>
                  Personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/20 border border-border/40">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.name}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/20 border border-border/40">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">
                      Role
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/20 border border-border/40">
                      <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default ProfilePage;
