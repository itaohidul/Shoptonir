/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";
import { ShoppingBag, Trash2, ShieldCheck, HeartHandshake, Truck, MapPin } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [shippingArea, setShippingArea] = useState<"inside" | "outside">("inside");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "success">("cart");
  const [orderId, setOrderId] = useState<string>("");

  const shippingCost = shippingArea === "inside" ? 80 : 150;
  const itemsSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const orderTotal = itemsSubtotal + shippingCost;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Apa, please fill out all details so we can securely deliver your order!");
      return;
    }

    // Generate a random premium order ID
    const randomId = "ST-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomId);
    setCheckoutStep("success");
    onClearCart();
  };

  const resetCheckout = () => {
    setCheckoutStep("cart");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-neutral-900 border-l border-white/5 flex flex-col justify-between shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#15161a]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#E1B168]" />
              <h2 className="font-serif text-lg text-white font-medium">Your Shopping Bag</h2>
              <span className="bg-[#E97D9B]/15 text-[#E97D9B] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-all text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Body Stage */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: CART LISTING */}
              {checkoutStep === "cart" && (
                <motion.div
                  key="cart_list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {cart.length === 0 ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="w-14 h-14 bg-neutral-950 rounded-full flex items-center justify-center text-neutral-600 mx-auto border border-white/5">
                        <ShoppingBag size={22} />
                      </div>
                      <p className="text-sm text-neutral-400 font-serif">Your shopping bag is completely empty, Apa.</p>
                      <button
                        onClick={onClose}
                        className="text-xs font-mono text-[#E1B168] hover:underline cursor-pointer"
                      >
                        Explore Modest Wear Catalog
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-neutral-950/40 border border-white/5 p-3 rounded-2xl flex gap-3 items-stretch group"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-20 rounded-xl object-cover object-top border border-white/5"
                          referrerPolicy="no-referrer"
                        />

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-white truncate pr-2">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                              Fabric: <span className="text-neutral-200">{item.selectedFabric.name}</span>
                            </p>
                            
                            <div className="flex gap-2 items-center text-[9px] font-mono mt-1">
                              <span className="flex items-center gap-1">
                                <span
                                  style={{ backgroundColor: item.selectedColor.hex }}
                                  className="w-2 h-2 rounded-full border border-neutral-800"
                                />
                                {item.selectedColor.name}
                              </span>
                              <span className="text-neutral-600">|</span>
                              <span>Size: {item.selectedSize}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-white/5">
                            {/* Quantity buttons */}
                            <div className="flex items-center bg-neutral-950 border border-white/5 rounded-lg p-0.5 scale-90 origin-left">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-white/5 cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-[10px] font-mono font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-white/5 cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs font-bold text-[#E1B168]">
                              ৳{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {cart.length > 0 && (
                    <div className="bg-neutral-950/20 p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Items Subtotal:</span>
                        <span className="font-bold text-white">৳{itemsSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs pb-1 border-b border-white/5">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Truck size={12} className="text-[#E1B168]" />
                          Delivery Fee:
                        </span>
                        <span className="font-bold text-white">৳{shippingCost}</span>
                      </div>

                      {/* Delivery options inside or outside Dhaka */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <button
                          onClick={() => setShippingArea("inside")}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            shippingArea === "inside"
                              ? "bg-white/5 border-[#E1B168] text-white"
                              : "bg-transparent border-white/5 text-neutral-500 hover:text-white"
                          }`}
                        >
                          Inside Dhaka (৳80)
                        </button>
                        <button
                          onClick={() => setShippingArea("outside")}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            shippingArea === "outside"
                              ? "bg-white/5 border-[#E1B168] text-white"
                              : "bg-transparent border-white/5 text-neutral-500 hover:text-white"
                          }`}
                        >
                          Outside Dhaka (৳150)
                        </button>
                      </div>

                      <div className="flex justify-between items-baseline pt-2">
                        <span className="text-sm font-semibold text-neutral-200">Total:</span>
                        <span className="text-lg font-bold text-[#E1B168]">৳{orderTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: SHIPPING DETAILS FORM */}
              {checkoutStep === "form" && (
                <motion.div
                  key="checkout_form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#E1B168]" />
                      Delivery Details
                    </h3>
                    <p className="text-[10px] text-neutral-400">We will finalize delivery via phone matching, Cash on Delivery in Bangladesh.</p>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nusrat Jahan Apa"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full mt-1 bg-neutral-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#E1B168] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Contact Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 017XXXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full mt-1 bg-neutral-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#E1B168] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">Full Delivery Address</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="House/Road, Area name, District"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full mt-1 bg-neutral-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#E1B168] transition-all resize-none"
                      />
                    </div>

                    <div className="bg-neutral-950/40 p-3 rounded-xl border border-white/5 text-[10px] text-neutral-400 leading-relaxed space-y-1">
                      <div className="flex justify-between font-mono">
                        <span>Items subtotal:</span>
                        <span className="text-neutral-200">৳{itemsSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Delivery fee ({shippingArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"}):</span>
                        <span className="text-neutral-200">৳{shippingCost}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold pt-1 border-t border-white/5">
                        <span className="text-white">Amount to Pay on Delivery:</span>
                        <span className="text-[#E1B168]">৳{orderTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Assure Order Cash on Delivery</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: ORDER SUCCESS SUCCESS */}
              {checkoutStep === "success" && (
                <motion.div
                  key="checkout_success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-5"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/25 flex items-center justify-center text-emerald-500 mx-auto">
                    <ShieldCheck size={32} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-white">Jazakallah Khair, Apa! 🌸</h3>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                      Your modest design order has been received at Shoptonir. Our Dhaka delivery team will call you at <b>{customerPhone}</b> to finalize sizing and transit timing.
                    </p>
                  </div>

                  <div className="bg-neutral-950/60 p-4 rounded-2xl border border-white/5 text-center inline-block max-w-xs w-full">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Order ID Reference</p>
                    <p className="text-lg font-bold font-mono text-[#E1B168] mt-0.5">{orderId}</p>
                    <p className="text-[9px] font-mono text-emerald-500 mt-1 flex items-center justify-center gap-1">
                      ● Preparing for Packaging
                    </p>
                  </div>

                  <button
                    onClick={resetCheckout}
                    className="text-xs font-mono text-[#E1B168] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer Action Bar */}
          {cart.length > 0 && checkoutStep === "cart" && (
            <div className="p-5 border-t border-white/5 bg-[#15161a]">
              <button
                onClick={() => setCheckoutStep("form")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 font-bold text-xs shadow-lg cursor-pointer"
              >
                Proceed to Delivery (Cash on Delivery)
              </button>
              <div className="mt-3.5 flex justify-center items-center gap-1 text-[10px] text-neutral-500 font-mono">
                <HeartHandshake size={11} className="text-[#E1B168]/60" />
                Hand-wrapped with care and fragrance
              </div>
            </div>
          )}

          {checkoutStep === "form" && (
            <div className="p-4 border-t border-white/5 text-center bg-[#15161a]">
              <button
                onClick={() => setCheckoutStep("cart")}
                className="text-[11px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
              >
                ← Back to Bag Listing
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
