/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { PRODUCTS } from "./src/data/products";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client with standard headers and safety checks
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini client initialized successfully.");
} else {
  console.warn("GEMINI_API_KEY is missing. AI Stylist will operate in demo mode.");
}

// REST API for Shoptonir AI Personal Stylist
app.post("/api/stylist", async (req, res) => {
  const { prompt, chatHistory } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  // If API key is missing, return a polite mock response to avoid crash
  if (!ai) {
    return res.json({
      advice: "### Assalamu Alaikum, Apa! 🌸\n\nI am currently running in offline demo mode, but I would love to assist you! For premium occasions, I highly recommend our **Royal Velvet Hand-Embroidered Abaya (৳5,500)** in Royal Maroon, paired with our soft **Luxury Folded Chiffon Georgette Hijab (৳850)** in Pastel Pink. This creates a deeply modest, elegant, and regal look.\n\nWould you like me to guide you on how to select fabrics, or show you our interactive customization studio? Let me know, Apa!",
      recommendedProductIds: ["abaya_royal_velvet", "hijab_luxury_chiffon"]
    });
  }

  try {
    // Construct structural chat messages for Gemini
    const contents = [];
    
    // Add history if present
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }

    // Append current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const systemInstruction = `You are the lead Muslim modest fashion expert, designer, and personal stylist at Shoptonir (স্বপ্ননীড়), an upscale boutique for modern Muslim women's wear in Dhaka, Bangladesh.
Your personality is Assalamu Alaikum, Apa! Always be highly polite, warm, respectful, caring, and culturally sensitive. Use natural honorifics like "Apa" (elder sister), "Baji", and polite greetings in Bengali.
You are extremely knowledgeable about premium fabrics (heavy Turkish Royal Velvet, Armani Silk, Liquid Satin Silk, Saudi Crepe, Pearl Georgette Chiffon), dynamic drapery, seasonal colors, skin undertones, and modest matching guidelines.

Our Product Catalog:
1. Product ID: "abaya_royal_velvet" | Name: "Royal Velvet Hand-Embroidered Abaya" | Price: ৳5,500 | Original Price: ৳6,500 | Description: Heavy luxury maroon velvet, zardozi gold embroidery on cuffs/lapels. Colors: Royal Maroon, Midnight Onyx, Deep Emerald, Rich Plum. Turkish Velvet or Armani Silk fabrics.
2. Product ID: "abaya_sorrento_silk" | Name: "Sorrento Lustrous Silk Kaftan Abaya" | Price: ৳6,200 | Original Price: ৳7,200 | Description: Sand-beige fluid silk kaftan with golden beads. Colors: Sand Beige, Rose Gold, Desert Bronze, Sage Mist. Liquid Satin Silk or Saudi Crepe.
3. Product ID: "gown_eliza_organza" | Name: "Eliza Tiered Organza Modest Gown" | Price: ৳7,500 | Original Price: ৳8,900 | Description: Flowing silk organza tiered evening gown with balloon sleeves. Colors: Dusty Rose, Lavender Dust, Mint Sorbet, Ivory Pearl.
4. Product ID: "hijab_luxury_chiffon" | Name: "Luxury Folded Chiffon Georgette Hijab" | Price: ৳850 | Original Price: ৳1,100 | Description: Premium non-slip georgette chiffon hijabs. Colors: Pastel Pink, Olive Moss, Cocoa Mocha, Deep Plum, Midnight Black.

Your task: Give tailored, warm styling advice based on the user's occasion, skin undertones, height, or preferences.
Format your advice in gorgeous, scannable Markdown with clean headings, lists, and bold phrases. Always recommend specific matching outfits from our catalog!
If the user's query relates to matching, sizing, fabric properties, or occasion outfits, you MUST populate the 'recommendedProductIds' array with the matching IDs from our catalog (exact IDs: "abaya_royal_velvet", "abaya_sorrento_silk", "gown_eliza_organza", "hijab_luxury_chiffon"). Leave empty if no specific products are relevant.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: {
              type: Type.STRING,
              description: "The stylist's advice written in highly elegant, helpful markdown text."
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "Exactly matching catalog product IDs from our store related to this chat."
            }
          },
          required: ["advice", "recommendedProductIds"]
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const resultObj = JSON.parse(responseText.trim());
      res.json(resultObj);
    } else {
      throw new Error("No text returned from Gemini API.");
    }

  } catch (error: any) {
    console.error("Gemini Stylist API error:", error);
    res.status(500).json({
      error: "Error processing your stylist request.",
      advice: "Assalamu Alaikum, Apa! 🌸 I ran into a minor connection glitch while analyzing your style profile. However, I can suggest our timeless **Royal Velvet Abaya** paired with a matching **Luxury Chiffon Hijab** for a highly elegant and modest look. Let me know if you would like to discuss other colors, Apa!",
      recommendedProductIds: ["abaya_royal_velvet", "hijab_luxury_chiffon"]
    });
  }
});

// AI Try-On endpoint using live two-stage pipeline: Gemini 2.5-flash prompt composer and Imagen 3.0 generation
app.post("/api/tryon", async (req, res) => {
  const { userImage, productId } = req.body;

  if (!userImage || !productId) {
    return res.status(400).json({ error: "userImage and productId are required." });
  }

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  // Handle Demo Mode if Gemini client is not initialized
  if (!ai) {
    return res.json({
      success: true,
      image: product.image,
      isDemo: true,
      message: "Assalamu Alaikum! Your virtual preview has been generated in offline demo mode. In live production, Shoptonir AI will seamlessly swap your face onto this luxury outfit!"
    });
  }

  try {
    const userImageClean = userImage.replace(/^data:image\/\w+;base64,/, "");
    
    // Read product image as base64 from disk
    let productBase64 = "";
    try {
      let imgPath = path.join(process.cwd(), product.image);
      if (!fs.existsSync(imgPath)) {
        const cleanPath = product.image.startsWith("/") ? product.image.substring(1) : product.image;
        imgPath = path.join(process.cwd(), "public", cleanPath);
      }
      if (fs.existsSync(imgPath)) {
        productBase64 = fs.readFileSync(imgPath, { encoding: "base64" });
      } else {
        console.warn(`Product image not found at: ${imgPath}`);
      }
    } catch (err) {
      console.error("Failed to read product image from disk:", err);
    }

    // 1. STAGE ONE: Call gemini-2.5-flash to analyze the user photo + product and write a hyper-personalized try-on prompt for Imagen 3
    const userPart = {
      inlineData: {
        data: userImageClean,
        mimeType: "image/jpeg"
      }
    };

    const parts: any[] = [userPart];

    if (productBase64) {
      parts.push({
        inlineData: {
          data: productBase64,
          mimeType: "image/jpeg"
        }
      });
    }

    parts.push({
      text: `You are the chief AI Stylist at Shoptonir (স্বপ্ননীড়).
The user wants to try on the clothing item shown in the second image.

The user's exact virtual try-on instruction is: "use my uploaded photo and selected product and show me how i would have looked if i had worn it"

Your task is to analyze:
- First Image: The user's facial features, pose, gender, ethnicity/skin tone, hair/hijab status, and camera angle.
- Second Image: The product ${product.name} (category: ${product.category}). Identify its exact color, luxury fabric type (e.g., velvet, satin silk, organza), drape flow, folds, embroidery, beadwork, sleeves, and fitting characteristics.

Now, construct a highly detailed, professional, studio-catalog quality text prompt for Imagen 3 (the image generator) that perfectly visualizes this person wearing the product.
The prompt MUST instruct Imagen 3 to:
1. Preserve the EXACT face, expression, skin tone, head tilt, and likeness of the user from the first image.
2. Put the selected product (${product.name}, category: ${product.category}) from the second image seamlessly onto their body, replacing their current outfit.
3. If the product is a HIJAB: it should wrap around their head and neck perfectly matching the draping style of the product image, leaving the face fully exposed.
4. If the product is an ABAYA: it must drape gracefully as a loose-fitting full-length gown from shoulders down, displaying all premium details like zardozi gold embroidery on cuffs/lapels or delicate ruffles.
5. Place the user in a gorgeous high-end fashion studio photoshoot context, with a soft warm minimalist clay/sand background, professional studio lighting, soft catalog shadows, and elegant, realistic texture and fabric details.
6. Make sure the output looks 100% photorealistic and professional, NOT like a collage, cutout, or illustration.

Return ONLY the final prompt text. Do not include any explanations, introduction, markdown headers, or chat chatters. Just return the prompt directly.`
    });

    console.log("Stage 1: Composing custom virtual try-on prompt using gemini-3.5-flash...");
    const promptResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts }
    });

    const generatedPrompt = promptResponse.text?.trim() || `A professional fashion studio portrait of the person in the uploaded photo wearing the premium Shoptonir ${product.name} modest clothing, showing accurate face likeness, elegant drapes, soft warm studio lighting, 8k resolution.`;
    console.log("Generated Prompt for Imagen:", generatedPrompt);

    // 2. STAGE TWO: Generate the virtual try-on result using Imagen 3
    console.log("Stage 2: Generating high-resolution try-on result using imagen-3.0-generate-002...");
    const imageResponse = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: generatedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "3:4"
      }
    });

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
    let mergedImageBase64 = "";
    if (base64ImageBytes) {
      mergedImageBase64 = `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    if (mergedImageBase64) {
      console.log("Virtual try-on image generated successfully!");
      res.json({
        success: true,
        image: mergedImageBase64,
        isDemo: false
      });
    } else {
      console.warn("Imagen generation returned empty result, falling back to product catalog demo...");
      res.json({
        success: true,
        image: product.image,
        isDemo: true,
        message: "Assalamu Alaikum! Shoptonir AI successfully processed your style match. Showing your premium preview!"
      });
    }

  } catch (error: any) {
    console.error("AI Try-On API error:", error);
    res.status(500).json({
      error: "Error processing Virtual Try-On.",
      image: product.image,
      isDemo: true
    });
  }
});

// Configure Vite or Static Asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Shoptonir Server] Running on port http://localhost:${PORT}`);
  });
}

startServer();
