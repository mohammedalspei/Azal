import React, { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Phone, 
  Calendar, 
  Sparkles, 
  Menu, 
  X, 
  Glasses, 
  Ear, 
  Camera, 
  Sun, 
  Eye, 
  Clock, 
  MapPin, 
  MessageCircle,
  ChevronDown
} from 'lucide-react';
import { AzalLogo } from './AzalLogo';
import { STORE_INFO } from '../data/products';
import { Currency } from '../utils/helpers';
import { CategoryType, StoreInfo } from '../types';

interface HeaderProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAppointment: () => void;
  onOpenVirtualTryOn: () => void;
  onOpenHearingTest: () => void;
  onOpenAIConsultant: () => void;
  currency: Currency;
  onChangeCurrency: (currency: Currency) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  storeInfo?: StoreInfo;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAppointment,
  onOpenVirtualTryOn,
  onOpenHearingTest,
  onOpenAIConsultant,
  currency,
  onChangeCurrency,
  searchQuery,
  onSearchChange,
  storeInfo
}) => {
  const currentInfo = storeInfo || STORE_INFO;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'all' as CategoryType, name: 'الرئيسية والمتجر', icon: ShoppingBag },
    { id: 'eyeglasses' as CategoryType, name: 'نظارات طبية', icon: Glasses },
    { id: 'sunglasses' as CategoryType, name: 'نظارات شمسية', icon: Sun },
    { id: 'contact-lenses' as CategoryType, name: 'عدسات لاصقة', icon: Eye },
    { id: 'hearing-aids' as CategoryType, name: 'قسم السمعيات', icon: Ear, badge: 'تخطيط وسماعات' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm transition-all" id="main-header">
      {/* Top Notification & Contact Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Phone Numbers & Working Hours */}
          <div className="flex items-center gap-4 flex-wrap">
            <a 
              href={`tel:${currentInfo.phone1}`} 
              className="flex items-center gap-1.5 hover:text-white transition-colors text-slate-300 font-medium"
              id="top-phone-link-1"
            >
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>{currentInfo.phone1}</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a 
              href={`tel:${currentInfo.phone2}`} 
              className="flex items-center gap-1.5 hover:text-white transition-colors text-slate-300 font-medium hidden sm:flex"
              id="top-phone-link-2"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentInfo.phone2}</span>
            </a>
            <span className="text-slate-600 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentInfo.workingHours}</span>
            </div>
          </div>

          {/* Center Promo Announcement */}
          <div className="hidden lg:flex items-center gap-2 text-slate-200 bg-gradient-to-r from-emerald-950/80 via-slate-800 to-amber-950/80 px-3.5 py-0.5 rounded-full border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-emerald-300">الفحص مجاناً 100%</span>
            <span className="text-slate-500">•</span>
            <span className="font-bold text-amber-300">خصم 30% لجميع الطلبات والاستفسارات عبر الموقع</span>
          </div>

          {/* Right Tools: Currency, WhatsApp, Location */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700 transition"
                id="currency-toggle-btn"
                title="تغيير عملة عرض الأسعار"
              >
                <span>{currency === 'YER' ? 'ريال يمني (جديد)' : currency === 'SAR' ? 'ريال سعودي (SAR)' : 'دولار ($)'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-slate-900 rounded-lg shadow-xl border border-slate-700 py-1.5 z-50 text-right">
                  <div className="px-3 py-1 text-[10px] text-slate-400 border-b border-slate-800 mb-1">
                    حساب الأسعار بالعملة الجديدة
                  </div>
                  <button
                    onClick={() => { onChangeCurrency('YER'); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between ${currency === 'YER' ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'}`}
                  >
                    <div>
                      <p className="font-semibold">ريال يمني (الجديد)</p>
                      <p className="text-[10px] text-slate-400">تعز والمناطق المحررة</p>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">YER</span>
                  </button>
                  <button
                    onClick={() => { onChangeCurrency('SAR'); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between ${currency === 'SAR' ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'}`}
                  >
                    <div>
                      <p className="font-semibold">ريال سعودي</p>
                      <p className="text-[10px] text-slate-400">1 ر.س = 430 ر.ي</p>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">SAR</span>
                  </button>
                  <button
                    onClick={() => { onChangeCurrency('USD'); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between ${currency === 'USD' ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'}`}
                  >
                    <div>
                      <p className="font-semibold">دولار أمريكي</p>
                      <p className="text-[10px] text-slate-400">1 $ = 1,600 ر.ي</p>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">USD</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick WhatsApp Contact */}
            <a
              href={`https://wa.me/${currentInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً مركز آزال للنظارات والسمعيات، أود الاستفسار من فضلكم.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold transition"
              id="top-whatsapp-btn"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">واتساب مباشر</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Navbar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            className="cursor-pointer flex-shrink-0"
            onClick={() => onSelectCategory('all')}
            id="brand-header-logo-click"
          >
            <AzalLogo size="md" />
          </div>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن إطار طبي، نظارة شمسية، ماركة، سماعة أذن، أو عدسات..."
                className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full py-2.5 pr-10 pl-10 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition duration-200"
                id="search-input-desktop"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-1 rounded-full"
                  id="clear-search-btn"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons & Features */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIConsultant}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-900/10 transition-all hover:scale-[1.02]"
              id="header-ai-advisor-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>مستشار آزال الذكي</span>
            </button>

            {/* Virtual Try-on Button */}
            <button
              onClick={onOpenVirtualTryOn}
              className="hidden sm:flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition"
              id="header-tryon-btn"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>تجربة افتراضية</span>
            </button>

            {/* Hearing Test Screener Button */}
            <button
              onClick={onOpenHearingTest}
              className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition"
              id="header-hearing-btn"
            >
              <Ear className="w-4 h-4 text-amber-600" />
              <span>فحص السمع</span>
            </button>

            {/* Book Appointment Button */}
            <button
              onClick={onOpenAppointment}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition"
              id="header-appointment-btn"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">حجز فحص</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="المفضلة"
              id="header-wishlist-btn"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition hover:shadow-md"
              id="header-cart-btn"
            >
              <ShoppingBag className="w-4 h-4 text-blue-300" />
              <span className="hidden md:inline">السلة</span>
              {cartCount > 0 ? (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">0</span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-900 rounded-lg md:hidden"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن نظارة، ماركة، سماعة..."
              className="w-full bg-slate-100 text-slate-800 text-sm rounded-xl py-2 pr-9 pl-4 border border-slate-200 outline-none focus:border-blue-600"
              id="search-input-mobile"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Desktop Category Navigation Tabs */}
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectCategory(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm shadow-blue-900/20'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50'
                  }`}
                  id={`nav-tab-${tab.id}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.name}</span>
                  {tab.badge && (
                    <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentInfo.city}</span>
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenVirtualTryOn(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 p-2.5 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold border border-blue-200"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>تجربة افتراضية</span>
            </button>
            <button
              onClick={() => { onOpenHearingTest(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-900 rounded-xl text-xs font-bold border border-amber-200"
            >
              <Ear className="w-4 h-4 text-amber-600" />
              <span>فحص السمع</span>
            </button>
            <button
              onClick={() => { onOpenAIConsultant(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 col-span-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>مستشار آزال الذكي للأشكال والمقاسات</span>
            </button>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 px-2 py-1">الأقسام الرئيسية</div>
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { onSelectCategory(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                  {tab.badge && (
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>هواتف المركز: {STORE_INFO.phone1} - {STORE_INFO.phone2}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>{STORE_INFO.address} - {STORE_INFO.city}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
