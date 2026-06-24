/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";

export const PRODUCTS: Product[] = [
  {
    id: "abaya_royal_velvet",
    name: "Royal Velvet Hand-Embroidered Abaya",
    bengaliName: "রয়্যাল ভেলভেট এমব্রয়ডারি আবায়া",
    price: 5500,
    originalPrice: 6500,
    description: "Deep luxury maroon velvet abaya adorned with hand-stitched floral gold zardozi embroidery on cuffs and lapels.",
    longDescription: "Crafted from premium heavy Turkish velvet, the Royal Velvet Abaya is a testament to timeless modest elegance. It features a sweeping classic drape, discrete side pockets, and magnificent hand-embroidered floral motifs inspired by Mughal art, created using golden zari and micro-beads. It's a statement piece meant for celebratory events, Eid, and formal gatherings.",
    image: "/src/assets/images/abaya_royal_velvet_1782320250749.jpg",
    category: "abaya",
    colors: [
      { name: "Royal Maroon", hex: "#5C1322" },
      { name: "Midnight Onyx", hex: "#0D0D11" },
      { name: "Deep Emerald", hex: "#0E3A2F" },
      { name: "Rich Plum", hex: "#3B1430" }
    ],
    fabrics: [
      {
        name: "Turkish Royal Velvet",
        description: "Heavy, ultra-soft velvet with high insulating comfort and a rich plush texture.",
        weight: "380 GSM",
        textureClass: "bg-radial from-[#5C1322] via-[#2F060D] to-[#140003]",
        sheen: 0.85,
        drapeFactor: 1.2
      },
      {
        name: "Premium Armani Silk",
        description: "Lighter weight, highly fluid silk with an exquisite pearlescent shimmer.",
        weight: "140 GSM",
        textureClass: "bg-gradient-to-tr from-[#3D0A14] to-[#751A2C]",
        sheen: 0.95,
        drapeFactor: 1.5
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 124
  },
  {
    id: "abaya_sorrento_silk",
    name: "Sorrento Lustrous Silk Kaftan Abaya",
    bengaliName: "সোরেন্টো লাস্ট্রাস সিল্ক কাফতান আবায়া",
    price: 6200,
    originalPrice: 7200,
    description: "An incredibly elegant sand-beige silk abaya with a subtle metallic sheen, designed with sweeping fluid folds.",
    longDescription: "The Sorrento Kaftan Abaya features an oversized, flowy cut that represents the pinnacle of premium modest streetwear and formal wear. Made from high-grade liquid satin silk, it ripples beautifully with movement, reflecting soft metallic tones. Adorned with delicate gold beadings along the split sleeves.",
    image: "/src/assets/images/abaya_sorrento_silk_1782320267075.jpg",
    category: "abaya",
    colors: [
      { name: "Sand Beige", hex: "#D4C5B9" },
      { name: "Rose Gold", hex: "#DFA0A5" },
      { name: "Desert Bronze", hex: "#9B8372" },
      { name: "Sage Mist", hex: "#9EADA1" }
    ],
    fabrics: [
      {
        name: "Lustrous Liquid Satin Silk",
        description: "Unbelievably smooth, cool-to-touch silk that shifts and shines elegantly under ambient light.",
        weight: "120 GSM",
        textureClass: "bg-gradient-to-r from-[#D4C5B9] to-[#EBE2DA]",
        sheen: 0.98,
        drapeFactor: 1.6
      },
      {
        name: "Luxury Saudi Crepe",
        description: "Matte, highly durable crepe with a structured weight that maintains pristine vertical folds.",
        weight: "180 GSM",
        textureClass: "bg-radial from-[#8C7A6E] to-[#5C4F46]",
        sheen: 0.1,
        drapeFactor: 1.3
      }
    ],
    sizes: ["M", "L", "XL"],
    isBestSeller: true,
    rating: 4.8,
    reviewsCount: 96
  },
  {
    id: "gown_eliza_organza",
    name: "Eliza Tiered Organza Modest Gown",
    bengaliName: "এলিযা টিয়ার্ড অরগাঞ্জা গাউন",
    price: 7500,
    originalPrice: 8900,
    description: "A gorgeous, multi-tiered dusty rose gown crafted from fine silk organza with full balloon sleeves.",
    longDescription: "Dainty, romantic, and perfectly modest, the Eliza Gown is built with layers of premium silk-infused organza overlaying a soft cotton-silk breathable lining. It features beautifully gathered balloon sleeves with tight buttoned cuffs, a fitted cinched belt that is removable, and a tiered dramatic skirt that billows majestically. Perfect for evening occasions, bridal showers, and festive occasions.",
    image: "/src/assets/images/gown_eliza_organza_1782320300161.jpg",
    category: "gown",
    colors: [
      { name: "Dusty Rose", hex: "#C78C95" },
      { name: "Lavender Dust", hex: "#A594B3" },
      { name: "Mint Sorbet", hex: "#A9C2B8" },
      { name: "Ivory Pearl", hex: "#F5ECE1" }
    ],
    fabrics: [
      {
        name: "Premium Silk Organza",
        description: "Sheer, crisp yet lightweight silk mesh that creates dramatic volume and ethereal shadows.",
        weight: "65 GSM",
        textureClass: "bg-gradient-to-b from-[#E6C5C9]/30 via-[#C78C95]/50 to-[#9E646E]/80",
        sheen: 0.6,
        drapeFactor: 1.1
      },
      {
        name: "Luxe Flowing Chiffon",
        description: "Soft, granular texture chiffon that drapes tightly to body contours with lightweight breeze.",
        weight: "95 GSM",
        textureClass: "bg-gradient-to-r from-[#C78C95] to-[#A36C75]",
        sheen: 0.2,
        drapeFactor: 1.7
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    isBestSeller: false,
    rating: 4.7,
    reviewsCount: 52
  },
  {
    id: "hijab_luxury_chiffon",
    name: "Luxury Folded Chiffon Georgette Hijab",
    bengaliName: "লাক্সারি শিফন জর্জেট হিজাব",
    price: 850,
    originalPrice: 1100,
    description: "A premium set of lightweight, breathable, and slightly textured georgette chiffons with non-slip grip.",
    longDescription: "Engineered specifically for active daily comfort and seamless draping, our Luxury Chiffon Georgette Hijabs are woven with high-twist yarn giving them a delicate sand-pebble texture. This unique weave provides natural anti-slip properties, allowing the hijab to stay pinned beautifully all day while maintaining complete breathability.",
    image: "/src/assets/images/hijab_collection_1782320280884.jpg",
    category: "hijab",
    colors: [
      { name: "Pastel Pink", hex: "#F3C5CB" },
      { name: "Olive Moss", hex: "#636F58" },
      { name: "Cocoa Mocha", hex: "#7D5E4D" },
      { name: "Deep Plum", hex: "#4A2840" },
      { name: "Midnight Black", hex: "#111113" }
    ],
    fabrics: [
      {
        name: "High-Twist Pearl Georgette Chiffon",
        description: "Lightweight, sheer, pebbled-texture chiffon which is highly breathable and resists creasing.",
        weight: "80 GSM",
        textureClass: "bg-gradient-to-r from-[#F3C5CB] to-[#E2A6AF]",
        sheen: 0.15,
        drapeFactor: 1.8
      }
    ],
    sizes: ["70 x 180 cm"],
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 210
  },
  {
    id: "abaya_rose_crystal",
    name: "Rose Crystal Floral Embellished Abaya",
    bengaliName: "রোজ ক্রিস্টাল ফ্লোরাল এমব্রয়ডারি আবায়া",
    price: 6500,
    originalPrice: 7800,
    description: "An exquisite rose-pink wrap abaya with magnificent hand-beaded pastel sequins and floral 3D embroidery along the cuffs and draping.",
    longDescription: "Draped in sheer modesty, this premium rose-pink abaya represents the pinnacle of modern hand-craftsmanship. It features a sophisticated wrap-around tie closure and stunning voluminous sleeves covered in hand-stitched 3D floral petals, sparkling sequins, and rose gold beads. Perfect for celebrations, weddings, and premium Eid gatherings.",
    image: "/src/assets/images/rose_crystal_abaya_1782321660559.jpg",
    category: "abaya",
    colors: [
      { name: "Dusty Rose", hex: "#C78C95" },
      { name: "Blush Pink", hex: "#E8B0B8" },
      { name: "Ivory Pearl", hex: "#F5ECE1" }
    ],
    fabrics: [
      {
        name: "Premium Armani Silk",
        description: "Lighter weight, highly fluid silk with an exquisite pearlescent shimmer.",
        weight: "140 GSM",
        textureClass: "bg-gradient-to-tr from-[#9E646E] to-[#C78C95]",
        sheen: 0.9,
        drapeFactor: 1.5
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 88
  },
  {
    id: "abaya_mocha_crinkle",
    name: "Mocha Crinkle Shimmer Kaftan",
    bengaliName: "মোকা ক্রিঙ্কেল শিমার কাফতান",
    price: 4800,
    originalPrice: 5800,
    description: "A loose, textured crinkle-shimmer chocolate-brown abaya kaftan with an open front and clean minimalist flowing drape.",
    longDescription: "The Mocha Crinkle Kaftan is made from top-grade Turkish crinkle crepe with a subtle shimmer thread woven throughout, catching light beautifully. Designed in an oversized open-front cut, it creates an elegant cascading drape that is perfect for both casual luxury wear and special evening dinners.",
    image: "/src/assets/images/mocha_crinkle_kaftan_1782321678552.jpg",
    category: "abaya",
    colors: [
      { name: "Mocha Brown", hex: "#5C4638" },
      { name: "Cocoa Shimmer", hex: "#7E6454" },
      { name: "Sand Dust", hex: "#BCA89B" }
    ],
    fabrics: [
      {
        name: "Turkish Shimmer Crinkle Crepe",
        description: "High-texture crinkle fabric with organic shimmer threads that drape in cascading folds.",
        weight: "170 GSM",
        textureClass: "bg-radial from-[#5C4638] via-[#433125] to-[#261B13]",
        sheen: 0.4,
        drapeFactor: 1.4
      }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    isBestSeller: false,
    rating: 4.7,
    reviewsCount: 41
  },
  {
    id: "abaya_button_down_set",
    name: "Classic Button-Down Daily Abaya Set",
    bengaliName: "ক্লাসিক বাটন-ডাউন ডেইলি আবায়া সেট",
    price: 3800,
    originalPrice: 4500,
    description: "A row of premium long shirt-style button-down abayas available in highly breathable, flowy linen-crepe tones.",
    longDescription: "Designed for effortless, practical modest daily comfort, this versatile shirt-style abaya features a complete button-down front with functional deep pockets and high utility collars. Made from exceptionally lightweight, wrinkle-resistant Saudi linen-crepe, it stands up beautifully to warm climates.",
    image: "/src/assets/images/button_down_abaya_set_1782321696214.jpg",
    category: "abaya",
    colors: [
      { name: "Sage Green", hex: "#758376" },
      { name: "Stone Grey", hex: "#6F7275" },
      { name: "Slate Blue", hex: "#556475" },
      { name: "Desert Beige", hex: "#C6B09E" }
    ],
    fabrics: [
      {
        name: "Saudi Linen-Crepe Blend",
        description: "Incredibly breathable linen-infused crepe that is soft on the skin and stays wrinkle-free.",
        weight: "150 GSM",
        textureClass: "bg-gradient-to-r from-[#758376] to-[#556475]",
        sheen: 0.1,
        drapeFactor: 1.2
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 56
  },
  {
    id: "abaya_midnight_crystal",
    name: "Midnight Crystal Floral Embellished Abaya",
    bengaliName: "মিডনাইট ক্রিস্টাল ফ্লোরাল এমব্রয়ডারি আবায়া",
    price: 6500,
    originalPrice: 7800,
    description: "An elegant midnight-black modest abaya dress adorned with pristine hand-beaded gold and pink floral 3D embroidery on cuffs.",
    longDescription: "The absolute embodiment of royal modesty. This midnight-black luxury abaya is crafted from premium heavy Saudi georgette and is adorned with magnificent hand-beaded sleeves showcasing 3D floral silk petals, golden bullion wires, and crystal sequins. Includes a premium matching chiffon headscarf.",
    image: "/src/assets/images/midnight_crystal_abaya_1782321713492.jpg",
    category: "abaya",
    colors: [
      { name: "Midnight Black", hex: "#0D0D11" },
      { name: "Rich Onyx", hex: "#17171E" }
    ],
    fabrics: [
      {
        name: "Premium Luxury Saudi Crepe",
        description: "Matte, high-drape crepe that is opaque, breathable, and deeply rich in black pigments.",
        weight: "190 GSM",
        textureClass: "bg-radial from-[#17171E] via-[#0D0D11] to-[#050507]",
        sheen: 0.05,
        drapeFactor: 1.3
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 112
  }
];
