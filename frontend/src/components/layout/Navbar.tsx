'use client';
import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import GoogleIcon from '@/assets/google-icon.svg';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/userContext';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const { user, login } = useAuth();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  if (pathname.includes('dashboard') || pathname.includes('interview')) {
    return null;
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300 bg-transparent',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-transparent border-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground bg-clip-text transition-all duration-300 group-hover:opacity-80">
            Interviewly
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#how_it_works">How it works</NavLink>
          <NavLink href="#testimonials">Testimonials</NavLink>
          <NavLink href="#faq">Faqs</NavLink>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user?.email ? (
            <Link href={'/dashboard/create-interview'}>
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 rounded-full px-6"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              {/* <Link
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`}
                className="group flex items-center gap-2"
              > */}
              <Button
                variant="outline"
                className="rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                onClick={async () => {
                  await login();
                }}
              >
                <Image
                  src={GoogleIcon}
                  alt="Google"
                  width={18}
                  height={18}
                  className="mr-1"
                />
                <span>Log in</span>
              </Button>
              {/* </Link> */}
              <Link
                target="_blank"
                href="https://github.com/mayank0274/mock-interview-with-ai"
              >
                <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]">
                  See On Github
                  <Github className="w-3 h-3 ml-2 text-primary" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-full left-0 w-full border-b border-border bg-background/95 backdrop-blur-xl px-4 pb-6 shadow-xl animate-in slide-in-from-top-2 md:hidden">
          <div className="flex flex-col space-y-4 pt-4">
            <MobileNavLink href="#how_it_works">How it works</MobileNavLink>
            <MobileNavLink href="#testimonials">Testimonials</MobileNavLink>
            <MobileNavLink href="#faq">Faqs</MobileNavLink>
            <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
              {user?.email ? (
                <Link href={'/dashboard/create-interview'}>
                  <Button className="w-full justify-center">Dashboard</Button>
                </Link>
              ) : (
                <>
                  {/* <Link
                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`}
                    className="w-full"
                  > */}
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2"
                    onClick={async () => {
                      await login();
                    }}
                  >
                    <Image
                      src={GoogleIcon}
                      alt="Google"
                      width={18}
                      height={18}
                    />
                    Log in
                  </Button>
                  {/* </Link> */}
                  <Link
                    target="_blank"
                    href="https://github.com/mayank0274/mock-interview-with-ai"
                  >
                    <Button className="w-full justify-center gap-2">
                      See On Github
                      <Github className="w-3 h-3" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
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
      className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group py-2"
    >
      {children}
      <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
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
      className="block text-lg font-medium text-foreground/80 hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
    >
      {children}
    </Link>
  );
}
