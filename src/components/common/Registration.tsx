import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RecaptchaVerifier } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth } from '../../services/firebase';

const EXTENDED_DUTY_OPTIONS = [
  { group: 'Default', options: ['None - but I will make Dua'] },
  { group: 'Spiritual & Educational', options: ['Wake-Up Caller for Fajr (Wakes up everyone)', 'Quran tajweed teacher'] },
  { group: 'Food & Refreshment', options: ['Halal Grocery Scout & Verifier (Checks ingredients)', 'Hydration & Water helper (Distributes water)', 'Iftar/Suhoor Time Announcer', 'Fruit & Snack Distributor'] },
  { group: 'Transport & Cleanliness', options: ['Bus Cleanliness Officer (Keeps bus tidy)', 'Trash & Recycling helper', 'Sound System & Nasheed Manager (Manages audio)', 'Weather & Road Commentator (Checks route updates)'] },
  { group: 'Community & Care', options: ['Elderly Support team (Assists elderly)', 'Halal Entertainment (Engages kids/group)', 'Salah Garment & Cover Organiser', 'Lost & Found Custodian (Keeps track of items)'] },
  { group: 'Logistics & Tech', options: ['Complaint In-Charge', 'Shared Expenses & Token Collector', 'Driver (Drives the minibus)', 'Map navigator GPS copilot (Guides driver)', 'Photographer (Captures memories)', 'Journalist (Writes trip summary)'] }
];

const CountdownTimer = () => {
  const targetDate = new Date('2026-07-02T14:00:00+02:00').getTime(); // July 2, 2pm
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

  return (
    <div className="mb-6 text-center bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-card-border shadow-inner">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('countdown.title', 'Registration Deadline')}</h3>
      <div dir="ltr" className="flex justify-center gap-4 sm:gap-6">
        {[
          { label: t('countdown.days', 'Days'), value: timeLeft.days },
          { label: t('countdown.hours', 'Hours'), value: timeLeft.hours },
          { label: t('countdown.mins', 'Mins'), value: timeLeft.minutes },
          { label: t('countdown.secs', 'Secs'), value: timeLeft.seconds },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center min-w-[60px] sm:min-w-[70px]">
            <span className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-red-500 to-orange-500 drop-shadow-sm">
              {item.value.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1 uppercase">{item.label}</span>
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
  const [smsCode, setSmsCode] = useState('');
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { signInWithIdentifierAndPasscode, sendPhoneSms, confirmPhoneSms, updateParticipantProfile } = useAuth();
  const { t } = useLanguage();

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
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md glass p-6 sm:p-8 rounded-2xl shadow-xl mt-8 mb-8">
        
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
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-2/3">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.role', 'Volunteer Role')}</label>
                  <select value={duty} onChange={(e) => setDuty(e.target.value)} className={`${inputClass} px-3 py-2 text-sm truncate`}>
                    {EXTENDED_DUTY_OPTIONS.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map(opt => <option key={opt} value={opt} title={opt}>{opt}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* First & Last Name Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.firstName', 'First Name')}</label>
                  <input required type="text" minLength={2} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder={t('registration.firstPlaceholder', 'John')} />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.lastName', 'Last Name')}</label>
                  <input required type="text" minLength={2} value={lastName} onChange={(e) => setLastName(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder={t('registration.lastPlaceholder', 'Doe')} />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.phone', 'Phone')}</label>
                  <input required type="tel" pattern="^\+.*" title="Must start with country code (e.g., +47)" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder="+47 123 45 678" />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.email', 'Email (Opt)')}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} px-3 py-2 text-sm`} placeholder="you@mail.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-500">{t('registration.passcode', 'Passcode (Opt 4-12 digits)')}</label>
                <input type="password" minLength={4} maxLength={12} value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`${inputClass} px-3 py-2.5`} placeholder="1234" />
                <p className="text-xs text-slate-400 mt-1">{t('registration.passcodeHint', 'Used to log back in quickly on a new device.')}</p>
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
    </div>
  );
};
