import React from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Glasses, 
  Ear, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  Mail,
  Camera,
  Lock,
  Code2
} from 'lucide-react';
import { AzalLogo } from './AzalLogo';
import { STORE_INFO as DEFAULT_STORE_INFO } from '../data/products';
import { CategoryType, StoreInfo } from '../types';

interface FooterProps {
  storeInfo?: StoreInfo;
  onSelectCategory: (category: CategoryType) => void;
  onOpenVirtualTryOn: () => void;
  onOpenHearingTest: () => void;
  onOpenAppointment: () => void;
  onOpenAIConsultant: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeInfo = DEFAULT_STORE_INFO,
  onSelectCategory,
  onOpenVirtualTryOn,
  onOpenHearingTest,
  onOpenAppointment,
  onOpenAIConsultant,
  onOpenAdminLogin
}) => {
  const currentInfo = storeInfo || DEFAULT_STORE_INFO;

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-28 md:pb-10 text-right" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <AzalLogo variant="white" size="lg" />
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentInfo.tagline}. وجهتكم الأولى لأرقى النظارات الطبية والشمسية، العدسات اللاصقة، وفحص النظر وتخطيط السمع الرقمي بأعلى معايير الدقة السويسرية والألمانية.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${currentInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition"
                title="واتساب"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${currentInfo.phone1}`}
                className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                title="اتصال هاتف"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenAIConsultant}
                className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center hover:bg-amber-600 hover:text-white transition"
                title="المستشار الذكي"
              >
                <Glasses className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-slate-800 pb-2">
              أقسام المتجر
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('eyeglasses')} className="hover:text-white transition">
                  نظارات طبية وإطارات تيتانيوم
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('sunglasses')} className="hover:text-white transition">
                  نظارات شمسية مستقطبة Polarized
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('contact-lenses')} className="hover:text-white transition">
                  عدسات لاصقة تجميلية وطبية
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('hearing-aids')} className="hover:text-white transition">
                  قسم السمعيات وسماعات الأذن غير المرئية
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('accessories')} className="hover:text-white transition">
                  محاليل معقمة وإكسسوارات وحوافظ جلدية
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Interactive Tools */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-slate-800 pb-2">
              الخدمات والتجربة الرقمية
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenVirtualTryOn} className="hover:text-blue-300 transition flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>غرفة القياس والتجربة الافتراضية</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenHearingTest} className="hover:text-amber-300 transition flex items-center gap-1.5">
                  <Ear className="w-3.5 h-3.5 text-amber-400" />
                  <span>فحص واختبار السمع التفاعلي</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenAIConsultant} className="hover:text-indigo-300 transition flex items-center gap-1.5">
                  <Glasses className="w-3.5 h-3.5 text-indigo-400" />
                  <span>مستشار آزال الذكي لشكل الوجه</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenAppointment} className="hover:text-red-300 transition flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>حجز موعد فحص نظر وتخطيط سمع</span>
                </button>
              </li>
              <li>
                <a href={`https://wa.me/${currentInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition">
                  خدمة العملاء والطلبات الخاصة
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info from Signboard */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-slate-800 pb-2">
              بيانات التواصل والمقر
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{currentInfo.address} - {currentInfo.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-mono text-white">{currentInfo.phone1} / {currentInfo.phone2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[11px]">{currentInfo.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{currentInfo.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Strip with Admin Access Button Placed Before Copyright & Developer Contact */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            {/* Admin Dashboard Button placed before 'جميع الحقوق' */}
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-amber-500/40 transition shadow-sm cursor-pointer text-xs font-semibold"
              id="footer-admin-btn"
              title="لوحة الإدارة والتحكم"
              aria-label="لوحة الإدارة"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>لوحة الإدارة</span>
            </button>

            {/* Developer Contact Button */}
            <a
              href="mailto:aaa776262895@gmail.com?subject=استفسار%20بخصوص%20تطوير%20موقع%20مركز%20آزال%20للنظارات"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-blue-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition shadow-sm text-xs font-semibold"
              id="footer-developer-contact-btn"
              title="التواصل مع مطور الموقع (aaa776262895@gmail.com)"
              aria-label="التواصل مع مطور الموقع"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>التواصل مع المطور</span>
            </a>

            <span className="text-slate-700 hidden sm:inline">•</span>

            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} {currentInfo.name} ({currentInfo.nameEn})</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>صمم بكل</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>لخدمة رعاية العيون والسمع بأعلى مقاييس الجودة</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

