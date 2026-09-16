import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Camera, 
  Star, 
  Sparkles, 
  Check, 
  Eye, 
  ShieldCheck, 
  Glasses,
  Ear
} from 'lucide-react';
import { Product } from '../types';
import { Currency, formatPrice } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickTryOn: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickTryOn,
}) => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeImage = product.images[selectedColorIdx] || product.images[0];
  const activeColor = product.colors[selectedColorIdx] || product.colors[0];

  const hasTryOn = product.category === 'eyeglasses' || product.category === 'sunglasses';
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`product-card-${product.id}`}
    >
      {/* Top Image Canvas */}
      <div className="relative aspect-4/3 sm:aspect-square bg-slate-100/70 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        
        {/* Product Image */}
        <img
          src={activeImage}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          loading="lazy"
          onError={(e) => {
            // Safe fallback if an external or uploaded URL fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
          {product.isBestSeller && (
            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
              الأكثر مبيعاً ⭐
            </span>
          )}
          {product.isNew && (
            <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
              جديد
            </span>
          )}
          {discountPercent && (
            <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
              خصم {discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 left-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted 
              ? 'bg-red-50 text-red-600 shadow-md' 
              : 'bg-white/80 text-slate-600 hover:text-red-600 hover:bg-white'
          }`}
          title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          id={`wishlist-toggle-${product.id}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600' : ''}`} />
        </button>

        {/* Quick Try-On Overlay Action */}
        {hasTryOn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickTryOn(product);
            }}
            className="absolute bottom-2.5 right-2.5 left-2.5 bg-slate-900/90 hover:bg-blue-900 text-white text-xs font-bold py-2 px-3 rounded-xl backdrop-blur-md flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-md z-10"
            id={`quick-tryon-${product.id}`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-300" />
            <span>تجربة افتراضية على الوجه</span>
          </button>
        )}

        {/* Brand Tag Pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs group-hover:opacity-0 transition-opacity">
          {product.brand}
        </div>
      </div>

      {/* Card Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal text-[11px]">({product.reviewCount})</span>
            </div>

            {/* Spec Tag */}
            {product.specs.weight && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {product.specs.weight}
              </span>
            )}
            {product.specs.channels && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                {product.specs.channels} قناة صوتية
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 hover:text-blue-700 cursor-pointer transition-colors font-tajawal leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-1">
            {product.nameEn}
          </p>
        </div>

        {/* Color Swatches */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-medium ml-1">الألوان:</span>
            {product.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColorIdx(idx)}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColorIdx === idx
                    ? 'ring-2 ring-blue-600 ring-offset-1 scale-110'
                    : 'border-slate-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          
          {/* Price Box */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-950 font-tajawal">
                {formatPrice(product.price, currency)}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.originalPrice, currency)}
              </span>
            )}
          </div>

          {/* Order / Customize Button */}
          <button
            onClick={() => onSelectProduct(product)}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
            id={`view-details-${product.id}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-200" />
            <span>تفصيل وطلب</span>
          </button>

        </div>

      </div>
    </div>
  );
};
