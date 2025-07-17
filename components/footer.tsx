"use client";

import Link from "next/link";
// import { Container } from "./container";
import { XIcon } from "@/components/icons/twitter";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { InstagramIcon } from "@/components/icons/instagram";
import { YouTubeIcon } from "@/components/icons/youtube";
import { FacebookIcon } from "@/components/icons/facebook";
import { motion } from "framer-motion";
import Logo from "@/public/mockify-logo.png";
import Image from "next/image";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ ease: "easeIn", delay: 0.3 }}
      className="bg-slate-900 text-slate-300 rounded-lg mt-8"
    >
      <div className="max-w-[1300px] mx-auto px-6 md:px-12 py-16">
        {/* Top Zone */}
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          {/* Left Block - Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-between items-center  mr-20"
          >
            {/* Circular Badge with Logo */}
            {/* <div className="w-14 h-14 bg-violet-500 rounded-full flex items-center justify-center"> */}
            {/* <Image src={Logo} alt="Mockify" width={128} height={128} className="" /> */}
            {/* </div> */}
            {/* <h3 className="text-xl font-semibold text-white ml-4">Mockify</h3> */}
            
            {/* Tagline */}
            <div>
              <Image src={Logo} alt="Mockify" width={180} height={180} className="" />
              <p className="text-slate-50 text-sm font-medium mt-3 text-center">Be Connected</p>
            </div>

            <div className="flex justify-center lg:justify-end gap-6 mt-8">
              <a href="https://linkedin.com/company/mockify" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn">
                <LinkedinIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </a>
              <a href="https://instagram.com/mockify" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                <InstagramIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </a>
              <a href="https://x.com/mockifytools" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)">
                <XIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </a>
              <a href="https://youtube.com/@Mockify" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to our YouTube channel">
                <YouTubeIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </a>
              <a href="https://facebook.com/profile.php?id=61558649983492" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                <FacebookIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </a>
            </div>
          </motion.div>

          {/* Right Block - Navigation Grid */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap md:flex-nowrap justify-between gap-8 md:gap-4">
              
              {/* Column 1: Company */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h4 className="uppercase text-xs font-bold tracking-widest text-slate-400 mb-4">Company</h4>
                <ul className="space-y-1">
                  <li><Link href="/about" className="block text-sm text-slate-300 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/careers" className="block text-sm text-slate-300 hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="/blog" className="block text-sm text-slate-300 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/press" className="block text-sm text-slate-300 hover:text-white transition-colors">Events</Link></li>
                  <li><Link href="/contact" className="block text-sm text-slate-300 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </motion.div>

              {/* Column 2: Products */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h4 className="uppercase text-xs font-bold tracking-widest text-slate-400 mb-4">Products</h4>
                <ul className="space-y-1">
                  <li><Link href="#tools" className="block text-sm text-slate-300 hover:text-white transition-colors">Tools</Link></li>
                  <li><Link href="#kart" className="block text-sm text-slate-300 hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link href="#community" className="block text-sm text-slate-300 hover:text-white transition-colors">Community</Link></li>
                  <li><Link href="#trainings" className="block text-sm text-slate-300 hover:text-white transition-colors">Training</Link></li>
                  <li><Link href="#reviews" className="block text-sm text-slate-300 hover:text-white transition-colors">Reviews</Link></li>
                </ul>
              </motion.div>

              {/* Column 3: Resources */}
              {/* <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h4 className="uppercase text-xs font-bold tracking-widest text-slate-400 mb-4">Resources</h4>
                <ul className="space-y-1">
                  <li><Link href="/help" className="block text-sm text-slate-300 hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/documentation" className="block text-sm text-slate-300 hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="/api" className="block text-sm text-slate-300 hover:text-white transition-colors">API</Link></li>
                  <li><Link href="/status" className="block text-sm text-slate-300 hover:text-white transition-colors">Status</Link></li>
                  <li><Link href="/changelog" className="block text-sm text-slate-300 hover:text-white transition-colors">Changelog</Link></li>
                </ul>
              </motion.div> */}

              {/* Column 4: Stay Updated */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h4 className="uppercase text-xs font-bold tracking-widest text-slate-400 mb-4">Stay Updated</h4>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Get the latest updates and insights from the   community.
                </p>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-row gap-2"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-[42px] px-3 text-sm bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  />
                  <InteractiveHoverButton 
                    type="submit" 
                    className="w-[200px] h-[42px] px-8 rounded-md text-sm font-medium"
                  >
                    Subscribe
                  </InteractiveHoverButton>
                </form>
              </motion.div>

              {/* Social Media Icons */}
              {/* <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center lg:justify-end gap-6 mt-8"
              >
                <LinkedinIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
                <InstagramIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
                <XIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
                <YouTubeIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
                <FacebookIcon className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </motion.div> */}

            </div>

            
          </div>
        </div>
      </div>

      {/* Separator */}
      <hr className="border-slate-700" />
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 py-6">
          <p className="text-sm text-slate-500">
            © 2024   Community. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-slate-500 hover:text-white transition-colors">
              Cookies
            </Link>
            <Link href="/security" className="text-slate-500 hover:text-white transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
