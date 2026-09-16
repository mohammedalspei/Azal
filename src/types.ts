export type CategoryType = 'all' | 'eyeglasses' | 'sunglasses' | 'contact-lenses' | 'hearing-aids' | 'accessories';

export type GenderType = 'men' | 'women' | 'unisex' | 'kids';

export type FrameShape = 'rectangular' | 'round' | 'aviator' | 'cat-eye' | 'geometric' | 'rimless' | 'square';

export type FrameMaterial = 'titanium' | 'acetate' | 'metal' | 'tr90' | 'wood-grain';

export interface LensOption {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  features: string[];
}

export interface PrescriptionData {
  type: 'manual' | 'upload' | 'later';
  odSph?: string;
  odCyl?: string;
  odAxis?: string;
  osSph?: string;
  osCyl?: string;
  osAxis?: string;
  pd?: string;
  prescriptionImage?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  brand: string;
  category: CategoryType;
  gender: GenderType;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: { name: string; hex: string; image?: string }[];
  frameShape?: FrameShape;
  material?: FrameMaterial;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  description: string;
  specs: {
    lensWidth?: number;
    bridgeWidth?: number;
    templeLength?: number;
    frameWidth?: number;
    weight?: string;
    warranty?: string;
    origin?: string;
    // Hearing aid specific specs
    channels?: number;
    batteryType?: string;
    bluetooth?: boolean;
    noiseReduction?: string;
    fittingRange?: string;
  };
  features: string[];
  tryOnFrameOverlaySvg?: string;
  frameColorCode?: string;
}

export interface CartItem {
  id: string; // unique item cart ID
  product: Product;
  selectedColor: { name: string; hex: string };
  selectedLens?: LensOption;
  prescription?: PrescriptionData;
  quantity: number;
  totalPrice: number;
}

export interface Appointment {
  id: string;
  fullName: string;
  phone: string;
  serviceType: 'eye-exam' | 'hearing-test' | 'glasses-fitting' | 'hearing-aid-maintenance' | 'contact-lens-consult';
  date: string;
  time: string;
  notes?: string;
  status: 'confirmed' | 'pending';
}

export interface HeroSlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  primaryBtnText: string;
  primaryCategory?: CategoryType;
  primaryActionType?: 'category' | 'virtual-tryon' | 'hearing-test' | 'appointment';
  secondaryBtnText: string;
  secondaryActionType?: 'category' | 'virtual-tryon' | 'hearing-test' | 'appointment';
  secondaryCategory?: CategoryType;
  bgGradient: string;
  bgImage?: string;
  image: string;
  floatingBadge?: {
    title: string;
    sub: string;
  };
  isActive?: boolean;
}

export interface StoreInfo {
  name: string;
  nameEn: string;
  tagline: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  address: string;
  city: string;
  workingHours: string;
  email: string;
  establishedYear: number;
  services: string[];
  storeImage?: string;
}

