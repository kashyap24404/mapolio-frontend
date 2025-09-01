"use client";

import React, { useState, useEffect } from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "Is this legal?",
    answer: "Yes, we extract publicly available business information. Users are responsible for compliance with local laws."
  },
  {
    question: "How accurate is the data?",
    answer: "We maintain 99.8% accuracy through validation and quality control measures."
  },
  {
    question: "What's included in each credit?",
    answer: "Each credit equals one business record. Simple pricing at $0.03 per credit, minimum 500 credits."
  },
  {
    question: "How fast are results?",
    answer: "Most extractions complete in under 2 minutes with real-time progress updates."
  },
  {
    question: "What export formats?",
    answer: "CSV, Excel, and JSON formats ready for CRM systems and marketing tools."
  },
  {
    question: "Do credits expire?",
    answer: "No, credits never expire. Use them at your own pace without monthly deadlines."
  }
];

const FAQSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  // Wait until after client-side hydration to render interactive elements
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Section id="faq" className="bg-background border-t border-border" padding="xl">
      <Container size="lg">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Everything you need to know about Mapolio.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-2xl mx-auto">
          {mounted ? (
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-muted-foreground py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            // Placeholder during mounting to prevent hydration mismatch
            <div className="space-y-4 animate-pulse">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg px-6 py-4">
                  <div className="h-6 bg-muted rounded w-48 mb-4"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FAQSection;