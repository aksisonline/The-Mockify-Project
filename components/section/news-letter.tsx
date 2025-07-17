"use client";
import React from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { motion } from "framer-motion";

export default function NewsLetter() {
  return (
    <motion.section
      initial={{ y: 70, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ ease: "easeIn", delay: 0.3 }}
      className="py-16 max-w-screen-xl mx-auto "
    >
      <div className="relative overflow-hidden mx-4 px-4 py-14 bg-white/90 rounded-2xl border border-grey/20 shadow-lg md:px-8 md:mx-8">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-md text-brand font-bold text-center mb-2">
            Stay Connected
          </p>
          <div className="space-y-3">
            <h3 className="text-3xl md:text-6xl text-primary font-bold tracking-tighter font-geist">
              Join the{" "}
              <span className="text-brand font-serif">  Community</span>
            </h3>
            <p className="leading-relaxed text-md md:text-lg text-primary-text">
              Get the latest   industry news, training updates, new tools, and exclusive 
              opportunities delivered straight to your inbox.
            </p>
          </div>
          <div className="mt-6">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center justify-center bg-white rounded-lg p-1 max-w-3xl mx-auto border border-grey/30"
            >
              <input
                type="email"
                placeholder="Enter your professional email"
                className="text-primary w-full p-3 outline-none border-none active:border-none focus:outline-none focus:ring-0 focus:border-none bg-inherit text-sm"
              />
              <InteractiveHoverButton type="submit" className="bg-slate-950 hover:bg-white text-white hover:text-slate-950 border-brand/20 hover:border-brand/40 transition-all duration-300 [&>div:first-child>div]:bg-white w-[200px] h-12">
                Join Community
              </InteractiveHoverButton>
            </form>
            <p className="mt-5 max-w-4xl text-md text-primary-text sm:mx-auto">
              No spam ever, only valuable   industry insights. Read our privacy policy.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
