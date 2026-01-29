'use client';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-muted/30 py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground mb-12">
          <p>© 2026 Interviewaly.ai. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href={'/terms'}
              className="hover:text-primary transition-colors"
            >
              Terms and conditions
            </Link>
            <Link
              href={'/privacy'}
              className="hover:text-primary transition-colors"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center items-center opacity-5 pointer-events-none select-none ">
        <h1 className="text-[10vw] md:text-[14vw] font-bold tracking-tighter text-foreground whitespace-nowrap leading-[0.8]">
          Interviewly
        </h1>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[150px] -z-0 pointer-events-none" />
    </footer>
  );
};

export default Footer;
