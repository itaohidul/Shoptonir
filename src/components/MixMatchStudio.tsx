/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product, ColorOption } from "../types";
import { PRODUCTS } from "../data/products";
import { Sparkles, ShoppingBag, Layers, CheckCircle2, RotateCcw, UploadCloud, Plus, Check } from "lucide-react";
import ThreeAvatar from "./ThreeAvatar";

interface MixMatchStudioProps {
  onAddBundleToCart: (items: Array<{ product: Product; color: ColorOption; size: string }>) => void;
}

const AVATARS = [
  { id: "dahlia", name: "Dahlia", description: "Traditional Bengali Grace", faceColor: "#F5C3A6", lipsColor: "#B43F54" },
  { id: "amina", name: "Amina", description: "Modern Minimalist Style", faceColor: "#E2A884", lipsColor: "#A63548" },
  { id: "nour", name: "Nour", description: "Royal Arabesque Look", faceColor: "#FCD8C1", lipsColor: "#C94A62" },
  { id: "yasmin", name: "Yasmin", description: "Festive Brightness Shimmer", faceColor: "#D1926D", lipsColor: "#912335" },
];

export default function MixMatchStudio({ onAddBundleToCart }: MixMatchStudioProps) {
  // Custom uploaded products state for try-on
  const [customProducts, setCustomProducts] = useState<Product[]>([]);

  // Extract Abayas and Hijabs from catalog (supporting custom uploads and category mapping)
  const allProducts = [...PRODUCTS, ...customProducts];
  const abayas = allProducts.filter((p) => p.category === "abaya" || p.category === "gown");
  const hijabs = allProducts.filter((p) => p.category === "hijab");

  // Selection states
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedAbaya, setSelectedAbaya] = useState<Product>(abayas[0]);
  const [selectedAbayaColor, setSelectedAbayaColor] = useState<ColorOption>(abayas[0].colors[0]);
  
  const [selectedHijab, setSelectedHijab] = useState<Product>(hijabs[0] || PRODUCTS[3]);
  const [selectedHijabColor, setSelectedHijabColor] = useState<ColorOption>(hijabs[0]?.colors[0] || { name: "Rose", hex: "#C78C95" });

  const [includePin, setIncludePin] = useState<boolean>(true);
  const [bundleAdded, setBundleAdded] = useState<boolean>(false);

  // Advanced Avatar Customization States
  const [selectedSize, setSelectedSize] = useState<"M" | "L" | "XL" | "XXL">("M");
  const [viewMode, setViewMode] = useState<"front" | "side" | "back" | "360">("360");
  const [niqabEnabled, setNiqabEnabled] = useState<boolean>(false);
  const [sleeveEmbellishment, setSleeveEmbellishment] = useState<"classic" | "royal_gold" | "crystal_sequin" | "lace_trim">("classic");

  // Product Upload States & Forms
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdPrice, setNewProdPrice] = useState<number>(1200);
  const [newProdImage, setNewProdImage] = useState<string | null>(null);
  const [newProdColor, setNewProdColor] = useState<string>("#C78C95");
  const [newProdFabric, setNewProdFabric] = useState<string>("Premium Armani Chiffon");
  const [newProdCovers, setNewProdCovers] = useState<{ [key: string]: boolean }>({
    hair: false,
    head: false,
    neck: false,
    shoulders: false,
    arms: false,
    torso: false,
    waist: false,
    legs: false,
    fullBody: false,
  });

  // Custom Fit Recommender States
  const [showRecommender, setShowRecommender] = useState<boolean>(false);
  const [heightFeet, setHeightFeet] = useState<string>("5");
  const [heightInches, setHeightInches] = useState<string>("4");
  const [weightKg, setWeightKg] = useState<string>("60");

  // Size details configurations
  const SIZE_CONFIGS = {
    M: {
      label: "Medium (M)",
      abayaScaleX: 1.0,
      abayaScaleY: 1.0,
      bust: "40 in",
      length: '54 in (Fits 5\'2" - 5\'4")',
      sweep: "120 in",
      sleeve: "24 in",
      drapeFit: "Svelte modest drape. Classic tailored flow with graceful, tight-contour folds."
    },
    L: {
      label: "Large (L)",
      abayaScaleX: 1.08,
      abayaScaleY: 1.02,
      bust: "44 in",
      length: '56 in (Fits 5\'4" - 5\'6")',
      sweep: "130 in",
      sleeve: "25 in",
      drapeFit: "Relaxed fluid fit. Beautiful cascading gather lines with a standard premium drape."
    },
    XL: {
      label: "Extra Large (XL)",
      abayaScaleX: 1.16,
      abayaScaleY: 1.04,
      bust: "48 in",
      length: '58 in (Fits 5\'6" - 5\'8")',
      sweep: "140 in",
      sleeve: "25.5 in",
      drapeFit: "Generous royal flare. Wide dramatic fall with majestic, heavy wind-resistant folds."
    },
    XXL: {
      label: "Double Extra Large (XXL)",
      abayaScaleX: 1.24,
      abayaScaleY: 1.06,
      bust: "52 in",
      length: '60 in (Fits 5\'8" - 5\'10")',
      sweep: "150 in",
      sleeve: "26 in",
      drapeFit: "Maximum Volume Queen drape. Deep premium ripples, ultimate breathability and sweep."
    }
  };

  const activeSizeInfo = SIZE_CONFIGS[selectedSize];

  // Bundle pricing logic with a 10% discount
  const abayaPrice = selectedAbaya.price;
  const hijabPrice = selectedHijab.price;
  const pinPrice = includePin ? 350 : 0;
  const subtotal = abayaPrice + hijabPrice + pinPrice;
  const discount = Math.round(subtotal * 0.1); // 10% bundle saving
  const total = subtotal - discount;

  const handleAddBundle = () => {
    const items = [
      { product: selectedAbaya, color: selectedAbayaColor, size: selectedSize },
      { product: selectedHijab, color: selectedHijabColor, size: "70 x 180 cm" }
    ];
    if (includePin) {
      // Mock accessory
      items.push({
        product: {
          id: "accessory_pin",
          name: "Golden Rose Elegant Brooch",
          bengaliName: "স্বর্ণালী গোলাপ ব্রোচ",
          price: 350,
          originalPrice: 450,
          description: "An elegant golden brass floral brooch modeled after traditional Shoptonir roses.",
          longDescription: "",
          image: "",
          category: "hijab", // placeholder
          colors: [{ name: "Gold", hex: "#E1B168" }],
          fabrics: [],
          sizes: ["One Size"],
          rating: 5,
          reviewsCount: 10
        },
        color: { name: "Gold", hex: "#E1B168" },
        size: "One Size"
      });
    }
    
    onAddBundleToCart(items);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  const resetSelections = () => {
    setSelectedAbaya(abayas[0]);
    setSelectedAbayaColor(abayas[0].colors[0]);
    setSelectedHijab(hijabs[0]);
    setSelectedHijabColor(hijabs[0].colors[0]);
    setIncludePin(true);
    setSelectedSize("M");
    setViewMode("360");
    setNiqabEnabled(false);
    setSleeveEmbellishment("classic");
  };

  // Drag and Drop upload state handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewProdImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleNameChange = (name: string) => {
    setNewProdName(name);
    const lower = name.toLowerCase();
    
    // Auto-detect checkmarks based on naming keywords to save users effort
    if (lower.includes("hijab") || lower.includes("scarf") || lower.includes("khimar") || lower.includes("dupatta") || lower.includes("veil") || lower.includes("head")) {
      setNewProdCovers({
        hair: true,
        head: true,
        neck: true,
        shoulders: false,
        arms: false,
        torso: false,
        waist: false,
        legs: false,
        fullBody: false,
      });
    } else if (lower.includes("abaya") || lower.includes("gown") || lower.includes("kaftan") || lower.includes("dress") || lower.includes("maxi") || lower.includes("bano") || lower.includes("body")) {
      setNewProdCovers({
        hair: false,
        head: false,
        neck: false,
        shoulders: true,
        arms: true,
        torso: true,
        waist: true,
        legs: true,
        fullBody: true,
      });
    }
  };

  const toggleCoverFeature = (key: string) => {
    setNewProdCovers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isAbayaClassification = () => {
    return (
      newProdCovers.shoulders || 
      newProdCovers.arms || 
      newProdCovers.torso || 
      newProdCovers.waist || 
      newProdCovers.legs || 
      newProdCovers.fullBody
    );
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdImage) return;

    const coversAbaya = isAbayaClassification();
    const detectedCategory = coversAbaya ? "abaya" : "hijab";

    const newProduct: Product = {
      id: `custom_${Date.now()}`,
      name: newProdName,
      bengaliName: detectedCategory === "abaya" ? "কাস্টম আবায়া" : "কাস্টম হিজাব",
      price: newProdPrice,
      originalPrice: newProdPrice,
      description: `Custom ${detectedCategory} covering: ${Object.keys(newProdCovers).filter(k => newProdCovers[k]).join(", ")}.`,
      longDescription: `User-uploaded custom ${detectedCategory} crafted from ${newProdFabric} for accurate virtual 3D try-on.`,
      image: newProdImage,
      category: detectedCategory,
      colors: [{ name: "Custom Tone", hex: newProdColor }],
      fabrics: [{ 
        name: newProdFabric, 
        description: "User uploaded custom fabric", 
        weight: "120 gsm", 
        textureClass: "bg-neutral-800",
        sheen: detectedCategory === "abaya" ? 0.2 : 0.1, 
        drapeFactor: detectedCategory === "abaya" ? 1.3 : 1.5 
      }],
      sizes: detectedCategory === "abaya" ? ["M", "L", "XL", "XXL"] : ["One Size"],
      rating: 5.0,
      reviewsCount: 0
    };

    setCustomProducts(prev => [newProduct, ...prev]);
    
    // Auto-select immediately so they see their custom product tried on right away in the 3D studio!
    if (detectedCategory === "abaya") {
      setSelectedAbaya(newProduct);
      setSelectedAbayaColor(newProduct.colors[0]);
    } else {
      setSelectedHijab(newProduct);
      setSelectedHijabColor(newProduct.colors[0]);
    }

    // Reset Form & Close Drawer
    setNewProdName("");
    setNewProdImage(null);
    setNewProdColor("#C78C95");
    setNewProdFabric("Premium Armani Chiffon");
    setNewProdCovers({
      hair: false,
      head: false,
      neck: false,
      shoulders: false,
      arms: false,
      torso: false,
      waist: false,
      legs: false,
      fullBody: false,
    });
    setShowUploader(false);
  };

  // Dynamic transform style for size scaling
  const transformStyle = {
    transform: `scaleX(${activeSizeInfo.abayaScaleX}) scaleY(${activeSizeInfo.abayaScaleY})`,
    transformOrigin: "50px 25px",
    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  return (
    <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* INTERACTIVE MANNEQUIN CANVAS WITH PERSPECTIVES, VEIL, & EMBELLISHMENTS */}
        <div className="flex-1 lg:max-w-md bg-gradient-to-b from-[#16171d] to-neutral-950 rounded-2xl p-5 border border-white/5 flex flex-col justify-between relative min-h-[580px]">
          
          <div className="z-10 flex justify-between items-start gap-2">
            <div className="text-left">
              <span className="text-[9px] font-mono tracking-widest text-[#E1B168] bg-[#E1B168]/5 px-2 py-0.5 rounded border border-[#E1B168]/10 uppercase">
                3D Fitting Studio
              </span>
              <h3 className="font-serif text-lg text-white font-medium mt-1">
                Virtual Styling Mirror
              </h3>
            </div>
          </div>

          {/* Layered Interactive 3D Try-On Display */}
          <div className="relative flex-1 flex flex-col justify-center my-2 h-[340px] overflow-hidden rounded-2xl bg-black/10 border border-white/5 p-1">
            <ThreeAvatar
              avatar={selectedAvatar}
              abaya={selectedAbaya}
              abayaColor={selectedAbayaColor}
              hijab={selectedHijab}
              hijabColor={selectedHijabColor}
              size={selectedSize}
              viewMode={viewMode}
              niqabEnabled={niqabEnabled}
              sleeveEmbellishment={sleeveEmbellishment}
              includePin={includePin}
            />
          </div>

          {/* ACTIVE SIZE SELECTION PILLS (M, L, XL, XXL) WITH INTERACTIVE FIT CALCULATOR */}
          <div className="z-10 mt-2 mb-3 bg-black/40 border border-white/5 p-3 rounded-xl text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono text-[#E1B168] uppercase tracking-wider font-bold flex items-center gap-1">
                <span>Select Silhouette Size:</span>
                <span className="text-neutral-400 font-normal">({selectedSize})</span>
              </p>
              <button
                onClick={() => setShowRecommender(!showRecommender)}
                className="text-[9px] font-mono text-[#E97D9B] hover:text-white transition-all flex items-center gap-1"
              >
                {showRecommender ? "✕ Close Calculator" : "📐 Fit Calculator"}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(["M", "L", "XL", "XXL"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-1.5 px-2 rounded-xl border text-center cursor-pointer transition-all ${
                    selectedSize === size
                      ? "bg-[#E1B168]/20 border-[#E1B168] text-white font-bold"
                      : "bg-transparent border-white/5 text-neutral-400 hover:border-white/10 hover:text-white"
                  }`}
                >
                  <p className="text-xs">{size}</p>
                </button>
              ))}
            </div>

            {/* COLLAPSIBLE PREMIUM SIZING SUGGESTION CALCULATOR */}
            {showRecommender && (
              <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fade-in text-xs">
                <div className="grid grid-cols-3 gap-2">
                  {/* Height Feet Select */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-neutral-400 uppercase">Height (Ft)</label>
                    <select
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg py-1 px-1.5 text-xs text-white outline-none focus:border-[#E1B168]"
                    >
                      <option value="4">4 Ft</option>
                      <option value="5">5 Ft</option>
                      <option value="6">6 Ft</option>
                    </select>
                  </div>

                  {/* Height Inches Select */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-neutral-400 uppercase">Inches (In)</label>
                    <select
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg py-1 px-1.5 text-xs text-white outline-none focus:border-[#E1B168]"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>{i} in</option>
                      ))}
                    </select>
                  </div>

                  {/* Weight Kg Input */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-neutral-400 uppercase">Weight (Kg)</label>
                    <input
                      type="number"
                      min="35"
                      max="150"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg py-1 px-1.5 text-xs text-white outline-none focus:border-[#E1B168]"
                    />
                  </div>
                </div>

                {/* Calculation Outputs */}
                {(() => {
                  const parsedFt = parseInt(heightFeet) || 5;
                  const parsedIn = parseInt(heightInches) || 4;
                  const totalInches = (parsedFt * 12) + parsedIn;
                  const weightVal = parseInt(weightKg) || 60;

                  // Size Recommendation
                  let suggestedSize: "M" | "L" | "XL" | "XXL" = "M";
                  if (weightVal < 58) suggestedSize = "M";
                  else if (weightVal >= 58 && weightVal < 74) suggestedSize = "L";
                  else if (weightVal >= 74 && weightVal < 90) suggestedSize = "XL";
                  else suggestedSize = "XXL";

                  // Length Recommendation
                  let suggestedLength = "54 in";
                  let floorSafetyText = "";
                  if (totalInches <= 61) {
                    suggestedLength = "52 in";
                    floorSafetyText = "Ideal for petite modest fit. Prevents drag and floor grazing entirely.";
                  } else if (totalInches > 61 && totalInches <= 64) {
                    suggestedLength = "54 in";
                    floorSafetyText = "Elegant floor-grazing length. Safely covers ankles for high modest compliance.";
                  } else if (totalInches > 64 && totalInches <= 67) {
                    suggestedLength = "56 in";
                    floorSafetyText = "Beautiful draped silhouette with deep graceful pleat folds.";
                  } else if (totalInches > 67 && totalInches <= 70) {
                    suggestedLength = "58 in";
                    floorSafetyText = "Loose flowing fit with dramatic wind-resistant heavy wave folds.";
                  } else {
                    suggestedLength = "60 in";
                    floorSafetyText = "Royal queen sweep length tailored precisely to high modest height.";
                  }

                  return (
                    <div className="bg-neutral-900/80 border border-white/5 p-2.5 rounded-lg space-y-2 text-left">
                      <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1.5">
                        <span className="font-mono text-neutral-400">Our Recommendation:</span>
                        <span className="font-serif font-bold text-[#E1B168] bg-[#E1B168]/15 px-2 py-0.5 rounded text-[11px]">
                          Size {suggestedSize} (Length: {suggestedLength})
                        </span>
                      </div>
                      
                      <div className="text-[10px] leading-relaxed text-neutral-300">
                        <p className="flex gap-1">
                          <span className="text-[#A3E2C9] font-bold">✓</span> {floorSafetyText}
                        </p>
                        <p className="text-[9px] text-neutral-400 mt-1 italic">
                          Abayas should drape loosely from shoulders to ankle heights. Size {suggestedSize} ensures complete modesty and ease of steps.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSize(suggestedSize);
                          setShowRecommender(false);
                        }}
                        className="w-full mt-1.5 py-1.5 px-2 bg-gradient-to-r from-[#2E6F5E] to-[#4A9F88] text-white rounded-lg text-[10px] font-bold cursor-pointer hover:opacity-95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        Apply Suggested Size ({suggestedSize})
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Custom Sizing Spec Details Card for customer comfort */}
            <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 text-[10px] leading-snug">
              <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-neutral-300 font-mono">
                <div className="flex justify-between border-r border-white/5 pr-2.5">
                  <span className="text-neutral-500">Bust:</span>
                  <span className="text-white font-bold">{activeSizeInfo.bust}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sleeve:</span>
                  <span className="text-white font-bold">{activeSizeInfo.sleeve}</span>
                </div>
                <div className="flex justify-between border-r border-white/5 pr-2.5">
                  <span className="text-neutral-500">Length:</span>
                  <span className="text-white font-bold">{activeSizeInfo.length.split(" ")[0]} in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sweep:</span>
                  <span className="text-white font-bold">{activeSizeInfo.sweep}</span>
                </div>
              </div>
              <p className="text-[9px] text-[#A3E2C9] italic mt-1.5 border-t border-white/5 pt-1.5 leading-snug flex gap-1">
                <span className="text-[#E1B168]">★</span> {activeSizeInfo.drapeFit}
              </p>
            </div>
          </div>

          {/* PORTRAIT DETAILS & ACCESSORY TOGGLES */}
          <div className="z-10 grid grid-cols-2 gap-2 bg-neutral-950/60 p-2.5 border border-white/5 rounded-xl text-left">
            {/* Niqab Toggle */}
            <div className="flex flex-col justify-between">
              <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                Hijab Style
              </span>
              <button
                onClick={() => setNiqabEnabled(!niqabEnabled)}
                className={`py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all text-center flex items-center justify-center gap-1 ${
                  niqabEnabled
                    ? "bg-[#2E6F5E]/20 border-emerald-500 text-emerald-400"
                    : "bg-transparent border-white/5 text-neutral-400 hover:text-white hover:border-white/10"
                }`}
              >
                <span>{niqabEnabled ? "Niqab Mask Active" : "Classic Open Face"}</span>
              </button>
            </div>

            {/* Sleeve Cuff Embellishment Selector */}
            <div className="flex flex-col justify-between">
              <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                Luxury Cuff
              </span>
              <select
                value={sleeveEmbellishment}
                onChange={(e) => setSleeveEmbellishment(e.target.value as any)}
                className="bg-neutral-900 border border-white/5 py-1 px-1.5 rounded-lg text-[10px] font-medium text-neutral-300 focus:outline-none focus:border-[#E1B168] cursor-pointer"
              >
                <option value="classic">Classic Plain</option>
                <option value="royal_gold">Royal Gold Zardozi</option>
                <option value="crystal_sequin">Crystal Sequins</option>
                <option value="lace_trim">Scalloped Lace</option>
              </select>
            </div>
          </div>

          {/* Skin Tone Presets */}
          <div className="z-10 mt-3 pt-2.5 border-t border-white/5">
            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-2 text-center">
              Active Portrait Complexion
            </p>
            <div className="flex justify-center gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setSelectedAvatar(av)}
                  style={{ backgroundColor: av.faceColor }}
                  className={`w-5 h-5 rounded-full border border-neutral-800 ring-1 cursor-pointer transition-all ${
                    selectedAvatar.id === av.id ? "ring-[#E1B168] scale-110" : "ring-white/5"
                  }`}
                  title={`${av.name} - ${av.description}`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* SELECTOR PANELS & BUNDLING DISCOUNTS */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#E1B168]">
                  Virtual Matcher
                </span>
                <h3 className="font-serif text-2xl text-white font-medium mt-1">
                  Curate Your Modest Set
                </h3>
              </div>
              
              <button
                onClick={() => setShowUploader(true)}
                className="bg-[#E1B168]/15 border border-[#E1B168]/20 hover:bg-[#E1B168]/30 text-[#E1B168] text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <UploadCloud size={15} />
                <span>Upload Custom Item</span>
              </button>
            </div>
            
            <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
              Pair your favorite luxury outer garments with complementary accessories. Buying as a curated set unlocks a <b>10% discount</b> on our premium fabrics or your custom uploads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ABAYA SELECTOR */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block border-b border-white/5 pb-1.5">
                Step 1: Choose Abaya Gown
              </label>
              <div className="space-y-2">
                {abayas.map((abaya) => (
                  <button
                    key={abaya.id}
                    onClick={() => {
                      setSelectedAbaya(abaya);
                      setSelectedAbayaColor(abaya.colors[0]);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex gap-3 items-center cursor-pointer ${
                      selectedAbaya.id === abaya.id
                        ? "bg-neutral-800/80 border-[#E1B168]"
                        : "bg-transparent border-white/5 hover:border-white/10"
                    }`}
                  >
                    <img
                      src={abaya.image}
                      alt={abaya.name}
                      className="w-10 h-10 rounded-lg object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{abaya.name}</h4>
                      <p className="text-[10px] text-neutral-400 truncate">৳{abaya.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Color swatch for active abaya */}
              <div className="pt-1">
                <p className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Abaya Color Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAbaya.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAbayaColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-5 h-5 rounded-full border border-neutral-800 ring-1 cursor-pointer transition-all ${
                        selectedAbayaColor.name === color.name ? "ring-[#E1B168] scale-110" : "ring-white/10"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* HIJAB SELECTOR */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block border-b border-white/5 pb-1.5">
                Step 2: Choose Matching Hijab
              </label>
              <div className="space-y-2">
                {hijabs.map((hijab) => (
                  <button
                    key={hijab.id}
                    onClick={() => {
                      setSelectedHijab(hijab);
                      setSelectedHijabColor(hijab.colors[0]);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex gap-3 items-center cursor-pointer ${
                      selectedHijab.id === hijab.id
                        ? "bg-neutral-800/80 border-[#E97D9B]"
                        : "bg-transparent border-white/5 hover:border-white/10"
                    }`}
                  >
                    <img
                      src={hijab.image}
                      alt={hijab.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{hijab.name}</h4>
                      <p className="text-[10px] text-neutral-400 truncate">৳{hijab.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Color swatch for active hijab */}
              <div className="pt-1">
                <p className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Hijab Color Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHijab.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedHijabColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-5 h-5 rounded-full border border-neutral-800 ring-1 cursor-pointer transition-all ${
                        selectedHijabColor.name === color.name ? "ring-[#E97D9B] scale-110" : "ring-white/10"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Pin Accessory and Checkout Bundle Panel */}
          <div className="bg-neutral-950/40 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="include_pin"
                checked={includePin}
                onChange={(e) => setIncludePin(e.target.checked)}
                className="w-4.5 h-4.5 accent-[#E1B168] bg-neutral-950 rounded border-white/10 focus:outline-none cursor-pointer"
              />
              <div>
                <label htmlFor="include_pin" className="text-xs font-bold text-neutral-200 cursor-pointer flex items-center gap-1.5">
                  Include Golden Rose Pin Accessory
                  <span className="text-[9px] font-mono text-[#E1B168] font-normal">+৳350</span>
                </label>
                <p className="text-[10px] text-neutral-500">Premium brass, prevents fabric slide and adds royal gloss.</p>
              </div>
            </div>

            <button
              onClick={resetSelections}
              className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-all"
            >
              <RotateCcw size={10} />
              Reset Selections
            </button>
          </div>

          {/* Summary pricing and buy button */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400 line-through">
                  ৳{subtotal.toLocaleString()}
                </span>
                <span className="bg-[#E1B168]/15 border border-[#E1B168]/20 text-[#E1B168] text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                  SAVE ৳{discount.toLocaleString()} (10%)
                </span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">
                ৳{total.toLocaleString()}
              </p>
              <p className="text-[9px] font-mono text-neutral-500 mt-0.5">Includes Abaya + Hijab {includePin && "+ Brooch"}</p>
            </div>

            <button
              onClick={handleAddBundle}
              disabled={bundleAdded}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                bundleAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 shadow-lg shadow-[#E1B168]/15 hover:shadow-[#E1B168]/25"
              }`}
            >
              {bundleAdded ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Curated Bundle Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  <span>Buy Complete Styled Outfit Set</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* CUSTOM FASHION UPLOADER MODAL DRAWER */}
      <AnimatePresence>
        {showUploader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={() => setShowUploader(false)} />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="border-b border-white/5 p-5 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E1B168]/15 border border-[#E1B168]/30 flex items-center justify-center text-[#E1B168]">
                    <UploadCloud size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white font-medium">Upload Custom Garment</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">Auto-Classification Try-On Engine</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploader(false)}
                  className="w-8 h-8 rounded-full border border-white/5 hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Scrollable */}
              <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
                
                {/* Image Upload Area (Complies with Drag and Drop / Manual selection guidelines) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Product Photograph (Front View recommended)
                  </label>
                  
                  {newProdImage ? (
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                      <img src={newProdImage} alt="Custom Preview" className="h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setNewProdImage(null)}
                        className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-600 border border-white/10 text-white text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all shadow-md cursor-pointer"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-4 text-center ${
                        dragActive 
                          ? "border-[#E1B168] bg-[#E1B168]/5" 
                          : "border-white/10 bg-black/10 hover:border-white/20 hover:bg-black/20"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400">
                        <UploadCloud size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-200">Drag & drop your product photo here</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Or click to browse files from device</p>
                      </div>
                      <p className="text-[9px] font-mono text-neutral-600">Supports PNG, JPG, JPEG, WebP</p>
                    </div>
                  )}
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. My Premium Armani Silk Hijab"
                      value={newProdName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#E1B168]"
                    />
                  </div>

                  {/* Fabric */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase">Fabric Material</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Georgette Silk"
                      value={newProdFabric}
                      onChange={(e) => setNewProdFabric(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#E1B168]"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase">Target Price (৳)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#E1B168]"
                    />
                  </div>

                  {/* Color Pick */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase">Custom Color Tint</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newProdColor}
                        onChange={(e) => setNewProdColor(e.target.value)}
                        className="w-9 h-9 rounded-lg overflow-hidden border-none cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={newProdColor}
                        onChange={(e) => setNewProdColor(e.target.value)}
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono focus:border-[#E1B168]"
                      />
                    </div>
                  </div>
                </div>

                {/* COVERAGE CHECKBOX RULES (For separation) */}
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3.5">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Coverage Mapping Features</span>
                      <span className="text-[9px] font-mono text-neutral-500 font-normal">(Used for Auto-Separation)</span>
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                      Select what body areas this outer garment covers. The engine will automatically classify the product.
                    </p>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {Object.keys(newProdCovers).map((key) => {
                      const label = key === "fullBody" ? "Full Body Gown" : key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                            newProdCovers[key]
                              ? "bg-white/5 border-white/20 text-white"
                              : "bg-transparent border-white/5 text-neutral-400 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={newProdCovers[key]}
                            onChange={() => toggleCoverFeature(key)}
                            className="w-4 h-4 accent-[#E1B168]"
                          />
                          <span className="text-[11px] font-medium">{label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* AUTO CLASSIFICATION PREVIEW BADGE */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">Detection Result:</p>
                    
                    {isAbayaClassification() ? (
                      <div className="flex items-center gap-1.5 bg-[#E1B168]/15 border border-[#E1B168]/20 px-3 py-1 rounded-xl text-[#E1B168] text-[10px] font-mono font-bold uppercase animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E1B168] animate-ping" />
                        <span>Abaya Collection Gown</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-[#E97D9B]/15 border border-[#E97D9B]/20 px-3 py-1 rounded-xl text-[#E97D9B] text-[10px] font-mono font-bold uppercase animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E97D9B] animate-ping" />
                        <span>Hijab Collection Headwear</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploader(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/5 bg-transparent hover:bg-white/5 text-neutral-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!newProdName || !newProdImage}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      newProdName && newProdImage
                        ? "bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 shadow-lg shadow-[#E1B168]/15"
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    <Plus size={14} />
                    <span>Generate & Try On in 3D</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
