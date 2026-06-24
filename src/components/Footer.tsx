/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Logo from "./Logo";
import { MessageSquare, Phone, MapPin, Sparkles, ShieldCheck } from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: "shop" | "mixmatch" | "stylist") => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer className="bg-neutral-950/90 border-t border-white/5 py-12 px-6 select-none relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* BRAND IDENTITY COLUMN (4 Cols) */}
        <div className="md:col-span-4 space-y-4">
          <Logo size="lg" />
          <p className="text-xs text-neutral-400 font-sans leading-relaxed pt-2">
            Shoptonir (স্বপ্ননীড়) is Bangladesh's premier luxury modest wear boutique, curated exclusively for women who values elegant grace, cultural modesty, and premium fabric comfort. Hand-crafted with royal care in Dhaka.
          </p>
          
          <div className="flex items-center gap-2 pt-2 text-[11px] text-[#E1B168] font-mono">
            <ShieldCheck size={14} />
            <span>Premium Turkish & Saudi Fabrics</span>
          </div>
        </div>

        {/* QUICK NAVIGATION (3 Cols) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#E1B168]">
            Explore Boutique
          </h4>
          <ul className="space-y-2 text-xs font-sans text-neutral-400">
            <li>
              <button onClick={() => setActiveTab("shop")} className="hover:text-white transition-all cursor-pointer">
                Royal Gown & Abaya Collection
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("mixmatch")} className="hover:text-white transition-all cursor-pointer">
                Virtual Mix & Match Studio
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("stylist")} className="hover:text-white transition-all cursor-pointer flex items-center gap-1">
                <Sparkles size={11} className="text-[#E97D9B]" />
                Personal AI Modest Stylist
              </button>
            </li>
            <li>
              <a href="https://www.facebook.com/rupashoptonir" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all">
                Latest Facebook Inquiries
              </a>
            </li>
          </ul>
        </div>

        {/* OUTLET & CONTACT DETAILS (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#E1B168]">
            Physical Outlet & Inquiries
          </h4>
          
          <div className="space-y-3.5 text-xs text-neutral-400">
            <div className="flex gap-2.5 items-start">
              <MapPin size={15} className="text-[#E97D9B] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <b>Shoptonir HQ Boutique:</b><br />
                Mirpur Road, Near Gausia Market, Dhaka 1205, Bangladesh.
              </p>
            </div>

            <div className="flex gap-2.5 items-center">
              <Phone size={14} className="text-[#E1B168]" />
              <p>Hotline: <span className="text-neutral-200 font-mono">+880 1799-556677</span> (WhatsApp available)</p>
            </div>

            <div className="flex gap-2.5 items-center">
              <MessageSquare size={14} className="text-[#E1B168]" />
              <p>
                Inquire on Facebook:{" "}
                <a
                  href="https://www.facebook.com/rupashoptonir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E97D9B] hover:underline underline-offset-4 font-bold"
                >
                  fb.com/rupashoptonir
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* COPYRIGHT DISCLOSURE */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-mono">
        <p>© {new Date().getFullYear()} Shoptonir (স্বপ্ননীড়). All Rights Reserved.</p>
        <p>Premium Modesty for Modern Women • Dhaka, Bangladesh</p>
      </div>
    </footer>
  );
}
