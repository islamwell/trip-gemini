import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { Wallet, CheckCircle2, AlertCircle, CreditCard, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { calculateBudget } from '../../data/finances';

export const Finances: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [maxPassengers, setMaxPassengers] = useState(17);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Hardcoded Admin Phone Number for Vipps (Norwegian Payment App)
  const VIPPS_ADMIN_PHONE = "4799999999"; 

  useEffect(() => {
    // 1. Listen to trip capacity settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'trip'), (docSnap) => {
      if (docSnap.exists()) {
        setMaxPassengers(docSnap.data().maxPassengers || 17);
      }
    });

    return () => unsubSettings();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // 2. Listen for payments
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

  const { perPersonCost, totalTripCost, breakdown } = calculateBudget(maxPassengers);
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
    return <div className="p-8 text-center animate-pulse">{t('finances.loading')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('nav.finances')}</h1>
        <p className="text-slate-500 mt-2">{t('finances.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-4">
            <Wallet className="w-5 h-5" />
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{t('finances.breakdownTitle')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-card-border">
              <span className="text-slate-500 font-medium text-sm">{t('finances.totalGroupCost')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalTripCost.toLocaleString()} NOK</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-card-border">
              <span className="text-slate-500 font-medium text-sm">{t('finances.passengersCapacity')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{maxPassengers}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{t('finances.individualShare')}</span>
              <span className="font-mono font-black text-xl text-primary-600 dark:text-primary-400">{perPersonCost.toLocaleString()} NOK</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-6">
            <CreditCard className="w-5 h-5" />
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{t('finances.paymentStatus')}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-sm">{t('finances.paidAmount')}</span>
              <span className="font-mono font-bold text-success text-base">{paidAmount.toLocaleString()} NOK</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-card-border">
              <span className="text-slate-500 font-medium text-sm">{t('finances.outstandingBalance')}</span>
              <span className="font-mono font-bold text-error text-base">{Math.max(0, balance).toLocaleString()} NOK</span>
            </div>

            {isPaid ? (
              <div className="mt-4 bg-success/10 text-success p-4 rounded-xl flex items-center justify-center gap-2 border border-success/20">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wide">{t('finances.paidInFull')}</span>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="bg-warning/10 text-warning p-3 rounded-lg flex items-start gap-2 text-sm border border-warning/20">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">{t('finances.transferPrompt')}</p>
                </div>
                
                <button 
                  onClick={handleVippsPayment}
                  className="w-full flex items-center justify-center gap-2 bg-[#ff5b24] hover:bg-[#e04a1b] text-white py-3 rounded-xl font-bold transition-all hover-lift shadow-md shadow-[#ff5b24]/10"
                >
                  {t('finances.payWithVipps')}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Expense Category Section with Accordions */}
      <div className="glass rounded-3xl p-6 md:p-8 shadow-md border border-card-border mt-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          {t('finances.itemizedBreakdown')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {t('finances.expandInstruction')}
        </p>
        <div className="space-y-4">
          {breakdown.map((item, idx) => {
            const isExpanded = expandedCategory === item.id;
            return (
              <div 
                key={idx} 
                className={`border border-card-border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'bg-slate-50/30 dark:bg-slate-900/10 shadow-sm' : ''
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : item.id)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-base md:text-lg">
                      {t('finances.category.' + item.id, item.category)}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {t('finances.category.' + item.id + '_desc', item.desc)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 block text-sm md:text-base">
                        {item.amountPerPerson.toLocaleString()} NOK
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {t('finances.totalLabel', { amount: item.totalAmount.toLocaleString() })}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Progress bar */}
                <div className="px-5 pb-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${(item.amountPerPerson / perPersonCost) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-5 pt-3 border-t border-card-border bg-slate-50/20 dark:bg-slate-900/5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('finances.evidenceTitle')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.evidence.map((ev, evIdx) => (
                        <div 
                          key={evIdx} 
                          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-card-border flex flex-col justify-between space-y-2 hover:shadow-sm transition-shadow"
                        >
                          <div className="space-y-1.5">
                            <span className="font-extrabold text-xs text-slate-700 dark:text-slate-300 block">
                              {t('finances.evidence.' + item.id + '.' + evIdx + '.label', ev.label)}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
                              {t('finances.evidence.' + item.id + '.' + evIdx + '.detail', ev.costDetail)}
                            </p>
                          </div>
                          {ev.sourceUrl && (
                            <a
                              href={ev.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline pt-2 border-t border-card-border mt-2"
                            >
                              {ev.sourceLabel ? t('finances.evidence.' + item.id + '.' + evIdx + '.sourceLabel', ev.sourceLabel) : t('finances.verifyPriceSource')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mathematical Proof Badge */}
      <div className="glass rounded-3xl p-6 md:p-8 shadow-md border border-card-border bg-gradient-to-br from-primary-500/5 to-teal-500/5 mt-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          {t('finances.mathematicalProofTitle')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {t('finances.mathematicalProofDesc')}
        </p>
        <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-card-border flex flex-col items-center justify-center text-center space-y-3">
          <div className="font-mono font-bold text-lg md:text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
            {t('finances.proofFormula', { passengers: maxPassengers, perPerson: perPersonCost.toLocaleString(), total: totalTripCost.toLocaleString() })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            {t('finances.verifiedBalance', { total1: totalTripCost.toLocaleString(), total2: totalTripCost.toLocaleString() })}
          </div>
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
              <h3 className="text-2xl font-bold">{t('finances.vippsTransfer')}</h3>
              <p className="text-slate-500 text-sm">
                {t('finances.desktopVippsPrompt')}
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-48 h-48 bg-slate-300 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs font-mono text-center px-4 select-none text-slate-800 dark:text-slate-200">
                  {t('finances.scanQrPrompt', { phone: VIPPS_ADMIN_PHONE })}
                </div>
                <span className="text-xs text-slate-400 mt-2">{t('finances.scanCodePrompt')}</span>
              </div>

              <div className="text-left space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('finances.receiverPhone')}</span>
                  <span className="font-mono font-bold">{VIPPS_ADMIN_PHONE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('finances.amountLabel')}</span>
                  <span className="font-mono font-bold text-error">{balance.toLocaleString()} NOK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('finances.bankAccount')}</span>
                  <span className="font-mono font-bold">1234.56.78901</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all"
                >
                  {t('common.close')}
                </button>
                <a
                  href={`sms:${VIPPS_ADMIN_PHONE}?body=Vipps payment for Geiranger trip: ${balance} NOK`}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-center transition-all flex items-center justify-center"
                >
                  {t('finances.sendSmsLink')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
