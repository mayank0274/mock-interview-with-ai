'use client';
import React, { useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import DEMO_IMAGE from '@/assets/hero.gif';
import Image from 'next/image';

const HeroSection = () => {
  const videoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () => {
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="relative w-full pt-20 md:pt-28 pb-5 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[10%] right-[10%] w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: Currently In Testing Phase
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1] "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Ace Tech Interviews with
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary-foreground to-primary">
            {' '}
            AI & Manage Job Applications Effectively
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Practice interviews with real-time AI guidance, track every
          application, and land your dream job faster with
          <span className="font-semibold text-foreground ml-1">
            interviewly.ai
          </span>
          .
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href={'/dashboard/create-interview'}
            className="w-full sm:w-auto"
          >
            <Button
              size={'lg'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-12 px-8 text-base w-full"
            >
              Get Started for Free
            </Button>
          </Link>
          <Button
            variant="outline"
            size={'lg'}
            className="h-12 px-8 text-base w-full sm:w-auto hover:bg-muted/50 border-input"
            onClick={scrollToDemo}
          >
            <Play className="w-4 h-4 mr-2" />
            Watch Demo
          </Button>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <Avatar
                key={i}
                className="w-10 h-10 border-2 border-background ring-2 ring-background/50"
              >
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                  U{i}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-primary">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <p className="text-sm text-primary/80 font-medium mt-1">
              Trusted by <span className="text-foreground">1,000+</span>{' '}
              developers
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={videoRef}
          className="w-full max-w-5xl mt-24 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="relative rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden aspect-video group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

            <div className="absolute inset-0 bg-muted flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted via-background to-muted">
              <Image
                src={DEMO_IMAGE}
                alt="Hero Demo"
                fill
                className="w-full h-full object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-background/10 pointer-events-none" />
            </div>
          </div>

          <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-xl blur-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-500" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
