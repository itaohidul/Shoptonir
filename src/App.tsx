/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product, CartItem, ColorOption, FabricOption } from "./types";
import { PRODUCTS } from "./data/products";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import FabricViewer from "./components/FabricViewer";
import MixMatchStudio from "./components/MixMatchStudio";
import AIStylist from "./components/AIStylist";
import CartDrawer from "./components/CartDrawer";
import { Sparkles, ShoppingBag, Eye, Heart, HelpCircle, ArrowRight, Star, Quote, Palette, Layers } from "lucide-react";

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<"shop" | "mixmatch" | "stylist">("shop");

  // Catalog filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart state loaded from localStorage for durable persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("shoptonir_cart_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active customizer product trigger
  const [selectedProductToCustomize, setSelectedProductToCustomize] = useState<Product | null>(null);

  // Cart drawer open/close
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Auto-save cart to localStorage on modifications
  useEffect(() => {
    localStorage.setItem("shoptonir_cart_v1", JSON.stringify(cart));
  }, [cart]);

  // Add customized item to cart
  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    color?: ColorOption,
    size?: string,
    fabric?: FabricOption
  ) => {
    const selectedColor = color || product.colors[0];
    const selectedSize = size || product.sizes[0];
    const selectedFabric = fabric || product.fabrics[0] || {
      name: "Standard Blend",
      description: "Standard modest weave",
      weight: "180 GSM",
      textureClass: "bg-neutral-800",
      sheen: 0.3,
      drapeFactor: 1.3
    };

    // Unique combination ID
    const cartItemId = `${product.id}_${selectedColor.name.replace(/\s+/g, "")}_${selectedSize}_${selectedFabric.name.replace(/\s+/g, "")}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          product,
          quantity,
          selectedColor,
          selectedSize,
          selectedFabric
        };
        return [...prev, newItem];
      }
    });

    // Open shopping cart drawer to show visual confirmation
    setIsCartOpen(true);
  };

  // Quick add to cart (using defaults)
  const handleQuickAddToCart = (product: Product) => {
    handleAddToCart(product, 1);
  };

  // Add virtual match studio bundle to cart with 10% discount bundled
  const handleAddBundleToCart = (bundleItems: Array<{ product: Product; color: ColorOption; size: string }>) => {
    setCart((prev) => {
      let updated = [...prev];
      
      bundleItems.forEach((item) => {
        // Since it's a bundled discount set, adjust price by 10%
        const discountedProduct = {
          ...item.product,
          price: Math.round(item.product.price * 0.9) // 10% discount
        };

        const fabric = item.product.fabrics[0] || {
          name: "Standard Weave",
          description: "Premium drape matching",
          weight: "150 GSM",
          textureClass: "bg-neutral-800",
          sheen: 0.3,
          drapeFactor: 1.3
        };

        const cartItemId = `${discountedProduct.id}_${item.color.name.replace(/\s+/g, "")}_${item.size}_${fabric.name.replace(/\s+/g, "")}_bundle`;

        const existingIdx = updated.findIndex((i) => i.id === cartItemId);
        if (existingIdx > -1) {
          updated[existingIdx].quantity += 1;
        } else {
          updated.push({
            id: cartItemId,
            product: discountedProduct,
            quantity: 1,
            selectedColor: item.color,
            selectedSize: item.size,
            selectedFabric: fabric
          });
        }
      });

      return updated;
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Filter products by active category
  const filteredProducts = selectedCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#5c2d3a] text-neutral-100 font-sans flex flex-col justify-between selection:bg-[#E1B168] selection:text-neutral-950">
      
      {/* Decorative Gold Glowing Header Bar */}
      <div className="h-1 bg-gradient-to-r from-[#D45C7C] via-[#E1B168] to-[#D45C7C] shadow-[0_2px_12px_rgba(225,177,104,0.4)]" />

      {/* STICKY TOP NAV */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* MAIN SCREEN STAGES */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MODEST COLLECTIONS & HOME */}
          {activeTab === "shop" && (
            <motion.div
              key="shop_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* HERO BANNER STAGE */}
              <div className="relative overflow-hidden bg-neutral-950/80 border-b border-white/5 py-12 md:py-20 px-6 sm:px-8">
                {/* Visual background image generated */}
                <div className="absolute inset-0 z-0 opacity-25">
                  <img
                    src="/src/assets/images/hero_modest_fashion_1782320236370.jpg"
                    alt="Shoptonir Premium Boutique"
                    className="w-full h-full object-cover object-center filter blur-[2px]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-neutral-950/80 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Hero Copywriting */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E1B168]/10 border border-[#E1B168]/20 rounded-full text-xs font-mono text-[#E1B168] uppercase tracking-wider">
                      <Sparkles size={12} className="animate-pulse" />
                      Eid & Festive Royal Modesty 2026
                    </div>

                    <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.1] text-white tracking-tight">
                      Where <span className="italic text-[#E1B168]">Modest Grace</span> <br />
                      Meets Royal Comfort.
                    </h1>

                    <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-sans leading-relaxed">
                      Welcome to <b>Shoptonir (স্বপ্ননীড়)</b>. Discover our exquisite collection of hand-crafted Turkish Velvet Abayas, flowing Italian Kaftans, and Pearl Georgette Chiffon hijabs. Perfectly tailored to celebrate your beautiful, dignified presence Apa.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={() => setActiveTab("mixmatch")}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 font-bold text-xs shadow-lg shadow-[#E1B168]/15 hover:shadow-[#E1B168]/25 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Interactive Matcher Studio</span>
                        <ArrowRight size={13} />
                      </button>

                      <button
                        onClick={() => setActiveTab("stylist")}
                        className="px-6 py-3 rounded-xl bg-neutral-900 border border-white/5 hover:border-[#E97D9B]/30 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Chat AI Stylist Apa</span>
                      </button>
                    </div>
                  </div>

                  {/* Brand Highlight Callout Card (5 Cols) */}
                  <div className="lg:col-span-5 bg-neutral-900/75 border border-white/5 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden text-left space-y-4 shadow-2xl">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#D45C7C]/5 rounded-full blur-2xl" />
                    
                    <div className="flex items-center gap-2">
                      <Quote size={18} className="text-[#E1B168]" />
                      <span className="font-serif text-xs italic text-[#E1B168] tracking-widest font-medium uppercase">Owner&apos;s Promise</span>
                    </div>

                    <p className="text-xs sm:text-sm italic text-neutral-300 leading-relaxed font-serif">
                      &quot;স্বপ্ননীড় (Shoptonir) is not just a brand; it is a dream woven with modesty. We source only standard non-see-through, breathable fabrics. Every seam is checked by hand so that you feel protected and honored APA.&quot;
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-9 h-9 rounded-full bg-[#E97D9B]/25 flex items-center justify-center text-xs font-bold text-[#E97D9B] border border-[#E97D9B]/30">
                        R
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200">Rupa Islam APA</h4>
                        <p className="text-[10px] text-neutral-500 font-mono">Founder, Shoptonir Modest Wear</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* PRODUCTS CATALOG SECTION */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 border-b border-white/5 pb-4">
                  <div className="text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E97D9B]">
                      স্বপ্ননীড় পোশাক কালেকশন
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white mt-1">
                      Explore Royal Catalog
                    </h2>
                  </div>

                  {/* Category Pill Filters */}
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: "all", label: "All Items" },
                      { id: "abaya", label: "Abayas" },
                      { id: "gown", label: "Modest Gowns" },
                      { id: "hijab", label: "Luxury Hijabs" }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                          selectedCategory === cat.id
                            ? "bg-white/5 border-[#E1B168] text-[#E1B168] shadow-md"
                            : "bg-transparent border-white/5 text-neutral-400 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(prod) => setSelectedProductToCustomize(prod)}
                      onAddToCart={handleQuickAddToCart}
                    />
                  ))}
                </div>

              </div>

              {/* TRADITIONAL EDUCATIONAL GUIDE: UNDERSTANDING HIJAB & ABAYA */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="border-t border-b border-white/5 py-10">
                  <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E97D9B] font-bold">
                      Shoptonir Modest Guide
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white">
                      Understanding Our Traditional Attire
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Modesty is more than styling; it is an act of dignity and grace. Learn about the rich traditional customs behind our curated silhouettes, Apa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {/* Section 1: Hijab */}
                    <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E97D9B]/10 border border-[#E97D9B]/20 flex items-center justify-center text-[#E97D9B]">
                          <Palette size={18} />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-semibold text-neutral-100">
                            The Hijab (হিজাব)
                          </h3>
                          <p className="text-[10px] text-neutral-400 font-mono">Islamic Traditional Headscarf</p>
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                        Derived from the Arabic word meaning <i>&quot;barrier&quot;</i> or <i>&quot;partition,&quot;</i> the <b>Hijab</b> is an elegant traditional headscarf worn by Muslim women to gracefully frame the face while covering the hair, neck, and shoulders.
                      </p>

                      <div className="text-xs text-neutral-400 space-y-1 bg-black/20 p-3 rounded-xl">
                        <p className="font-bold text-neutral-300 flex items-center gap-1">
                          <span className="text-[#E1B168]">★</span> Traditional Purpose:
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          It signifies devotion, dignity, and absolute modesty. At Shoptonir, we source only premium non-sheer fabrics like Armani Chiffon and Luxury Georgette to guarantee both total comfort and a breathable, airy drape even in warm weather.
                        </p>
                      </div>
                    </div>

                    {/* Section 2: Abaya */}
                    <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E1B168]/10 border border-[#E1B168]/20 flex items-center justify-center text-[#E1B168]">
                          <Layers size={18} />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-semibold text-neutral-100">
                            The Abaya (আবায়া)
                          </h3>
                          <p className="text-[10px] text-neutral-400 font-mono">Islamic Traditional Gown</p>
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                        The <b>Abaya</b> is a elegant, loose-fitting outer robe or traditional gown designed to cover the entire body from the shoulders down to the ankles, ensuring full-body modesty and ease of movement.
                      </p>

                      <div className="text-xs text-neutral-400 space-y-1 bg-black/20 p-3 rounded-xl">
                        <p className="font-bold text-neutral-300 flex items-center gap-1">
                          <span className="text-[#E1B168]">★</span> Traditional Purpose:
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          It preserves a respectful, dignified silhouette. Shoptonir premium Abayas are tailored in wide sweeping patterns with traditional Saudi Crepe or Turkish Royal Velvet, and embellished with gold zardozi stitching for celebratory elegance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY SHOPTONIR VALUE PROPOSITIONS */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-neutral-900/20 border border-white/5 rounded-3xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E1B168]/10 border border-[#E1B168]/20 flex items-center justify-center text-[#E1B168]">
                      <Star size={18} />
                    </div>
                    <h3 className="font-serif text-sm font-semibold text-neutral-100">Premium Non-See-Through Guarantee</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      All our Abayas, Kaftans, and Gowns are strictly tailored with high-opacity, heavy GSM fabrics. You never have to worry about sheerness, Apa.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E97D9B]/10 border border-[#E97D9B]/20 flex items-center justify-center text-[#E97D9B]">
                      <Sparkles size={18} />
                    </div>
                    <h3 className="font-serif text-sm font-semibold text-neutral-100">Custom Sizing Adjustments</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Select your favorite design and request custom sleeve lengths, cuff modifications, or chest adjustments in our Customization Studio at no extra cost.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <ShoppingBag size={18} />
                    </div>
                    <h3 className="font-serif text-sm font-semibold text-neutral-100">Hassle-Free Cash on Delivery</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      We ship all across Bangladesh! Open your parcel, verify the fabric weight and sewing grace, and pay upon complete satisfaction.
                    </p>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: VIRTUAL MIX & MATCH STUDIO */}
          {activeTab === "mixmatch" && (
            <motion.div
              key="mixmatch_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 pt-6"
            >
              <MixMatchStudio onAddBundleToCart={handleAddBundleToCart} />
            </motion.div>
          )}

          {/* TAB 3: AI PERSONAL STYLIST */}
          {activeTab === "stylist" && (
            <motion.div
              key="stylist_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 pt-6"
            >
              <AIStylist
                onSelectProduct={(product) => setSelectedProductToCustomize(product)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <Footer setActiveTab={setActiveTab} />

      {/* DYNAMIC FABRIC VIEWER / TAILOR MODAL */}
      <AnimatePresence>
        {selectedProductToCustomize && (
          <FabricViewer
            product={selectedProductToCustomize}
            onClose={() => setSelectedProductToCustomize(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
