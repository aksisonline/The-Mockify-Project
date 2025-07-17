"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const toggleVisibility = () => {
      // Show button when user scrolls past the hero section (viewport height)
      if (window.scrollY > window.innerHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [isMounted]);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-[85px] right-[28px] z-50 p-3 rounded-full 
        bg-blue-600 hover:bg-blue-700 text-white shadow-lg
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-xl
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
      `}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import { ChevronUp } from "lucide-react";

// export function ScrollToTop() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);
//   useEffect(() => {
//     if (!isMounted) return;
    
//     const toggleVisibility = () => {
//       // Show button when user scrolls down 300px
//       if (window.scrollY > 300) {
//         setIsVisible(true);
//       } else {
//         setIsVisible(false);
//       }
//     };

//     window.addEventListener("scroll", toggleVisibility);

//     return () => {
//       window.removeEventListener("scroll", toggleVisibility);
//     };
//   }, [isMounted]);
//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };
//   if (!isMounted) {
//     return null;
//   }

//   return (
//     <button
//       onClick={scrollToTop}
//       className={`
//         fixed bottom-28 right-6 sm:right-8 z-50 p-3 rounded-full 
//         bg-gray-900 hover:bg-gray-800 text-white shadow-lg
//         transition-all duration-300 ease-in-out
//         hover:scale-110 hover:shadow-xl
//         ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
//       `}
//       aria-label="Scroll to top"
//     >
//       <ChevronUp className="w-6 h-6" />
//     </button>
//   );
// }
