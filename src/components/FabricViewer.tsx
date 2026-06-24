/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product, ColorOption, FabricOption } from "../types";
import { Ruler, Sparkles, ShoppingBag, ShieldCheck, HelpCircle } from "lucide-react";

interface FabricViewerProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color: ColorOption, size: string, fabric: FabricOption) => void;
}

export default function FabricViewer({ product, onClose, onAddToCart }: FabricViewerProps) {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [selectedFabric, setSelectedFabric] = useState<FabricOption>(product.fabrics[0] || {
    name: "Standard Blend",
    description: "Elegant weave suitable for all season drapes.",
    weight: "180 GSM",
    textureClass: "bg-neutral-800",
    sheen: 0.3,
    drapeFactor: 1.3
  });
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [sleeveStyle, setSleeveStyle] = useState<string>("Classic Bell");
  const [customLength, setCustomLength] = useState<number>(54); // standard abaya length in inches
  const [customChest, setCustomChest] = useState<number>(38); // standard width in inches
  const [quantity, setQuantity] = useState<number>(1);
  const [dragAngle, setDragAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Rotation effect calculations
  const handleDrag = (_event: any, info: any) => {
    // Increment angle based on drag delta
    const delta = info.delta.x * 0.5;
    setDragAngle((prev) => (prev + delta) % 360);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize, selectedFabric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-neutral-900/90 border border-white/10 rounded-3xl w-full max-w-5xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Main Customizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT PANEL: The Interactive 3D Fabric Stage (5 Columns) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#15161a] to-neutral-950 p-6 flex flex-col justify-between border-r border-white/5 relative min-h-[450px]">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#E1B168] uppercase bg-white/5 px-2.5 py-1 rounded-md">
                Studio View 360°
              </span>
              <h4 className="font-serif text-lg text-white font-medium mt-3">
                {product.name}
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Drag on the garment to rotate, test lighting, and drape dynamics.
              </p>
            </div>

            {/* Interactive Stage */}
            <div className="relative flex-1 flex items-center justify-center my-6">
              {/* Radial glow background aligned to selected color */}
              <div 
                style={{ backgroundColor: selectedColor.hex }}
                className="absolute w-48 h-48 rounded-full opacity-10 blur-3xl transition-all duration-700 pointer-events-none"
              />

              {/* Glowing Pedestal Base */}
              <div className="absolute bottom-2 w-36 h-3.5 bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/10 rounded-full blur-[2px] opacity-60 shadow-[0_8px_16px_rgba(0,0,0,0.5)] z-0" />

              {/* Draggable Mannequin Outfit Representation */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={handleDrag}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                style={{ 
                  rotateY: dragAngle,
                  perspective: 1000,
                  transformStyle: "preserve-3d"
                }}
                className="relative z-10 w-44 h-72 cursor-grab active:cursor-grabbing select-none"
                title="Drag horizontally to spin fabric draping"
              >
                {/* 3D shadows on cylinder fold overlay */}
                <div className="absolute inset-y-0 left-0 right-0 pointer-events-none rounded-xl z-20 bg-gradient-to-r from-black/60 via-transparent to-black/60 opacity-40 mix-blend-multiply" />

                {/* Shimmer light flare representing Sheen strength */}
                <div 
                  style={{ opacity: selectedFabric.sheen * 0.4 }}
                  className="absolute inset-y-0 left-1/4 w-12 pointer-events-none z-20 bg-gradient-to-r from-white/20 to-transparent blur-md mix-blend-screen animate-pulse"
                />

                {/* SVG mannequin silhouette filled dynamically with color and drapes */}
                <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
                  <defs>
                    <linearGradient id="fabricGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
                      <stop offset="50%" stopColor={selectedColor.hex} stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
                    </linearGradient>

                    {/* Simulates Velvet Texture Overlay */}
                    <pattern id="velvetTex" width="4" height="4" patternUnits="userSpaceOnUse">
                      <rect width="4" height="4" fill={selectedColor.hex} />
                      <circle cx="2" cy="2" r="1.2" fill="#fff" opacity="0.05" />
                      <line x1="0" y1="0" x2="4" y2="4" stroke="#000" strokeWidth="0.5" opacity="0.1" />
                    </pattern>

                    {/* Simulates Satin Shiny Overlay */}
                    <pattern id="satinTex" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect width="20" height="20" fill={selectedColor.hex} />
                      <path d="M0,0 Q5,10 10,0 T20,0" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.08" />
                      <path d="M0,10 Q5,20 10,10 T20,10" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.08" />
                    </pattern>
                  </defs>

                  {/* Elegant Mannequin neck block */}
                  <path d="M 45,15 L 55,15 L 52,25 L 48,25 Z" fill="#E1B168" opacity="0.6" />
                  <ellipse cx="50" cy="15" rx="5" ry="2.5" fill="#C29352" />

                  {/* Drapery Gown Body */}
                  <g>
                    {/* Main dress silhouette */}
                    <path
                      d={`M 35,45 C 35,40 40,30 50,30 C 60,30 65,40 65,45 L 75,120 C 78,140 82,170 82,185 C 82,192 78,195 50,195 C 22,195 18,192 18,185 C 18,170 22,140 25,120 Z`}
                      fill={`url(#fabricGradient)`}
                    />

                    {/* Texture map overlay pattern based on active fabric */}
                    <path
                      d={`M 35,45 C 35,40 40,30 50,30 C 60,30 65,40 65,45 L 75,120 C 78,140 82,170 82,185 C 82,192 78,195 50,195 C 22,195 18,192 18,185 C 18,170 22,140 25,120 Z`}
                      fill={selectedFabric.name.includes("Velvet") ? "url(#velvetTex)" : "url(#satinTex)"}
                      opacity={selectedFabric.name.includes("Velvet") ? "0.35" : "0.2"}
                      style={{ mixBlendMode: "overlay" }}
                    />

                    {/* 3D Vertical Creases and Folds (Dynamic depending on fabric drape factor) */}
                    <g opacity={0.6 + selectedFabric.drapeFactor * 0.15}>
                      {/* Left vertical folding crease */}
                      <path d="M 42,32 C 40,70 34,130 26,188" stroke="#000000" strokeWidth="1.2" fill="none" opacity="0.3" />
                      <path d="M 42,32 C 40,70 34,130 26,188" stroke={selectedColor.hex} strokeWidth="0.5" fill="none" opacity="0.4" />

                      {/* Right vertical folding crease */}
                      <path d="M 58,32 C 60,70 66,130 74,188" stroke="#000000" strokeWidth="1.2" fill="none" opacity="0.3" />
                      <path d="M 58,32 C 60,70 66,130 74,188" stroke={selectedColor.hex} strokeWidth="0.5" fill="none" opacity="0.4" />

                      {/* Center crease */}
                      <path d="M 50,30 C 50,70 51,130 50,194" stroke="#000000" strokeWidth="1.5" fill="none" opacity="0.25" />
                      <path d="M 50,30 C 50,70 51,130 50,194" stroke="#ffffff" strokeWidth="0.4" fill="none" opacity="0.2" />

                      {/* Side drapes depending on dynamic sleeve options */}
                      {sleeveStyle === "Flared Kimono" ? (
                        <>
                          <path d="M 36,44 C 20,50 12,85 15,110 C 18,120 22,110 32,75 Z" fill="url(#fabricGradient)" />
                          <path d="M 64,44 C 80,50 88,85 85,110 C 82,120 78,110 68,75 Z" fill="url(#fabricGradient)" />
                        </>
                      ) : (
                        <>
                          {/* Classic tighter sleeve folds */}
                          <path d="M 36,44 C 28,52 24,70 26,95 C 28,100 30,95 33,70 Z" fill="url(#fabricGradient)" />
                          <path d="M 64,44 C 72,52 76,70 74,95 C 72,100 70,95 67,70 Z" fill="url(#fabricGradient)" />
                        </>
                      )}
                    </g>
                  </g>
                </svg>
              </motion.div>

              {/* Instruction Prompt */}
              <AnimatePresence>
                {dragAngle === 0 && !isDragging && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 bg-neutral-950/80 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] text-neutral-300 font-mono tracking-wider pointer-events-none flex items-center gap-1.5"
                  >
                    <Sparkles size={11} className="text-[#E1B168] animate-spin-slow" />
                    Swipe Left/Right to Spin
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Micro Specs readout */}
            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
              <div className="grid grid-cols-3 text-center divide-x divide-white/5">
                <div>
                  <p className="text-[9px] font-mono text-neutral-500 uppercase">Weight</p>
                  <p className="text-xs font-semibold text-neutral-200 mt-0.5">{selectedFabric.weight}</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-neutral-500 uppercase">Sheen</p>
                  <p className="text-xs font-semibold text-neutral-200 mt-0.5">
                    {selectedFabric.sheen > 0.8 ? "Lustrous" : selectedFabric.sheen > 0.4 ? "Ethereal" : "Matte"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-neutral-500 uppercase">Drape</p>
                  <p className="text-xs font-semibold text-neutral-200 mt-0.5">
                    {selectedFabric.drapeFactor > 1.5 ? "Fluid Flow" : selectedFabric.drapeFactor > 1.2 ? "Structured" : "Classic"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Customizer Options (7 Columns) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
            
            {/* Header controls */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono tracking-wider text-[#E97D9B]">
                  Tailor-Made Elegance
                </span>
                <h3 className="font-serif text-2xl text-white font-medium mt-1">
                  Customization Studio
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-full border border-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customization Details Form */}
            <div className="space-y-6 my-6 flex-1">
              
              {/* SECTION 1: Select Premium Fabric */}
              <div>
                <label className="text-xs font-mono tracking-widest uppercase text-[#E1B168] flex items-center gap-1.5 mb-2.5">
                  <Sparkles size={12} />
                  1. Select Premium Fabric Fabric
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.fabrics.map((fabric, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedFabric(fabric)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedFabric.name === fabric.name
                          ? "bg-gradient-to-r from-neutral-800 to-neutral-900 border-[#E1B168] shadow-lg shadow-[#E1B168]/5"
                          : "bg-neutral-950/20 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <h5 className="text-xs font-semibold text-neutral-100">{fabric.name}</h5>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                        {fabric.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Select Royal Colorways */}
              <div>
                <label className="text-xs font-mono tracking-widest uppercase text-[#E1B168] flex items-center gap-1.5 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1B168]" />
                  2. Choose Colorway
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        selectedColor.name === color.name
                          ? "bg-white/5 border-[#E1B168] text-white"
                          : "bg-transparent border-white/5 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <span
                        style={{ backgroundColor: color.hex }}
                        className="w-4 h-4 rounded-full border border-neutral-800 ring-1 ring-white/10"
                      />
                      <span className="text-xs font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Standard Sizing */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-mono tracking-widest uppercase text-[#E1B168] flex items-center gap-1.5">
                    <Ruler size={12} />
                    3. Select Standard Size
                  </label>
                  <button 
                    onClick={() => alert("Size Chart: S (52\" L, 36\" C), M (54\" L, 38\" C), L (56\" L, 40\" C), XL (58\" L, 44\" C)")}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline flex items-center gap-1"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[42px] px-3 py-2 rounded-xl border text-xs font-semibold font-mono transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#E1B168] border-[#E1B168] text-neutral-950"
                          : "bg-transparent border-white/5 text-neutral-300 hover:border-white/15 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Custom Tailoring Dimensions (Interactive sliders to simulate 3D) */}
              <div className="bg-neutral-950/20 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                    Custom Custom Tailoring (Optional)
                  </h4>
                  <span className="text-[10px] font-mono text-[#E1B168] bg-[#E1B168]/5 px-2 py-0.5 rounded">
                    Free Adjustment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sleeve options */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                      Sleeve Style Style
                    </label>
                    <select
                      value={sleeveStyle}
                      onChange={(e) => setSleeveStyle(e.target.value)}
                      className="w-full mt-1.5 bg-neutral-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#E1B168] transition-all"
                    >
                      <option value="Classic Bell">Classic Bell (Draped Wrist)</option>
                      <option value="Flared Kimono">Flared Kimono (Sweeping Open)</option>
                      <option value="Elastic Smocked">Elastic Smocked (Modest Tight Cuff)</option>
                      <option value="Buttoned Cuffed">Buttoned French Cuff</option>
                    </select>
                  </div>

                  {/* Length adjustment */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                      <span>Length Length</span>
                      <span className="text-[#E1B168] font-bold">{customLength} inches</span>
                    </div>
                    <input
                      type="range"
                      min="48"
                      max="62"
                      value={customLength}
                      onChange={(e) => setCustomLength(parseInt(e.target.value))}
                      className="w-full accent-[#E1B168] mt-2.5 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Chest adjustment */}
                  <div className="sm:col-span-2">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                      <span>Chest Width Chest Width</span>
                      <span className="text-[#E1B168] font-bold">{customChest} inches (Bust 32&quot;-46&quot;)</span>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="48"
                      value={customChest}
                      onChange={(e) => setCustomChest(parseInt(e.target.value))}
                      className="w-full accent-[#E1B168] mt-2.5 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar / Pricing and Buy Button */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Quantity adjustments */}
                <div className="flex items-center bg-neutral-950 border border-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold font-mono text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Estimated Total</span>
                  <span className="text-xl font-bold text-[#E1B168]">
                    ৳{(product.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Main Action Call */}
              <button
                onClick={handleAddToCartClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E1B168] hover:bg-[#D4A359] text-neutral-950 px-8 py-3 rounded-xl transition-all duration-300 font-bold text-sm shadow-lg shadow-[#E1B168]/15 group cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>Add Customized Outfit</span>
              </button>
            </div>

            {/* Quality badge disclaimer */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 font-mono">
              <ShieldCheck size={12} className="text-[#E1B168]/60" />
              100% Halal Fabric, Hand-Finished in Dhaka, Bangladesh
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
