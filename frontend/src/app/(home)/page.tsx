import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import TestimonialSection from './TestimonialSection';
import FAQSection from './FAQSection';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <TestimonialSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
