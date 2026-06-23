import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Wallet, CheckCircle2, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';

const PARTICIPANT_COUNT = 17;

const expenseBreakdown = [
  {
    category: '🏡 Accommodation & Lodging',
    desc: 'Shared luxury mountain cabins in Geilo, Stryn, and Geiranger (3 nights).',
    amountPerPerson: 2265,
    totalAmount: 2265 * PARTICIPANT_COUNT,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    category: '🚐 Transport & Logistics',
    desc: '17-seater Sprinter minibus rental, fuel, highway tolls (bompenger), and car ferries.',
    amountPerPerson: 1500,
    totalAmount: 1500 * PARTICIPANT_COUNT,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    category: '🍲 Food & Communal Catering',
    desc: 'Breakfast groceries, daily sandwich/trail lunch packages, and warm communal dinners.',
    amountPerPerson: 800,
    totalAmount: 800 * PARTICIPANT_COUNT,
    color: 'from-amber-500 to-orange-500',
  },
  {
    category: '🚢 Activities & Fjord Cruise',
    desc: 'Geirangerfjord sightseeing cruise, Dalsnibba Skywalk admission, and scenic routes.',
    amountPerPerson: 350,
    totalAmount: 350 * PARTICIPANT_COUNT,
    color: 'from-pink-500 to-rose-500',
  },
  {
    category: '🛡️ Safety Buffer & Admin',
    desc: 'Emergency contingency fund, first-aid kit, parking fees, and administrative items.',
    amountPerPerson: 84,
    totalAmount: 84 * PARTICIPANT_COUNT,
    color: 'from-purple-500 to-fuchsia-500',
  },
];

export const Finances: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const participantCount = PARTICIPANT_COUNT;
  const perPersonCost = 4999;
  const totalTripCost = perPersonCost * participantCount; // 84,983 NOK
  
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Hardcoded Admin Phone Number for Vipps (Norwegian Payment App)
  const VIPPS_ADMIN_PHONE = "4799999999"; 

  useEffect(() => {
    if (!user) return;
    
    // Listen for payments
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('participantId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalPaid = 0;
      snapshot.forEach(doc => {
        totalPaid += doc.data().amount;
      });
      setPaidAmount(totalPaid);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching payments", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const balance = perPersonCost - paidAmount;
  const isPaid = balance <= 0;

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleVippsPayment = () => {
    if (isMobileDevice()) {
      window.open(`vipps://?phone=${VIPPS_ADMIN_PHONE}&amount=${balance}`, '_blank');
    } else {
      setShowPaymentModal(true);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading financial data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('nav.finances')}</h1>
        <p className="text-slate-500 mt-2">Track your payments and trip costs transparently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-4">
            <Wallet className="w-5 h-5" />
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Trip Breakdown</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-card-border">
              <span className="text-slate-500">Total Trip Cost</span>
              <span className="font-mono font-medium">{totalTripCost.toLocaleString()} NOK</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-card-border">
              <span className="text-slate-500">Participants</span>
              <span className="font-mono font-medium">{participantCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Your Share</span>
              <span className="font-mono font-bold text-lg text-primary-600 dark:text-primary-400">{perPersonCost.toLocaleString()} NOK</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-6">
            <CreditCard className="w-5 h-5" />
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Payment Status</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Paid</span>
              <span className="font-mono font-medium text-success">{paidAmount.toLocaleString()} NOK</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-card-border">
              <span className="text-slate-500">Outstanding</span>
              <span className="font-mono font-bold text-error">{Math.max(0, balance).toLocaleString()} NOK</span>
            </div>

            {isPaid ? (
              <div className="mt-4 bg-success/10 text-success p-4 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Paid in Full</span>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="bg-warning/10 text-warning p-3 rounded-lg flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Please pay your outstanding balance before the trip begins.</p>
                </div>
                
                <button 
                  onClick={handleVippsPayment}
                  className="w-full flex items-center justify-center gap-2 bg-[#ff5b24] hover:bg-[#e04a1b] text-white py-3 rounded-xl font-bold transition-all hover-lift"
                >
                  Pay with Vipps
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Expense Category Section */}
      <div className="glass rounded-3xl p-6 md:p-8 shadow-md border border-card-border mt-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          📊 Itemized Budget Breakdown (Per Participant)
        </h2>
        <div className="space-y-6">
          {expenseBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-start gap-4 text-sm md:text-base">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.category}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 block">{item.amountPerPerson.toLocaleString()} NOK</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Group: {item.totalAmount.toLocaleString()} NOK</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${(item.amountPerPerson / perPersonCost) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vipps Desktop Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-card-border relative animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-[#ff5b24]/10 rounded-full flex items-center justify-center">
                <span className="text-[#ff5b24] font-black text-2xl">vipps</span>
              </div>
              <h3 className="text-2xl font-bold">Vipps Transfer</h3>
              <p className="text-slate-500 text-sm">
                Since you are on a desktop browser, please scan this code or perform a manual transfer in the Vipps app.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-48 h-48 bg-slate-300 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs font-mono text-center px-4 select-none text-slate-800 dark:text-slate-200">
                  [ Scan QR Code to Phone: {VIPPS_ADMIN_PHONE} ]
                </div>
                <span className="text-xs text-slate-400 mt-2">Scan code from your phone's camera</span>
              </div>

              <div className="text-left space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receiver Phone:</span>
                  <span className="font-mono font-bold">{VIPPS_ADMIN_PHONE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-mono font-bold text-error">{balance.toLocaleString()} NOK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Account:</span>
                  <span className="font-mono font-bold">1234.56.78901</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all"
                >
                  Close
                </button>
                <a
                  href={`sms:${VIPPS_ADMIN_PHONE}?body=Vipps payment for Geiranger trip: ${balance} NOK`}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-center transition-all flex items-center justify-center"
                >
                  Send SMS Link
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
