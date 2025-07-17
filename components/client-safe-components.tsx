"use client";

import dynamic from 'next/dynamic';

// Dynamically import components that use browser APIs
const ScrollToTopComponent = dynamic(
  () => import('@/components/ui/scroll-to-top').then(mod => ({ default: mod.ScrollToTop })),
  { 
    ssr: false,
    loading: () => null
  }
);

const HeaderComponent = dynamic(
  () => import('@/components/header').then(mod => ({ default: mod.Header })),
  { 
    ssr: false,
    loading: () => (
      <header className="mt-4 fixed top-0 left-0 w-full z-50 px-4 md:p-2 nav-transition">
        <div className="flex items-center justify-between w-full p-8 rounded-full h-navigation-height border border-grey/20 bg-white shadow-lg">
          <div className="flex items-center gap-12">
            <span className="font-bold">Mockify</span>
          </div>
        </div>
      </header>
    )
  }
);

export { ScrollToTopComponent as ScrollToTop, HeaderComponent as Header };
