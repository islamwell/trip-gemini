import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { MessageSquare, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ComplaintForm {
  text: string;
}

export const Complaints: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<ComplaintForm>();
  const [myComplaints, setMyComplaints] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'complaints'), where('participantId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let complaintsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      complaintsData.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
      setMyComplaints(complaintsData);
    });
    return () => unsubscribe();
  }, [user]);

  const textValue = watch('text', '');

  const onSubmit = async (data: ComplaintForm) => {
    if (!user) return;
    setError('');

    try {
      await addDoc(collection(db, 'complaints'), {
        participantId: user.uid,
        participantName: user.displayName || user.email,
        text: data.text,
        timestamp: serverTimestamp(),
        status: 'unresolved'
      });
      setSubmitSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || t('complaints.submitFailed', 'Failed to submit complaint. Please try again.'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('nav.complaints')}</h1>
        <p className="text-slate-500 mt-2">{t('complaints.subtitle', 'Submit concerns securely and privately.')}</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          
          <div className="flex items-start gap-3 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 p-4 rounded-xl mb-6">
            <ShieldAlert className="w-6 h-6 mt-0.5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
            <div>
              <h3 className="font-semibold">{t('complaints.noticeTitle', 'Confidentiality Notice')}</h3>
              <p className="text-sm mt-1 opacity-90">
                {t('complaints.noticeDesc', 'Your concerns will only be reviewed by the designated Complaint Handler. Other participants cannot see your submissions.')}
              </p>
            </div>
          </div>

          {submitSuccess ? (
            <div className="bg-success/10 border border-success/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-success mb-2">{t('complaints.submittedTitle', 'Complaint Submitted')}</h3>
                <p className="text-success/80">
                  {t('complaints.submittedDesc', 'Thank you for letting us know. The Complaint Handler will review your concern and take appropriate action.')}
                </p>
              </div>
              <button 
                onClick={() => setSubmitSuccess(false)}
                className="mt-4 px-6 py-2 bg-success/20 text-success hover:bg-success/30 rounded-lg font-medium transition-colors"
              >
                {t('complaints.submitAnother', 'Submit Another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('complaints.describeConcern', 'Describe your concern')}
                </label>
                <div className="relative">
                  <textarea
                    id="text"
                    {...register('text', { 
                      required: t('complaints.errorRequired', 'Please describe your concern'),
                      minLength: { value: 10, message: t('complaints.errorMinLength', 'Must be at least 10 characters') },
                      maxLength: { value: 500, message: t('complaints.errorMaxLength', 'Cannot exceed 500 characters') }
                    })}
                    rows={5}
                    placeholder={t('complaints.placeholder', 'Please provide details...')}
                    className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-800/50 focus:ring-2 outline-none transition-all resize-none ${
                      errors.text 
                        ? 'border-error focus:ring-error focus:border-error' 
                        : 'border-card-border focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  ></textarea>
                  <div className={`absolute bottom-3 right-3 text-xs font-medium ${
                    textValue.length > 500 ? 'text-error' : 'text-slate-400'
                  }`}>
                    {textValue.length}/500
                  </div>
                </div>
                {errors.text && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.text.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white font-medium rounded-xl transition-all hover-lift flex items-center justify-center gap-2"
                >
                  {isSubmitting ? t('common.submitting', 'Submitting...') : t('complaints.submitBtn', 'Submit Complaint')}
                  {!isSubmitting && <MessageSquare className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}

          {/* User's Past Complaints */}
          {myComplaints.length > 0 && (
            <div className="mt-8 border-t border-card-border pt-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t('complaints.myComplaints', 'My Past Complaints')}</h3>
              <div className="space-y-4">
                {myComplaints.map(c => {
                  const isResolved = c.status === 'resolved';
                  return (
                    <div key={c.id} className={`p-4 rounded-xl border ${isResolved ? 'border-success/30 bg-success/5' : 'border-card-border bg-slate-50 dark:bg-slate-800/50'}`}>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isResolved ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                          {isResolved ? t('complaints.statusResolved', 'Resolved') : t('complaints.statusPending', 'Pending Review')}
                        </span>
                        {c.timestamp && <span className="text-xs text-slate-400">{c.timestamp.toDate ? c.timestamp.toDate().toLocaleString() : new Date(c.timestamp).toLocaleString()}</span>}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.text}</p>
                      
                      {isResolved && c.adminReply && (
                        <div className="mt-3 bg-white/60 dark:bg-slate-900/40 p-3 rounded-lg border border-card-border">
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 block mb-1">{t('complaints.adminReply', 'Reply from Admin:')}</span>
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{c.adminReply}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
