"use client";

import { Container } from "@/components/container";
import { Hero, HeroSubTitle, HeroTitle } from "@/components/hero";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Spotlight } from "@/components/ui/spotlight-new";
import Image from "next/image";
import heroImg1 from "@/public/heroimg1.avif";
import heroImg2 from "@/public/heroimg2.avif";

export function HeroSection() {
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  const scrollToNextSection = () => {
    // Scroll to the next section after hero
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 hero-nav-padding">
      <Spotlight 
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 70%, .35) 0, hsla(210, 100%, 55%, .20) 50%, hsla(210, 100%, 45%, .08) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 75%, .30) 0, hsla(210, 100%, 60%, .18) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 80%, .25) 0, hsla(210, 100%, 50%, .15) 80%, transparent 100%)"
        width={700}
        height={1600}
        smallWidth={300}
        xOffset={120}
      />
      <Image
        src={heroImg1}
        alt="hero-img1"
        className="absolute -z-50 top-10 right-20 blur-sm animate-bounce w-20 h-20"
      />
      <Image
        src={heroImg2}
        alt="hero-img1"
        className="absolute -z-50 top-[30rem] right-0 xl:right-[20rem] blur-sm animate-bounce opacity-50 xl:opacity-80"
      />
      <Container className="overflow-visible">        <Hero className="relative">
          <HeroTitle className="text-white animate-fade-in [--animation-delay:200ms] opacity-0 translate-y-[-1rem] font-semibold relative z-40">
            Platform{" "}
            {/* <span className={`text-white ${serif.className} italic`}> */}
              Community
            {/* </span> */}
            <div className="text-white animate-fade-in [--animation-delay:200ms] opacity-0 translate-y-[-1rem] font-semibold text-5xl ">
              Built by   Experts, For   Professionals
            </div>
          </HeroTitle>
          <div className=""></div>          <HeroSubTitle className="animate-fade-in [--animation-delay:200ms] opacity-0 translate-y-[-1rem] text-white relative z-40">
            Where   experts unite to share, learn, and lead the industry forward.
          </HeroSubTitle>
          <HeroSubTitle className="animate-fade-in [--animation-delay:200ms] opacity-0 translate-y-[-1rem] text-white relative z-40">
            We don&apos;t just build a platform – we cultivate a thriving ecosystem for Platform growth and innovation.
          </HeroSubTitle>          <div className="flex items-center gap-6 justify-center animate-fade-in [--animation-delay:200ms] relative z-0">
            <InteractiveHoverButton type="submit" className="h-16 px-8 text-lg font-semibold whitespace-nowrap">
              Join Community
            </InteractiveHoverButton>
            <InteractiveHoverButton 
              type="button" 
              onClick={scrollToServices}
              className="h-16 px-8 text-lg font-semibold whitespace-nowrap"
            >
              Explore Services
            </InteractiveHoverButton>
          </div>
        </Hero>
      </Container>      {/* Scroll Down Indicator - Positioned at bottom */}
      <div 
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center animate-fade-in [--animation-delay:400ms] opacity-0 translate-y-[-1rem] z-50 group cursor-pointer hover:scale-110 transition-all duration-300"
        onClick={scrollToNextSection}
      ><p className="text-white/60 text-sm font-medium mb-4 animate-pulse group-hover:text-white/80 transition-colors duration-300 text-center whitespace-nowrap">
          Scroll down to discover
        </p>{/* Enhanced animated mouse with glow effect */}
        <div className="relative flex flex-col items-center">
          {/* Glow ring */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-12 border border-white/20 rounded-full animate-ping opacity-30"></div>
          
          {/* Main mouse container */}
          <div className="relative w-6 h-10 border-2 border-white/40 rounded-full flex justify-center group-hover:border-white/60 transition-colors duration-300 animate-bounce">
            {/* Animated scroll dot with enhanced movement */}
            <div className="w-1 h-3 bg-gradient-to-b from-white/90 to-white/30 rounded-full mt-2 animate-scroll-wheel"></div>
          </div>
          
          {/* Multiple animated arrows with staggered timing */}
          <div className="flex flex-col items-center mt-2 space-y-1">
            <svg 
              className="w-3 h-3 text-white/50 animate-bounce-arrow opacity-80" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ animationDelay: '0ms' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
            <svg 
              className="w-3 h-3 text-white/40 animate-bounce-arrow opacity-60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ animationDelay: '150ms' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
            <svg 
              className="w-3 h-3 text-white/30 animate-bounce-arrow opacity-40" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ animationDelay: '300ms' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
