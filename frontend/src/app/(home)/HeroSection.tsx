import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className="w-full md:w-[60%] mx-auto mt-10 p-2 md:p-0">
      <h1 className="text-6xl md:text-7xl text-foreground capitalize text-center leading-tight font-sans font-semibold">
        Ace Tech Interviews with AI & Manage Your Job Applications Smartly
      </h1>
      <h5 className="text-xl md:text-2xl text-muted-foreground text-center  font-sans font-normal">
        Practice interviews with AI-powered guidance, track-applications and
        land your dream job with{' '}
        <span className="bg-accent text-foreground cursor-pointer p-2 mt-1 inline-block rounded-sm">
          interviewaly.ai
        </span>
      </h5>
      <div className="flex items-center space-x-4 p-4 w-max mx-auto">
        <div className="flex -space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="path-to-image1.jpg" alt="User 1" />
            <AvatarFallback className="bg-gray-300 text-gray-800">
              U1
            </AvatarFallback>
          </Avatar>
          <Avatar className="w-12 h-12">
            <AvatarImage src="path-to-image2.jpg" alt="User 2" />
            <AvatarFallback className="bg-gray-300 text-gray-800">
              U2
            </AvatarFallback>
          </Avatar>
          <Avatar className="w-12 h-12">
            <AvatarImage src="path-to-image3.jpg" alt="User 3" />
            <AvatarFallback className="bg-gray-300 text-gray-800">
              U3
            </AvatarFallback>
          </Avatar>
          <Avatar className="w-12 h-12">
            <AvatarImage src="path-to-image4.jpg" alt="User 4" />
            <AvatarFallback className="bg-gray-300 text-gray-800">
              U4
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col ml-4">
          <div className="flex items-center space-x-1 text-yellow-400">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            1000+ active users
          </p>
        </div>
      </div>

      <div className="mx-auto w-max mt-5 flex gap-5">
        <Button
          className="bg-accent-foreground text-muted hover:bg-accent-foreground"
          size={'lg'}
        >
          See Demo
        </Button>
        <Button size={'lg'} className="bg-accent hover:bg-accent">
          Get Started for free
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
