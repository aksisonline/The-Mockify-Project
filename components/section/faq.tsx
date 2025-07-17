"use client";

import { faq } from "@/lib/constant";
import { Container } from "@/components/container";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import faq1 from "@/public/faq1.avif";

interface FAQItem {
  question: string;
  answer: string;
}

function AccordionItem({ data }: { data: FAQItem }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (    <div
      className="mb-4 border border-brand/25 w-full p-3 lg:p-4 rounded-2xl bg-white/80 backdrop-blur-md cursor-pointer shadow-sm"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between cursor-pointer">
        <p className={cn("text-sm lg:text-md font-semibold", open && "mb-4 lg:mb-5")}>
          {data.question}
        </p>
        {open ? <Minus size={16} className="flex-shrink-0 ml-2" /> : <Plus size={16} className="flex-shrink-0 ml-2" />}
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={
          open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.1, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pt-2 text-sm text-primary-text">{data.answer}</p>
      </motion.div>
    </div>
  );
}

export function FAQ() {
  return (
    <>
      <Container className="py-12 lg:py-16 px-4 lg:px-8">
        <div className="mx-auto max-w-full text-center mb-8 lg:mb-10">
          <p className="text-sm lg:text-md text-brand font-bold text-center mb-2">
            Frequently Asked Questions
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-6xl tracking-tighter font-semibold">
            Everything you <span className="font-serif text-brand">need</span>{" "}
            to know.
          </h2>
          <p className="mt-4 text-sm md:text-md lg:text-lg tracking-tight text-balance text-primary-text font-geist max-w-5xl mx-auto text-center px-4">
            Everything professionals need to know about joining our community,
            accessing tools, and growing their careers.
          </p>
        </div>

        <div className="flex items-center flex-col max-w-5xl mx-auto relative px-4">
          {faq.map((data, idx) => (
            <AccordionItem key={idx} data={data} />
          ))}
          <Image
            src={faq1}
            className="animate-bounce absolute bottom-0 -left-10 lg:-left-20 w-12 h-12 lg:w-20 lg:h-20 -z-50 blur-sm hidden sm:block"
            alt="img"
            width={80}
            height={80}
          />
          <Image
            src={faq1}
            className="animate-bounce absolute -top-5 lg:-top-10 -right-5 lg:-right-10 w-12 h-12 lg:w-20 lg:h-20 -z-50 blur-sm hidden sm:block"
            alt="img"
            width={80}
            height={80}
          />

          <div className="bg-brand absolute h-[8rem] lg:h-[10rem] w-[16rem] lg:w-[20rem] top-10 lg:top-20 right-10 lg:right-20 -z-50 blur-3xl opacity-55 hidden lg:block"></div>
        </div>
      </Container>
    </>
  );
}
