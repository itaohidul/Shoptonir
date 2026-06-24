/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { Message, Product } from "../types";
import { PRODUCTS } from "../data/products";
import {
  Sparkles,
  Send,
  Sparkle,
  User,
  ArrowRight,
  CornerDownRight,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  ShoppingBag,
  Loader2,
  RefreshCw,
  Info,
  Sliders,
  Move,
  Maximize,
  RotateCw,
  Sun,
  Palette
} from "lucide-react";

interface FaceCoordinates {
  x: number;      // percentage of product image width
  y: number;      // percentage of product image height
  scale: number;  // base scale multiplier
  clipWidth: number; // width of face oval
  clipHeight: number; // height of face oval
}

const PRODUCT_FACE_COORDS: Record<string, FaceCoordinates> = {
  abaya_royal_velvet: { x: 50.5, y: 14.5, scale: 0.95, clipWidth: 62, clipHeight: 80 },
  abaya_sorrento_silk: { x: 50.0, y: 13.5, scale: 0.90, clipWidth: 60, clipHeight: 76 },
  gown_eliza_organza: { x: 51.0, y: 15.0, scale: 0.92, clipWidth: 62, clipHeight: 78 },
  hijab_luxury_chiffon: { x: 50.0, y: 15.0, scale: 0.98, clipWidth: 65, clipHeight: 82 },
  abaya_rose_crystal: { x: 49.0, y: 13.0, scale: 0.95, clipWidth: 62, clipHeight: 80 },
  abaya_mocha_crinkle: { x: 50.0, y: 15.0, scale: 0.92, clipWidth: 60, clipHeight: 78 },
  abaya_button_down_set: { x: 50.0, y: 14.0, scale: 0.96, clipWidth: 62, clipHeight: 80 },
  abaya_midnight_crystal: { x: 50.0, y: 13.0, scale: 0.93, clipWidth: 60, clipHeight: 78 }
};

interface AIStylistProps {
  onSelectProduct: (product: Product) => void;
}

export default function AIStylist({ onSelectProduct }: AIStylistProps) {
  // --- CHAT EXPERT STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "### Assalamu Alaikum, Apa! 🌸\n\nWelcome to **Shoptonir (স্বপ্ননীড়) Modest Style Studio**. I am your personal modest fashion consultant. \n\nI can help you style your perfect outfit for **Eid, weddings, celebratory parties, or daily comfort**, match the correct **hijab shade** to your abaya, explain our luxury **Turkish Velvet or Armani Silk fabrics**, or suggest a full modest coordination.\n\nHow can I help you elevate your grace today, Apa?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterChips = [
    { label: "Suggest an Eid outfit", text: "Apa, can you suggest an elegant and royal outfit set for a formal Eid gathering?" },
    { label: "Match a hijab for Emerald Abaya", text: "What color and fabric of hijab should I pair with a Deep Emerald Abaya for a wedding?" },
    { label: "Explain Turkish Royal Velvet", text: "Can you tell me about the weight and texture of your Turkish Royal Velvet abaya?" },
    { label: "Modest casual outfit", text: "I need a comfortable, lightweight modest outfit for daily wear in hot weather." }
  ];

  // --- TRY-ON STUDIO STATE ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState<boolean>(false);
  const [tryOnMessage, setTryOnMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INTERACTIVE MIRROR FINE-TUNING STATE ---
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveTryOnImage, setInteractiveTryOnImage] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState({
    xOffset: 0,
    yOffset: -12, // slightly adjusted upwards by default
    scale: 0.9,
    rotation: 0,
    brightness: 1.0,
    warmth: 0,
    contrast: 1.0,
    lightAngle: 45,       // angle of virtual light source in degrees
    lightIntensity: 0.20, // strength of virtual lighting highlight
    occlusionBlur: 14,    // soft feathering of face/neck cutout
    shadowDepth: 0.55,    // opacity of inner contact shadow
    fabricWarp: 0,        // skew value to match body posture (-20 to 20)
    shoulderFit: 1.0,     // independent horizontal stretch of garment
    toneMatch: true,      // auto-apply skin-tone & lighting match
  });

  // --- INTERACTIVE DRAGGING & ZOOMING GESTURES ---
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffsets = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isInteractiveMode) return;
    setIsDragging(true);
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = { x: clientX, y: clientY };
    dragStartOffsets.current = { x: adjustments.xOffset, y: adjustments.yOffset };
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !isInteractiveMode) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    setAdjustments((prev) => ({
      ...prev,
      xOffset: dragStartOffsets.current.x + deltaX,
      yOffset: dragStartOffsets.current.y + deltaY
    }));
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isInteractiveMode) return;
    const zoomStep = 0.03;
    const factor = e.deltaY < 0 ? 1 : -1;
    setAdjustments((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(1.6, parseFloat((prev.scale + factor * zoomStep).toFixed(3))))
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Generate local Canvas Try-On Image with User Photo as Base Canvas & Isolated Garment Overlay
  const generateCanvasTryOn = (
    userImgSrc: string,
    productImgSrc: string,
    prodId: string,
    adjusts: typeof adjustments
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const userImg = new Image();
      const prodImg = new Image();
      
      userImg.crossOrigin = "anonymous";
      prodImg.crossOrigin = "anonymous";

      let loadedCount = 0;
      const onImageLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) {
          try {
            const canvas = document.createElement("canvas");
            // Set canvas size matching the user's uploaded image aspect ratio (normalized to 640px width)
            const canvasWidth = 640;
            const userAspect = userImg.naturalHeight / userImg.naturalWidth;
            const canvasHeight = Math.round(canvasWidth * (userAspect || 1.333));
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Failed to get 2D context"));
              return;
            }

            // 1. Draw the user's uploaded portrait image as the absolute base canvas
            ctx.drawImage(userImg, 0, 0, canvasWidth, canvasHeight);

            // 2. Sample user's face color to determine skin undertone and brightness
            const userFaceX = Math.round(canvasWidth / 2);
            const userFaceY = Math.round(canvasHeight * 0.24);
            let userR = 180, userG = 150, userB = 130, userLuminance = 150;
            try {
              const uFaceData = ctx.getImageData(Math.max(0, userFaceX - 15), Math.max(0, userFaceY - 15), 30, 30);
              const uData = uFaceData.data;
              let rSum = 0, gSum = 0, bSum = 0, count = 0;
              for (let i = 0; i < uData.length; i += 4) {
                if (uData[i + 3] > 100) { // Check alpha threshold
                  rSum += uData[i];
                  gSum += uData[i + 1];
                  bSum += uData[i + 2];
                  count++;
                }
              }
              if (count > 0) {
                userR = rSum / count;
                userG = gSum / count;
                userB = bSum / count;
                userLuminance = 0.299 * userR + 0.587 * userG + 0.114 * userB;
              }
            } catch (err) {
              console.warn("Failed to sample user face color:", err);
            }

            // 3. Fetch product face details for alignment
            const coords = PRODUCT_FACE_COORDS[prodId] || { x: 50, y: 15, scale: 1.0, clipWidth: 60, clipHeight: 78 };

            // Create offscreen canvas for isolating the garment (background & face removal)
            const tempCanvas = document.createElement("canvas");
            const tempWidth = prodImg.naturalWidth || 600;
            const tempHeight = prodImg.naturalHeight || 800;
            tempCanvas.width = tempWidth;
            tempCanvas.height = tempHeight;
            const tempCtx = tempCanvas.getContext("2d");
            if (!tempCtx) {
              reject(new Error("Failed to initialize temp canvas"));
              return;
            }

            // Draw product image to temporary canvas
            tempCtx.drawImage(prodImg, 0, 0, tempWidth, tempHeight);

            // Calculate garment face coords in temp canvas space
            const prodFaceX = (coords.x / 100) * tempWidth;
            const prodFaceY = (coords.y / 100) * tempHeight;
            const baseFaceW = (coords.clipWidth / 600) * tempWidth;
            const baseFaceH = (coords.clipHeight / 800) * tempHeight;

            // 4. Sample product model's face color region BEFORE erasing
            let prodR = 210, prodG = 185, prodB = 170, prodLuminance = 190;
            try {
              const pFaceData = tempCtx.getImageData(Math.max(0, Math.round(prodFaceX - 15)), Math.max(0, Math.round(prodFaceY - 15)), 30, 30);
              const pData = pFaceData.data;
              let rSum = 0, gSum = 0, bSum = 0, count = 0;
              for (let i = 0; i < pData.length; i += 4) {
                if (pData[i + 3] > 100) {
                  rSum += pData[i];
                  gSum += pData[i + 1];
                  bSum += pData[i + 2];
                  count++;
                }
              }
              if (count > 0) {
                prodR = rSum / count;
                prodG = gSum / count;
                prodB = bSum / count;
                prodLuminance = 0.299 * prodR + 0.587 * prodG + 0.114 * prodB;
              }
            } catch (err) {
              console.warn("Failed to sample product face color:", err);
            }

            // Retrieve image pixels to perform advanced color-keying (background isolation)
            const imgData = tempCtx.getImageData(0, 0, tempWidth, tempHeight);
            const data = imgData.data;

            // Sample background color from corners (the studio backdrop of product JPEGs)
            const bgSamples = [
              { x: 12, y: 12 },
              { x: tempWidth - 12, y: 12 },
              { x: 12, y: 40 },
              { x: tempWidth - 12, y: 40 }
            ];
            let sumR = 0, sumG = 0, sumB = 0;
            for (const sample of bgSamples) {
              const idx = (sample.y * tempWidth + sample.x) * 4;
              sumR += data[idx];
              sumG += data[idx + 1];
              sumB += data[idx + 2];
            }
            const bgR = sumR / bgSamples.length;
            const bgG = sumG / bgSamples.length;
            const bgB = sumB / bgSamples.length;

            // Chroma key threshold and soft feather transitions
            const threshold = 40;
            const featherRange = 25;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Euclidean distance to background studio color
              const dist = Math.sqrt(
                Math.pow(r - bgR, 2) +
                Math.pow(g - bgG, 2) +
                Math.pow(b - bgB, 2)
              );

              if (dist < threshold) {
                data[i + 3] = 0; // Completely transparent
              } else if (dist < threshold + featherRange) {
                // Soft edge transition
                const factor = (dist - threshold) / featherRange;
                data[i + 3] = Math.min(data[i + 3], Math.floor(factor * 255));
              }
            }
            tempCtx.putImageData(imgData, 0, 0);

            // 5. Erase the face of the product model using a beautiful feathered radial gradient
            tempCtx.save();
            tempCtx.globalCompositeOperation = "destination-out";
            
            // Generate a radial gradient mask to soften edges (controlled by adjusts.occlusionBlur)
            const featherRatio = Math.max(0.1, Math.min(0.8, adjusts.occlusionBlur * 0.03));
            const faceGrad = tempCtx.createRadialGradient(
              prodFaceX,
              prodFaceY,
              (baseFaceW / 2) * (1 - featherRatio),
              prodFaceX,
              prodFaceY,
              (baseFaceW / 2) * (1 + featherRatio)
            );
            faceGrad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
            faceGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
            
            tempCtx.fillStyle = faceGrad;
            tempCtx.beginPath();
            tempCtx.ellipse(
              prodFaceX,
              prodFaceY,
              (baseFaceW / 2) * (1 + featherRatio),
              (baseFaceH / 2) * (1 + featherRatio),
              0,
              0,
              2 * Math.PI
            );
            tempCtx.fill();
            tempCtx.restore();

            // 6. Draw soft contact shadows around the inner face-hole edge (controlled by shadowDepth)
            tempCtx.save();
            const shadowGrad = tempCtx.createRadialGradient(
              prodFaceX,
              prodFaceY,
              (baseFaceW / 2) * 0.76,
              prodFaceX,
              prodFaceY,
              (baseFaceW / 2) * 1.15
            );
            shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
            shadowGrad.addColorStop(0.75, `rgba(10, 10, 15, ${adjusts.shadowDepth * 0.85})`); // Adjustable contact occlusion
            shadowGrad.addColorStop(1, "rgba(10, 10, 15, 0.0)");
            
            tempCtx.fillStyle = shadowGrad;
            tempCtx.beginPath();
            tempCtx.ellipse(
              prodFaceX,
              prodFaceY,
              (baseFaceW / 2) * 1.15,
              (baseFaceH / 2) * 1.15,
              0,
              0,
              2 * Math.PI
            );
            tempCtx.fill();
            tempCtx.restore();

            // 7. Calculate aligned target position
            const targetX = userFaceX + adjusts.xOffset;
            const targetY = userFaceY + adjusts.yOffset;

            // Compute garment scale relative to user's canvas width
            const scaleFactor = (canvasWidth * 0.24) / baseFaceW;
            const finalScale = scaleFactor * coords.scale * adjusts.scale;

            // 8. Auto-matching color tone & light balancing logic
            let finalBrightness = adjusts.brightness;
            let finalWarmth = adjusts.warmth;
            if (adjusts.toneMatch) {
              const luminanceRatio = userLuminance / (prodLuminance || 190);
              const clampedRatio = Math.max(0.72, Math.min(1.25, luminanceRatio));
              finalBrightness *= clampedRatio;

              const userWarmthRatio = userR / (userB || 1);
              const prodWarmthRatio = prodR / (prodB || 1);
              const warmthDifference = userWarmthRatio - prodWarmthRatio;
              // Map difference to a standard warmth scale step
              finalWarmth += Math.max(-3, Math.min(3, Math.round(warmthDifference * 4.5)));
            }

            ctx.save();
            ctx.translate(targetX, targetY);
            ctx.rotate((adjusts.rotation * Math.PI) / 180);

            // 9. Fabric draping posture warping via transform skew matrix
            const skewRad = (adjusts.fabricWarp * Math.PI) / 180;
            ctx.transform(1, 0, Math.sin(skewRad), 1, 0, 0);

            // Apply independent shoulder fit stretching (horizontal garment scale)
            ctx.scale(finalScale * adjusts.shoulderFit, finalScale);

            // Lighting adjustment filter to match ambient lighting of user's uploaded portrait
            ctx.filter = `brightness(${finalBrightness}) saturate(${1 + finalWarmth * 0.12}) sepia(${finalWarmth * 0.08}) contrast(${adjusts.contrast})`;

            // Elegant drop shadow so garment casts shadow back onto the user's body
            ctx.shadowColor = "rgba(10, 10, 15, 0.45)";
            ctx.shadowBlur = 18;
            ctx.shadowOffsetX = 3 * (finalScale > 1 ? 1 : finalScale);
            ctx.shadowOffsetY = 8 * (finalScale > 1 ? 1 : finalScale);

            // Render isolated product garment (origin centered at product face coordinates)
            ctx.drawImage(tempCanvas, -prodFaceX, -prodFaceY);
            ctx.restore();

            // 10. Draw custom virtual lighting pass overlay (Source-Atop garment masking)
            if (adjusts.lightIntensity > 0) {
              ctx.save();
              ctx.globalCompositeOperation = "source-atop";

              // Redraw the garment transformations on top to calculate light gradient direction
              const angleRad = (adjusts.lightAngle * Math.PI) / 180;
              const dx = Math.cos(angleRad) * canvasWidth;
              const dy = Math.sin(angleRad) * canvasHeight;

              const lightGrad = ctx.createLinearGradient(
                canvasWidth / 2 - dx / 2,
                canvasHeight / 2 - dy / 2,
                canvasWidth / 2 + dx / 2,
                canvasHeight / 2 + dy / 2
              );

              // Specular highlights on source side
              lightGrad.addColorStop(0, `rgba(255, 255, 255, ${adjusts.lightIntensity * 1.6})`);
              // Balanced midtones
              lightGrad.addColorStop(0.5, "rgba(128, 128, 128, 0)");
              // Depth-boosting shadows on the opposing side
              lightGrad.addColorStop(1, `rgba(12, 12, 18, ${adjusts.lightIntensity * 1.3})`);

              ctx.fillStyle = lightGrad;
              // Use global composite blend to paint lighting beautifully onto the garment fibers
              ctx.globalCompositeOperation = "source-atop";
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);
              ctx.restore();
            }

            resolve(canvas.toDataURL("image/png"));
          } catch (e) {
            reject(e);
          }
        }
      };

      userImg.onload = onImageLoaded;
      prodImg.onload = onImageLoaded;
      userImg.onerror = () => reject(new Error("Failed to load user face photo"));
      prodImg.onerror = () => reject(new Error("Failed to load product model photo"));

      userImg.src = userImgSrc;
      prodImg.src = productImgSrc;
    });
  };

  // Re-generate canvas image when adjustments, uploadedImage, or selectedProduct changes
  useEffect(() => {
    if (uploadedImage && selectedProduct && tryOnImage && isInteractiveMode) {
      generateCanvasTryOn(uploadedImage, selectedProduct.image, selectedProduct.id, adjustments)
        .then((dataUrl) => {
          setInteractiveTryOnImage(dataUrl);
        })
        .catch((err) => console.error("Interactive face overlay error:", err));
    } else {
      setInteractiveTryOnImage(null);
    }
  }, [uploadedImage, selectedProduct, adjustments, tryOnImage, isInteractiveMode]);

  // Chat message submission
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          chatHistory: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI consultant.");
      }

      const data = await response.json();
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: data.advice,
        recommendedProductIds: data.recommendedProductIds,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: "Assalamu Alaikum, Apa! 🌸 I am having a tiny connection glitch right now. However, I can suggest our timeless **Royal Velvet Abaya** paired with a matching **Luxury Chiffon Hijab** for a highly elegant and modest look. Let me know if you would like to discuss other colors, Apa!",
        recommendedProductIds: ["abaya_royal_velvet", "hijab_luxury_chiffon"],
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop file handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setTryOnImage(null);
      setInteractiveTryOnImage(null);
      setTryOnMessage(null);
      setIsInteractiveMode(false);
    };
  };

  // Handle Visual Try-On Execution
  const handleTryOn = async () => {
    if (!uploadedImage) return;

    setIsTryOnLoading(true);
    setTryOnMessage(null);
    setIsInteractiveMode(false);

    // Animation steps for loading state
    const steps = [
      "Assalamu Alaikum! Uploading portrait...",
      "Analyzing facial features & skin undertones...",
      "Draping luxury modest fabrics onto body...",
      "Stitching intricate gold zardozi and beads...",
      "Aligning shadows and dynamic ambient lighting...",
      "Applying final Shoptonir royal glow..."
    ];

    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setLoadingStep(steps[currentStepIdx]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userImage: uploadedImage,
          productId: selectedProduct.id
        })
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error("Failed to process try-on.");
      }

      const data = await response.json();
      setTryOnImage(data.image);
      
      if (data.isDemo) {
        setIsInteractiveMode(true);
        // Pre-generate interactive composition
        await generateCanvasTryOn(uploadedImage, selectedProduct.image, selectedProduct.id, adjustments)
          .then((dataUrl) => {
            setInteractiveTryOnImage(dataUrl);
          });
      } else {
        setIsInteractiveMode(false);
      }

      if (data.message) {
        setTryOnMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setTryOnImage(selectedProduct.image);
      setIsInteractiveMode(true);
      
      // Generate immediate local fallback try-on
      await generateCanvasTryOn(uploadedImage, selectedProduct.image, selectedProduct.id, adjustments)
        .then((dataUrl) => {
          setInteractiveTryOnImage(dataUrl);
        })
        .catch((e) => console.error(e));

      setTryOnMessage(
        "Assalamu Alaikum! Shoptonir Interactive Virtual Mirror initialized. You can now use the fine-tuning sliders below to rotate, zoom, and skin-blend your face perfectly onto this premium model portrait!"
      );
    } finally {
      setIsTryOnLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: INTERACTIVE CONSULTANT CHAT */}
      <div className="lg:col-span-6 bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6 backdrop-blur-xl h-[620px] flex flex-col justify-between">
        {/* Header */}
        <div className="pb-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E97D9B]/15 border border-[#E97D9B]/20 flex items-center justify-center text-[#E97D9B]">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="font-serif text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                Shoptonir AI Stylist
                <span className="bg-[#E1B168]/15 text-[#E1B168] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  Active
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400">Personalized modest design expert & matching baji</p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="text-[9px] font-mono text-neutral-500 hover:text-white transition-all underline cursor-pointer"
          >
            Clear Consultation
          </button>
        </div>

        {/* Messages Stage */}
        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4 min-h-0 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.sender === "user"
                    ? "bg-neutral-800 border-white/10 text-neutral-300"
                    : "bg-gradient-to-r from-[#2E6F5E] to-[#4A9F88] border-none text-white shadow-[0_2px_8px_rgba(46,111,94,0.3)]"
                }`}>
                  {msg.sender === "user" ? <User size={13} /> : <Sparkle size={13} />}
                </div>

                {/* Bubble Body */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#E1B168] text-neutral-950 font-medium rounded-tr-none"
                      : "bg-neutral-950/40 text-neutral-200 border border-white/5 rounded-tl-none font-sans text-left"
                  }`}>
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="markdown-body text-neutral-200 space-y-2 prose prose-invert prose-xs">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    )}
                  </div>

                  {/* Recommended products inline blocks */}
                  {msg.sender === "bot" && msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="pl-2 space-y-2 text-left">
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                        <CornerDownRight size={11} className="text-[#E1B168]" />
                        Recommended Items:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                        {msg.recommendedProductIds.map((id) => {
                          const prod = PRODUCTS.find((p) => p.id === id);
                          if (!prod) return null;
                          return (
                            <div
                              key={id}
                              onClick={() => onSelectProduct(prod)}
                              className="bg-neutral-900/60 border border-white/5 hover:border-[#E1B168]/20 p-2 rounded-xl flex gap-3 items-center cursor-pointer transition-all hover:bg-neutral-800/60 group"
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover object-top border border-white/5"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold text-white truncate group-hover:text-[#E1B168] transition-all">
                                  {prod.name}
                                </h4>
                                <p className="text-[10px] text-neutral-400">৳{prod.price.toLocaleString()}</p>
                              </div>
                              <ArrowRight size={12} className="text-neutral-500 group-hover:text-[#E1B168] group-hover:translate-x-0.5 transition-all" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pulsing Loading Loader */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 max-w-[80%] mr-auto"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2E6F5E] to-[#4A9F88] flex items-center justify-center shrink-0 border-none text-white shadow-lg shadow-[#2E6F5E]/20 animate-spin-slow">
                <Sparkle size={13} />
              </div>
              <div className="bg-neutral-950/40 text-neutral-400 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-left">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E97D9B] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1B168] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="text-xs font-mono text-neutral-400 pl-1">
                  Shoptonir baji is pairing colors...
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Recommended Prompt suggestions */}
        {messages.length === 1 && !loading && (
          <div className="py-2 flex flex-wrap gap-2 overflow-x-auto select-none">
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.text)}
                className="text-[10px] sm:text-xs font-medium text-neutral-300 hover:text-white bg-neutral-950/50 hover:bg-neutral-800 border border-white/5 hover:border-[#E1B168]/20 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Stage */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="mt-3 flex gap-2.5 items-center bg-neutral-950 border border-white/5 p-1.5 rounded-2xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Consult stylist (e.g. 'Apa, suggest a rose gold bridal look...')"
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#E1B168] hover:bg-[#D4A359] text-neutral-950 p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-md"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: AI VISUAL TRY-ON STUDIO */}
      <div className="lg:col-span-6 bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6 backdrop-blur-xl min-h-[620px] flex flex-col justify-between text-left">
        {/* Header */}
        <div className="pb-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E1B168]/15 border border-[#E1B168]/20 flex items-center justify-center text-[#E1B168]">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                AI Visual Try-On Studio
                <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  Beta
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400">See yourself in our premium royal modest wear</p>
            </div>
          </div>

          {(uploadedImage || tryOnImage) && (
            <button
              onClick={() => {
                setUploadedImage(null);
                setTryOnImage(null);
                setInteractiveTryOnImage(null);
                setTryOnMessage(null);
                setIsInteractiveMode(false);
              }}
              className="text-[9px] font-mono text-[#E97D9B] hover:text-white transition-all underline cursor-pointer"
            >
              Reset Model
            </button>
          )}
        </div>

        {/* Visual Board */}
        <div className="flex-1 my-4 overflow-y-auto pr-1 min-h-0 scrollbar-thin space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Input Side: Portrait Upload */}
            <div className="flex flex-col justify-between bg-neutral-950/40 border border-white/5 rounded-2xl p-4 relative min-h-[220px]">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                  1. Your Portrait Photo
                </span>

                {!uploadedImage ? (
                  /* Drag & Drop Zone */
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all h-[180px] ${
                      dragActive
                        ? "border-[#E1B168] bg-[#E1B168]/5"
                        : "border-white/10 hover:border-[#E1B168]/30 hover:bg-white/[0.02]"
                    }`}
                  >
                    <Upload size={24} className="text-neutral-500 animate-bounce-slow" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-300">Drag & drop your face photo</p>
                      <p className="text-[10px] text-neutral-500">or click to browse files</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  /* Portrait Preview */
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] w-full max-h-[180px] border border-white/10 bg-neutral-900 flex items-center justify-center">
                    <img
                      src={uploadedImage}
                      alt="Uploaded face profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-neutral-900/80 border border-white/10 rounded-lg text-[9px] font-mono text-[#E1B168]">
                      <Check size={10} />
                      Portrait Loaded
                    </div>
                  </div>
                )}
              </div>

              {uploadedImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/5 py-1.5 px-3 rounded-lg justify-center cursor-pointer transition-all"
                >
                  <RefreshCw size={10} />
                  Change Face Photo
                </button>
              )}
            </div>

            {/* Selector Side: Product selection */}
            <div className="flex flex-col bg-neutral-950/40 border border-white/5 rounded-2xl p-4 relative min-h-[220px]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                2. Choose Dress to Try On
              </span>

              {/* Grid of Abayas / Gowns */}
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                {PRODUCTS.filter((p) => p.category === "abaya" || p.category === "gown").map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setTryOnImage(null);
                      setInteractiveTryOnImage(null);
                      setTryOnMessage(null);
                    }}
                    className={`p-1.5 rounded-xl border text-left flex gap-2 items-center cursor-pointer transition-all ${
                      selectedProduct.id === prod.id
                        ? "bg-[#E1B168]/10 border-[#E1B168] text-white"
                        : "bg-transparent border-white/5 hover:border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-8 h-8 rounded-lg object-cover object-top border border-white/5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold truncate">{prod.name}</p>
                      <p className="text-[8px] font-mono text-neutral-400">৳{prod.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-3 border-t border-white/5 flex gap-2.5 items-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-12 h-16 rounded-lg object-cover object-top border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-[10px] font-bold text-neutral-200 truncate">{selectedProduct.name}</h4>
                  <p className="text-[9px] text-neutral-400 mt-0.5 truncate">{selectedProduct.description}</p>
                  <p className="text-[10px] font-bold text-[#E1B168] mt-0.5">৳{selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Large Result Render Area */}
          <div className="bg-neutral-950/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[240px] overflow-hidden">
            {isTryOnLoading ? (
              /* Loading Screen */
              <div className="flex flex-col items-center justify-center gap-4 text-center p-6 z-10 animate-fade-in">
                <Loader2 size={36} className="text-[#E1B168] animate-spin" />
                <div className="space-y-1.5">
                  <p className="text-sm font-serif font-medium text-white">{loadingStep}</p>
                  <p className="text-[10px] text-neutral-400">Please wait, Apa. We are weaving your modest look together...</p>
                </div>
              </div>
            ) : (tryOnImage || interactiveTryOnImage) ? (
              /* Try-On Result */
              <div className="w-full space-y-4">
                {/* INTERACTIVE COMPOSITING PREVIEW */}
                <div 
                  ref={containerRef}
                  onMouseDown={handleStartDrag}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleEndDrag}
                  onMouseLeave={handleEndDrag}
                  onTouchStart={handleStartDrag}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleEndDrag}
                  onWheel={handleWheelZoom}
                  className={`relative rounded-xl overflow-hidden border border-white/10 max-h-[290px] flex items-center justify-center bg-neutral-900 group select-none transition-all ${
                    isInteractiveMode ? "cursor-grab active:cursor-grabbing border-[#E1B168]/30" : ""
                  }`}
                  title={isInteractiveMode ? "Drag to align garment | Mouse-wheel to zoom" : "AI Try-On Preview"}
                >
                  <img
                    src={interactiveTryOnImage || tryOnImage || undefined}
                    alt="AI Visual Try On Preview"
                    className="max-h-[290px] w-auto object-contain object-center rounded-xl pointer-events-none"
                  />
                  {/* Luxury glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-2 right-2 bg-[#E1B168] text-neutral-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow pointer-events-none uppercase tracking-wider">
                    {isInteractiveMode ? "Mirror Mode: Drag & Scroll Zoom" : "Shoptonir AI Preview"}
                  </span>
                </div>
 
                {/* SLIDER CONTROLS DRAWER: FOR COMFORTABLE GARMENT FIT MATCHING */}
                {isInteractiveMode && (
                  <div className="bg-neutral-950/80 border border-white/5 p-4 rounded-xl space-y-4 max-h-[380px] overflow-y-auto scrollbar-thin">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-[11px] font-mono font-bold text-[#E1B168] uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders size={12} />
                        Professional Tailoring & Studio Lighting
                      </h4>
                      <button
                        onClick={() => setAdjustments({
                          xOffset: 0,
                          yOffset: -12,
                          scale: 0.9,
                          rotation: 0,
                          brightness: 1.0,
                          warmth: 0,
                          contrast: 1.0,
                          lightAngle: 45,
                          lightIntensity: 0.20,
                          occlusionBlur: 14,
                          shadowDepth: 0.55,
                          fabricWarp: 0,
                          shoulderFit: 1.0,
                          toneMatch: true,
                        })}
                        className="text-[9px] font-mono text-neutral-400 hover:text-white transition-all underline cursor-pointer"
                      >
                        Reset Alignment
                      </button>
                    </div>

                    {/* Quick Auto-Match Skin Tone and Lighting */}
                    <div className="bg-[#2E6F5E]/10 border border-[#2E6F5E]/20 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-neutral-200">Auto-Match Lighting & Tone</p>
                        <p className="text-[8px] text-neutral-400">Samples skin tone and luminance to calibrate garments</p>
                      </div>
                      <button
                        onClick={() => setAdjustments(prev => ({ ...prev, toneMatch: !prev.toneMatch }))}
                        className={`w-10 h-5 rounded-full p-0.5 transition-all cursor-pointer ${adjustments.toneMatch ? "bg-[#E1B168]" : "bg-neutral-800"}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-neutral-950 transition-all ${adjustments.toneMatch ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
 
                    {/* SECTION 1: DRAUGHTING & FIT (FABRIC PHYSICS) */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block border-b border-white/[0.03] pb-1">
                        1. Physical Fit & Draping
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {/* Horizontal matching slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Move size={10} /> Horizontal Fit</span>
                            <span className="text-white">{adjustments.xOffset > 0 ? `+${adjustments.xOffset}` : adjustments.xOffset}px</span>
                          </div>
                          <input
                            type="range"
                            min="-60"
                            max="60"
                            value={adjustments.xOffset}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, xOffset: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
 
                        {/* Vertical matching slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Move size={10} className="rotate-90" /> Vertical Drape</span>
                            <span className="text-white">{adjustments.yOffset > 0 ? `+${adjustments.yOffset}` : adjustments.yOffset}px</span>
                          </div>
                          <input
                            type="range"
                            min="-80"
                            max="40"
                            value={adjustments.yOffset}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, yOffset: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
 
                        {/* Garment Scale slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Maximize size={10} /> Garment Scale</span>
                            <span className="text-white">{Math.round(adjustments.scale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.6"
                            step="0.02"
                            value={adjustments.scale}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
 
                        {/* Rotation slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><RotateCw size={10} /> Body Rotation</span>
                            <span className="text-white">{adjustments.rotation}°</span>
                          </div>
                          <input
                            type="range"
                            min="-30"
                            max="30"
                            value={adjustments.rotation}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>

                        {/* Skew Warp slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><RefreshCw size={10} className="rotate-45" /> Fabric Posture Warp</span>
                            <span className="text-white">{adjustments.fabricWarp > 0 ? `+${adjustments.fabricWarp}` : adjustments.fabricWarp}°</span>
                          </div>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={adjustments.fabricWarp}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, fabricWarp: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>

                        {/* Shoulder Stretch Fit slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Maximize size={10} className="rotate-90" /> Shoulder Width Fit</span>
                            <span className="text-white">{Math.round(adjustments.shoulderFit * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.8"
                            max="1.25"
                            step="0.01"
                            value={adjustments.shoulderFit}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, shoulderFit: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: VIRTUAL STUDIO LIGHTING */}
                    <div className="space-y-3 pt-1">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block border-b border-white/[0.03] pb-1">
                        2. Virtual Studio Lighting & Direction
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {/* Light Angle Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Sun size={10} /> Light Source Angle</span>
                            <span className="text-white">{adjustments.lightAngle}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={adjustments.lightAngle}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, lightAngle: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>

                        {/* Light Intensity Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Sparkle size={10} /> Light Specular Intensity</span>
                            <span className="text-white">{Math.round(adjustments.lightIntensity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="0.55"
                            step="0.01"
                            value={adjustments.lightIntensity}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, lightIntensity: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: BLENDING, FEATHERING & SHADOW DEEPENING */}
                    <div className="space-y-3 pt-1">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block border-b border-white/[0.03] pb-1">
                        3. Color Grade & Cutout Blending
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {/* Garment Brightness slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Sun size={10} /> Garment Brightness</span>
                            <span className="text-white">{Math.round(adjustments.brightness * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.7"
                            max="1.4"
                            step="0.02"
                            value={adjustments.brightness}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, brightness: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>

                        {/* Contrast Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Sliders size={10} /> Fabric Contrast</span>
                            <span className="text-white">{Math.round(adjustments.contrast * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.8"
                            max="1.35"
                            step="0.02"
                            value={adjustments.contrast}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, contrast: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
 
                        {/* Warmth slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Palette size={10} /> Warmth Tone Shift</span>
                            <span className="text-white">{adjustments.warmth > 0 ? `+${adjustments.warmth}` : adjustments.warmth}</span>
                          </div>
                          <input
                            type="range"
                            min="-3"
                            max="3"
                            step="1"
                            value={adjustments.warmth}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, warmth: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>

                        {/* Cutout Occlusion Feathering Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Sparkles size={10} /> Cutout Alpha Feathering</span>
                            <span className="text-white">{adjustments.occlusionBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="32"
                            step="1"
                            value={adjustments.occlusionBlur}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, occlusionBlur: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>

                        {/* Inner shadow depth slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1"><Sliders size={10} /> Neck Contact Shadows</span>
                            <span className="text-white">{Math.round(adjustments.shadowDepth * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={adjustments.shadowDepth}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, shadowDepth: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E1B168]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tryOnMessage && (
                  <div className="bg-white/5 border border-[#E1B168]/20 rounded-xl p-3 flex gap-2.5 items-start text-xs text-neutral-300">
                    <Info size={14} className="text-[#E1B168] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{tryOnMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => onSelectProduct(selectedProduct)}
                    className="flex-1 bg-gradient-to-r from-[#E1B168] to-[#C29352] text-neutral-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow hover:scale-[1.02] transition-all"
                  >
                    <ShoppingBag size={14} />
                    <span>Customize & Buy Gown</span>
                  </button>

                  {/* Toggle Fine-Tune Interactive Mirror */}
                  {tryOnImage && (
                    <button
                      onClick={() => setIsInteractiveMode(!isInteractiveMode)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/5 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sliders size={13} />
                      <span>{isInteractiveMode ? "Show AI Composition" : "Fine-Tune Fit"}</span>
                    </button>
                  )}

                  <button
                    onClick={handleTryOn}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/5 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RefreshCw size={13} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Non-Ready State */
              <div className="flex flex-col items-center justify-center gap-3 text-center p-6 text-neutral-500">
                <ImageIcon size={32} className="text-neutral-600 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-400">Ready for Transformation</h4>
                  <p className="text-[10px] text-neutral-500">Upload your portrait photo and click the button below to generate a real-time visual dressing preview!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate / Action Button */}
        {!(tryOnImage || interactiveTryOnImage) && (
          <button
            onClick={handleTryOn}
            disabled={!uploadedImage || isTryOnLoading}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              !uploadedImage
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5"
                : "bg-gradient-to-r from-[#2E6F5E] to-[#4A9F88] text-white shadow-emerald-950/20 hover:shadow-[#2E6F5E]/30 hover:scale-[1.01]"
            }`}
          >
            {isTryOnLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Generating Your Shoptonir Modest Look...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Shoptonir AI Try-On Preview</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
