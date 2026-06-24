/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorOption {
  name: string;
  hex: string;
}

export interface FabricOption {
  name: string;
  description: string;
  weight: string;
  textureClass: string; // CSS styling for simulated texture
  sheen: number; // Specular glow strength 0 to 1
  drapeFactor: number; // Dynamic folds multiplier
}

export interface Product {
  id: string;
  name: string;
  bengaliName: string;
  price: number;
  originalPrice: number;
  description: string;
  longDescription: string;
  image: string;
  category: "abaya" | "hijab" | "gown" | "co-ord";
  colors: ColorOption[];
  fabrics: FabricOption[];
  sizes: string[];
  isBestSeller?: boolean;
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  id: string; // unique combination ID (productId_color_size_fabric)
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
  selectedSize: string;
  selectedFabric: FabricOption;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  recommendedProductIds?: string[];
}
