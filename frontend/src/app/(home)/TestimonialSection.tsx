'use client';
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at TechCorp',
    content:
      'Interviewaly transformed my preparation. The AI feedback was incredibly precise, catching edge cases I missed. I felt so much more confident walking into my real interview.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    initials: 'SC',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Frontend Developer',
    content:
      "The realistic coding environment is a game-changer. Being able to code and talk through my thought process with the AI interviewer helped me master the 'think aloud' technique that companies love.",
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    initials: 'MR',
  },
  {
    name: 'Priya Patel',
    role: 'Full Stack Developer',
    content:
      'I used to get so nervous during system design rounds. The structured practice sessions here helped me organize my thoughts and present my solutions clearly. Landed my dream job last week!',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    initials: 'PP',
  },
  {
    name: 'David Kim',
    role: 'Junior Developer',
    content:
      "As a recent grad, I didn't know what to expect. This platform demystified the whole process. The behavioral questions section was surprisingly helpful for preparing my soft skills answers.",
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    initials: 'DK',
  },
  {
    name: 'Emily Wang',
    role: 'Senior React Developer',
    content:
      'Even as a senior dev, I needed to brush up on algorithms. The difficulty scaling is perfect. It challenged me without being overwhelming. Highly recommend for any experience level.',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    initials: 'EW',
  },
  {
    name: 'James Wilson',
    role: 'Engineering Manager',
    content:
      "I use this to practice for my own interviews and also to get inspiration for questions to ask candidates. The AI's versatility in different tech stacks is impressive.",
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    initials: 'JW',
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-24 bg-muted/50 w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[30%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[25rem] h-[25rem] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Loved by Developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who have leveled up their careers with
            our platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card className="h-full border-border/50 bg-card hover:border-primary/20 transition-colors shadow-sm hover:shadow-md">
                <CardHeader className="pb-2">
                  <Quote className="w-8 h-8 text-primary/40 mb-2" />
                  <p className="text-muted-foreground leading-relaxed italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                </CardHeader>
                <CardContent className="pt-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
