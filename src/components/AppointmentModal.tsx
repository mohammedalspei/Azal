import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Phone, 
  User, 
  MessageCircle, 
  MapPin, 
  Glasses, 
  Ear, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { StoreInfo } from '../types';
import { STORE_INFO } from '../data/products';
import { db, collection, addDoc } from '../lib/firebase';

interface AppointmentModalProps {
  onClose: () => void;
  storeInfo?: StoreInfo;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ onClose, storeInfo }) => {
  const currentInfo = storeInfo || STORE_INFO;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<'eye-exam' | 'hearing-test' | 'hearing-aid-fitting' | 'maintenance'>('eye-exam');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:30 صباحاً');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timeSlots = [
    '09:30 صباحاً',
    '10:30 صباحاً',
    '11:30 صباحاً',
    '04:30 عصراً',
    '05:30 مساءً',
    '06:30 مساءً',
    '08:00 مساءً',
    '09:00 مساءً'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setIsSubmitted(true);

    const aptPayload = {
      fullName,
      phone,
      serviceType: serviceNames[serviceType] || serviceType,
      preferredDate: date,
      preferredTime: timeSlot,
      notes,
      createdAt: new Date().toISOString(),
      status: 'جديد'
    };

    // 1. Firebase Firestore save
    try {
      await addDoc(collection(db, 'appointments'), aptPayload);
    } catch (fbErr) {
      console.warn('Firestore appointment error:', fbErr);
    }

    // 2. Server REST save
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptPayload)
      });
    } catch (err) {
      console.warn('Appointment server sync error:', err);
    }
  };

  const serviceNames: Record<string, string> = {
    'eye-exam': 'فحص النظر وتحديد مقاسات العدسات بالكمبيوتر',
    'hearing-test': 'تخطيط وقياس السمع السريري الرقمي',
    'hearing-aid-fitting': 'برمجة وتجربة سماعات الأذن غير المرئية',
    'maintenance': 'صيانة وتعديل النظارات / أجهزة السمع'
  };

  const handleSendWhatsAppConfirmation = () => {
    const message = `مرحباً مركز آزال للنظارات والسمعيات 👓👂\nأود تأكيد حجز موعد فحص بالمركز:\n` +
      `👤 الاسم: ${fullName}\n` +
      `📞 الهاتف: ${phone}\n` +
      `🩺 نوع الخدمة: ${serviceNames[serviceType]}\n` +
      `📅 التاريخ: ${date}\n` +
      `⏰ الوقت: ${timeSlot}\n` +
      (notes ? `📝 ملاحظات: ${notes}\n` : '') +
      `\nيرجى تأكيد الحجز ومكان الاستقبال. شكراً جزيلاً!`;

    const cleanPhone = currentInfo.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6" id="appointment-modal">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-tajawal">حجز موعد فحص في مركز آزال</h2>
              <p className="text-xs text-slate-300">فحص نظر كمبيوتري متطور • تخطيط سمع رقمي سريري</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            id="close-appointment-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Service Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">اختر نوع الفحص أو الخدمة المطلوبة:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setServiceType('eye-exam')}
                    className={`p-3 rounded-xl border text-right transition flex items-center gap-2.5 ${
                      serviceType === 'eye-exam'
                        ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <Glasses className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>فحص النظر وتفصيل العدسات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('hearing-test')}
                    className={`p-3 rounded-xl border text-right transition flex items-center gap-2.5 ${
                      serviceType === 'hearing-test'
                        ? 'border-amber-600 bg-amber-50/90 text-amber-900 font-bold ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <Ear className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>تخطيط وفحص السمع السريري</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('hearing-aid-fitting')}
                    className={`p-3 rounded-xl border text-right transition flex items-center gap-2.5 ${
                      serviceType === 'hearing-aid-fitting'
                        ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>برمجة وتجربة سماعات السمع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('maintenance')}
                    className={`p-3 rounded-xl border text-right transition flex items-center gap-2.5 ${
                      serviceType === 'maintenance'
                        ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>صيانة وتعديل إطارات / أجهزة</span>
                  </button>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>الاسم الكريم:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد محمد"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 779807290 أو 734543540"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاريخ الموعد المفضل:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>الفترة الزمنية المناسبة:</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {timeSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ملاحظات أو أعراض ترغب في ذكرها (اختياري):</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: صداع عند استخدام الشاشات، أو ضعف في تمييز الكلام في المجالس..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              {/* Location Note */}
              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>موقع المركز: {STORE_INFO.address} - {STORE_INFO.city} (هواتف: {STORE_INFO.phone1} - {STORE_INFO.phone2})</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01]"
                id="submit-appointment-btn"
              >
                تأكيد طلب حجز الموعد
              </button>

            </form>
          ) : (
            /* Confirmation Screen */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 font-tajawal">تم استلام طلب حجزك بنجاح!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  شكراً لك {fullName}، تم تسجيل موعدك في مركز آزال للنظارات والسمعيات.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-right space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">نوع الخدمة:</span>
                  <span className="font-bold text-slate-900">{serviceNames[serviceType]}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">الموعد:</span>
                  <span className="font-bold text-slate-900">{date} ({timeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <span className="font-bold text-slate-900">{phone}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSendWhatsAppConfirmation}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال تأكيد الموعد عبر الواتساب</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إغلاق ومتابعة التسوق
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
