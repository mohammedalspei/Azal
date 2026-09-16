import React, { useState, useMemo, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { VirtualTryOn } from './components/VirtualTryOn';
import { HearingTest } from './components/HearingTest';
import { AIConsultantModal } from './components/AIConsultantModal';
import { AppointmentModal } from './components/AppointmentModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { StoreLocationInfo } from './components/StoreLocationInfo';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';

import { PRODUCTS, STORE_INFO, DEFAULT_HERO_SLIDES } from './data/products';
import { Product, CategoryType, GenderType, CartItem, FrameShape, FrameMaterial, HeroSlideItem, StoreInfo } from './types';
import { Currency, formatPrice, safeLocalStorageSet } from './utils/helpers';
import { db, doc, onSnapshot, setDoc } from './lib/firebase';
import {
  subscribeToProducts,
  subscribeToHeroSlides,
  subscribeToStoreInfo,
  syncAllProductsToFirestore,
  syncHeroSlidesToFirestore,
  saveStoreInfoToFirestore,
  resetAllDataInFirestore,
  testFirestoreConnection
} from './lib/firestoreService';
import { 
  Filter, 
  Sparkles, 
  ShoppingBag, 
  Camera, 
  Ear, 
  Calendar, 
  SlidersHorizontal, 
  Check, 
  X,
  Phone,
  Heart,
  Glasses
} from 'lucide-react';

export default function App() {
  // Central Data States with LocalStorage Persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('azal_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => {
    try {
      const saved = localStorage.getItem('azal_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_HERO_SLIDES;
    } catch {
      return DEFAULT_HERO_SLIDES;
    }
  });

  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    try {
      const saved = localStorage.getItem('azal_store_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...STORE_INFO, ...parsed };
      }
      return STORE_INFO;
    } catch {
      return STORE_INFO;
    }
  });

  // Admin Auth & Modal States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('azal_admin_auth') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Navigation & Category State
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Currency State
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('azal_currency') as Currency) || 'YER';
  });

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('azal_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('azal_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVirtualTryOnOpen, setIsVirtualTryOnOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [isHearingTestOpen, setIsHearingTestOpen] = useState(false);
  const [isAIConsultantOpen, setIsAIConsultantOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Real-time Firestore & Cloud Synchronization for All Visitors & Devices
  useEffect(() => {
    // 1. Test connection
    testFirestoreConnection();

    // 2. Subscribe to real-time products
    const unsubProducts = subscribeToProducts((newProds) => {
      if (Array.isArray(newProds)) {
        setProducts(newProds);
        safeLocalStorageSet('azal_products', newProds);
      }
    });

    // 3. Subscribe to real-time hero slides
    const unsubSlides = subscribeToHeroSlides((newSlides) => {
      if (Array.isArray(newSlides)) {
        setHeroSlides(newSlides);
        safeLocalStorageSet('azal_hero_slides', newSlides);
      }
    });

    // 4. Subscribe to real-time store info
    const unsubStore = subscribeToStoreInfo((newInfo) => {
      if (newInfo && typeof newInfo === 'object') {
        setStoreInfo(newInfo);
        safeLocalStorageSet('azal_store_info', newInfo);
      }
    });

    // Fallback: Also fetch server REST endpoint
    async function loadServerData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (Array.isArray(data.products) && data.products.length > 0) {
              setProducts(prev => (prev.length > 0 ? prev : data.products));
            }
            if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
              setHeroSlides(prev => (prev.length > 0 ? prev : data.heroSlides));
            }
            if (data.storeInfo && typeof data.storeInfo === 'object') {
              setStoreInfo(prev => prev || data.storeInfo);
            }
          }
        }
      } catch {
        // Silently use local cache and Firestore
      }
    }
    loadServerData();

    return () => {
      unsubProducts();
      unsubSlides();
      unsubStore();
    };
  }, []);

  // Sync to LocalStorage safely
  useEffect(() => {
    safeLocalStorageSet('azal_products', products);
  }, [products]);

  useEffect(() => {
    safeLocalStorageSet('azal_hero_slides', heroSlides);
  }, [heroSlides]);

  useEffect(() => {
    safeLocalStorageSet('azal_store_info', storeInfo);
  }, [storeInfo]);

  useEffect(() => {
    safeLocalStorageSet('azal_currency', currency);
  }, [currency]);

  useEffect(() => {
    safeLocalStorageSet('azal_cart', cartItems);
  }, [cartItems]);

  useEffect(() => {
    safeLocalStorageSet('azal_wishlist', wishlist);
  }, [wishlist]);

  // Universal Cloud (Firestore) & Server synchronization helper
  const syncWithCloudAndServer = async (
    newProducts?: Product[],
    newSlides?: HeroSlideItem[],
    newStoreInfo?: StoreInfo
  ) => {
    const prodsToSync = newProducts || products;
    const slidesToSync = newSlides || heroSlides;
    const infoToSync = newStoreInfo || storeInfo;

    // 1. Sync to Firebase Cloud Firestore collections
    try {
      if (newProducts) {
        await syncAllProductsToFirestore(newProducts);
      }
      if (newSlides) {
        await syncHeroSlidesToFirestore(newSlides);
      }
      if (newStoreInfo) {
        await saveStoreInfoToFirestore(newStoreInfo);
      }
    } catch (firebaseErr) {
      console.warn('Firebase sync error:', firebaseErr);
    }

    // 2. Sync to Server REST API & DB file (silent non-blocking)
    try {
      await fetch('/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: prodsToSync,
          heroSlides: slidesToSync,
          storeInfo: infoToSync,
          updatedAt: new Date().toISOString()
        })
      });
    } catch {
      // Non-blocking
    }
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    safeLocalStorageSet('azal_products', newProducts);
    syncWithCloudAndServer(newProducts, undefined, undefined);
  };

  const handleUpdateHeroSlides = (newSlides: HeroSlideItem[]) => {
    setHeroSlides(newSlides);
    safeLocalStorageSet('azal_hero_slides', newSlides);
    syncWithCloudAndServer(undefined, newSlides, undefined);
  };

  const handleUpdateStoreInfo = (newStoreInfo: StoreInfo) => {
    setStoreInfo(newStoreInfo);
    safeLocalStorageSet('azal_store_info', newStoreInfo);
    syncWithCloudAndServer(undefined, undefined, newStoreInfo);
  };

  const handleForceCloudSync = async () => {
    await syncAllProductsToFirestore(products);
    await syncHeroSlidesToFirestore(heroSlides);
    await saveStoreInfoToFirestore(storeInfo);
    try {
      await fetch('/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          heroSlides,
          storeInfo,
          updatedAt: new Date().toISOString()
        })
      });
    } catch (err) {
      console.warn('Server sync backup error:', err);
    }
  };

  // Admin Handlers
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
    localStorage.removeItem('azal_admin_auth');
  };

  const handleResetToDefaults = async () => {
    setProducts(PRODUCTS);
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setStoreInfo(STORE_INFO);
    safeLocalStorageSet('azal_products', PRODUCTS);
    safeLocalStorageSet('azal_hero_slides', DEFAULT_HERO_SLIDES);
    safeLocalStorageSet('azal_store_info', STORE_INFO);
    try {
      await resetAllDataInFirestore();
    } catch (fbErr) {
      console.warn('Firestore reset warning:', fbErr);
    }
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch (err) {
      console.error('Reset data error:', err);
    }
  };


  // Wishlist handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  // Cart handlers
  const handleAddToCart = (newItem: Omit<CartItem, 'id'>) => {
    const itemWithId: CartItem = {
      ...newItem,
      id: `${newItem.product.id}-${newItem.selectedColor.name}-${newItem.selectedLens?.id || 'none'}-${Date.now()}`
    };
    setCartItems((prev) => [...prev, itemWithId]);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const unitPrice = item.totalPrice / item.quantity;
          return {
            ...item,
            quantity: newQty,
            totalPrice: unitPrice * newQty
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
  };

  // Open Try-On with specific product
  const handleOpenQuickTryOn = (product: Product) => {
    setTryOnProduct(product);
    setIsVirtualTryOnOpen(true);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category Filter
      if (activeCategory !== 'all' && p.category !== activeCategory) {
        return false;
      }

      // 2. Gender Filter
      if (selectedGender !== 'all' && p.gender !== selectedGender && p.gender !== 'unisex') {
        return false;
      }

      // 3. Frame Shape Filter
      if (selectedShape !== 'all' && p.frameShape !== selectedShape) {
        return false;
      }

      // 4. Material Filter
      if (selectedMaterial !== 'all' && p.material !== selectedMaterial) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [products, activeCategory, selectedGender, selectedShape, selectedMaterial, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedGender('all');
    setSelectedShape('all');
    setSelectedMaterial('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedGender !== 'all' || selectedShape !== 'all' || selectedMaterial !== 'all' || searchQuery !== '';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-tajawal">
      
      {/* 1. Main Header */}
      <Header
        storeInfo={storeInfo}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAppointment={() => setIsAppointmentOpen(true)}
        onOpenVirtualTryOn={() => {
          setTryOnProduct(null);
          setIsVirtualTryOnOpen(true);
        }}
        onOpenHearingTest={() => setIsHearingTestOpen(true)}
        onOpenAIConsultant={() => setIsAIConsultantOpen(true)}
        currency={currency}
        onChangeCurrency={setCurrency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Body */}
      <main className="flex-1 space-y-4">
        
        {/* 2. Hero Slider Banner (Show if no search query & in main views) */}
        {!searchQuery && (
          <HeroSlider
            slides={heroSlides}
            onSelectCategory={setActiveCategory}
            onOpenVirtualTryOn={() => {
              setTryOnProduct(null);
              setIsVirtualTryOnOpen(true);
            }}
            onOpenHearingTest={() => setIsHearingTestOpen(true)}
            onOpenAppointment={() => setIsAppointmentOpen(true)}
          />
        )}

        {/* 3. Category Navigation Cards */}
        <CategoryNav
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onOpenVirtualTryOn={() => {
            setTryOnProduct(null);
            setIsVirtualTryOnOpen(true);
          }}
          onOpenHearingTest={() => setIsHearingTestOpen(true)}
        />

        {/* 4. Products Catalog Section with Filters */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="products-catalog-section">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-tajawal flex items-center gap-2">
                <span>
                  {activeCategory === 'all' ? 'جميع معروضات المركز' :
                   activeCategory === 'eyeglasses' ? 'النظارات الطبية وإطارات التيتانيوم' :
                   activeCategory === 'sunglasses' ? 'النظارات الشمسية الفاخرة المستقطبة' :
                   activeCategory === 'contact-lenses' ? 'العدسات اللاصقة الطبية والتجميلية' :
                   activeCategory === 'hearing-aids' ? 'قسم السمعيات وأجهزة السمع الرقمية' : 'إكسسوارات ومحاليل العناية'}
                </span>
                <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} منتج
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-700 font-semibold mt-1 flex items-center gap-2">
                <span>✨ الفحص مجاناً 100% (نظر وسمع) + خصم خاص 30% لطلبات والتواصل عبر الموقع</span>
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">الترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 shadow-xs"
                id="sort-select"
              >
                <option value="featured">الأكثر تميزاً ومبيعاً</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>
          </div>

          {/* Filtering Controls Bar */}
          <div className="py-4 flex items-center justify-between flex-wrap gap-3">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>تصفية:</span>
              </span>

              {/* Gender Filter */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setSelectedGender('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedGender === 'all' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setSelectedGender('men')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedGender === 'men' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  رجالي
                </button>
                <button
                  onClick={() => setSelectedGender('women')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedGender === 'women' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  نسائي
                </button>
                <button
                  onClick={() => setSelectedGender('kids')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedGender === 'kids' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  أطفال
                </button>
              </div>

              {/* Shape Filter for Eyewear */}
              {(activeCategory === 'all' || activeCategory === 'eyeglasses' || activeCategory === 'sunglasses') && (
                <select
                  value={selectedShape}
                  onChange={(e) => setSelectedShape(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">جميع أشكال الإطارات</option>
                  <option value="rectangular">مستطيل / مربع</option>
                  <option value="round">دائري كلاسيك</option>
                  <option value="aviator">أفياتور طيارين</option>
                  <option value="cat-eye">عين القطة (Cat-Eye)</option>
                  <option value="geometric">هندسي أوفرسايز</option>
                </select>
              )}

              {/* Material Filter */}
              {(activeCategory === 'all' || activeCategory === 'eyeglasses' || activeCategory === 'sunglasses') && (
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">جميع الخامات</option>
                  <option value="titanium">تيتانيوم ياباني خفيف</option>
                  <option value="acetate">أسيتات إيطالي فاخر</option>
                  <option value="metal">معدن مقوى وروز جولد</option>
                  <option value="tr90">سيليكون TR90 مرن للأطفال</option>
                </select>
              )}

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-xl transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إلغاء التصفية</span>
                </button>
              )}
            </div>

          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Glasses className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">لم نجد منتجات مطابقة لبحثك</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية لعرض جميع النظارات والأجهزة
              </p>
              <button
                onClick={resetFilters}
                className="bg-blue-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-blue-800"
              >
                إعادة ضبط خيارات البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  isWishlisted={isWishlisted(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={setSelectedProduct}
                  onQuickTryOn={handleOpenQuickTryOn}
                />
              ))}
            </div>
          )}

        </section>

        {/* 5. Center Information, Real Photo Showcase & Reviews */}
        <StoreLocationInfo 
          storeInfo={storeInfo}
          onOpenAppointment={() => setIsAppointmentOpen(true)} 
        />

      </main>

      {/* 6. Footer */}
      <Footer
        storeInfo={storeInfo}
        onSelectCategory={setActiveCategory}
        onOpenVirtualTryOn={() => {
          setTryOnProduct(null);
          setIsVirtualTryOnOpen(true);
        }}
        onOpenHearingTest={() => setIsHearingTestOpen(true)}
        onOpenAppointment={() => setIsAppointmentOpen(true)}
        onOpenAIConsultant={() => setIsAIConsultantOpen(true)}
        onOpenAdminLogin={handleOpenAdmin}
      />

      {/* Floating Bottom Bar for Quick Mobile Access */}
      <div className="fixed bottom-3 right-3 left-3 md:hidden z-30 bg-slate-950/90 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-2xl flex items-center justify-around text-white text-[11px] font-bold">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl ${
            activeCategory === 'all' ? 'text-blue-400' : 'text-slate-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>المتجر</span>
        </button>

        <button
          onClick={() => {
            setTryOnProduct(null);
            setIsVirtualTryOnOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-300 hover:text-white"
        >
          <Camera className="w-4 h-4 text-blue-400" />
          <span>تجربة حية</span>
        </button>

        <button
          onClick={() => setIsHearingTestOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-300 hover:text-white"
        >
          <Ear className="w-4 h-4 text-amber-400" />
          <span>فحص السمع</span>
        </button>

        <button
          onClick={() => setIsAppointmentOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-red-400 font-extrabold"
        >
          <Calendar className="w-4 h-4" />
          <span>حجز فحص</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-300"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>السلة</span>
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-1 bg-red-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Modals & Drawers */}
      
      {/* Product Customizer & Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenVirtualTryOn={handleOpenQuickTryOn}
          isWishlisted={isWishlisted(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          storeInfo={storeInfo}
        />
      )}

      {/* Virtual Try-On Studio Modal */}
      {isVirtualTryOnOpen && (
        <VirtualTryOn
          initialProduct={tryOnProduct}
          currency={currency}
          onClose={() => {
            setIsVirtualTryOnOpen(false);
            setTryOnProduct(null);
          }}
          onSelectProductToCart={(product) => {
            setIsVirtualTryOnOpen(false);
            setSelectedProduct(product);
          }}
        />
      )}

      {/* Hearing Test Screener Modal */}
      {isHearingTestOpen && (
        <HearingTest
          onClose={() => setIsHearingTestOpen(false)}
          storeInfo={storeInfo}
          onOpenAppointment={() => {
            setIsHearingTestOpen(false);
            setIsAppointmentOpen(true);
          }}
        />
      )}

      {/* AI Face Shape & Hearing Consultant Modal */}
      {isAIConsultantOpen && (
        <AIConsultantModal
          onClose={() => setIsAIConsultantOpen(false)}
          onSelectProduct={(product) => {
            setIsAIConsultantOpen(false);
            setSelectedProduct(product);
          }}
          onOpenVirtualTryOn={(product) => {
            setIsAIConsultantOpen(false);
            handleOpenQuickTryOn(product);
          }}
        />
      )}

      {/* Appointment Booking Modal */}
      {isAppointmentOpen && (
        <AppointmentModal
          onClose={() => setIsAppointmentOpen(false)}
          storeInfo={storeInfo}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        storeInfo={storeInfo}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currency={currency}
        storeInfo={storeInfo}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        currency={currency}
        onRemoveFromWishlist={handleToggleWishlist}
        onSelectProduct={(product) => {
          setIsWishlistOpen(false);
          setSelectedProduct(product);
        }}
        onOpenVirtualTryOn={(product) => {
          setIsWishlistOpen(false);
          handleOpenQuickTryOn(product);
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={products}
        heroSlides={heroSlides}
        storeInfo={storeInfo}
        currency={currency}
        onUpdateProducts={handleUpdateProducts}
        onUpdateHeroSlides={handleUpdateHeroSlides}
        onUpdateStoreInfo={handleUpdateStoreInfo}
        onResetToDefaults={handleResetToDefaults}
        onForceCloudSync={handleForceCloudSync}
        onLogout={handleAdminLogout}
      />

    </div>
  );
}
