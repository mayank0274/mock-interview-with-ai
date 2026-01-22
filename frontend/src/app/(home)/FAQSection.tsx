'use client';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'Is it free to use?',
    answer:
      'Yes, Interviewaly is completely free to use during our current public beta test phase. We believe in democratizing access to high-quality interview preparation. Enjoy full access to all features without any cost.',
  },
  {
    question: 'What data do you store?',
    answer:
      'We value your privacy highly. We only store essential data required to provide the service, such as your authentication details and interview history (to generate progress reports). We do not share your personal data with third parties without your explicit consent.',
  },
  {
    question: 'Can I practice for specific job roles?',
    answer:
      'Absolutely. You can customize your interview sessions based on industry-standard roles like Frontend Developer, Backend Engineer, Full Stack, DevOps, and more. You can also specify the tech stack you want to be tested on.',
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 w-full bg-background relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[20%] w-[15rem] h-[15rem] bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[20rem] h-[20rem] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about the platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border/50"
              >
                <AccordionTrigger className="text-left text-lg font-medium py-6 hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
