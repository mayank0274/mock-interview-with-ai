'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import LOGO from '@/assets/logo.png';
import GoogleIcon from '@/assets/google-icon.svg';

export function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
        >
          <Image
            src={LOGO}
            alt="interviewaly.ai logo"
            width={150}
            height={100}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          <NavLink href="/features">Features</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/testimonials">Testimonials</NavLink>
        </nav>

        <div className="hidden md:flex items-center">
          <Button className="group flex bg-transparent items-center text-sm font-medium px-3 py-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-primary-foreground">
            <Image
              src={GoogleIcon}
              alt="Google"
              width={20}
              height={20}
              className="mr-1"
            />{' '}
            Log in
            <ArrowRight className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 animate-fadeIn">
          <div className="flex flex-col space-y-3 pt-2">
            <MobileNavLink href="/features">Features</MobileNavLink>
            <MobileNavLink href="/pricing">Pricing</MobileNavLink>
            <MobileNavLink href="/testimonials">Testimonials</MobileNavLink>
            <Button className="w-max group flex items-center text-sm font-medium px-3 py-2 rounded-md transition-all duration-300 bg-transparent hover:bg-accent hover:text-primary-foreground">
              <Image
                src={GoogleIcon}
                alt="Google"
                width={20}
                height={20}
                className="mr-1"
              />
              Log in
              <ArrowRight className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        'text-foreground',
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block text-base font-medium hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}
