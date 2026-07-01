import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RecaptchaVerifier } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DutyOption {
  dbValue: string;
  titleKey: string;
  hintKey: string;
}

interface DutyGroup {
  group: string;
  groupKey: string;
  options: DutyOption[];
}

const EXTENDED_DUTY_OPTIONS: DutyGroup[] = [
  {
    group: 'Default',
    groupKey: 'registration.role_groups.Default',
    options: [
      {
        dbValue: 'None - but I will make Dua',
        titleKey: 'registration.roles.none',
        hintKey: 'registration.role_hints.none'
      }
    ]
  },
  {
    group: 'Spiritual & Educational',
    groupKey: 'registration.role_groups.Spiritual & Educational',
    options: [
      {
        dbValue: 'Wake-Up Caller for Fajr (Wakes up everyone)',
        titleKey: 'registration.roles.fajr_caller',
        hintKey: 'registration.role_hints.fajr_caller'
      },
      {
        dbValue: 'Quran tajweed teacher',
        titleKey: 'registration.roles.quran_teacher',
        hintKey: 'registration.role_hints.quran_teacher'
      }
    ]
  },
  {
    group: 'Food & Refreshment',
    groupKey: 'registration.role_groups.Food & Refreshment',
    options: [
      {
        dbValue: 'Halal Grocery Scout & Verifier (Checks ingredients)',
        titleKey: 'registration.roles.grocery_scout',
        hintKey: 'registration.role_hints.grocery_scout'
      },
      {
        dbValue: 'Hydration & Water helper (Distributes water)',
        titleKey: 'registration.roles.hydration_helper',
        hintKey: 'registration.role_hints.hydration_helper'
      },
      {
        dbValue: 'Iftar/Suhoor Time Announcer',
        titleKey: 'registration.roles.iftar_announcer',
        hintKey: 'registration.role_hints.iftar_announcer'
      },
      {
        dbValue: 'Fruit & Snack Distributor',
        titleKey: 'registration.roles.snack_distributor',
        hintKey: 'registration.role_hints.snack_distributor'
      }
    ]
  },
  {
    group: 'Transport & Cleanliness',
    groupKey: 'registration.role_groups.Transport & Cleanliness',
    options: [
      {
        dbValue: 'Bus Cleanliness Officer (Keeps bus tidy)',
        titleKey: 'registration.roles.cleanliness_officer',
        hintKey: 'registration.role_hints.cleanliness_officer'
      },
      {
        dbValue: 'Trash & Recycling helper',
        titleKey: 'registration.roles.trash_helper',
        hintKey: 'registration.role_hints.trash_helper'
      },
      {
        dbValue: 'Sound System & Nasheed Manager (Manages audio)',
        titleKey: 'registration.roles.audio_manager',
        hintKey: 'registration.role_hints.audio_manager'
      },
      {
        dbValue: 'Weather & Road Commentator (Checks route updates)',
        titleKey: 'registration.roles.weather_commentator',
        hintKey: 'registration.role_hints.weather_commentator'
      }
    ]
  },
  {
    group: 'Community & Care',
    groupKey: 'registration.role_groups.Community & Care',
    options: [
      {
        dbValue: 'Elderly Support team (Assists elderly)',
        titleKey: 'registration.roles.elderly_support',
        hintKey: 'registration.role_hints.elderly_support'
      },
      {
        dbValue: 'Halal Entertainment (Engages kids/group)',
        titleKey: 'registration.roles.entertainment_helper',
        hintKey: 'registration.role_hints.entertainment_helper'
      },
      {
        dbValue: 'Salah Garment & Cover Organiser',
        titleKey: 'registration.roles.garment_organiser',
        hintKey: 'registration.role_hints.garment_organiser'
      },
      {
        dbValue: 'Lost & Found Custodian (Keeps track of items)',
        titleKey: 'registration.roles.lost_found',
        hintKey: 'registration.role_hints.lost_found'
      }
    ]
  },
  {
    group: 'Logistics & Tech',
    groupKey: 'registration.role_groups.Logistics & Tech',
    options: [
      {
        dbValue: 'Complaint In-Charge',
        titleKey: 'registration.roles.complaint_incharge',
        hintKey: 'registration.role_hints.complaint_incharge'
      },
      {
        dbValue: 'Shared Expenses & Token Collector',
        titleKey: 'registration.roles.token_collector',
        hintKey: 'registration.role_hints.token_collector'
      },
      {
        dbValue: 'Driver (Drives the minibus)',
        titleKey: 'registration.roles.driver',
        hintKey: 'registration.role_hints.driver'
      },
      {
        dbValue: 'Map navigator GPS copilot (Guides driver)',
        titleKey: 'registration.roles.navigator',
        hintKey: 'registration.role_hints.navigator'
      },
      {
        dbValue: 'Photographer (Captures memories)',
        titleKey: 'registration.roles.photographer',
        hintKey: 'registration.role_hints.photographer'
      },
      {
        dbValue: 'Journalist (Writes trip summary)',
        titleKey: 'registration.roles.journalist',
        hintKey: 'registration.role_hints.journalist'
      }
    ]
  }
];

const CountdownTimer = () => {
  const { t } = useLanguage();
  const targetDate = new Date('2026-07-02T11:00:00+02:00').getTime(); // July 2, 11am
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const hasTitle = !!t('countdown.title');

  return (
    <div className="mb-6 text-center bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-card-border shadow-inner">
      {hasTitle && (
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
          {t('countdown.title')}
        </h3>
      )}
      <div dir="ltr" className="flex justify-center mx-auto w-fit gap-4 sm:gap-6">
        {[
          { key: 'days', label: 'Days', value: timeLeft.days },
          { key: 'hours', label: 'Hours', value: timeLeft.hours },
          { key: 'mins', label: 'Mins', value: timeLeft.minutes },
          { key: 'secs', label: 'Secs', value: timeLeft.seconds },
        ].map(item => (
          <div key={item.key} className="flex flex-col items-center min-w-[60px] sm:min-w-[70px]">
            <div className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-red-500 to-orange-500 drop-shadow-sm">
              {item.value.toString().padStart(2, '0')}
            </div>
            {item.label && (
              <span className="block text-xs font-bold tracking-widest text-slate-400 mt-1 uppercase">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Registration: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [useSms, setUseSms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form State
  const [salutation, setSalutation] = useState('Brother');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [duty, setDuty] = useState('None - but I will make Dua');
  const [food1, setFood1] = useState('');
  const [food2, setFood2] = useState('');
  const [food3, setFood3] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { signInWithIdentifierAndPasscode, sendPhoneSms, confirmPhoneSms, updateParticipantProfile } = useAuth();
  const { t } = useLanguage();

  const currentDutyOption = EXTENDED_DUTY_OPTIONS.flatMap(g => g.options).find(o => o.dbValue === duty);
  const currentDutyHint = currentDutyOption ? t(currentDutyOption.hintKey) : '';

  useEffect(() => {
    // Initialize reCAPTCHA for SMS auth
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (phone && !phone.startsWith('+')) {
      setMessage(t('registration.phoneError', 'Please include your country code starting with + (e.g. +47).'));
      setLoading(false);
      return;
    }

    try {
      const identifier = email || phone;
      if (!identifier) throw new Error(t('registration.identifierError', 'Please provide either a Phone Number or an Email.'));
      
      // Attempt login/registration
      await signInWithIdentifierAndPasscode(identifier, passcode);
      
      // Once auth is successful, update profile with extra fields
      await updateParticipantProfile({
        name: `${salutation} ${firstName} ${lastName}`.trim(),
        phone,
        duty,
        favoriteFoods: [food1.trim(), food2.trim(), food3.trim()].filter(Boolean).join(', '),
      });
    } catch (err: any) {
      setMessage(err.message || t('registration.failed', 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const identifier = phone || email;
      if (!identifier) throw new Error(t('login.identifierError', 'Please enter your phone number or email.'));
      await signInWithIdentifierAndPasscode(identifier, passcode);
    } catch (err: any) {
      setMessage(err.message || t('login.failed', 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!phone) {
      setMessage(t('login.phoneRequired', 'Please enter your phone number.'));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await sendPhoneSms(phone, appVerifier);
      setConfirmationResult(result);
      setMessage(t('login.smsSent', 'SMS code sent!'));
    } catch (err: any) {
      setMessage(err.message || t('login.smsFailed', 'Failed to send SMS'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !smsCode) return;
    setLoading(true);
    setMessage('');
    try {
      await confirmPhoneSms(confirmationResult, smsCode);
    } catch (err: any) {
      setMessage(err.message || t('login.invalidSms', 'Invalid SMS code'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none transition-colors " +
    "focus:bg-green-50 dark:focus:bg-green-900/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 " +
    "invalid:[&:not(:placeholder-shown)]:bg-pink-50 dark:invalid:[&:not(:placeholder-shown)]:bg-pink-900/30 invalid:[&:not(:placeholder-shown)]:border-pink-500 invalid:[&:not(:placeholder-shown)]:text-pink-600 invalid:[&:not(:placeholder-shown)]:focus:ring-pink-500/20";

  return (
    <div 
      className="flex flex-1 items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative before:absolute before:inset-0 before:bg-black/20 dark:before:bg-black/50"
      style={{ backgroundImage: "url('/images/green_fjord_bg.jpg')" }}
    >
      <div className="w-full max-w-md glass p-6 sm:p-8 rounded-2xl shadow-2xl mt-8 mb-8 relative z-10 transition-all duration-300">
        
        {/* RECAPTCHA CONTAINER */}
        <div id="recaptcha-container"></div>

        {!isLogin && (
          <>
            <CountdownTimer />
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Title & Role Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/3">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.title', 'Title')}</label>
                  <select 
                    value={salutation} 
                    onChange={(e) => setSalutation(e.target.value)}
                    className={`${inputClass} px-3 py-2 text-sm`}
                  >
                    {['Brother', 'Sister', 'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Imam'].map(s => (
                      <option key={s} value={s}>{t(`registration.salutations.${s}`, s)}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-2/3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('registration.role', 'Volunteer Role')}</label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors p-0.5"
                      title={t('registration.roleDetailsTitle', 'Volunteer Roles Reference Guide')}
                    >
                      <HelpCircle className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                  <select value={duty} onChange={(e) => setDuty(e.target.value)} className={`${inputClass} px-3 py-2 text-sm truncate`}>
                    {EXTENDED_DUTY_OPTIONS.map(group => (
                      <optgroup key={group.group} label={t(group.groupKey, group.group)}>
                        {group.options.map(opt => (
                          <option key={opt.dbValue} value={opt.dbValue} title={t(opt.titleKey, opt.dbValue)}>
                            {t(opt.titleKey, opt.dbValue)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {currentDutyHint && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 leading-normal">
                      {currentDutyHint}
                    </p>
                  )}
                </div>
              </div>

              {/* First & Last Name Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.firstName', 'First Name')}</label>
                  <input required type="text" minLength={2} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder={t('registration.firstPlaceholder', 'Maryam')} />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.lastName', 'Last Name')}</label>
                  <input required type="text" minLength={2} value={lastName} onChange={(e) => setLastName(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder={t('registration.lastPlaceholder', 'Imran')} />
                </div>
              </div>

              {/* Phone Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.phone', 'Phone')}</label>
                  <input required type="tel" pattern="^\+.*" title="Must start with country code (e.g., +47)" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder="+47 123 45 678" />
                </div>
              </div>
              {/* Food Row */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('registration.favoriteFoods', '3 Favorite Foods/Snacks (Required)')}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input required type="text" value={food1} onChange={(e) => setFood1(e.target.value)} className={`${inputClass} px-3 py-2 text-sm w-full sm:w-1/3`} placeholder="e.g., Dates" />
                  <input required type="text" value={food2} onChange={(e) => setFood2(e.target.value)} className={`${inputClass} px-3 py-2 text-sm w-full sm:w-1/3`} placeholder="e.g., Chips" />
                  <input required type="text" value={food3} onChange={(e) => setFood3(e.target.value)} className={`${inputClass} px-3 py-2 text-sm w-full sm:w-1/3`} placeholder="e.g., Apples" />
                </div>
              </div>

              {/* Optional Accordion */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOptional(!showOptional)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {t('registration.optionalSection', 'Optional Information')}
                  </span>
                  {showOptional ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${showOptional ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-4 space-y-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.email', 'Email')}</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} px-3 py-2 text-sm w-full`} placeholder="you@mail.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.passcode', 'Passcode (4-12 digits)')}</label>
                      <input type="password" minLength={4} maxLength={12} value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`${inputClass} px-3 py-2.5 w-full`} placeholder="1234" />
                      <p className="text-xs text-slate-400 mt-1">{t('registration.passcodeHint', 'Used to log back in quickly on a new device.')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-md shadow-primary-500/20 active:scale-95">
                {loading ? t('common.processing', 'Processing...') : t('registration.submit', 'Register Now')}
              </button>
            </form>
          </>
        )}

        {isLogin && !useSms && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">{t('login.title', 'Welcome Back')}</h1>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('login.identifier', 'Phone or Email')}</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} px-4 py-3`} placeholder={t('login.identifierPlaceholder', 'Phone number or Email')} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('login.passcode', 'Passcode')}</label>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`${inputClass} px-4 py-3`} placeholder={t('login.passcodePlaceholder', 'Leave blank if none')} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-primary-500/20">
              {loading ? t('common.loggingIn', 'Logging in...') : t('login.submit', 'Log In')}
            </button>
            
            <button type="button" onClick={() => setUseSms(true)} className="w-full mt-2 text-sm text-primary-600 hover:underline">
              {t('login.forgotPasscode', 'Forgot Passcode? Login with SMS')}
            </button>
          </form>
        )}

        {isLogin && useSms && (
          <form onSubmit={handleVerifySms} className="space-y-4">
            {!confirmationResult ? (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold">{t('login.smsLogin', 'SMS Login')}</h1>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('login.phone', 'Phone Number')}</label>
                  <input required type="tel" pattern="^\+.*" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} px-4 py-3`} placeholder="+47 123 45 678" />
                </div>
                <button type="button" onClick={handleSendSms} disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-primary-500/20">
                  {loading ? t('common.sending', 'Sending...') : t('login.sendSms', 'Send SMS Code')}
                </button>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold">{t('login.verifySms', 'Verify SMS')}</h1>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('login.sixDigit', '6-Digit Code')}</label>
                  <input required type="text" pattern="[0-9]{6}" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} className={`${inputClass} px-4 py-3 text-center tracking-widest text-lg`} placeholder="123456" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-primary-500/20">
                  {loading ? t('common.verifying', 'Verifying...') : t('login.verifySubmit', 'Verify & Login')}
                </button>
              </>
            )}
            
            <button type="button" onClick={() => { setUseSms(false); setConfirmationResult(null); }} className="w-full mt-2 text-sm text-slate-500 hover:underline">
              {t('login.backToPasscode', 'Back to Passcode Login')}
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-sm text-center ${message.includes('failed') || message.includes('Invalid') ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
            {message}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-card-border text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setUseSms(false); setMessage(''); }} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">
            {isLogin ? t('registration.toggleRegister', "Don't have an account? Register") : t('registration.toggleLogin', "Already have an account? Log In")}
          </button>
        </div>
      </div>

      {/* HELPER MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-card-bg border border-card-border rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-card-border">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                {t('registration.roleDetailsTitle', 'Volunteer Roles Reference Guide')}
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 scrollbar-thin">
              {EXTENDED_DUTY_OPTIONS.map(group => (
                <div key={group.group} className="space-y-3 text-left">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
                    {t(group.groupKey, group.group)}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.options.map(opt => (
                      <div 
                        key={opt.dbValue} 
                        onClick={() => {
                          setDuty(opt.dbValue);
                          setShowHelpModal(false);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          duty === opt.dbValue 
                            ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/20 ring-2 ring-primary-500/20' 
                            : 'border-card-border bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {t(opt.titleKey, opt.dbValue)}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {t(opt.hintKey)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-card-border flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
              >
                {t('registration.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
