import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Download, 
  ShoppingBag, 
  Sliders, 
  Glasses, 
  Sun, 
  User,
  Move,
  Maximize2
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { Currency, formatPrice } from '../utils/helpers';

interface VirtualTryOnProps {
  initialProduct?: Product | null;
  currency: Currency;
  onClose: () => void;
  onSelectProductToCart: (product: Product) => void;
}

const PRESET_MODELS = [
  {
    id: 'model-1',
    name: 'شاب 1',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    defaultScale: 1,
    defaultY: 38,
    defaultX: 50
  },
  {
    id: 'model-2',
    name: 'سيدة 1',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    defaultScale: 0.95,
    defaultY: 37,
    defaultX: 50
  },
  {
    id: 'model-3',
    name: 'شاب 2',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    defaultScale: 1.05,
    defaultY: 36,
    defaultX: 50
  }
];

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  initialProduct,
  currency,
  onClose,
  onSelectProductToCart,
}) => {
  const eyewearProducts = PRODUCTS.filter(p => p.category === 'eyeglasses' || p.category === 'sunglasses');
  
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialProduct && (initialProduct.category === 'eyeglasses' || initialProduct.category === 'sunglasses')
      ? initialProduct
      : eyewearProducts[0]
  );

  const [mode, setMode] = useState<'model' | 'webcam' | 'upload'>('model');
  const [selectedModel, setSelectedModel] = useState(PRESET_MODELS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Customization Sliders
  const [scale, setScale] = useState(100);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(38);
  const [rotation, setRotation] = useState(0);
  const [lensTint, setLensTint] = useState<'clear' | 'dark' | 'gradient' | 'blue-cut'>('clear');
  const [frameColor, setFrameColor] = useState<string>(selectedProduct.colors[0]?.hex || '#0f172a');
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync color when product changes
  useEffect(() => {
    if (selectedProduct.colors[0]) {
      setFrameColor(selectedProduct.colors[0].hex);
    }
    if (selectedProduct.category === 'sunglasses') {
      setLensTint('dark');
    } else {
      setLensTint('clear');
    }
  }, [selectedProduct]);

  // Handle Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (mode === 'webcam') {
      setCameraError(null);
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 640, height: 640 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setCameraError('لم نتمكن من الوصول للكاميرا، يرجى تفعيل إذن الكاميرا أو استخدام صورة تجريبية');
          setMode('model');
        });
    } else {
      setIsCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAdjustments = () => {
    setScale(100);
    setPosX(50);
    setPosY(mode === 'model' ? selectedModel.defaultY : 40);
    setRotation(0);
  };

  // Render SVG Glasses Frame on Face
  const renderFrameSvg = () => {
    const shape = selectedProduct.frameShape || 'rectangular';
    const isRound = shape === 'round';
    const isAviator = shape === 'aviator';
    const isCatEye = shape === 'cat-eye';

    let tintBg = 'rgba(255, 255, 255, 0.15)';
    if (lensTint === 'dark') tintBg = 'rgba(15, 23, 42, 0.85)';
    if (lensTint === 'gradient') tintBg = 'url(#lensGradient)';
    if (lensTint === 'blue-cut') tintBg = 'rgba(59, 130, 246, 0.2)';

    return (
      <svg
        viewBox="0 0 240 90"
        className="w-full h-full drop-shadow-xl"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
        }}
      >
        <defs>
          <linearGradient id="lensGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Bridge */}
        {isAviator ? (
          <>
            <path d="M95 30 Q120 22 145 30" stroke={frameColor} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M100 42 Q120 38 140 42" stroke={frameColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <path d="M98 38 Q120 30 142 38" stroke={frameColor} strokeWidth="5" fill="none" strokeLinecap="round" />
        )}

        {/* Temples (Left & Right Arms) */}
        <path d="M15 36 L2 32" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M225 36 L238 32" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />

        {/* Left Lens & Rim */}
        {isRound ? (
          <g>
            <circle cx="58" cy="45" r="38" fill={tintBg} stroke={frameColor} strokeWidth="5" />
            <circle cx="58" cy="45" r="37" fill="url(#glare)" />
          </g>
        ) : isCatEye ? (
          <g>
            <path
              d="M20 30 C30 15 85 20 95 38 C98 62 70 78 50 75 C25 72 15 50 20 30 Z"
              fill={tintBg}
              stroke={frameColor}
              strokeWidth="5"
            />
            <path d="M20 30 C30 15 85 20 95 38" stroke={frameColor} strokeWidth="7" fill="none" />
          </g>
        ) : isAviator ? (
          <g>
            <path
              d="M22 28 Q60 22 95 28 Q98 65 65 78 Q25 74 22 28 Z"
              fill={tintBg}
              stroke={frameColor}
              strokeWidth="4"
            />
            <path d="M25 30 Q58 26 90 30" fill="none" stroke="url(#glare)" strokeWidth="8" />
          </g>
        ) : (
          /* Rectangular / Square */
          <g>
            <rect
              x="18"
              y="22"
              width="80"
              height="50"
              rx="12"
              fill={tintBg}
              stroke={frameColor}
              strokeWidth="5"
            />
            <rect x="22" y="26" width="72" height="42" rx="8" fill="url(#glare)" />
          </g>
        )}

        {/* Right Lens & Rim */}
        {isRound ? (
          <g>
            <circle cx="182" cy="45" r="38" fill={tintBg} stroke={frameColor} strokeWidth="5" />
            <circle cx="182" cy="45" r="37" fill="url(#glare)" />
          </g>
        ) : isCatEye ? (
          <g>
            <path
              d="M220 30 C210 15 155 20 145 38 C142 62 170 78 190 75 C215 72 225 50 220 30 Z"
              fill={tintBg}
              stroke={frameColor}
              strokeWidth="5"
            />
            <path d="M220 30 C210 15 155 20 145 38" stroke={frameColor} strokeWidth="7" fill="none" />
          </g>
        ) : isAviator ? (
          <g>
            <path
              d="M218 28 Q180 22 145 28 Q142 65 175 78 Q215 74 218 28 Z"
              fill={tintBg}
              stroke={frameColor}
              strokeWidth="4"
            />
            <path d="M215 30 Q182 26 150 30" fill="none" stroke="url(#glare)" strokeWidth="8" />
          </g>
        ) : (
          /* Rectangular / Square */
          <g>
            <rect
              x="142"
              y="22"
              width="80"
              height="50"
              rx="12"
              fill={tintBg}
              stroke={frameColor}
              strokeWidth="5"
            />
            <rect x="146" y="26" width="72" height="42" rx="8" fill="url(#glare)" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6" id="virtual-tryon-studio-modal">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-tajawal">غرفة التجربة الافتراضية الذكية</h2>
              <p className="text-xs text-blue-200">جرب الإطارات الطبية والشمسية مباشرة على وجهك قبل الشراء</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            id="close-tryon-studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1">
          
          {/* Left / Center: Visual Viewport Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[400px]">
            
            {/* Camera / Model Canvas Container */}
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900 flex items-center justify-center select-none">
              
              {/* 1. Webcam Video */}
              {mode === 'webcam' && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}

              {/* 2. Preset Model */}
              {mode === 'model' && (
                <img
                  src={selectedModel.img}
                  alt={selectedModel.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* 3. Uploaded Photo */}
              {mode === 'upload' && uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Uploaded face"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Error Alert */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
                  <p className="text-sm text-red-400 font-bold mb-3">{cameraError}</p>
                  <button
                    onClick={() => setMode('model')}
                    className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    استخدام الموديل الافتراضي
                  </button>
                </div>
              )}

              {/* Overlay: Render Glasses Frame at Calculated Position */}
              <div
                className="absolute pointer-events-none transition-all duration-75"
                style={{
                  top: `${posY}%`,
                  left: `${posX}%`,
                  width: `${(scale / 100) * 58}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  zIndex: 20
                }}
              >
                {renderFrameSvg()}
              </div>

              {/* Brand Stamp Watermark */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-[10px] font-bold">
                مركز آزال • تجربة افتراضية
              </div>

              {/* Mode Switcher Bar inside Canvas */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs">
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMode('webcam')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
                      mode === 'webcam' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>الكاميرا الحية</span>
                  </button>

                  <button
                    onClick={() => setMode('model')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
                      mode === 'model' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>عارض نموذج</span>
                  </button>

                  <label className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                    mode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </div>

                <button
                  onClick={resetAdjustments}
                  className="p-1 text-slate-400 hover:text-white"
                  title="إعادة ضبط الموضع"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Model Selector if in Model Mode */}
            {mode === 'model' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-400">اختر ملامح الوجه:</span>
                {PRESET_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setPosY(model.defaultY);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedModel.id === model.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{model.name}</span>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right: Controls & Frame Carousel (5 Cols) */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between space-y-5">
            
            <div className="space-y-5">
              
              {/* Selected Frame Info */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {selectedProduct.brand}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 font-tajawal">{selectedProduct.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-blue-900 font-tajawal">
                      {formatPrice(selectedProduct.price, currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Quick Frame Selector Carousel */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>اختر إطاراً للتجربة:</span>
                  <span className="text-slate-500 text-[11px]">{eyewearProducts.length} إطارات متوفرة</span>
                </label>
                
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                  {eyewearProducts.map((p) => {
                    const isCurrent = selectedProduct.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-1.5 rounded-xl border text-right transition flex flex-col items-center ${
                          isCurrent ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={p.images[0]} alt={p.name} className="w-12 h-10 object-cover rounded-md mb-1" />
                        <span className="text-[10px] font-bold text-slate-800 line-clamp-1">{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Color Swatches */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">لون الإطار:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedProduct.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFrameColor(c.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                        frameColor === c.hex ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Lens Tinting Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">نوع تظليل العدسة المعروضة:</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  <button
                    onClick={() => setLensTint('clear')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-bold text-[11px] ${
                      lensTint === 'clear' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    شفافة طبية
                  </button>
                  <button
                    onClick={() => setLensTint('dark')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-bold text-[11px] ${
                      lensTint === 'dark' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    شمسية داكنة
                  </button>
                  <button
                    onClick={() => setLensTint('gradient')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-bold text-[11px] ${
                      lensTint === 'gradient' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    متدرجة
                  </button>
                  <button
                    onClick={() => setLensTint('blue-cut')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-bold text-[11px] ${
                      lensTint === 'blue-cut' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    حماية شاشات
                  </button>
                </div>
              </div>

              {/* 4. Fine Adjustment Sliders */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>تعديل المقاس والموضع على الوجه:</span>
                  </span>
                </div>

                {/* Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>حجم الإطار (Scale)</span>
                    <span>{scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Position Y */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>الارتفاع على الأنف (Y)</span>
                    <span>{posY}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="65"
                    value={posY}
                    onChange={(e) => setPosY(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Position X */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>المحاذاة الأفقية (X)</span>
                    <span>{posX}%</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="65"
                    value={posX}
                    onChange={(e) => setPosX(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onSelectProductToCart(selectedProduct);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
                id="tryon-order-now-btn"
              >
                <ShoppingBag className="w-4 h-4 text-blue-200" />
                <span>طلب هذا الإطار وتفصيل المقاسات</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
