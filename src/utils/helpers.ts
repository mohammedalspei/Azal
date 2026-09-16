export type Currency = 'YER' | 'SAR' | 'USD';

export const CURRENCY_RATES: Record<Currency, { symbol: string; symbolAr: string; nameAr: string; yerRate: number }> = {
  YER: { symbol: 'YR', symbolAr: 'ر.ي', nameAr: 'ريال يمني (العملة الجديدة)', yerRate: 1 },
  SAR: { symbol: 'SAR', symbolAr: 'ر.س', nameAr: 'ريال سعودي', yerRate: 430 },
  USD: { symbol: '$', symbolAr: '$', nameAr: 'دولار أمريكي', yerRate: 1600 }
};

export function formatPrice(priceInYER: number, currency: Currency = 'YER'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.YER;
  if (currency === 'YER') {
    return `${Math.round(priceInYER).toLocaleString('en-US')} ${info.symbolAr}`;
  } else if (currency === 'SAR') {
    const val = priceInYER / info.yerRate;
    const formatted = val >= 100 || Number.isInteger(val) ? Math.round(val).toLocaleString('en-US') : val.toFixed(1);
    return `${formatted} ${info.symbolAr}`;
  } else {
    const val = priceInYER / info.yerRate;
    const formatted = val >= 100 || Number.isInteger(val) ? Math.round(val).toLocaleString('en-US') : val.toFixed(1);
    return `${formatted} ${info.symbolAr}`;
  }
}

export function generateWhatsAppOrderLink(
  phone: string,
  items: { name: string; quantity: number; price: number; color?: string; lens?: string }[],
  totalUSD: number,
  currency: Currency,
  customerName?: string,
  city?: string,
  deliveryType?: string,
  prescriptionNotes?: string
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const totalFormatted = formatPrice(totalUSD, currency);

  let message = `مرحباً مركز آزال للنظارات والسمعيات 👓👂\n`;
  message += `أرغب في تأكيد طلب شراء جديد من الموقع:\n\n`;

  if (customerName) {
    message += `👤 اسم العميل: ${customerName}\n`;
  }
  if (city) {
    message += `📍 المدينة/العنوان: ${city}\n`;
  }
  if (deliveryType) {
    message += `🚚 طريقة الاستلام: ${deliveryType}\n`;
  }

  message += `\n🛒 تفاصيل المنتجات المطلوبة:\n`;
  items.forEach((item, idx) => {
    message += `${idx + 1}. ${item.name} (${item.quantity}x)\n`;
    if (item.color) message += `   • اللون: ${item.color}\n`;
    if (item.lens) message += `   • نوع العدسات: ${item.lens}\n`;
  });

  if (prescriptionNotes) {
    message += `\n📋 ملاحظات مقاسات النظر / الفحص: ${prescriptionNotes}\n`;
  }

  message += `\n💰 الإجمالي المطلوب: ${totalFormatted}\n`;
  message += `\nيرجى تأكيد التوفر وموعد الاستلام. شكراً لكم!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppConsultationLink(phone: string, topic: string = 'استشارة عامة'): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `مرحباً مركز آزال للنظارات والسمعيات، أود الاستفسار بخصوص: ${topic}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Compresses an image file (from camera / file picker) to a lightweight WebP/JPEG Data URL.
 * Resizes large dimensions to max 800px and compresses quality to ~0.75,
 * reducing 5MB-10MB mobile camera photos to ~30KB-70KB so they easily fit in localStorage.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 650,
  maxHeight = 650,
  quality = 0.70
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or gif, return as is
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if image object fails
        resolve(e.target?.result as string);
      };
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Try webp first (smaller size), fallback to jpeg
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData && webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // Fall through
        }

        try {
          const jpegData = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegData);
        } catch {
          resolve(canvas.toDataURL());
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Safe local storage setter that prevents unhandled quota crashes
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
    return true;
  } catch (err) {
    console.warn(`[LocalStorage] Failed to write key "${key}":`, err);
    return false;
  }
}
