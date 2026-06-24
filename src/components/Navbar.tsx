/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Logo from "./Logo";
import { ShoppingBag, Sparkles, ShoppingCart, UserCheck, Flame } from "lucide-react";
import { CartItem } from "../types";

interface NavbarProps {
  activeTab: "shop" | "mixmatch" | "stylist";
  setActiveTab: (tab: "shop" | "mixmatch" | "stylist") => void;
  cart: CartItem[];
  onOpenCart: () => void;
}

export default function Navbar({ activeTab, setActiveTab, cart, onOpenCart }: NavbarProps) {
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 select-none px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* LOGO LINK */}
        <div className="cursor-pointer" onClick={() => setActiveTab("shop")}>
          <Logo size="md" />
        </div>

        {/* INTERACTIVE NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-1.5 bg-neutral-900 border border-white/5 rounded-full p-1 shadow-inner shadow-black/40">
          <button
            onClick={() => setActiveTab("shop")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "shop"
                ? "bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/5 text-white shadow-md shadow-black/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <ShoppingBag size={13} className={activeTab === "shop" ? "text-[#E1B168]" : ""} />
            Collections
          </button>

          <button
            onClick={() => setActiveTab("mixmatch")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "mixmatch"
                ? "bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/5 text-white shadow-md shadow-black/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Flame size={13} className={activeTab === "mixmatch" ? "text-[#E97D9B]" : ""} />
            Mix & Match Studio
          </button>

          <button
            onClick={() => setActiveTab("stylist")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "stylist"
                ? "bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/5 text-white shadow-md shadow-black/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles size={13} className={activeTab === "stylist" ? "text-[#E1B168] animate-spin-slow" : ""} />
            AI Stylist
          </button>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          
          {/* Quick FB Group Button for Rupa Shoptonir */}
          <a
            href="https://www.facebook.com/rupashoptonir"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-[10px] font-mono text-neutral-300 hover:text-[#E1B168] hover:border-[#E1B168]/20 transition-all cursor-pointer"
          >
            <UserCheck size={11} />
            <span>Facebook Page</span>
          </a>

          {/* Cart triggers */}
          <button
            onClick={onOpenCart}
            id="navbar-cart-trigger"
            className="relative bg-neutral-900 border border-white/5 hover:border-[#E1B168]/30 hover:bg-neutral-800 p-2.5 rounded-xl transition-all text-neutral-300 hover:text-[#E1B168] cursor-pointer"
          >
            <ShoppingCart size={16} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[#E97D9B] text-white text-[9px] font-bold font-mono flex items-center justify-center animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* MOBILE BOTTOM NAV BAR (Fixed floating look) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-neutral-950/90 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex items-center justify-around z-40 shadow-2xl">
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            activeTab === "shop" ? "text-[#E1B168]" : "text-neutral-400"
          }`}
        >
          <ShoppingBag size={18} />
          Shop
        </button>

        <button
          onClick={() => setActiveTab("mixmatch")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            activeTab === "mixmatch" ? "text-[#E97D9B]" : "text-neutral-400"
          }`}
        >
          <Flame size={18} />
          Mixer
        </button>

        <button
          onClick={() => setActiveTab("stylist")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold cursor-pointer ${
            activeTab === "stylist" ? "text-[#E1B168]" : "text-neutral-400"
          }`}
        >
          <Sparkles size={18} className={activeTab === "stylist" ? "animate-pulse" : ""} />
          AI Stylist
        </button>
      </div>

    </nav>
  );
}
