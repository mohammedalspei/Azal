import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Ear, 
  Volume2, 
  VolumeX, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MessageCircle, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck,
  Headphones,
  Award
} from 'lucide-react';
import { StoreInfo } from '../types';
import { STORE_INFO, PRODUCTS } from '../data/products';
import { generateWhatsAppConsultationLink } from '../utils/helpers';

interface HearingTestProps {
  onClose: () => void;
  onOpenAppointment: () => void;
  storeInfo?: StoreInfo;
}

const FREQUENCIES = [
  { freq: 250, label: '250 Hz', desc: 'الترددات المنخفضة (أصوات المحركات والجهير)' },
  { freq: 500, label: '500 Hz', desc: 'الترددات المتوسطة المنخفضة (نبرات الحروف الصوتية)' },
  { freq: 1000, label: '1000 Hz', desc: 'التردد الأساسي للمحادثات اليومية (1 kHz)' },
  { freq: 2000, label: '2000 Hz', desc: 'تردد وضوح مخارج الحروف وفهم الكلمات' },
  { freq: 4000, label: '4000 Hz', desc: 'الترددات العالية (أصوات الطيور وصفير الرياح)' },
  { freq: 8000, label: '8000 Hz', desc: 'أعلى ترددات السمع الدقيقة (8 kHz)' },
];

export const HearingTest: React.FC<HearingTestProps> = ({
  onClose,
  onOpenAppointment,
  storeInfo
}) => {
  const currentInfo = storeInfo || STORE_INFO;
  const [step, setStep] = useState<'intro' | 'testing' | 'result'>('intro');
  const [currentFreqIdx, setCurrentFreqIdx] = useState(0);
  const [currentEar, setCurrentEar] = useState<'right' | 'left'>('right');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Results map: ear -> frequency -> heard: boolean
  const [responses, setResponses] = useState<{
    right: Record<number, boolean>;
    left: Record<number, boolean>;
  }>({
    right: {},
    left: {}
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const hearingAidProducts = PRODUCTS.filter(p => p.category === 'hearing-aids');

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopTone();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const playTone = (freq: number, ear: 'right' | 'left') => {
    try {
      stopTone();
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Safe pleasant audio volume
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.1);

      if (panner) {
        panner.pan.setValueAtTime(ear === 'right' ? 0.9 : -0.9, ctx.currentTime);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio Web API error:", e);
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {
        // Ignore already stopped
      }
      oscRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleStartTest = () => {
    setResponses({ right: {}, left: {} });
    setCurrentFreqIdx(0);
    setCurrentEar('right');
    setStep('testing');
    setTimeout(() => {
      playTone(FREQUENCIES[0].freq, 'right');
    }, 400);
  };

  const handleResponse = (heard: boolean) => {
    stopTone();
    const currentFreq = FREQUENCIES[currentFreqIdx].freq;

    const newResponses = {
      ...responses,
      [currentEar]: {
        ...responses[currentEar],
        [currentFreq]: heard
      }
    };
    setResponses(newResponses);

    // If more frequencies in current ear
    if (currentFreqIdx < FREQUENCIES.length - 1) {
      const nextIdx = currentFreqIdx + 1;
      setCurrentFreqIdx(nextIdx);
      setTimeout(() => {
        playTone(FREQUENCIES[nextIdx].freq, currentEar);
      }, 500);
    } else if (currentEar === 'right') {
      // Switch to left ear
      setCurrentEar('left');
      setCurrentFreqIdx(0);
      setTimeout(() => {
        playTone(FREQUENCIES[0].freq, 'left');
      }, 700);
    } else {
      // Finished all frequencies for both ears
      setStep('result');
    }
  };

  // Calculate Hearing Health Score
  const calculateResult = () => {
    const rightHeard = Object.values(responses.right).filter(Boolean).length;
    const leftHeard = Object.values(responses.left).filter(Boolean).length;
    const totalHeard = rightHeard + leftHeard;
    const totalTones = FREQUENCIES.length * 2;
    const percentage = Math.round((totalHeard / totalTones) * 100);

    let status = 'ممتاز وطبيعي';
    let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    let recommendation = 'نتائجك تشير إلى استجابة سمعية ممتازة لجميع الترددات الأساسية والمتقدمة. نوصي بحماية أذنيك من الأصوات العالية وإجراء فحص دوري سنوي بمركز آزال.';

    if (percentage < 55) {
      status = 'مؤشرات ضعف سمع ملحوظ';
      statusColor = 'text-red-700 bg-red-50 border-red-200';
      recommendation = 'هناك صعوبة في التقاط بعض ترددات المحادثات أو الترددات العالية. ننصحك بزيارة مركز آزال لإجراء تخطيط سمع سريري دقيق واستشارة أخصائي السمع لبرمجة سماعة رقمية مناسبة.';
    } else if (percentage < 85) {
      status = 'ضعف سمع خفيف في بعض الترددات';
      statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
      recommendation = 'يظهر الفحص الأولي بعض التراجع في التقاط الترددات العالية أو الدقيقة. يفضل فحص طبلة الأذن ومجرى السمع بالمركز للتأكد من عدم وجود شوائب أو شمع وقياس الترددات.';
    }

    return { percentage, status, statusColor, recommendation, rightHeard, leftHeard };
  };

  const result = step === 'result' ? calculateResult() : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6" id="hearing-test-modal">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl">
              <Ear className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-tajawal">فحص واختبار السمع التفاعلي</h2>
              <p className="text-xs text-amber-200">قسم السمعيات وتخطيط السمع الرقمي • مركز آزال</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopTone();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            id="close-hearing-test"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* STEP 1: INTRO */}
          {step === 'intro' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-800 shadow-inner">
                <Headphones className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 font-tajawal">
                  اختبر كفاءة سمعك خلال دقيقتين
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  يقوم هذا الفحص بتوليد 6 ترددات صوتية علمية (من 250 هرتز حتى 8000 هرتز) لكل أذن على حدة لتقييم مدى وضوح نغمات الكلام البشري لديك.
                </p>
              </div>

              {/* Tips */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-right space-y-2 text-xs text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>إرشادات للحصول على أدق نتيجة:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700 pr-4 list-disc">
                  <li>يفضل ارتداء سماعات الرأس (Headphones) للاستماع لكل أذن بشكل منفصل.</li>
                  <li>اضبط مستوى صوت جهازك على 50% تقريباً في مكان هادئ بدون ضوضاء.</li>
                  <li>اضغط على "نعم أسمعها" فور سماع النغمة الرنانة أو "لا أسمعها".</li>
                </ul>
              </div>

              <button
                onClick={handleStartTest}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.02]"
                id="start-hearing-test-btn"
              >
                بدء اختبار فحص السمع الآن
              </button>
            </div>
          )}

          {/* STEP 2: TESTING IN PROGRESS */}
          {step === 'testing' && (
            <div className="space-y-6 text-center">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    currentEar === 'right' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    الأذن اليمنى (Right Ear)
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    currentEar === 'left' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    الأذن اليسرى (Left Ear)
                  </span>
                </div>
                <span>التردد {currentFreqIdx + 1} من {FREQUENCIES.length}</span>
              </div>

              {/* Visual Sound Wave Pulse Box */}
              <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 text-white relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent"></div>

                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-amber-500 text-slate-950 ring-8 ring-amber-400/30 scale-110 shadow-lg shadow-amber-500/50' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isPlaying ? <Volume2 className="w-10 h-10 animate-bounce" /> : <VolumeX className="w-10 h-10" />}
                </div>

                <div className="text-2xl font-black font-tajawal text-white tracking-wide">
                  {FREQUENCIES[currentFreqIdx].label}
                </div>
                <div className="text-xs text-amber-300 mt-1">
                  {FREQUENCIES[currentFreqIdx].desc}
                </div>

                <button
                  onClick={() => playTone(FREQUENCIES[currentFreqIdx].freq, currentEar)}
                  className="mt-4 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-lg text-xs border border-white/20 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة تشغيل النغمة</span>
                </button>
              </div>

              {/* Decision Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleResponse(true)}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition flex flex-col items-center justify-center gap-1.5 hover:scale-[1.02]"
                  id="heard-tone-btn"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-sm">نعم، أسمع النغمة بوضوح</span>
                </button>

                <button
                  onClick={() => handleResponse(false)}
                  className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl border border-slate-300 transition flex flex-col items-center justify-center gap-1.5 hover:scale-[1.02]"
                  id="not-heard-tone-btn"
                >
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                  <span className="text-sm">لا، لا أسمع أي صوت</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: RESULT & RECOMMENDATION */}
          {step === 'result' && result && (
            <div className="space-y-6">
              
              {/* Score Box */}
              <div className={`p-5 rounded-2xl border text-center space-y-2 ${result.statusColor}`}>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">نتيجة الفحص الأولي للسمع</div>
                <div className="text-3xl font-black font-tajawal">{result.status}</div>
                <p className="text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">{result.recommendation}</p>
              </div>

              {/* Ears Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 block mb-1">الأذن اليمنى (Right):</span>
                  <span className="text-base font-black text-blue-900">{result.rightHeard} من {FREQUENCIES.length} ترددات</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 block mb-1">الأذن اليسرى (Left):</span>
                  <span className="text-base font-black text-amber-900">{result.leftHeard} من {FREQUENCIES.length} ترددات</span>
                </div>
              </div>

              {/* Recommended Hearing Aids at Azal */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>الحلول وسماعات السمع الرقمية المقترحة بمركز آزال:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hearingAidProducts.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                      <img src={item.images[0]} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                        <div className="text-[11px] text-amber-700 font-semibold">{item.specs.channels} قناة • {item.specs.warranty}</div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">برمجة وتخطيط مجاناً</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAppointment();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
                  id="book-audiology-exam-btn"
                >
                  <Calendar className="w-4 h-4" />
                  <span>حجز موعد تخطيط سمع شامل بالمركز</span>
                </button>

                <a
                  href={generateWhatsAppConsultationLink(currentInfo.whatsapp, 'استشارة بخصوص نتائج فحص السمع وتخطيط الأذن')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>استشارة أخصائي السمعيات</span>
                </a>

                <button
                  onClick={handleStartTest}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold"
                  title="إعادة الفحص"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
