import {
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc
} from './firebase';
import { Product, HeroSlideItem, StoreInfo } from '../types';
import { PRODUCTS, DEFAULT_HERO_SLIDES, STORE_INFO } from '../data/products';

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'settings', 'ping');
    await setDoc(testDocRef, { ping: 'ok', timestamp: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore connection warning:', error);
    return false;
  }
}

/**
 * Subscribe to real-time products updates from Firestore.
 * Automatically seeds the database with initial products if collection is empty.
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const productsCol = collection(db, 'products');
  let hasCheckedInitial = false;

  const unsubscribe = onSnapshot(
    productsCol,
    async (snapshot) => {
      if (snapshot.empty && !hasCheckedInitial) {
        hasCheckedInitial = true;
        // Seed default products only on first empty check
        try {
          await seedInitialProducts();
        } catch (e) {
          console.warn('Error seeding initial products:', e);
        }
      } else {
        hasCheckedInitial = true;
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as Product;
          list.push({ ...item, id: docSnap.id });
        });
        onUpdate(list);
      }
    },
    (err) => {
      console.warn('Firestore products listener error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time hero slides updates from Firestore.
 */
export function subscribeToHeroSlides(
  onUpdate: (slides: HeroSlideItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const slidesCol = collection(db, 'heroSlides');
  let hasCheckedInitial = false;

  const unsubscribe = onSnapshot(
    slidesCol,
    async (snapshot) => {
      if (snapshot.empty && !hasCheckedInitial) {
        hasCheckedInitial = true;
        try {
          await seedInitialSlides();
        } catch (e) {
          console.warn('Error seeding initial slides:', e);
        }
      } else {
        hasCheckedInitial = true;
        const list: HeroSlideItem[] = [];
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as HeroSlideItem;
          list.push({ ...item, id: docSnap.id });
        });
        onUpdate(list);
      }
    },
    (err) => {
      console.warn('Firestore heroSlides listener error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time store info updates from Firestore.
 */
export function subscribeToStoreInfo(
  onUpdate: (info: StoreInfo) => void,
  onError?: (err: Error) => void
): () => void {
  const storeDoc = doc(db, 'settings', 'storeInfo');

  const unsubscribe = onSnapshot(
    storeDoc,
    async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(storeDoc, STORE_INFO);
        } catch (e) {
          console.warn('Error seeding store info:', e);
        }
      } else {
        const data = snapshot.data() as StoreInfo;
        onUpdate({ ...STORE_INFO, ...data });
      }
    },
    (err) => {
      console.warn('Firestore storeInfo listener error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a single product in Firestore.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const cleanId = product.id || `prod-${Date.now()}`;
  const prodDoc = doc(db, 'products', cleanId);
  const dataToSave = {
    ...product,
    id: cleanId,
    updatedAt: new Date().toISOString()
  };
  await setDoc(prodDoc, dataToSave, { merge: true });
}

/**
 * Delete a product from Firestore.
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const prodDoc = doc(db, 'products', productId);
    await deleteDoc(prodDoc);
  } catch (err) {
    console.warn('Failed to delete product from Firestore:', productId, err);
  }
}

/**
 * Save all products to Firestore (batch sync with full delete detection).
 */
export async function syncAllProductsToFirestore(products: Product[]): Promise<void> {
  try {
    const currentProdsSnap = await getDocs(collection(db, 'products'));
    const newIds = new Set(products.map(p => p.id));
    
    // 1. Delete items from Firestore that were removed by admin
    for (const docSnap of currentProdsSnap.docs) {
      if (!newIds.has(docSnap.id)) {
        try {
          await deleteDoc(docSnap.ref);
        } catch (e) {
          console.warn('Error deleting doc in Firestore:', docSnap.id, e);
        }
      }
    }

    // 2. Upsert all current products
    for (const product of products) {
      await saveProductToFirestore(product);
    }
  } catch (err) {
    console.warn('Error syncing products to Firestore:', err);
  }
}

/**
 * Save hero slides to Firestore (with full delete detection).
 */
export async function syncHeroSlidesToFirestore(slides: HeroSlideItem[]): Promise<void> {
  try {
    const currentSlidesSnap = await getDocs(collection(db, 'heroSlides'));
    const newIds = new Set(slides.map(s => s.id));
    
    for (const docSnap of currentSlidesSnap.docs) {
      if (!newIds.has(docSnap.id)) {
        try {
          await deleteDoc(docSnap.ref);
        } catch (e) {
          console.warn('Error deleting slide in Firestore:', docSnap.id, e);
        }
      }
    }

    for (const slide of slides) {
      const cleanId = slide.id || `slide-${Date.now()}`;
      const slideDoc = doc(db, 'heroSlides', cleanId);
      await setDoc(slideDoc, { ...slide, id: cleanId }, { merge: true });
    }
  } catch (err) {
    console.warn('Error syncing hero slides to Firestore:', err);
  }
}

export async function deleteHeroSlideFromFirestore(slideId: string): Promise<void> {
  try {
    const slideDoc = doc(db, 'heroSlides', slideId);
    await deleteDoc(slideDoc);
  } catch (err) {
    console.warn('Failed to delete slide from Firestore:', slideId, err);
  }
}

/**
 * Save store info to Firestore.
 */
export async function saveStoreInfoToFirestore(info: StoreInfo): Promise<void> {
  const storeDoc = doc(db, 'settings', 'storeInfo');
  await setDoc(storeDoc, { ...info, updatedAt: new Date().toISOString() }, { merge: true });
}

/**
 * Seed initial products.
 */
export async function seedInitialProducts(): Promise<void> {
  for (const p of PRODUCTS) {
    await saveProductToFirestore(p);
  }
}

/**
 * Seed initial slides.
 */
export async function seedInitialSlides(): Promise<void> {
  for (const s of DEFAULT_HERO_SLIDES) {
    const slideDoc = doc(db, 'heroSlides', s.id);
    await setDoc(slideDoc, s, { merge: true });
  }
}

/**
 * Master Reset function.
 */
export async function resetAllDataInFirestore(): Promise<void> {
  // 1. Delete all current products
  const prodsSnap = await getDocs(collection(db, 'products'));
  for (const docSnap of prodsSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  // 2. Delete all current slides
  const slidesSnap = await getDocs(collection(db, 'heroSlides'));
  for (const docSnap of slidesSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  // 3. Reseed
  await seedInitialProducts();
  await seedInitialSlides();
  await saveStoreInfoToFirestore(STORE_INFO);
}
