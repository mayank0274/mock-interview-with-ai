'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import createInterviewImg from '@/assets/create_interview.png';
import attendInterviewImg from '@/assets/attend_interview.png';
import resultImg from '@/assets/result.png';
import { Heart, Presentation, Trophy } from 'lucide-react';

const steps = [
  {
    title: 'Tailor Your Interview',
    description:
      'Select your desired role, tech stack, and experience level. Our AI instantly generates a customized interview session that targets your specific needs and career goals.',
    image: createInterviewImg,
    icon: <Heart />,
  },
  {
    title: 'Real-Time AI Interview',
    description:
      'Experience a realistic interview environment with our advanced AI. Solve coding challenges in the integrated editor while receiving voice-based questions and guidance just like the real thing.',
    image: attendInterviewImg,
    icon: <Presentation />,
  },
  {
    title: 'Detailed Performance Insights',
    description:
      'Get comprehensive feedback on your code quality, problem-solving approach, and communication skills. Track your progress over time and identify specific areas for improvement.',
    image: resultImg,
    icon: <Trophy />,
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how_it_works"
      className="py-24 relative overflow-hidden w-full"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-30">
        <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[25rem] h-[25rem] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master your technical interviews in three simple steps. Our
            AI-driven platform tailored specifically for developers.
          </p>
        </motion.div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
                  {step.icon}
                </div>
                <h3 className="text-3xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="flex-1 w-full relative">
                <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden aspect-[4/3] group">
                  <div className="absolute inset-0 bg-muted/20 z-0"></div>
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                </div>
                <div
                  className={`absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl opacity-40 -z-10 group-hover:opacity-50 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
