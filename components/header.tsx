"use client";

import Link from "next/link";
import { Container } from "./container";
import { Button } from "./ui/button2";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/public/mockify-logo.png";
import Image from "next/image";

export function Header() {
  const [hamburgerIcon, setHamhamburgerIcon] = useState<boolean>(false);
  const [isNavHidden, setIsNavHidden] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Ensure component is mounted on client side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    setHamhamburgerIcon(!hamburgerIcon);
  };

  useEffect(() => {
    const html = document.querySelector("html");

    if (html) html.classList.toggle("overflow-hidden", hamburgerIcon);
  }, [hamburgerIcon]);

  useEffect(() => {
    const closehamburgerNavigation = () => setHamhamburgerIcon(false);
    window.addEventListener("orientationchange", closehamburgerNavigation);
    window.addEventListener("resize", closehamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closehamburgerNavigation);
      window.removeEventListener("resize", closehamburgerNavigation);
    };
  }, []);

  // Navigation scroll behavior implementation - only on client
  useEffect(() => {
    if (!isMounted) return;
    
    let lastScrollY = 0;
    let scrollThrottle: NodeJS.Timeout;

    // Throttled scroll direction detection
    const handleScroll = () => {
      if (scrollThrottle) clearTimeout(scrollThrottle);
      
      scrollThrottle = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        
        // Only act on significant scroll movements (±10px)
        if (Math.abs(scrollDelta) >= 10) {
           if (scrollDelta > 0) {
            // Scrolling down - hide nav
            setIsNavHidden(true);
          } else if (scrollDelta < 0) {
            // Scrolling up - show nav
            setIsNavHidden(false);
          }
        }
        
        lastScrollY = currentScrollY;
      }, 100); // 100ms throttle
    };

    // Keyboard focus handler - ensure nav is visible when focused
    const handleFocusIn = (e: FocusEvent) => {
      const header = document.querySelector('header');
      if (header?.contains(e.target as Node)) {
        setIsNavHidden(false);
      }
    };

    // Initialize listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('focusin', handleFocusIn);
      if (scrollThrottle) clearTimeout(scrollThrottle);
    };
  }, [isMounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <header className="mt-4 fixed top-0 left-0 w-full z-50 px-4 md:p-2 nav-transition">
        <Container className="flex items-center justify-between w-full p-8 rounded-full h-navigation-height border border-grey/20 bg-white shadow-lg animate-fade-in [--animation-delay:200ms]">
          <div className="flex items-center gap-12">
            <Link href="/">
              <Image
                style={{
                  textShadow:
                    "0px -10px 70px rgba(59, 130, 246, 0.5), 0px -10px 70px rgba(59, 130, 246, 0.5)",
                }}
                src={Logo}
                alt="Logo"
                width={100}
                height={100}
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button size="medium" variant="secondary">
              Log in
            </Button>
            <Button size="medium">
              Sign up
            </Button>
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className={cn(
      "mt-4 fixed top-0 left-0 w-full z-50 px-4 md:p-2 nav-transition",
      isNavHidden && "hide-nav"
    )}>
      <Container className="flex items-center justify-between w-full p-8 rounded-full h-navigation-height border border-grey/20 bg-white shadow-lg animate-fade-in [--animation-delay:200ms]">
        <div className="flex items-center gap-12">
          <Link href="/">
            <Image
              style={{
                textShadow:
                  "0px -10px 70px rgba(59, 130, 246, 0.5), 0px -10px 70px rgba(59, 130, 246, 0.5)",
              }}
              src={Logo}
              alt="Logo"
              width={100}
              height={100}
            />
          </Link>
          <nav
            className={cn(
              "transition-opacity duration-500 h-[calc(100vh_-_var(--navigation-height))] overflow-auto md:block fixed top-navigation-height mt-4 md:mt-0 left-0 w-full bg-background/90 md:relative md:h-auto md:top-0 md:w-auto md:bg-transparent md:opacity-100 md:translate-x-0 ",
              hamburgerIcon
                ? "opacity-100 translate-x-0 border-t border-brand rounded-t-3xl"
                : "opacity-0 translate-x-[-100vw]"
            )}
          >
            <ul
              className={cn(
                "flex h-full flex-col md:flex-row md:items-center [&_li]:ml-6 [&_li]:border-b [&_li]:border-grey/20 md:[&_li]:border-none ease-in [&_a]:text-primary [&_a:hover]:text-brand [&_a]:flex [&_a]:h-navigation-height [&_a]:w-full [&_a]:translate-y-8 [&_a]:items-center [&_a]:text-xl [&_a]:transition-[color,transform] [&_a]:duration-300 md:[&_a]:translate-y-0 md:[&_a]:text-sm [&_a]:md:transition-colors",
                hamburgerIcon && "[&_a]:translate-y-0"
              )}
            >
              <li>
                <Link href="#">Events</Link>
              </li>
              <li>
                <Link href="#">Tools</Link>
              </li>
              <li className="md:hidden lg:block">
                <Link href="#">Careers</Link>
              </li>
              <li className="md:hidden lg:block">
                <Link href="#">AVKart</Link>
              </li>
              <li className="md:hidden lg:block">
                <Link href="#">Community</Link>
              </li>
              {/* <li>
                <Link href="#">Pricing</Link>
              </li> */}
              <li>
                <Link href="#">Training</Link>
              </li>
              {/* Mobile buttons - only show in mobile menu */}
              <li className="md:hidden mt-4 px-6 pb-4">
                <div className="flex flex-row gap-3">
                  <Button size="medium" variant="secondary" className="w-full">
                    Log in
                  </Button>
                  <Button className="w-full" size="medium">
                    Sign up
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>

        <button
          className="ml-6 md:hidden transition-transform"
          onClick={handleToggle}
        >
          <span className="sr-only ">Toggle Menu</span>
          {hamburgerIcon ? <X /> : <Menu />}
        </button>

        <div className="hidden md:flex items-center gap-2">
          <Button size="medium" variant="secondary" className="">
            Log in
          </Button>
          <Button className="" size="medium">
            Sign up
          </Button>
        </div>
      </Container>
    </header>
  );
}
