import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Glasses, 
  Ear, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Award, 
  Camera, 
  Calendar, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { STORE_INFO, DEFAULT_HERO_SLIDES } from '../data/products';
import { CategoryType, HeroSlideItem } from '../types';

interface HeroSliderProps {
  slides?: HeroSlideItem[];
  onSelectCategory: (category: CategoryType) => void;
  onOpenVirtualTryOn: () => void;
  onOpenHearingTest: () => void;
  onOpenAppointment: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides = DEFAULT_HERO_SLIDES,
  onSelectCategory,
  onOpenVirtualTryOn,
  onOpenHearingTest,
  onOpenAppointment
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;

  // Auto slide interval
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  const getActionHandler = (actionType?: string, category?: CategoryType) => {
    switch (actionType) {
      case 'virtual-tryon':
        return onOpenVirtualTryOn;
      case 'hearing-test':
        return onOpenHearingTest;
      case 'appointment':
        return onOpenAppointment;
      case 'category':
      default:
        return () => onSelectCategory(category || 'eyeglasses');
    }
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'virtual-tryon':
        return Camera;
      case 'hearing-test':
        return Ear;
      case 'appointment':
        return Calendar;
      default:
        return Glasses;
    }
  };


  return (
    <div className="relative w-full overflow-hidden bg-slate-950" id="hero-slider-section">
      {/* Slide Canvas */}
      <div className="relative min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
        {activeSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          const SecondaryIcon = getActionIcon(slide.secondaryActionType);
          const primaryHandler = getActionHandler(slide.primaryActionType, slide.primaryCategory);
          const secondaryHandler = getActionHandler(slide.secondaryActionType, slide.secondaryCategory);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Store Photo Background & Dynamic Overlay - Clear & Bright */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.bgImage || "/src/assets/images/azal_store_hero_1787843974970.jpg"}
                  alt="مركز آزال للنظارات والسمعيات"
                  className="w-full h-full object-cover object-center scale-100 filter brightness-95 contrast-105 saturate-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                {/* Refined Directional Overlays: Crisp photo on left, soft contrast for text on right */}
                <div className="absolute inset-0 bg-gradient-to-l from-slate-950/85 via-slate-950/50 to-slate-950/15"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40"></div>
              </div>

              <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 py-8 sm:py-12 lg:py-16">
                
                {/* Content Side */}
                <div className="w-full lg:w-1/2 text-right space-y-4 lg:space-y-5">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm bg-white/10 backdrop-blur-md border border-white/15">
                    <span className={`w-2 h-2 rounded-full ${slide.badgeColor}`}></span>
                    <span>{slide.badge}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-tajawal tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm lg:text-base text-slate-200 max-w-xl font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2 sm:line-clamp-none">
                    {slide.subtitle}
                  </p>

                  {/* Call to Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                    <button
                      onClick={primaryHandler}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      id={`hero-primary-btn-${slide.id}`}
                    >
                      <span>{slide.primaryBtnText}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={secondaryHandler}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
                      id={`hero-secondary-btn-${slide.id}`}
                    >
                      <SecondaryIcon className="w-4 h-4 text-blue-300" />
                      <span>{slide.secondaryBtnText}</span>
                    </button>
                  </div>

                  {/* Quick Trust & Special Offer Badges - Streamlined & Elegant */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] sm:text-xs font-semibold flex-wrap">
                    <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>فحص مجاني 100%</span>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>خصم 30% للموقع</span>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-200 px-2.5 py-1 rounded-md border border-blue-500/25">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>أصلي 100%</span>
                    </div>
                  </div>

                </div>

                {/* Visual Image / Showcase Side */}
                <div className="w-full lg:w-1/2 flex justify-center relative">
                  <div className="relative w-full max-w-md lg:max-w-lg aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                    {/* Store Branding Overlay Watermark */}
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span>مركز آزال</span>
                    </div>

                    {/* Floating Info Card */}
                    {slide.floatingBadge && (
                      <div className="absolute bottom-4 right-4 left-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-white flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white font-tajawal">{slide.floatingBadge.title}</div>
                          <div className="text-xs text-slate-300">{slide.floatingBadge.sub}</div>
                        </div>
                        <div className="bg-blue-600/30 text-blue-300 p-2 rounded-lg border border-blue-500/30">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Controls (Arrows & Dots) */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-between max-w-7xl mx-auto px-4 pointer-events-none">
        
        {/* Slide Dots */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-red-600' : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={prevSlide}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition shadow-md"
            aria-label="الشريحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition shadow-md"
            aria-label="الشريحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Features Strip */}
      <div className="bg-slate-900/90 border-t border-slate-800 py-3.5 px-4 text-white text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Glasses className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100">فحص وتفصيل فوري</div>
              <div className="text-[11px] text-slate-400">أجهزة أوتوماتيكية دقيقة</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Ear className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100">قسم سمعيات رقمي</div>
              <div className="text-[11px] text-slate-400">تخطيط سمع وسماعات مخفية</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100">ضمان أصلي معتمد</div>
              <div className="text-[11px] text-slate-400">صيانة وبرمجة مجانية</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100">توصيل سريع أو استلام</div>
              <div className="text-[11px] text-slate-400">خدمة عملاء عبر الواتساب</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
