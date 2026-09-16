import React from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Glasses, 
  Ear, 
  Sparkles, 
  MessageCircle, 
  Calendar,
  CheckCircle2,
  Award
} from 'lucide-react';
import { STORE_INFO as DEFAULT_STORE_INFO, TESTIMONIALS } from '../data/products';
import { StoreInfo } from '../types';

interface StoreLocationInfoProps {
  storeInfo?: StoreInfo;
  onOpenAppointment: () => void;
}

export const StoreLocationInfo: React.FC<StoreLocationInfoProps> = ({ 
  storeInfo = DEFAULT_STORE_INFO,
  onOpenAppointment 
}) => {
  const currentInfo = storeInfo || DEFAULT_STORE_INFO;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12" id="store-location-section">
      
      {/* Center Overview & Storefront Presentation */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white overflow-hidden shadow-xl border border-blue-900/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Real Store Photo Showcase (From user's uploaded storefront image) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group">
              <img
                src={currentInfo.storeImage || "/src/assets/images/azal_store_hero_1787843974970.jpg"}
                alt={currentInfo.name}
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Verified Store Badge */}
              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>الفرع الرئيسي المعتمد</span>
              </div>

              {/* Billboard phone watermark */}
              <div className="absolute bottom-3 right-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-white">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{currentInfo.name}</span>
                  <span className="text-red-400 font-mono text-[11px]">{currentInfo.nameEn}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{currentInfo.phone1} - {currentInfo.phone2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Info & Services Details */}
          <div className="lg:col-span-7 space-y-5 text-right">
            
            <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-red-400" />
              <span>خبرة موثوقة في البصريات والسمعيات منذ {currentInfo.establishedYear}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-tajawal text-white leading-tight">
              أهلاً بكم في {currentInfo.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
              {currentInfo.tagline}. نجمع بين أحدث أجهزة فحص النظر الكمبيوترية وتخطيط السمع الرقمي السريري، وتوفير أكبر تشكيلة من الإطارات والعدسات وسماعات الأذن غير المرئية بأسعار منافسة.
            </p>

            {/* Quick Contact & Working Hours Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <Phone className="w-4 h-4" />
                  <span>أرقام التواصل والحجوزات:</span>
                </div>
                <div className="font-mono text-sm text-white font-bold tracking-wide">
                  <a href={`tel:${currentInfo.phone1}`} className="hover:underline text-blue-300">{currentInfo.phone1}</a> - <a href={`tel:${currentInfo.phone2}`} className="hover:underline text-red-300">{currentInfo.phone2}</a>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>مواعيد العمل واستقبال الزوار:</span>
                </div>
                <div className="text-slate-200 text-[11px] leading-tight">
                  {currentInfo.workingHours}
                </div>
              </div>
            </div>


            {/* Services Checklist */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-200">الخدمات السريرية والفنية بالمركز:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {currentInfo.services.map((srv, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px]">{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenAppointment}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-lg transition hover:scale-[1.02] cursor-pointer"
                id="location-book-appointment-btn"
              >
                <Calendar className="w-4 h-4" />
                <span>حجز موعد فحص نظر أو سمعي</span>
              </button>

              <a
                href={`https://wa.me/${currentInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً مركز آزال للنظارات والسمعيات، أود الاستفسار عن فحص النظر وتخطيط السمع.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md transition hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مراسلة المركز عبر الواتساب</span>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Customer Reviews & Testimonials Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-tajawal">
              آراء وتقييمات عملاء مركز آزال
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">ثقة عملائنا هي فخرنا ومسؤوليتنا المستمرة</p>
          </div>
          <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span>⭐ تقييم عام: 4.9 من 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-right space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{review.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{review.name}</div>
                  <div className="text-[10px] text-slate-400">{review.city}</div>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">
                  مشتري موثق ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
