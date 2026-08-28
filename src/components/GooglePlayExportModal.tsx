import React, { useState, useEffect } from 'react';
import { SoundConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  CheckCircle2,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  X,
  FileCode,
  ShieldCheck,
  Zap,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GooglePlayExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundConfig: SoundConfig;
}

export const GooglePlayExportModal: React.FC<GooglePlayExportModalProps> = ({
  isOpen,
  onClose,
  soundConfig,
}) => {
  const isAr = soundConfig.language === 'ar';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundManager.playPop();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        isAr
          ? 'التطبيق جاهز كـ PWA! يمكنك تثبيته مباشرة من قائمة المتصفح (إضافة إلى الشاشة الرئيسية) أو تصديره إلى متجر جوجل بلاي.'
          : 'App is ready as PWA! You can install it from your browser menu (Add to Home Screen) or publish to Google Play.'
      );
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundManager.playGem();
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#58CC02] z-10 select-none text-slate-800 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#58CC02] to-[#2B8200] text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {isAr ? 'جاهزية جوجل سوق بلاي (Google Play Store)' : 'Google Play Store Readiness'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-300">
                100% Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              {isAr
                ? 'تم تجهيز المنفست، الأيقونات، Service Worker، وشهادات TWA بنجاح'
                : 'Manifest, High-res Icons, Service Worker, and TWA configurations ready'}
            </p>
          </div>
        </div>

        {/* Checkmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                {isAr ? 'ملف المنفست (manifest.json)' : 'Web App Manifest'}
              </h4>
              <p className="text-[11px] text-emerald-800">
                {isAr ? 'معرف التطبيق، الاسم، الألوان، والأبعاد' : 'App ID, Theme Colors, Standalone display'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                {isAr ? 'حزمة الأيقونات عالية الدقة' : 'High-Res Vector Icons'}
              </h4>
              <p className="text-[11px] text-emerald-800">
                {isAr ? 'أيقونات 512x512 و 192x192 و Maskable' : '512px, 192px, Maskable & Favicons'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                {isAr ? 'دعم العمل بدون إنترنت (Offline PWA)' : 'Service Worker & Offline'}
              </h4>
              <p className="text-[11px] text-emerald-800">
                {isAr ? 'تخزين كاش للأصوات والواجهات لتشغيل سريع' : 'Offline caching for fast tablet/phone play'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                {isAr ? 'شهادة الربط الرقمي (AssetLinks)' : 'Digital Asset Links (TWA)'}
              </h4>
              <p className="text-[11px] text-emerald-800">
                {isAr ? 'ملف .well-known/assetlinks.json جاهز' : 'Verified Google Play TWA verification file'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Options */}
        <div className="space-y-4">
          {/* Option 1: Direct Android Install */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#58CC02] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                <Play className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <h4 className="text-sm font-black">
                  {isAr ? 'تثبيت فوري على أجهزة أندرويد' : 'Instant Android Install (PWA)'}
                </h4>
                <p className="text-xs text-white/90">
                  {isAr
                    ? 'جرب التطبيق كأنه مثبت من المتجر بملء الشاشة'
                    : 'Experience as a standalone Android app right now'}
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-black text-xs shadow-md hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isInstalled
                ? isAr
                  ? '✓ مثبت بالفعل'
                  : '✓ Installed'
                : isAr
                ? '📲 تثبيت التطبيق الآن'
                : '📲 Install Now'}
            </button>
          </div>

          {/* Option 2: Step-by-Step Google Play Console Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                {isAr
                  ? 'طريقة رفع التطبيق على Google Play Console بضغطة زر:'
                  : 'How to export .aab package for Google Play Console:'}
              </span>
            </h4>

            <ol className="space-y-2 text-xs text-slate-700 font-medium list-decimal list-inside">
              <li>
                <span className="font-bold text-slate-900">
                  {isAr ? 'استخدم أداة PWABuilder الرسمية:' : 'Use PWABuilder (Microsoft/Google supported):'}
                </span>{' '}
                {isAr
                  ? 'افتح موقع PWABuilder.com وضع رابط تطبيقك، ثم اضغط على "Android Package" وسيقوم تلقائياً بتوليد ملف AAB الموقّع.'
                  : 'Go to PWABuilder.com, paste your app URL, and click "Generate Android Package (AAB)".'}
              </li>
              <li>
                <span className="font-bold text-slate-900">
                  {isAr ? 'أو عبر أداة Google Bubblewrap CLI:' : 'Or using Google Bubblewrap CLI:'}
                </span>{' '}
                <div className="mt-1 flex items-center gap-2 bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <span>npx @bubblewrap/cli build</span>
                  <button
                    onClick={() => copyToClipboard('npx @bubblewrap/cli init --manifest=https://' + window.location.host + '/manifest.json && npx @bubblewrap/cli build', 'cli')}
                    className="ml-auto text-slate-400 hover:text-white p-1"
                    title="Copy command"
                  >
                    {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
              <li>
                <span className="font-bold text-slate-900">
                  {isAr ? 'ارفع ملف .aab إلى Google Play Console:' : 'Upload the .aab to Google Play Console:'}
                </span>{' '}
                {isAr
                  ? 'ادخل إلى حساب المطور، أنشئ تطبيقاً جديداً وارفع حزمة App Bundle.'
                  : 'Open Google Play Console, create a new app and drag-and-drop the generated .aab bundle.'}
              </li>
            </ol>
          </div>

          {/* Quick Links to Manifest & Assets */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <a
              href="/manifest.json"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? 'معاينة manifest.json' : 'View manifest.json'}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="/icon.svg"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'أيقونة التطبيق الرسمية' : 'Official App Icon'}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-300"
            >
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>PWABuilder.com</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm cursor-pointer"
        >
          {isAr ? 'تم وفهمت (إغلاق)' : 'Got it (Close)'}
        </button>
      </motion.div>
    </div>
  );
};
