/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Product } from "../types";
import { Eye, ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring settings for ultra-smooth 3D physical drag
  const springConfig = { damping: 25, stiffness: 180, mass: 0.8 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);

  // Motion values for reflective glare shine position
  const shineX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), springConfig);
  const shineY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Normalized position relative to center of card (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className="relative w-full max-w-sm rounded-2xl bg-neutral-900/60 p-4 border border-white/5 hover:border-[#E1B168]/20 transition-all duration-300 backdrop-blur-xl group cursor-pointer select-none"
    >
      {/* Glossy Reflective Glare Overlay */}
      <motion.div
        style={{
          background: useTransform(
            [shineX, shineY],
            ([sx, sy]) => `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%)`
          ),
        }}
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
      />

      {/* Best Seller Badge */}
      {product.isBestSeller && (
        <div className="absolute top-6 left-6 z-20 bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-[0_4px_12px_rgba(225,177,104,0.3)]">
          Bestseller
        </div>
      )}

      {/* Product Image Stage */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#141519] flex items-center justify-center border border-white/5"
        style={{ transform: "translateZ(25px)" }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/10 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Fast Action Buttons overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            id={`view-btn-${product.id}`}
            className="flex items-center gap-1 bg-neutral-950/85 hover:bg-[#E1B168] hover:text-neutral-950 border border-[#E1B168]/30 hover:border-[#E1B168] text-white p-2.5 rounded-xl transition-all duration-300 text-xs shadow-lg backdrop-blur-sm"
            title="Interactive Customizer"
          >
            <Eye size={15} />
            <span className="font-medium pr-1">Customize</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            id={`add-btn-${product.id}`}
            className="flex items-center gap-1.5 bg-[#E1B168] hover:bg-[#D4A359] text-neutral-950 p-2.5 rounded-xl transition-all duration-300 text-xs font-bold shadow-lg shadow-[#E1B168]/20"
            title="Quick Add to Cart"
          >
            <ShoppingCart size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Product Information Container */}
      <div className="mt-4 px-1" style={{ transform: "translateZ(15px)" }}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E1B168]">
              {product.category}
            </span>
            <h3 className="font-serif text-sm font-medium text-neutral-100 group-hover:text-white group-hover:underline decoration-[#E1B168]/30 underline-offset-4 decoration-1 transition-all mt-0.5 line-clamp-1">
              {product.name}
            </h3>
            <p className="font-serif text-xs text-neutral-400 mt-0.5 Bengali text-[#E97D9B]/85">
              {product.bengaliName}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-neutral-50">
              ৳{product.price.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-neutral-500 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Rating and Colorways Swatch Preview */}
        <div className="mt-3.5 pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Star size={12} className="text-[#E1B168] fill-[#E1B168]" />
            <span className="font-medium text-neutral-200">{product.rating}</span>
            <span className="text-neutral-500">({product.reviewsCount})</span>
          </div>

          {/* Miniature Color Swatches */}
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color, idx) => (
              <span
                key={idx}
                style={{ backgroundColor: color.hex }}
                className="w-2.5 h-2.5 rounded-full border border-neutral-800 ring-1 ring-white/10"
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] font-mono text-neutral-500 font-medium pl-0.5">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
