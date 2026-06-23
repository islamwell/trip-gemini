import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Globe, ArrowRight } from 'lucide-react';

export const Welcome: React.FC = () => {
  const { setLanguage } = useLanguage();
  const { user, updateOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectLanguage = async (lang: string) => {
    if (!user) return;
    setLoading(true);
    try {
      setLanguage(lang);
      // Update Firestore to remember they've chosen
      await setDoc(doc(db, 'participants', user.uid), {
        language: lang,
        languageSet: true
      }, { merge: true });
      updateOnboardingStatus(false, true); // (signedRules, languageSet)
      navigate('/rules');
    } catch (error: any) {
      console.error("Failed to set language:", error);
      alert(`Error setting language: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-xl w-full glass p-10 rounded-3xl shadow-xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="mx-auto w-20 h-20 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
          <Globe className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome / Velkommen / خوش آمدید</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Please select your preferred language to continue.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => handleSelectLanguage('en')}
            disabled={loading}
            className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group hover-lift disabled:opacity-50"
          >
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">English</span>
              <span className="text-slate-500">Continue in English</span>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
          </button>

          <button
            onClick={() => handleSelectLanguage('no')}
            disabled={loading}
            className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group hover-lift disabled:opacity-50"
          >
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">Norsk</span>
              <span className="text-slate-500">Fortsett på norsk</span>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
          </button>

          <button
            onClick={() => handleSelectLanguage('ur')}
            disabled={loading}
            className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group hover-lift disabled:opacity-50"
            dir="rtl"
          >
            <div className="flex flex-col items-start">
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">اردو</span>
              <span className="text-slate-500 font-sans">Continue in Urdu</span>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors rotate-180" />
          </button>
        </div>

      </div>
    </div>
  );
};
