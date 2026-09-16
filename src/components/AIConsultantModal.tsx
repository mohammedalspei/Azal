import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Glasses, 
  Ear, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { PRODUCTS, STORE_INFO } from '../data/products';
import { Product } from '../types';

interface AIConsultantModalProps {
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn: (product: Product) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendedProductIds?: string[];
  suggestions?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'أهلاً بك في مركز آزال للنظارات والسمعيات! 👓👂\nأنا مستشارك الذكي، يسعدني مساعدتك في:\n1. اختيار أنسب شكل إطار لملامح وجهك ومقاساتك\n2. ترشيح أفضل أنواع العدسات (حماية شاشات Blue Cut أو فوتوكروميك للشمس)\n3. تقديم استشارات بخصوص سماعات الأذن الرقمية غير المرئية وتخطيط السمع.\n\nكيف يمكنني مساعدتك اليوم؟',
    suggestions: [
      'ما هو أنسب إطار لشكل وجهي؟',
      'أحتاج نظارة لحماية العين من شاشات الهاتف والكمبيوتر',
      'أريد سماعة أذن طبية غير مرئية لوالدي',
      'ما هي أفضل النظارات الشمسية المستقطبة للقيادة؟'
    ]
  }
];

export const AIConsultantModal: React.FC<AIConsultantModalProps> = ({
  onClose,
  onSelectProduct,
  onOpenVirtualTryOn
}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI knowledge engine response simulation tailored for Azal Optics
    setTimeout(() => {
      let replyText = '';
      let recommendedIds: string[] = [];
      let nextSuggestions: string[] = [];

      const lower = textToSend.toLowerCase();

      if (lower.includes('وجه') || lower.includes('شكل') || lower.includes('ملامح') || lower.includes('دائري') || lower.includes('مربع') || lower.includes('بيضاوي')) {
        replyText = 'تناسق شكل الإطار مع ملامح الوجه هو سر الأناقة والراحة:\n\n' +
          '• **الوجه الدائري**: تناسبه الإطارات المستطيلة أو المربعة مثل (إطار آزال تيتانيوم إليت) لإعطاء زوايا محددة للوجه.\n' +
          '• **الوجه المربع**: تناسبه الإطارات الدائرية أو المنحنية مثل (إطار آزال فينتاج دائرية) لتنعيم الملامح.\n' +
          '• **الوجه البيضاوي**: يناسبه معظم الأشكال كإطارات الوايفارر والأفياتور.\n' +
          '• **الوجه القلبي / المثلث**: تناسبه إطارات عين القطة (Cat-Eye) والروز جولد.\n\n' +
          'إليك أفضل الخيارات المتوفرة لدينا حالياً:';
        recommendedIds = ['azal-titanium-elite', 'azal-cateye-rose-gold', 'azal-round-vintage'];
        nextSuggestions = ['جرب النظارات في غرفة التجربة الافتراضية', 'احجز موعد فحص نظر بالمركز'];
      } else if (lower.includes('شاشة') || lower.includes('كمبيوتر') || lower.includes('هاتف') || lower.includes('بلو') || lower.includes('blue') || lower.includes('صداع')) {
        replyText = 'لحماية العين من إجهاد الشاشات والصداع، نوصي بتركيب **عدسات Blue Cut Shield الذكية** من مركز آزال.\n' +
          'تتميز هذه العدسات بحجب 98% من الضوء الأزرق المنبعث من الهواتف والحواسب مع طبقات مضادة للانعكاس والخدش. يمكنك تفصيلها على أي إطار مفضل لديك مثل إطار التيتانيوم الخفيف.';
        recommendedIds = ['azal-titanium-elite', 'azal-havana-classic'];
        nextSuggestions = ['تفصيل عدسات Blue Cut مع إطار تيتانيوم', 'حجز موعد فحص نظر'];
      } else if (lower.includes('سماع') || lower.includes('أذن') || lower.includes('سمع') || lower.includes('صوت') || lower.includes('مسن') || lower.includes('والد')) {
        replyText = 'في قسم السمعيات بمركز آزال، نوفر أحدث جيل من السماعات الطبية الرقمية:\n\n' +
          '1. **سماعة Phonak Lumity السويسرية غير المرئية (CIC)**: توضع بالكامل داخل مجرى السمع ومزودة بـ 24 قناة لعزل الضوضاء.\n' +
          '2. **سماعة Oticon More الدنماركية القابلة للشحن**: تدعم البلوتوث للهواتف الذكية مع 64 قناة لمعالجة الكلام فائق الوضوح.\n\n' +
          '✨ تشمل خدماتنا الفحص المجاني الشامل وتخطيط السمع وبرمجة السماعة بدقة فائقة مع خصم 30% لطلبات الموقع.';
        recommendedIds = ['azal-phonak-lumity-cic', 'azal-oticon-more-bte'];
        nextSuggestions = ['بدء فحص السمع التفاعلي الآن', 'حجز موعد تخطيط سمع بالمركز'];
      } else if (lower.includes('شمس') || lower.includes('سيارة') || lower.includes('قيادة') || lower.includes('استقطاب') || lower.includes('polar')) {
        replyText = 'للقيادة والاستخدام النهاري تحت أشعة الشمس القوية، نوصي دائماً باختيار **عدسات مستقطبة (Polarized)** مع حماية UV400 كاملة لحجب الانعكاسات المجهدة للعين عن الإسفلت وزجاج السيارات.\n\nإليك أفضل النظارات الشمسية المستقطبة الأكثر طلباً:';
        recommendedIds = ['azal-aviator-polar-gold', 'azal-wayfarer-bold', 'azal-oversized-glam'];
        nextSuggestions = ['عرض تفاصيل نظارة الأفياتور', 'تجربة شمسية افتراضية'];
      } else {
        replyText = `شكراً لتواصلك مع مركز آزال للنظارات والسمعيات!\nيسعدنا خدمتكم في مقرنا أو عبر التوصيل السريع. لدينا أحدث تشكيلات النظارات الطبية والشمسية والعدسات وسماعات الأذن الرقمية مع فحص كمبيوتري دقيق. يمكنك أيضاً التواصل المباشر مع أخصائيينا على الرقم ${STORE_INFO.phone1} أو ${STORE_INFO.phone2}.`;
        recommendedIds = ['azal-titanium-elite', 'azal-phonak-lumity-cic'];
        nextSuggestions = ['عرض جميع النظارات الطبية', 'عرض سماعات الأذن', 'حجز موعد بالمركز'];
      }

      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        recommendedProductIds: recommendedIds,
        suggestions: nextSuggestions
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6" id="ai-consultant-modal">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col h-[85vh] max-h-[700px] border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 text-blue-300 border border-blue-400/30 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-tajawal">مستشار آزال الذكي للبصريات والسمع</h2>
              <p className="text-xs text-blue-200">إرشادات مخصصة لشكل الوجه، العدسات، وحلول السمع</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            id="close-ai-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-3 ${isAI ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isAI
                        ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tr-none'
                        : 'bg-blue-900 text-white rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Product Cards Attachment */}
                  {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {msg.recommendedProductIds.map((pId) => {
                        const product = PRODUCTS.find((p) => p.id === pId);
                        if (!product) return null;
                        return (
                          <div
                            key={product.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 transition shadow-xs flex items-center gap-2.5 text-right cursor-pointer"
                            onClick={() => {
                              onClose();
                              onSelectProduct(product);
                            }}
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                            />
                            <div className="text-xs flex-1">
                              <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                              <div className="text-[11px] text-blue-700 font-bold mt-0.5">{product.brand}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <span>عرض وتجربة</span>
                                <ArrowLeft className="w-3 h-3 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Suggestions Buttons */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-semibold px-2.5 py-1 rounded-full transition text-right"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white px-3 py-2 rounded-xl w-fit border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>جاري صياغة الاستشارة المتخصصة من مركز آزال...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك عن شكل الإطار، العدسات، أو السمعيات..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 transition"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-sm"
              id="ai-send-btn"
            >
              <Send className="w-4 h-4 transform rotate-180" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
