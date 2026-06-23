import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import * as Icons from 'lucide-react';
import { covenantData } from '../../data/covenant';

// Color themes for each rule card
const ruleThemes = [
  { bg: 'from-emerald-500 to-teal-600',    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',   iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', quranBg: 'bg-emerald-50 dark:bg-emerald-900/20',   accent: 'bg-emerald-500' },
  { bg: 'from-rose-500 to-pink-600',       iconBg: 'bg-rose-100 dark:bg-rose-900/40',         iconColor: 'text-rose-600 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-800',       quranBg: 'bg-rose-50 dark:bg-rose-900/20',         accent: 'bg-rose-500' },
  { bg: 'from-violet-500 to-purple-600',    iconBg: 'bg-violet-100 dark:bg-violet-900/40',     iconColor: 'text-violet-600 dark:text-violet-400',   border: 'border-violet-200 dark:border-violet-800',   quranBg: 'bg-violet-50 dark:bg-violet-900/20',     accent: 'bg-violet-500' },
  { bg: 'from-amber-500 to-orange-600',     iconBg: 'bg-amber-100 dark:bg-amber-900/40',       iconColor: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-800',     quranBg: 'bg-amber-50 dark:bg-amber-900/20',       accent: 'bg-amber-500' },
  { bg: 'from-sky-500 to-blue-600',         iconBg: 'bg-sky-100 dark:bg-sky-900/40',           iconColor: 'text-sky-600 dark:text-sky-400',         border: 'border-sky-200 dark:border-sky-800',         quranBg: 'bg-sky-50 dark:bg-sky-900/20',           accent: 'bg-sky-500' },
  { bg: 'from-teal-500 to-cyan-600',        iconBg: 'bg-teal-100 dark:bg-teal-900/40',         iconColor: 'text-teal-600 dark:text-teal-400',       border: 'border-teal-200 dark:border-teal-800',       quranBg: 'bg-teal-50 dark:bg-teal-900/20',         accent: 'bg-teal-500' },
  { bg: 'from-indigo-500 to-blue-700',      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',     iconColor: 'text-indigo-600 dark:text-indigo-400',   border: 'border-indigo-200 dark:border-indigo-800',   quranBg: 'bg-indigo-50 dark:bg-indigo-900/20',     accent: 'bg-indigo-500' },
  { bg: 'from-fuchsia-500 to-pink-600',     iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',   iconColor: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-800', quranBg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',   accent: 'bg-fuchsia-500' },
  { bg: 'from-lime-500 to-green-600',       iconBg: 'bg-lime-100 dark:bg-lime-900/40',         iconColor: 'text-lime-600 dark:text-lime-400',       border: 'border-lime-200 dark:border-lime-800',       quranBg: 'bg-lime-50 dark:bg-lime-900/20',         accent: 'bg-lime-500' },
  { bg: 'from-cyan-500 to-teal-600',        iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',         iconColor: 'text-cyan-600 dark:text-cyan-400',       border: 'border-cyan-200 dark:border-cyan-800',       quranBg: 'bg-cyan-50 dark:bg-cyan-900/20',         accent: 'bg-cyan-500' },
  { bg: 'from-yellow-500 to-amber-600',     iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',     iconColor: 'text-yellow-600 dark:text-yellow-400',   border: 'border-yellow-200 dark:border-yellow-800',   quranBg: 'bg-yellow-50 dark:bg-yellow-900/20',     accent: 'bg-yellow-500' },
  { bg: 'from-blue-500 to-indigo-600',      iconBg: 'bg-blue-100 dark:bg-blue-900/40',         iconColor: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-800',       quranBg: 'bg-blue-50 dark:bg-blue-900/20',         accent: 'bg-blue-500' },
];

export const TripRules: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, hasSignedRules, updateOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  
  const [agreed, setAgreed] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('covenant_checked_items');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [signatureName, setSignatureName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [signatureData, setSignatureData] = useState<any>(null);

  // Calculate checklists progress
  const allItems = covenantData.flatMap(section => section.items);
  const totalItemsCount = allItems.length;
  const checkedCount = allItems.filter(item => checkedItems[item.id]).length;
  const allChecked = checkedCount === totalItemsCount;
  const progressPercent = Math.round((checkedCount / totalItemsCount) * 100);

  useEffect(() => {
    if (hasSignedRules) {
      setAgreed(true);
      // Auto-check all items if they already signed
      const autoChecked: Record<string, boolean> = {};
      allItems.forEach(item => {
        autoChecked[item.id] = true;
      });
      setCheckedItems(autoChecked);

      // Fetch signature data to display
      if (user) {
        const fetchSignature = async () => {
          try {
            const sigRef = collection(db, 'signatures');
            const q = query(sigRef, where('participantId', '==', user.uid), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
              setSignatureData(snap.docs[0].data());
            }
          } catch (err) {
            console.error("Failed to fetch signature", err);
          }
        };
        fetchSignature();
      }
    }
  }, [hasSignedRules, user]);

  const toggleItem = (itemId: string) => {
    if (hasSignedRules) return; // Disallow toggle after signing
    setCheckedItems(prev => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      localStorage.setItem('covenant_checked_items', JSON.stringify(next));
      return next;
    });
  };

  const handleCheckAll = () => {
    if (hasSignedRules) return;
    const next: Record<string, boolean> = {};
    allItems.forEach(item => {
      next[item.id] = true;
    });
    setCheckedItems(next);
    localStorage.setItem('covenant_checked_items', JSON.stringify(next));
  };

  const handleSign = async () => {
    if (!allChecked || !user || !signatureName.trim()) return;
    setSubmitting(true);
    setError('');

    let ipAddress = 'unknown';
    let locationStr = 'Unknown Location';
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        ipAddress = data.ip || 'unknown';
        if (data.city && data.country_name) {
          locationStr = `${data.city}, ${data.country_name}`;
        }
      }
    } catch (ipErr) {
      console.warn('Failed to retrieve IP/Location:', ipErr);
    }

    try {
      await addDoc(collection(db, 'signatures'), {
        participantId: user.uid,
        participantName: signatureName.trim(),
        timestamp: serverTimestamp(),
        signedAt: new Date().toISOString(),
        ipAddress: ipAddress,
        location: locationStr,
      });

      // Update participant's document as single source of truth
      await setDoc(doc(db, 'participants', user.uid), {
        hasSignedRules: true
      }, { merge: true });

      updateOnboardingStatus(true, true);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to submit agreement. Please try again.');
      setSubmitting(false);
    }
  };

  const getLocText = (obj: { en: string; no: string; ur: string } | undefined) => {
    if (!obj) return '';
    const lang = (language || 'en') as 'en' | 'no' | 'ur';
    return obj[lang] || obj['en'];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 px-4">
      {/* Header */}
      <div className="text-center space-y-5 pt-10 pb-4">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary-500/25 rotate-3 hover:rotate-0 transition-transform duration-500">
          <Icons.BookOpen className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'no' ? 'Oslo → Geiranger Bilferie-pakt' : language === 'ur' ? 'اوسلو ← گیرانجر خاندانی روڈ ٹرپ عہد نامہ' : 'Oslo → Geiranger Family Road Trip Covenant'}
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
          {language === 'no' ? 
            'Bismillah. Vi er enige om at denne turen er for tilbedelse, familiebånd, takknemlighet og å nyte Allahs skaperverk. Vi søker barakah, ikke bare underholdning.' : 
            language === 'ur' ? 
            'بسم اللہ۔ ہم متفق ہیں کہ یہ سفر عبادت، خاندانی تعلقات، شکر گزاری اور اللہ کی تخلیق سے لطف اندوز ہونے کے لیے ہے۔ ہم برکت چاہتے ہیں، محض تفریح نہیں۔' : 
            'Bismillah. We agree that this trip is for worship, family bonding, gratitude, and enjoying Allah\'s creation. We seek barakah, not merely entertainment.'}
        </p>
      </div>

      {/* Progress & Quick Check Control */}
      {!hasSignedRules && (
        <div className="glass p-6 rounded-3xl border border-card-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5 w-full md:w-auto">
            <div className="flex justify-between md:justify-start items-baseline gap-2">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Covenant Agreement Progress</span>
              <span className="text-sm font-mono text-primary-600 dark:text-primary-400 font-bold">{checkedCount} / {totalItemsCount} ({progressPercent}%)</span>
            </div>
            <div className="w-full md:w-80 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-primary-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={handleCheckAll}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Agree to All Sections
          </button>
        </div>
      )}

      {/* Covenant Sections Grid */}
      <div className="space-y-8">
        {covenantData.map((section, idx) => {
          const theme = ruleThemes[idx % ruleThemes.length];
          const IconComponent = (Icons as any)[section.iconName] || Icons.HelpCircle;
          
          return (
            <div 
              key={section.id} 
              className={`relative rounded-3xl overflow-hidden border ${theme.border} bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg transition-all duration-300`}
            >
              {/* Colored Top Bar */}
              <div className={`h-2 bg-gradient-to-r ${theme.bg}`}></div>
              
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div className={`shrink-0 w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-sm`}>
                    <IconComponent className={`w-7 h-7 ${theme.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${theme.bg} text-white text-xs font-bold shadow-sm`}>
                        {section.id}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {getLocText(section.title)}
                      </h2>
                    </div>

                    {/* Section Quote/Instruction */}
                    {section.quote && (
                      <div className={`p-4 rounded-xl ${theme.quranBg} border ${theme.border} italic text-sm md:text-base text-slate-700 dark:text-slate-300`}>
                        📖 {getLocText(section.quote)}
                      </div>
                    )}

                    {/* Checklist items */}
                    <div className="space-y-3 pt-2">
                      {section.items.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        return (
                          <div 
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isChecked 
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200' 
                                : 'bg-slate-50/30 dark:bg-slate-900/10 border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-100/50 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <Icons.CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Icons.Square className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                              )}
                            </div>
                            <span className={`text-sm md:text-base ${isChecked ? 'font-medium' : ''} select-none`}>
                              {getLocText(item)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature Section */}
      {!hasSignedRules ? (
        <div className="mt-16 bg-white dark:bg-slate-800/80 p-6 md:p-10 rounded-3xl shadow-2xl border-2 border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>

          {!allChecked ? (
            <div className="space-y-4 text-center py-6">
              <Icons.Lock className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Covenant Signature Locked</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                Please read and agree to all the covenant rules by checking off all checkboxes to unlock the signature box.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                <p className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed italic">
                  &ldquo;{language === 'no' ? 
                    'Vi lover, for Allahs skyld, å bevare bønn, god karakter, tålmodighet, takknemlighet og kjærlighet under denne reisen, og å gjøre denne turen til en kilde til barakah og vakre minner.' :
                    language === 'ur' ?
                    'ہم اللہ کی رضا کے لیے وعدہ کرتے ہیں کہ ہم اس سفر کے دوران نماز، اخلاق، صبر، شکر گزاری اور محبت کو برقرار رکھیں گے اور اس سفر کو برکت اور خوبصورت یادوں کا ذریعہ بنائیں گے۔' :
                    'We promise, for the sake of Allah, to preserve prayer, good character, patience, gratitude, and love during this journey, and to make this trip a source of barakah and beautiful memories.'
                  }&rdquo;
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-4 font-mono font-bold">
                  اللهم بارك لنا في سفرنا، واحفظنا، واجعله سفراً مباركاً، وردنا إلى أهلنا سالمين غانمين. آمين
                </p>
              </div>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1 shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <div className="w-10 h-10 border-2 border-slate-300 rounded-xl peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all duration-300 group-hover:border-emerald-400 flex items-center justify-center shadow-sm">
                    <Icons.Check className="w-6 h-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200 select-none leading-snug pt-1">
                  {language === 'no' ? 'Jeg godtar denne pakten for meg selv og min familie' : language === 'ur' ? 'میں اپنے اور اپنے خاندان کی طرف سے اس عہد نامے سے متفق ہوں' : 'I agree to uphold this covenant for myself and my family'}
                </span>
              </label>

              {/* Name Input */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  ✍️ Please type your full name to sign:
                </label>
                <input 
                  type="text" 
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-5 py-4 text-lg rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white/50 dark:bg-slate-800/50 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleSign}
                disabled={!agreed || !signatureName.trim() || submitting}
                className="w-full py-4 text-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
              >
                {submitting ? 'Submitting...' : '✅ Sign Covenant & Enter'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 flex flex-col items-center gap-6 text-center shadow-lg animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center shrink-0">
            <Icons.Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-2">Covenant Signed!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">JazakAllah Khair. You have officially agreed to the trip rules.</p>
          </div>
          
          {signatureData && (
            <div className="w-full max-w-lg mt-4 bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-left space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Digital Signature Record</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Participant Name</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{signatureData.participantName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {signatureData.signedAt ? new Date(signatureData.signedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">IP Address</p>
                  <p className="font-mono text-sm font-medium text-slate-800 dark:text-slate-200">{signatureData.ipAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{signatureData.location || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Home Navigation Button at the Bottom */}
      <div className="flex justify-center pt-8 border-t border-slate-200 dark:border-slate-700 mt-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-primary-500/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Icons.Home className="w-5 h-5" />
          <span>{t('nav.home')}</span>
        </button>
      </div>
    </div>
  );
};
