import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  Store, 
  MessageCircle, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, StoreInfo } from '../types';
import { Currency, formatPrice, generateWhatsAppOrderLink } from '../utils/helpers';
import { STORE_INFO } from '../data/products';
import { db, collection, addDoc } from '../lib/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  onOrderCompleted: () => void;
  storeInfo?: StoreInfo;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onOrderCompleted,
  storeInfo,
}) => {
  if (!isOpen) return null;
  const currentInfo = storeInfo || STORE_INFO;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('تعز');
  const [addressDetails, setAddressDetails] = useState('');
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home_delivery'>('store_pickup');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'kuraimi' | 'onecash' | 'card'>('cod');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const deliveryFee = deliveryType === 'home_delivery' ? 2000 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    const orderPayload = {
      customerName,
      phone: customerPhone,
      city,
      address: deliveryType === 'store_pickup' ? 'استلام من المركز' : addressDetails,
      items: cartItems.map(i => ({
        id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        color: i.selectedColor.name,
        lens: i.selectedLens?.name,
        totalPrice: i.totalPrice
      })),
      totalAmount: grandTotal,
      currency,
      paymentMethod: paymentMethod === 'cod' ? 'الدفع عند الاستلام' : paymentMethod,
      notes,
      createdAt: new Date().toISOString(),
      status: 'جديد'
    };

    // 1. Firebase Firestore save
    try {
      await addDoc(collection(db, 'orders'), orderPayload);
    } catch (fbErr) {
      console.warn('Firestore order error:', fbErr);
    }

    // 2. Save order to server database
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (err) {
      console.warn('Order server sync error:', err);
    }

    setIsSuccess(true);
  };

  const handleSendWhatsApp = () => {
    const itemsSummary = cartItems.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.totalPrice,
      color: item.selectedColor.name,
      lens: item.selectedLens?.name
    }));

    const deliveryText = deliveryType === 'store_pickup' 
      ? 'استلام مباشر من مركز آزال للنظارات'
      : `توصيل إلى العنوان: ${city} - ${addressDetails}`;

    const link = generateWhatsAppOrderLink(
      currentInfo.whatsapp,
      itemsSummary,
      grandTotal,
      currency,
      customerName,
      city,
      deliveryText,
      notes
    );

    window.open(link, '_blank');
  };

  const handleFinish = () => {
    onOrderCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6" id="checkout-modal">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-tajawal">إتمام طلب الشراء • مركز آزال</h2>
              <p className="text-xs text-slate-300">تسوق آمن ومضمون 100% مع ضمان المركز</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Delivery method selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">طريقة الاستلام المفضلة:</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setDeliveryType('store_pickup')}
                    className={`cursor-pointer p-3 rounded-xl border transition flex items-center gap-2.5 ${
                      deliveryType === 'store_pickup'
                        ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Store className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold">استلام من مركز آزال</div>
                      <div className="text-[10px] text-emerald-700">مجاناً + فحص وتعديل فوري</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryType('home_delivery')}
                    className={`cursor-pointer p-3 rounded-xl border transition flex items-center gap-2.5 ${
                      deliveryType === 'home_delivery'
                        ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold">توصيل سريع للمنزل</div>
                      <div className="text-[10px] text-slate-500">لجميع المناطق والمحافظات</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>اسم المستلم:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: يحيى اليماني"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>رقم الهاتف / الواتساب:</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="مثال: 779807290 أو 734543540"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>المدينة:</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">تفاصيل العنوان / الشارع:</label>
                  <input
                    type="text"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder="الشارع، الحي، أقرب معلم مميز..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800">طريقة الدفع:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition ${
                      paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    💵 الدفع عند الاستلام
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('kuraimi')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition ${
                      paymentMethod === 'kuraimi' ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    🏦 حـوالة الكريمي
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('onecash')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition ${
                      paymentMethod === 'onecash' ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    📱 ون كاش / النجم
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition ${
                      paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    💳 بطاقة بنكية
                  </button>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>عدد المنتجات ({cartItems.length}):</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>رسوم التوصيل:</span>
                    <span>{formatPrice(deliveryFee, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2 font-tajawal">
                  <span>المبلغ الإجمالي للدفع:</span>
                  <span className="text-blue-900 text-base">{formatPrice(grandTotal, currency)}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01]"
                id="complete-order-button"
              >
                تأكيد وإرسال الطلب الآن
              </button>

            </form>
          ) : (
            /* Order Success View */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 font-tajawal">تم استلام طلبك بنجاح! 👓🎉</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  شكراً لك {customerName}، تم تسجيل طلبك في مركز آزال للنظارات والسمعيات وسيتم تجهيز النظارة/السماعة فوراً.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-right space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">رقم الطلب:</span>
                  <span className="font-mono font-bold text-blue-900">#AZAL-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">المبلغ الإجمالي:</span>
                  <span className="font-bold text-slate-900">{formatPrice(grandTotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">طريقة الاستلام:</span>
                  <span className="font-bold text-slate-900">
                    {deliveryType === 'store_pickup' ? 'استلام من المركز' : `توصيل لـ ${city}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال تفاصيل الفاتورة عبر الواتساب</span>
                </button>

                <button
                  onClick={handleFinish}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
