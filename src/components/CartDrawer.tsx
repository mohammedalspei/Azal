import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Tag, 
  ShieldCheck, 
  Check, 
  MessageCircle,
  Glasses,
  FileText
} from 'lucide-react';
import { CartItem, StoreInfo } from '../types';
import { Currency, formatPrice, generateWhatsAppOrderLink } from '../utils/helpers';
import { STORE_INFO } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: () => void;
  storeInfo?: StoreInfo;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  storeInfo,
}) => {
  if (!isOpen) return null;
  const currentInfo = storeInfo || STORE_INFO;

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'AZAL30' || code === 'WEB30' || code === 'AZAL' || code === 'TAIZ30' || code === '30') {
      setDiscountPercent(30);
      setPromoMessage('تم تطبيق خصم الموقع الخاص بنسبة 30% بنجاح! 🎁');
    } else if (code === 'VIP20') {
      setDiscountPercent(20);
      setPromoMessage('تم تطبيق خصم VIP بنسبة 20%! 🎉');
    } else if (code === 'AZAL2025' || code === 'AZAL10' || code === 'WELCOME') {
      setDiscountPercent(30);
      setPromoMessage('تم تطبيق خصم الموقع بنسبة 30%! 🎁');
    } else {
      setDiscountPercent(0);
      setPromoMessage('كود الخصم غير صالح أو منتهي الصلاحية');
    }
  };

  const handleQuickWhatsAppCheckout = () => {
    const itemsSummary = cartItems.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.totalPrice,
      color: item.selectedColor.name,
      lens: item.selectedLens?.name
    }));

    const link = generateWhatsAppOrderLink(
      currentInfo.whatsapp,
      itemsSummary,
      grandTotal,
      currency
    );
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm transition-opacity" id="cart-drawer-overlay">
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-300" />
              <h2 className="text-base font-bold font-tajawal">سلة المشتريات</h2>
              <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
              id="close-cart-drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">سلة المشتريات فارغة حالياً</h3>
                  <p className="text-xs text-slate-400 mt-1">تصفح تشكيلة النظارات والسمعيات وأضف ما يناسبك</p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-blue-900 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  تصفح المنتجات الآن
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />

                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-slate-900 font-tajawal line-clamp-1">{item.product.name}</h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>اللون: <strong className="text-slate-700">{item.selectedColor.name}</strong></span>
                    </div>

                    {item.selectedLens && (
                      <div className="text-[10px] text-blue-700 bg-blue-50 p-1 rounded font-medium flex items-center gap-1">
                        <Glasses className="w-3 h-3" />
                        <span>عدسات: {item.selectedLens.name.split('(')[0]}</span>
                      </div>
                    )}

                    {item.prescription && item.prescription.type === 'manual' && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1 rounded font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>مقاسات الكشف مدخلة (PD: {item.prescription.pd || 62})</span>
                      </div>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-blue-900 text-xs font-tajawal">
                        {formatPrice(item.totalPrice, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Actions */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="كود الخصم (اكتب: AZAL30 لخصم 30%)"
                    className="w-full bg-white border border-slate-300 rounded-xl pr-8 pl-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-bold"
                >
                  تطبيق
                </button>
              </form>

              {promoMessage && (
                <div className={`text-[11px] font-bold ${discountPercent > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {promoMessage}
                </div>
              )}

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>خصم الكوبون ({discountPercent}%):</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الفحص والتركيب بالمركز:</span>
                  <span className="text-emerald-700 font-bold">مجاني 100%</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 border-t border-slate-200 pt-2 font-tajawal">
                  <span>المبلغ الإجمالي المطلوب:</span>
                  <span className="text-blue-900 text-base">{formatPrice(grandTotal, currency)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
                  id="checkout-cart-btn"
                >
                  <span>متابعة إتمام الطلب والدفع</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleQuickWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition"
                  id="cart-whatsapp-order-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال الطلب فوراً عبر الواتساب</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
