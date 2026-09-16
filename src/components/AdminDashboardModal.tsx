import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Filter, 
  Check, 
  AlertTriangle, 
  Eye, 
  Layers, 
  Store, 
  Phone, 
  FileText, 
  Download, 
  RefreshCw, 
  LogOut,
  Tag,
  DollarSign,
  Glasses,
  Sun,
  Ear,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Product, CategoryType, GenderType, FrameShape, FrameMaterial, HeroSlideItem, StoreInfo } from '../types';
import { formatPrice, Currency, compressImageFile } from '../utils/helpers';
import { 
  saveProductToFirestore, 
  deleteProductFromFirestore, 
  deleteHeroSlideFromFirestore, 
  saveStoreInfoToFirestore 
} from '../lib/firestoreService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  heroSlides: HeroSlideItem[];
  onUpdateHeroSlides: (slides: HeroSlideItem[]) => void;
  storeInfo: StoreInfo;
  onUpdateStoreInfo: (info: StoreInfo) => void;
  onResetToDefaults: () => void;
  onForceCloudSync?: () => Promise<void>;
  currency: Currency;
}

type TabType = 'products' | 'offers' | 'images' | 'store' | 'backup';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  products,
  onUpdateProducts,
  heroSlides,
  onUpdateHeroSlides,
  storeInfo,
  onUpdateStoreInfo,
  onResetToDefaults,
  onForceCloudSync,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  
  // Product Edit / Add State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Offer / Slide Edit / Add State
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlideItem | null>(null);

  // Store Info Form State
  const [localStoreInfo, setLocalStoreInfo] = useState<StoreInfo>(storeInfo);
  const [storeSavedMessage, setStoreSavedMessage] = useState(false);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  if (!isOpen) return null;

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  // Product Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (isAddingProduct) {
      const newProduct: Product = {
        ...editingProduct,
        id: editingProduct.id || `prod-${Date.now()}`
      };
      onUpdateProducts([newProduct, ...products]);
      try {
        await saveProductToFirestore(newProduct);
      } catch (err) {
        console.warn('Firestore save product warning:', err);
      }
      showToast(`تمت إضافة المنتج "${newProduct.name}" بنجاح`);
    } else {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      try {
        await saveProductToFirestore(editingProduct);
      } catch (err) {
        console.warn('Firestore update product warning:', err);
      }
      showToast(`تم تحديث بيانات المنتج "${editingProduct.name}"`);
    }

    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleDeleteProductConfirmed = async () => {
    if (!productToDelete) return;
    const toDeleteId = productToDelete.id;
    const toDeleteName = productToDelete.name;

    // Immediate UI update
    onUpdateProducts(products.filter(p => p.id !== toDeleteId));
    setProductToDelete(null);
    showToast(`تم حذف المنتج "${toDeleteName}" بنجاح`);

    // Immediate Firestore deletion
    try {
      await deleteProductFromFirestore(toDeleteId);
    } catch (err) {
      console.warn('Firestore delete product warning:', err);
    }
  };

  const handleStartAddProduct = () => {
    const blankProduct: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      nameEn: '',
      brand: 'آزال',
      category: 'eyeglasses',
      gender: 'unisex',
      price: 25000,
      originalPrice: 30000,
      rating: 5.0,
      reviewCount: 1,
      images: [
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f68?auto=format&fit=crop&w=800&q=80'
      ],
      colors: [
        { name: 'أسود كلاسيكي', hex: '#0f172a' },
        { name: 'فضي لامع', hex: '#94a3b8' }
      ],
      frameShape: 'rectangular',
      material: 'titanium',
      isNew: true,
      isOnSale: false,
      isBestSeller: false,
      description: 'إطار عالي الجودة مصمم لتوفير أقصى درجات الراحة والأناقة اليومية.',
      specs: {
        lensWidth: 52,
        bridgeWidth: 18,
        templeLength: 140,
        weight: '12g',
        warranty: 'ضمان سنة كاملة'
      },
      features: ['خفيف الوزن ومقاوم للصدأ', 'وسادات أنف مريحة وسيليكونية']
    };
    setEditingProduct(blankProduct);
    setIsAddingProduct(true);
  };

  // Slides / Offers Handlers
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (isAddingSlide) {
      const newSlide: HeroSlideItem = {
        ...editingSlide,
        id: editingSlide.id || `slide-${Date.now()}`
      };
      onUpdateHeroSlides([...heroSlides, newSlide]);
      showToast(`تمت إضافة العرض "${newSlide.title}" بنجاح`);
    } else {
      onUpdateHeroSlides(heroSlides.map(s => s.id === editingSlide.id ? editingSlide : s));
      showToast(`تم تحديث بيانات العرض "${editingSlide.title}"`);
    }

    setEditingSlide(null);
    setIsAddingSlide(false);
  };

  const handleDeleteSlideConfirmed = async () => {
    if (!slideToDelete) return;
    if (heroSlides.length <= 1) {
      showToast('يجب إبقاء عرض واحد على الأقل في الواجهة');
      setSlideToDelete(null);
      return;
    }
    const toDeleteId = slideToDelete.id;
    onUpdateHeroSlides(heroSlides.filter(s => s.id !== toDeleteId));
    setSlideToDelete(null);
    showToast(`تم حذف العرض بنجاح`);
    try {
      await deleteHeroSlideFromFirestore(toDeleteId);
    } catch (err) {
      console.warn('Firestore delete slide warning:', err);
    }
  };

  const handleStartAddSlide = () => {
    const blankSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      badge: 'عرض جديد وحصري',
      badgeColor: 'bg-red-600',
      title: 'عنوان العرض الترويجي الجديد',
      subtitle: 'وصف العرض المميز والخصومات المتوفرة حالياً في مركز آزال',
      primaryBtnText: 'استكشف العرض الآن',
      primaryActionType: 'category',
      primaryCategory: 'eyeglasses',
      secondaryBtnText: 'تجربة افتراضية',
      secondaryActionType: 'virtual-tryon',
      bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
      image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f68?auto=format&fit=crop&w=1200&q=85',
      floatingBadge: {
        title: 'عرض محدود',
        sub: 'خصم يصل إلى 30%'
      },
      isActive: true
    };
    setEditingSlide(blankSlide);
    setIsAddingSlide(true);
  };

  // Store Info Save
  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreInfo(localStoreInfo);
    setStoreSavedMessage(true);
    showToast('تم تحديث بيانات المركز والتواصل بنجاح');
    try {
      await saveStoreInfoToFirestore(localStoreInfo);
    } catch (err) {
      console.warn('Firestore store info warning:', err);
    }
    setTimeout(() => setStoreSavedMessage(false), 3000);
  };

  // Image Upload Helper with Automatic Compression for Local Storage
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('جاري تحسين وضغط الصورة للحفظ السريع...');
      const compressedDataUrl = await compressImageFile(file, 650, 650, 0.70);
      callback(compressedDataUrl);
      showToast('تم رفع وحفظ الصورة بنجاح');
    } catch (err) {
      console.error('Image compression error:', err);
      // Fallback to basic file reader
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
          showToast('تم رفع ومعاينة الصورة بنجاح');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Export JSON
  const handleExportData = () => {
    const exportObject = {
      products,
      heroSlides,
      storeInfo,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `azal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير النسخة الاحتياطية بنجاح');
  };

  // Import JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products && Array.isArray(json.products)) {
          onUpdateProducts(json.products);
        }
        if (json.heroSlides && Array.isArray(json.heroSlides)) {
          onUpdateHeroSlides(json.heroSlides);
        }
        if (json.storeInfo) {
          onUpdateStoreInfo(json.storeInfo);
          setLocalStoreInfo(json.storeInfo);
        }
        showToast('تم استيراد وتطبيق البيانات بنجاح!');
      } catch (err) {
        alert('الملف غير صالح أو غير متوافق مع بيانات النظام.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" id="admin-dashboard-modal">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div 
        className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white font-tajawal">
                  لوحة تحكم إدارة مركز آزال
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600/30 text-red-400 border border-red-500/30 font-bold">
                  مدير النظام
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>متصل بالسيرفر (الحفظ فوري لجميع الزوار)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة الكتالوج، تغيير الصور، إضافة العروض وتعديل الأسعار والمواصفات (يتم التحديث مباشرة للزوار)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onForceCloudSync && (
              <button
                onClick={async () => {
                  setIsSyncingCloud(true);
                  try {
                    await onForceCloudSync();
                    showToast('تمت المزامنة السحابية الشاملة وحفظ كافة التعديلات لجميع الزوار بنجاح!');
                  } catch (e) {
                    showToast('تم إرسال التحديثات للسحابة');
                  } finally {
                    setIsSyncingCloud(false);
                  }
                }}
                disabled={isSyncingCloud}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition active:scale-95 disabled:opacity-50"
                title="نشر ومزامنة كافة التعديلات سحابياً لجميع الزوار"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'جاري النشر السحابي...' : 'مزامنة ونشر سحابي فوري'}</span>
              </button>
            )}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/90 px-4 sm:px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Glasses className="w-4 h-4" />
            <span>إدارة المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'offers'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>العروض والبنرات الرئيسية ({heroSlides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'images'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>مغير صور الموقع السريع</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'store'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>بيانات المركز والتواصل</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>النسخ الاحتياطي والاستعادة</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50">
          
          {/* ===================== TAB 1: PRODUCTS ===================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="بحث بالاسم أو الماركة..."
                      className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">كل الأقسام ({products.length})</option>
                    <option value="eyeglasses">نظارات طبية</option>
                    <option value="sunglasses">نظارات شمسية</option>
                    <option value="contact-lenses">عدسات لاصقة</option>
                    <option value="hearing-aids">قسم السمعيات</option>
                    <option value="accessories">إكسسوارات ومحاليل</option>
                  </select>
                </div>

                <button
                  onClick={handleStartAddProduct}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>

              {/* Products Table/Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col group"
                  >
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f68?auto=format&fit=crop&w=800&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
                          {product.category}
                        </span>
                        {product.isOnSale && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                            تخفيض
                          </span>
                        )}
                        {product.isNew && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            جديد
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono">
                        {product.images.length} صور
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] text-amber-400 font-bold">{product.brand}</div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{product.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white font-mono">
                            {formatPrice(product.price, currency)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-[10px] text-slate-500 line-through font-mono">
                              {formatPrice(product.originalPrice, currency)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct({ ...product });
                              setIsAddingProduct(false);
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 transition text-xs flex items-center gap-1"
                            title="تعديل المنتج"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">تعديل</span>
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <Glasses className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">لا توجد منتجات مطابقة لخيارات البحث</p>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: OFFERS & HERO SLIDES ===================== */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white">شرائح العروض الترويجية والبنرات</h2>
                  <p className="text-xs text-slate-400">تحكم بالصور والنصوص والروابط المعروضة في شريط العرض الرئيسي أعلى المتجر</p>
                </div>
                <button
                  onClick={handleStartAddSlide}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عرض جديد</span>
                </button>
              </div>

              <div className="space-y-4">
                {heroSlides.map((slide, idx) => (
                  <div 
                    key={slide.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-slate-700 transition"
                  >
                    <div className="w-full md:w-56 h-36 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 relative border border-slate-800">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-black/70">
                        شريحة #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 text-right w-full">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${slide.badgeColor}`}>
                          {slide.badge}
                        </span>
                        {slide.floatingBadge && (
                          <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {slide.floatingBadge.title} ({slide.floatingBadge.sub})
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{slide.title}</h3>
                      <p className="text-xs text-slate-400">{slide.subtitle}</p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>الزر الرئيسي: <strong className="text-slate-300">{slide.primaryBtnText}</strong></span>
                        <span>الزر الثانوي: <strong className="text-slate-300">{slide.secondaryBtnText}</strong></span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 w-full md:w-auto">
                      <button
                        onClick={() => {
                          setEditingSlide({ ...slide });
                          setIsAddingSlide(false);
                        }}
                        className="flex-1 md:flex-none px-3 py-2 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل العرض والصورة</span>
                      </button>
                      <button
                        onClick={() => setSlideToDelete(slide)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition flex items-center justify-center"
                        title="حذف العرض"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================== TAB 3: QUICK MEDIA / IMAGES CHANGER ===================== */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h2 className="text-sm font-bold text-white">مغير صور الموقع السريع</h2>
                <p className="text-xs text-slate-400">
                  يمكنك استبدال أي صورة في المتجر أو صورة المعرض والفرع مباشرة عبر رفع صورة من جهازك أو وضع رابط.
                </p>
              </div>

              {/* Store & Showroom Main Photo */}
              <div className="space-y-3 bg-gradient-to-r from-blue-950/40 via-slate-950 to-slate-950 p-5 rounded-2xl border-2 border-blue-600/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>صورة المعرض والفرع الرئيسي المعتمد (مركز آزال)</span>
                    </h3>
                    <p className="text-xs text-slate-400">الصورة المعروضة في قسم تعريف المركز والفرع المعتمد بالصفحة الرئيسية</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-lg transition">
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة جديدة للمعرض</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                          const updated = { ...localStoreInfo, storeImage: newUrl };
                          setLocalStoreInfo(updated);
                          onUpdateStoreInfo(updated);
                          showToast('تم تحديث صورة الفرع والمعرض بنجاح!');
                        })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
                  <div className="md:col-span-6 relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl">
                    <img
                      src={localStoreInfo.storeImage || "/src/assets/images/azal_store_hero_1787843974970.jpg"}
                      alt="معرض مركز آزال"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      الفرع الرئيسي المعتمد
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">أو ضع رابط مباشر لصورة المعرض (URL):</label>
                      <input
                        type="text"
                        value={localStoreInfo.storeImage || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = { ...localStoreInfo, storeImage: val };
                          setLocalStoreInfo(updated);
                          onUpdateStoreInfo(updated);
                        }}
                        placeholder="/src/assets/images/azal_store_hero_... أو رابط مباشر"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newUrl = prompt('ضع رابط الصورة الجديد لمعرض المركز:', localStoreInfo.storeImage || '');
                        if (newUrl && newUrl.trim()) {
                          const updated = { ...localStoreInfo, storeImage: newUrl.trim() };
                          setLocalStoreInfo(updated);
                          onUpdateStoreInfo(updated);
                          showToast('تم تحديث صورة المعرض بنجاح!');
                        }
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>تعديل الرابط المباشر</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Images Gallery Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  صور المنتجات ({products.length} منتج)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white">
                          {product.category}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">{product.name}</div>
                      
                      <div className="flex items-center gap-1.5 pt-1">
                        <label className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-slate-700 transition">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>رفع صورة جديدة</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                              const updated = products.map(p => p.id === product.id ? {
                                ...p,
                                images: [newUrl, ...p.images.slice(1)]
                              } : p);
                              onUpdateProducts(updated);
                            })}
                          />
                        </label>
                        <button
                          onClick={() => {
                            const newUrl = prompt('ضع رابط الصورة الجديد (URL):', product.images[0]);
                            if (newUrl && newUrl.trim()) {
                              const updated = products.map(p => p.id === product.id ? {
                                ...p,
                                images: [newUrl.trim(), ...p.images.slice(1)]
                              } : p);
                              onUpdateProducts(updated);
                              showToast('تم تحديث رابط الصورة بنجاح');
                            }
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="تعديل الرابط"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Banner Images */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  صور شرائح الواجهة الرئيسية (Hero Slides)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {heroSlides.map((slide, idx) => (
                    <div key={slide.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white">
                          شريحة #{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">{slide.title}</div>
                      
                      <div className="flex items-center gap-1.5 pt-1">
                        <label className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-slate-700 transition">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>رفع صورة للبنر</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                              const updated = heroSlides.map(s => s.id === slide.id ? { ...s, image: newUrl } : s);
                              onUpdateHeroSlides(updated);
                            })}
                          />
                        </label>
                        <button
                          onClick={() => {
                            const newUrl = prompt('ضع رابط الصورة الجديد (URL):', slide.image);
                            if (newUrl && newUrl.trim()) {
                              const updated = heroSlides.map(s => s.id === slide.id ? { ...s, image: newUrl.trim() } : s);
                              onUpdateHeroSlides(updated);
                              showToast('تم تحديث صورة البنر');
                            }
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="تعديل الرابط"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ===================== TAB 4: STORE INFO ===================== */}
          {activeTab === 'store' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">بيانات المركز والتواصل الرسمية</h2>
                  <p className="text-xs text-slate-400">تعديل أرقام الهواتف، الواتساب، العنوان، وساعات العمل</p>
                </div>
                {storeSavedMessage && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم الحفظ</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveStoreInfo} className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">اسم المركز (بالعربية)</label>
                    <input
                      type="text"
                      value={localStoreInfo.name}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">اسم المركز (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={localStoreInfo.nameEn}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, nameEn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">الشعار التعريفي (Tagline)</label>
                  <input
                    type="text"
                    value={localStoreInfo.tagline}
                    onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">رقم الهاتف 1 (الثابت أو النقال)</label>
                    <input
                      type="text"
                      value={localStoreInfo.phone1}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, phone1: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">رقم الهاتف 2</label>
                    <input
                      type="text"
                      value={localStoreInfo.phone2}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, phone2: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">رقم الواتساب مع المفتاح الدولي</label>
                    <input
                      type="text"
                      value={localStoreInfo.whatsapp}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">العنوان والموقع</label>
                    <input
                      type="text"
                      value={localStoreInfo.address}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">المدينة / الدولة</label>
                    <input
                      type="text"
                      value={localStoreInfo.city}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">ساعات الدوام والعمل</label>
                    <input
                      type="text"
                      value={localStoreInfo.workingHours}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, workingHours: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={localStoreInfo.email}
                      onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Store Showcase Image */}
                <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400">صورة الفرع والمعرض الرئيسي</label>
                    <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>رفع صورة جديدة للمعرض</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                          setLocalStoreInfo({ ...localStoreInfo, storeImage: newUrl });
                        })}
                      />
                    </label>
                  </div>

                  <div className="relative aspect-video max-h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                    <img
                      src={localStoreInfo.storeImage || "/src/assets/images/azal_store_hero_1787843974970.jpg"}
                      alt="معرض المركز"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <input
                    type="text"
                    value={localStoreInfo.storeImage || ''}
                    onChange={(e) => setLocalStoreInfo({ ...localStoreInfo, storeImage: e.target.value })}
                    placeholder="رابط الصورة المباشر أو ارفع من جهازك أعلاه"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ بيانات المركز</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* ===================== TAB 5: BACKUP & RESET ===================== */}
          {activeTab === 'backup' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Notice about Active Firebase Firestore Cloud Storage */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-5 space-y-3 text-right">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">قاعدة البيانات السحابية المركزية (Firebase Firestore) نشطة</h3>
                    <p className="text-xs text-emerald-300">مزامنة سحابية حية لجميع الزوار على مدار الساعة</p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <p>
                    • أي تعديل، حذف، أو إضافة منتج، صورة، بانر إعلاني، أو سعر تقوم به في لوحة الإدارة يتم حفظه سحابياً في <strong className="text-emerald-400">Firebase Firestore</strong> فوراً، ويظهر في نفس اللحظة لأي زائر يفتح الموقع من أي هاتف أو جهاز.
                  </p>
                  <p>
                    • يمكنك أيضاً تنزيل نسخة احتياطية محلية (JSON) على جهازك في أي وقت كإجراء أمان إضافي.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">تصدير واستيراد البيانات (JSON)</h3>
                    <p className="text-xs text-slate-400">حفظ نسخة احتياطية لجميع التعديلات على جهازك أو استعادتها لاحقاً</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleExportData}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>تنزيل نسخة احتياطية (JSON)</span>
                  </button>

                  <label className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>استيراد ملف نسخة احتياطية</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to defaults */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-400">إعادة تعيين البيانات الافتراضية للموقع</h3>
                    <p className="text-xs text-slate-400">إرجاع المنتجات والشرائح والبيانات إلى حالتها الأولية الأصلية</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  تنبيه: سيؤدي هذا الإجراء إلى حذف كافة التعديلات المدخلة محلياً واستعادة كتالوج المنتجات الأصلي.
                </p>

                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من رغبتك في استعادة كافة البيانات الافتراضية للمتجر؟')) {
                      onResetToDefaults();
                      showToast('تمت استعادة البيانات الافتراضية بنجاح');
                    }
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>استعادة الضبط الأصلي (Factory Reset)</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ==================== PRODUCT EDIT / ADD MODAL ==================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-right shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-bold text-white font-tajawal flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>{isAddingProduct ? 'إضافة منتج جديد للكتالوج' : `تعديل المنتج: ${editingProduct.name}`}</span>
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">اسم المنتج بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="مثال: إطار آزال تيتانيوم بريميوم"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">اسم المنتج بالإنجليزية</label>
                  <input
                    type="text"
                    value={editingProduct.nameEn}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                    placeholder="e.g. Azal Titanium Premium"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">الماركة / البراند *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="مثال: آزال، راي بان، فوناك"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">القسم الرئيسي *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="eyeglasses">نظارات طبية (Eyeglasses)</option>
                    <option value="sunglasses">نظارات شمسية (Sunglasses)</option>
                    <option value="contact-lenses">عدسات لاصقة (Contact Lenses)</option>
                    <option value="hearing-aids">قسم السمعيات (Hearing Aids)</option>
                    <option value="accessories">إكسسوارات ومحاليل (Accessories)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">الفئة المستهدفة</label>
                  <select
                    value={editingProduct.gender}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as GenderType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="unisex">للجنسين (Unisex)</option>
                    <option value="men">رجالي (Men)</option>
                    <option value="women">نسائي (Women)</option>
                    <option value="kids">أطفال (Kids)</option>
                  </select>
                </div>
              </div>

              {/* Price & Sale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">السعر الفعلي (بالريال اليمني) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-amber-500 outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">السعر الأصلي قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="إذا كان هناك تخفيض"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-amber-500 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Images Manager */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>صور المنتج (يمكنك رفع صور متعددة أو إدخال روابط)</span>
                  </label>
                  
                  <label className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                        setEditingProduct({
                          ...editingProduct,
                          images: [...editingProduct.images, newUrl]
                        });
                      })}
                    />
                  </label>
                </div>

                {/* Images list preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {editingProduct.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-700 group">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newUrl = prompt('تعديل رابط الصورة:', imgUrl);
                            if (newUrl) {
                              const newImgs = [...editingProduct.images];
                              newImgs[idx] = newUrl;
                              setEditingProduct({ ...editingProduct, images: newImgs });
                            }
                          }}
                          className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-amber-600"
                          title="تعديل الرابط"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {editingProduct.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct({
                                ...editingProduct,
                                images: editingProduct.images.filter((_, i) => i !== idx)
                              });
                            }}
                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {idx === 0 && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[9px]">
                          الرئيسية
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('أدخل رابط الصورة (URL):');
                      if (url && url.trim()) {
                        setEditingProduct({
                          ...editingProduct,
                          images: [...editingProduct.images, url.trim()]
                        });
                      }
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة رابط صورة خارجي (URL)</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">وصف المنتج</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="اكتب وصفاً مفصلاً للمنتج ومميزاته وفوائده..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Tags & Badges */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isNew}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isNew: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>تمييز كمنتج جديد (New)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isOnSale}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isOnSale: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>عرض تخفيض خاص (On Sale)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isBestSeller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>الأكثر مبيعاً (Best Seller)</span>
                </label>
              </div>

              {/* Specs & Features */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">الضمان</label>
                  <input
                    type="text"
                    value={editingProduct.specs.warranty || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      specs: { ...editingProduct.specs, warranty: e.target.value }
                    })}
                    placeholder="مثال: سنتان معتمدة"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">الوزن</label>
                  <input
                    type="text"
                    value={editingProduct.specs.weight || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      specs: { ...editingProduct.specs, weight: e.target.value }
                    })}
                    placeholder="مثال: 9.5 جرام"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">بلد المنشأ</label>
                  <input
                    type="text"
                    value={editingProduct.specs.origin || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      specs: { ...editingProduct.specs, origin: e.target.value }
                    })}
                    placeholder="مثال: اليابان / سويسرا"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المنتج في المتجر</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================== SLIDE / OFFER EDIT / ADD MODAL ==================== */}
      {editingSlide && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-right shadow-2xl">
            
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-bold text-white font-tajawal flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isAddingSlide ? 'إضافة عرض ترويجي جديد' : 'تعديل الشريحة والعرض'}</span>
              </h2>
              <button
                onClick={() => setEditingSlide(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">شارة العرض (Badge)</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.badge}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    placeholder="مثال: عرض الصيف الحصري"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">لون خلفية الشارة</label>
                  <select
                    value={editingSlide.badgeColor}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badgeColor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="bg-red-600">أحمر (Red)</option>
                    <option value="bg-amber-600">ذهبي / كهرماني (Amber)</option>
                    <option value="bg-blue-600">أزرق ملوكي (Blue)</option>
                    <option value="bg-emerald-600">أخضر زمردي (Emerald)</option>
                    <option value="bg-indigo-600">بنفسجي نيلي (Indigo)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">عنوان العرض الرئيسي *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  placeholder="مثال: خصم 40% على جميع الإطارات الطبية"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">الوصف الفرعي للعرض</label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  placeholder="تفاصيل العرض والمميزات الإضافية..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Slide Image & Background */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foreground Image */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400">صورة المنتج / العرض (الجانبية)</label>
                    <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 transition">
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>رفع</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                          setEditingSlide({ ...editingSlide, image: newUrl });
                        })}
                      />
                    </label>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <img src={editingSlide.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  <input
                    type="text"
                    value={editingSlide.image}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    placeholder="رابط الصورة (URL)"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Background Image */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-400">خلفية الشريحة (صورة المعرض)</label>
                    <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 transition">
                      <Upload className="w-3 h-3 text-blue-400" />
                      <span>رفع</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (newUrl) => {
                          setEditingSlide({ ...editingSlide, bgImage: newUrl });
                        })}
                      />
                    </label>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <img 
                      src={editingSlide.bgImage || "/src/assets/images/azal_store_hero_1787843974970.jpg"} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>

                  <input
                    type="text"
                    value={editingSlide.bgImage || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, bgImage: e.target.value })}
                    placeholder="افتراضي: صورة مركز آزال أو رابط صورة مخصص"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Actions & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">نص الزر الأساسي</label>
                  <input
                    type="text"
                    value={editingSlide.primaryBtnText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, primaryBtnText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">وجهة الزر الأساسي</label>
                  <select
                    value={editingSlide.primaryCategory || 'eyeglasses'}
                    onChange={(e) => setEditingSlide({
                      ...editingSlide,
                      primaryActionType: 'category',
                      primaryCategory: e.target.value as CategoryType
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="eyeglasses">قسم النظارات الطبية</option>
                    <option value="sunglasses">قسم النظارات الشمسية</option>
                    <option value="contact-lenses">قسم العدسات اللاصقة</option>
                    <option value="hearing-aids">قسم السمعيات وأجهزة السمع</option>
                    <option value="accessories">قسم الإكسسوارات والمحاليل</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ العرض</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================== DELETE PRODUCT CONFIRMATION ==================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 text-right shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد حذف المنتج</h3>
              <p className="text-xs text-slate-300">
                هل أنت متأكد من رغبتك في حذف المنتج: <strong className="text-red-400">"{productToDelete.name}"</strong>؟
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteProductConfirmed}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-950/60"
              >
                نعم، احذف المنتج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE SLIDE CONFIRMATION ==================== */}
      {slideToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 text-right shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد حذف العرض</h3>
              <p className="text-xs text-slate-300">
                هل أنت متأكد من حذف هذا العرض الترويجي: <strong className="text-red-400">"{slideToDelete.title}"</strong>؟
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSlideToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteSlideConfirmed}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-950/60"
              >
                نعم، احذف العرض
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
