import React from 'react';
import { X, Heart, ShoppingBag, Trash2, Camera } from 'lucide-react';
import { Product } from '../types';
import { Currency, formatPrice } from '../utils/helpers';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  currency: Currency;
  onRemoveFromWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  currency,
  onRemoveFromWishlist,
  onSelectProduct,
  onOpenVirtualTryOn
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6" id="wishlist-modal">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh] border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <h2 className="text-base font-bold font-tajawal">قائمة الرغبات والمفضلة</h2>
            <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">قائمة المفضلة فارغة حالياً</h3>
              <p className="text-xs text-slate-400">انقر على رمز القلب على أي نظارة أو سماعة لحفظها هنا</p>
            </div>
          ) : (
            wishlist.map((item) => {
              const hasTryOn = item.category === 'eyeglasses' || item.category === 'sunglasses';
              return (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="text-xs space-y-0.5">
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.brand}
                      </span>
                      <h4 className="font-bold text-slate-900 font-tajawal line-clamp-1">{item.name}</h4>
                      <div className="text-xs font-black text-blue-900 font-tajawal">
                        {formatPrice(item.price, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasTryOn && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVirtualTryOn(item);
                        }}
                        className="p-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="تجربة افتراضية"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">تجربة</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(item);
                      }}
                      className="p-2 bg-blue-900 text-white hover:bg-blue-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="hidden sm:inline">طلب</span>
                    </button>

                    <button
                      onClick={() => onRemoveFromWishlist(item)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
