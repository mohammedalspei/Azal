import React from 'react';
import { 
  Glasses, 
  Sun, 
  Eye, 
  Ear, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  ArrowLeft 
} from 'lucide-react';
import { CATEGORIES_LIST } from '../data/products';
import { CategoryType } from '../types';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  onOpenVirtualTryOn: () => void;
  onOpenHearingTest: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenVirtualTryOn,
  onOpenHearingTest,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Glasses': return Glasses;
      case 'Sun': return Sun;
      case 'Eye': return Eye;
      case 'Ear': return Ear;
      case 'ShieldCheck': return ShieldCheck;
      default: return Sparkles;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="category-navigation-section">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-tajawal flex items-center gap-2">
            <span>تصفح حسب الأقسام والتخصصات</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">مركز آزال</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">اختر القسم لاستعراض أرقى الموديلات وحلول الرعاية البصرية والسمعية</p>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {CATEGORIES_LIST.filter(c => c.id !== 'all').map((cat) => {
          const Icon = getIcon(cat.icon);
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as CategoryType)}
              className={`group relative flex flex-col p-4 rounded-2xl text-right transition-all duration-300 overflow-hidden border ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/20 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
              id={`cat-card-${cat.id}`}
            >
              {/* Top Row: Icon & Count */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-white/15 text-white'
                    : 'bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count} صنف
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className={`font-bold text-sm sm:text-base font-tajawal transition-colors ${
                  isSelected ? 'text-white' : 'text-slate-900 group-hover:text-blue-900'
                }`}>
                  {cat.name}
                </h3>
                <p className={`text-[11px] mt-0.5 ${
                  isSelected ? 'text-blue-200' : 'text-slate-400'
                }`}>
                  {cat.nameEn}
                </p>
              </div>

              {/* Bottom Subtle Arrow Indicator */}
              <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                <span className="text-[11px]">تصفح الآن</span>
                <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Two Interactive Callout Banners (Virtual Try-on & Hearing Screener) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Virtual Try-On Banner */}
        <div 
          onClick={onOpenVirtualTryOn}
          className="cursor-pointer group relative bg-gradient-to-l from-slate-900 to-blue-950 rounded-2xl p-5 text-white overflow-hidden shadow-md hover:shadow-xl transition-all border border-blue-900/30"
          id="banner-virtual-tryon"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5 max-w-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                <Camera className="w-3 h-3" />
                ميزة حصرية
              </span>
              <h3 className="text-lg font-black font-tajawal">غرفة القياس والتجربة الافتراضية</h3>
              <p className="text-xs text-slate-300">جرب النظارات مباشرة على وجهك بالكاميرا أو ارفع صورتك لمعاينة الشكل والمقاس بدقة</p>
              <button className="mt-2 text-xs font-bold text-blue-300 group-hover:text-white flex items-center gap-1">
                <span>ابدأ التجربة الحية</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              </button>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm group-hover:scale-110 transition duration-300 text-blue-400">
              <Glasses className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Online Hearing Screener Banner */}
        <div 
          onClick={onOpenHearingTest}
          className="cursor-pointer group relative bg-gradient-to-l from-slate-900 to-amber-950 rounded-2xl p-5 text-white overflow-hidden shadow-md hover:shadow-xl transition-all border border-amber-900/30"
          id="banner-hearing-screener"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5 max-w-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md">
                <Ear className="w-3 h-3" />
                فحص إلكتروني أولي
              </span>
              <h3 className="text-lg font-black font-tajawal">اختبار وفحص السمع التفاعلي</h3>
              <p className="text-xs text-slate-300">استمع لنغمات الترددات الصوتية وقيم كفاءة سمعك مع ترشيح فوري لأنسب سماعة رقمية</p>
              <button className="mt-2 text-xs font-bold text-amber-300 group-hover:text-white flex items-center gap-1">
                <span>ابدأ اختبار السمع</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              </button>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm group-hover:scale-110 transition duration-300 text-amber-400">
              <Ear className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
