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

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>User not found</p>;
  }
  return (
    <SidebarWrapper>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <Card className="shadow-lg">
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <Avatar className="w-28 h-28 border-2 border-primary">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-lg">{user.email}</p>
              <div className="flex justify-center sm:justify-start items-center gap-2 flex-wrap mt-2">
                <Badge variant="secondary" className="uppercase">
                  {user.role}
                </Badge>
                <Badge
                  variant={
                    user.subscription_tier === 'Premium'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="uppercase"
                >
                  {user.subscription_tier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Key information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left p-6">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                {user.credits_remaining}
              </p>
              <p className="text-sm text-muted-foreground">Credits</p>
            </div>
            <div className="space-y-1">
              <p
                className={`text-2xl font-bold ${user.is_active ? 'text-green-500' : 'text-red-500'}`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">Joined</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {new Date(user.updated_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">Last Update</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />
      </div>
    </SidebarWrapper>
  );
};

export default ProfilePage;
