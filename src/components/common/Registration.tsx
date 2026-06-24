import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RecaptchaVerifier } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth } from '../../services/firebase';

const EXTENDED_DUTY_OPTIONS = [
  { group: 'Default', options: ['None - but I will make Dua'] },
  { group: 'Spiritual & Educational', options: ['Wake-Up Caller for Fajr', 'Quran tajweed teacher'] },
  { group: 'Food & Refreshment', options: ['Halal Grocery Scout & Verifier', 'Hydration & Water helper', 'Iftar/Suhoor Time Announcer', 'Fruit & Snack Distributor'] },
  { group: 'Transport & Cleanliness', options: ['Bus Cleanliness Officer', 'Trash & Recycling helper', 'Sound System & Nasheed Manager', 'Weather & Road Commentator'] },
  { group: 'Community & Care', options: ['Elderly Support team', 'Halal Entertainment', 'Salah Garment & Cover Organiser', 'Lost & Found Custodian'] },
  { group: 'Logistics & Tech', options: ['Complaint In-Charge', 'Shared Expenses & Token Collector', 'Memory Journal & Dua Request Scribe', 'Driver', 'Map navigator GPS copilot'] }
];

export const Registration: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [useSms, setUseSms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form State
  const [salutation, setSalutation] = useState('Br.');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [duty, setDuty] = useState('None - but I will make Dua');
  const [smsCode, setSmsCode] = useState('');
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { signInWithIdentifierAndPasscode, sendPhoneSms, confirmPhoneSms, updateParticipantProfile } = useAuth();

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
    try {
      const identifier = email || phone;
      if (!identifier) throw new Error("Please provide either a Phone Number or an Email.");
      
      // Attempt login/registration
      await signInWithIdentifierAndPasscode(identifier, passcode);
      
      // Once auth is successful, update profile with extra fields
      await updateParticipantProfile({
        name: `${salutation} ${name}`,
        phone,
        duty,
      });
    } catch (err: any) {
      setMessage(err.message || 'Registration failed');
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
      if (!identifier) throw new Error("Please enter your phone number or email.");
      await signInWithIdentifierAndPasscode(identifier, passcode);
    } catch (err: any) {
      setMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!phone) {
      setMessage('Please enter your phone number.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await sendPhoneSms(phone, appVerifier);
      setConfirmationResult(result);
      setMessage('SMS code sent!');
    } catch (err: any) {
      setMessage(err.message || 'Failed to send SMS');
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
      setMessage(err.message || 'Invalid SMS code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl mt-8 mb-8">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
              TR
            </div>
          </div>
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Trip Registration'}</h1>
          <p className="text-slate-500 mt-2">
            {isLogin ? 'Log in to view your itinerary' : 'Sign up to join the journey'}
          </p>
        </div>

        {/* RECAPTCHA CONTAINER */}
        <div id="recaptcha-container"></div>

        {!isLogin && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="block text-sm font-medium mb-1">Title</label>
                <select 
                  value={salutation} 
                  onChange={(e) => setSalutation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none"
                >
                  {['Br.', 'Sr.', 'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Imam'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="w-2/3">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="First Last" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="+47 123 45 678" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passcode (Optional 4-12 digits)</label>
              <input type="password" maxLength={12} value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="1234" />
              <p className="text-xs text-slate-400 mt-1">Used to log back in quickly on a new device.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Volunteer Role</label>
              <select value={duty} onChange={(e) => setDuty(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none text-sm">
                {EXTENDED_DUTY_OPTIONS.map(group => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 mt-4 hover-lift">
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        )}

        {isLogin && !useSms && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone or Email</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="Phone number or Email" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passcode</label>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="Leave blank if none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 hover-lift">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            
            <button type="button" onClick={() => setUseSms(true)} className="w-full mt-2 text-sm text-primary-600 hover:underline">
              Forgot Passcode? Login with SMS
            </button>
          </form>
        )}

        {isLogin && useSms && (
          <form onSubmit={handleVerifySms} className="space-y-4">
            {!confirmationResult ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none" placeholder="+47 123 45 678" />
                </div>
                <button type="button" onClick={handleSendSms} disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 hover-lift">
                  {loading ? 'Sending...' : 'Send SMS Code'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">6-Digit Code</label>
                  <input required type="text" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none text-center tracking-widest text-lg" placeholder="123456" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 hover-lift">
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </>
            )}
            
            <button type="button" onClick={() => { setUseSms(false); setConfirmationResult(null); }} className="w-full mt-2 text-sm text-slate-500 hover:underline">
              Back to Passcode Login
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
            {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};
