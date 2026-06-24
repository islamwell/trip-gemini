import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, addDoc, getDocs, doc, setDoc, deleteDoc, serverTimestamp, where } from 'firebase/firestore';
import { ShieldCheck, Users, Wallet, CheckCircle, AlertCircle, Clock, Map, Clipboard, Trash2, Settings } from 'lucide-react';
import { calculateBudget } from '../../data/finances';
import { useToast } from '../../contexts/ToastContext';
import { Finances } from '../participant/Finances';

interface ParticipantProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  hasSignedRules?: boolean;
  duty?: string;
}

interface Signature {
  id: string;
  participantId: string;
  participantName: string;
  signedAt: string;
  ipAddress: string;
  timestamp?: any;
}

interface Complaint {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: any;
  status: 'unresolved' | 'resolved';
}

interface Payment {
  id: string;
  participantId: string;
  amount: number;
}

export const DUTY_OPTIONS = [
  'Minibus Driver',
  'Lead Navigator',
  'Food Coordinator',
  'Prayer Leader (Imam)',
  'Muezzin (Adhan Caller)',
  'First Aid / Safety',
  'Equipment Manager',
  'Treasurer',
  'Cleaning Supervisor',
  'Photographer',
  'None / General Help'
];

export const AdminDashboard: React.FC = () => {
  const { role } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [participants, setParticipants] = useState<ParticipantProfile[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [itinerary, setItinerary] = useState<Record<string, any[]>>({});

  const [maxPassengers, setMaxPassengers] = useState(17);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'budget' | 'duties' | 'itinerary' | 'complaints'>('users');

  // Itinerary Edit Form State
  const [selectedDay, setSelectedDay] = useState<string>('thursday');
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(0);
  const [editTime, setEditTime] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // Sync edit form fields when itinerary stop changes
  useEffect(() => {
    if (itinerary[selectedDay] && itinerary[selectedDay][selectedStopIdx]) {
      const stop = itinerary[selectedDay][selectedStopIdx];
      setEditTime(stop.time);
      setEditLabel(stop.label);
      setEditDesc(stop.desc);
    }
  }, [selectedDay, selectedStopIdx, itinerary]);

  // Dynamic budget parameters based on setting
  const { perPersonCost, totalTripCost } = calculateBudget(maxPassengers);

  useEffect(() => {
    if (role !== 'admin') return;

    // 1. Listen to participants
    const unsubParticipants = onSnapshot(collection(db, 'participants'), (snap) => {
      const list: ParticipantProfile[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as ParticipantProfile);
      });
      setParticipants(list);
    });

    // 2. Listen to signatures
    const unsubSignatures = onSnapshot(collection(db, 'signatures'), (snap) => {
      const list: Signature[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Signature);
      });
      setSignatures(list);
    });

    // 3. Listen to complaints
    const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snap) => {
      const list: Complaint[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Complaint);
      });
      setComplaints(list);
    });

    // 4. Listen to payments
    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
      const list: Payment[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Payment);
      });
      setPayments(list);
    });

    // 5. Listen to itinerary
    const unsubItinerary = onSnapshot(collection(db, 'itinerary'), (snap) => {
      const data: Record<string, any[]> = {};
      snap.forEach(docSnap => {
        data[docSnap.id] = docSnap.data().stops;
      });
      setItinerary(data);
    });

    // 6. Listen to settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'trip'), (docSnap) => {
      if (docSnap.exists()) {
        setMaxPassengers(docSnap.data().maxPassengers || 17);
      } else {
        setDoc(doc(db, 'settings', 'trip'), { maxPassengers: 17 }).catch(console.error);
        setMaxPassengers(17);
      }
      setLoading(false);
    });

    return () => {
      unsubParticipants();
      unsubSignatures();
      unsubComplaints();
      unsubPayments();
      unsubItinerary();
      unsubSettings();
    };
  }, [role]);

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-error" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500">Only designated administrators can access this panel.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-slate-500">Loading Admin Control Panel...</div>;
  }

  // Toggle Payment paid status
  const handleTogglePayment = async (pId: string, currentPaid: boolean) => {
    try {
      if (currentPaid) {
        // Find payment documents for this user and delete them
        const q = query(collection(db, 'payments'), where('participantId', '==', pId));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await deleteDoc(doc(db, 'payments', d.id));
        });
      } else {
        // Add a payment document of perPersonCost NOK
        await addDoc(collection(db, 'payments'), {
          participantId: pId,
          amount: perPersonCost,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Failed to toggle payment:", err);
    }
  };

  // Delete participant permanently
  const handleDeleteParticipant = async (pId: string, pName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete passenger "${pName}"? This will delete their signature, payments, and complaints.`)) return;
    
    try {
      // 1. Delete participant profile
      await deleteDoc(doc(db, 'participants', pId));
      
      // 2. Delete signatures
      const sigQ = query(collection(db, 'signatures'), where('participantId', '==', pId));
      const sigSnap = await getDocs(sigQ);
      sigSnap.forEach(async (d) => {
        await deleteDoc(doc(db, 'signatures', d.id));
      });
      
      // 3. Delete payments
      const payQ = query(collection(db, 'payments'), where('participantId', '==', pId));
      const paySnap = await getDocs(payQ);
      paySnap.forEach(async (d) => {
        await deleteDoc(doc(db, 'payments', d.id));
      });
      
      // 4. Delete complaints
      const compQ = query(collection(db, 'complaints'), where('participantId', '==', pId));
      const compSnap = await getDocs(compQ);
      compSnap.forEach(async (d) => {
        await deleteDoc(doc(db, 'complaints', d.id));
      });

      showSuccess("Participant and all related records deleted successfully.");
    } catch (err) {
      console.error("Failed to delete participant:", err);
      showError("Error deleting participant.");
    }
  };

  // Save trip passenger capacity settings
  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'trip'), { maxPassengers }, { merge: true });
      showSuccess(`Passenger limit updated to ${maxPassengers} successfully!`);
    } catch (err) {
      console.error("Failed to update settings:", err);
      showError("Failed to update passenger capacity.");
    }
  };

  // Resolve complaint
  const handleResolveComplaint = async (cId: string, currentStatus: string) => {
    try {
      await setDoc(doc(db, 'complaints', cId), {
        status: currentStatus === 'resolved' ? 'unresolved' : 'resolved'
      }, { merge: true });
    } catch (err) {
      console.error("Failed to update complaint status:", err);
    }
  };

  // Assign duty to participant
  const handleAssignDuty = async (pId: string, newDuty: string) => {
    try {
      await setDoc(doc(db, 'participants', pId), {
        duty: newDuty
      }, { merge: true });
    } catch (err) {
      console.error("Failed to assign duty:", err);
    }
  };

  // Save itinerary stop change
  const handleSaveItineraryStop = async () => {
    try {
      if (!itinerary[selectedDay]) return;
      
      const updatedStops = [...itinerary[selectedDay]];
      const targetStop = { ...updatedStops[selectedStopIdx] };
      
      const oldTime = targetStop.time;
      const oldLabel = targetStop.label;
      
      targetStop.time = editTime;
      targetStop.label = editLabel;
      targetStop.desc = editDesc;
      
      updatedStops[selectedStopIdx] = targetStop;
      
      // Update in Firestore
      await setDoc(doc(db, 'itinerary', selectedDay), {
        stops: updatedStops
      });

      // Send notification if requested
      if (sendNotification) {
        let msg = `${selectedDay.toUpperCase()}: Stop "${targetStop.label}" was updated.`;
        if (oldTime !== editTime) {
          msg += ` Time changed from ${oldTime} to ${editTime}.`;
        }
        if (oldLabel !== editLabel) {
          msg += ` Location renamed from "${oldLabel}" to "${editLabel}".`;
        }
        await addDoc(collection(db, 'notifications'), {
          title: 'Itinerary Update',
          message: msg,
          timestamp: serverTimestamp()
        });
      }
      showSuccess("Itinerary stop updated successfully!");
    } catch (err) {
      console.error("Failed to update itinerary stop:", err);
      showError("Failed to update stop.");
    }
  };

  // Calculations
  const totalSubmissions = signatures.length;
  const totalOutstandingIncome = participants.reduce((sum, p) => {
    const totalPaid = payments.filter(pay => pay.participantId === p.id).reduce((s, pay) => s + pay.amount, 0);
    return sum + Math.max(0, perPersonCost - totalPaid);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
        <p className="text-slate-500 mt-2">Manage user signatures, assign duties, edit the itinerary, and resolve feedback.</p>
      </div>


      {/* Trip Settings Control */}
      <div className="glass rounded-3xl p-6 border border-card-border mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-500 animate-spin-slow" /> Capacity & Settings
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 max-w-xl">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Max Trip Passengers</label>
            <input
              type="number"
              min="1"
              max="50"
              value={maxPassengers}
              onChange={(e) => setMaxPassengers(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white dark:bg-slate-800 border border-card-border px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-500/10 hover-lift shrink-0"
          >
            Update Capacity
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Recalculates shared accommodation & transport parts automatically. Per-passenger cost is currently <strong className="text-slate-600 dark:text-slate-200">{perPersonCost.toLocaleString()} NOK</strong> (Total budget: {totalTripCost.toLocaleString()} NOK).
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-card-border">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Members</span>
            <span className="text-2xl font-bold">{participants.length} / {maxPassengers}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-card-border">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Signatures</span>
            <span className="text-2xl font-bold">{totalSubmissions} Signed</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-card-border">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Unpaid Members</span>
            <span className="text-2xl font-bold">{totalOutstandingIncome.toLocaleString()} NOK due</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-card-border gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Signatures & Rules
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'payments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Payments Track
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'budget' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Budget Breakdown
        </button>
        <button
          onClick={() => setActiveTab('duties')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'duties' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Duties & Roles
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'itinerary' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Edit Itinerary
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'complaints' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Complaints ({complaints.filter(c => c.status !== 'resolved').length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="glass rounded-3xl p-6 border border-card-border overflow-x-auto">
        {activeTab === 'users' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border text-slate-400 text-sm uppercase font-semibold">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rule Signing Status</th>
                <th className="py-3 px-4">Signing IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => {
                const sig = signatures.find(s => s.participantId === p.id);
                return (
                  <tr key={p.id} className="border-b border-card-border hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                     <td className="py-4 px-4 font-bold">{p.name}</td>
                    <td className="py-4 px-4 font-mono text-sm">{p.email}</td>
                    <td className="py-4 px-4">
                      {sig ? (
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
                           <CheckCircle className="w-3.5 h-3.5" />
                          Signed Rules
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-warning/10 text-warning text-xs font-semibold px-2.5 py-1 rounded-full">
                           <Clock className="w-3.5 h-3.5" />
                          Pending Sign
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">{sig ? sig.ipAddress : 'N/A'}</td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {sig ? new Date(sig.signedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleDeleteParticipant(p.id, p.name)}
                        className="flex items-center gap-1 text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                        title="Delete passenger permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'payments' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border text-slate-400 text-sm uppercase font-semibold">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Required Share</th>
                <th className="py-3 px-4">Paid Status</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => {
                const totalPaid = payments.filter(pay => pay.participantId === p.id).reduce((sum, pay) => sum + pay.amount, 0);
                const isPaid = totalPaid >= perPersonCost;
                
                return (
                  <tr key={p.id} className="border-b border-card-border hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                    <td className="py-4 px-4 font-bold">{p.name}</td>
                    <td className="py-4 px-4 font-mono">{perPersonCost.toLocaleString()} NOK</td>
                    <td className="py-4 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
                          Paid in Full
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-error/10 text-error text-xs font-semibold px-2.5 py-1 rounded-full">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-sm">
                      {Math.max(0, perPersonCost - totalPaid).toLocaleString()} NOK
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePayment(p.id, isPaid)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                          isPaid 
                            ? 'bg-error/10 text-error hover:bg-error/25' 
                            : 'bg-success/10 text-success hover:bg-success/25'
                        }`}
                      >
                        {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'budget' && (
          <Finances />
        )}

        {activeTab === 'duties' && (
          <div className="space-y-6">
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-4 rounded-2xl">
              <h3 className="font-bold text-sm text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                <Clipboard className="w-4 h-4" /> Duty Assignment Guide
              </h3>
              <p className="text-xs text-primary-700 dark:text-primary-400 mt-1">
                Assign roles to passengers to distribute workload during the trip (e.g., driver, navigator, cook). These are displayed on the home dashboard.
              </p>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border text-slate-400 text-sm uppercase font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Duty</th>
                  <th className="py-3 px-4">Assign Duty</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-b border-card-border hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                    <td className="py-4 px-4 font-bold">{p.name}</td>
                    <td className="py-4 px-4 font-mono text-sm">{p.email}</td>
                    <td className="py-4 px-4">
                      {p.duty ? (
                        <span className="inline-flex bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {p.duty}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Duty Assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={p.duty || 'None / General Help'}
                        onChange={(e) => handleAssignDuty(p.id, e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-card-border px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      >
                        {DUTY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-4 rounded-2xl">
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Map className="w-4 h-4" /> Edit Route Stops & Times
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Select a day and stop to modify its schedule, label, or description. Any changes will persist in Firestore and propagate to all participants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Select Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => {
                    setSelectedDay(e.target.value);
                    setSelectedStopIdx(0);
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-card-border px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Select Stop</label>
                <select
                  value={selectedStopIdx}
                  onChange={(e) => setSelectedStopIdx(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-card-border px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {(itinerary[selectedDay] || []).map((stop, idx) => (
                    <option key={idx} value={idx}>
                      [{stop.time}] {stop.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-card-border my-6" />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Time (e.g., 15:30 or placeholder {'{fajr}'} / {'{sunset}'})</label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-card-border px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Location / Stop Title</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-card-border px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description / Sights / Notes</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-white dark:bg-slate-800 border border-card-border px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="send-notif"
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 border-card-border"
                />
                <label htmlFor="send-notif" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notify participants about this change (creates a broadcast alert)
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveItineraryStop}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-500/10"
                >
                  Save Stop Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No complaints filed yet.</div>
            ) : (
              complaints.map((c) => {
                const isResolved = c.status === 'resolved';
                return (
                  <div key={c.id} className={`p-5 rounded-2xl border transition-all ${
                    isResolved ? 'border-success/20 bg-success/5 opacity-60' : 'border-card-border bg-slate-50/50 dark:bg-slate-900/10'
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block">Submitted by: {c.participantName}</span>
                        <p className="mt-2 text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">{c.text}</p>
                      </div>
                      <button
                        onClick={() => handleResolveComplaint(c.id, c.status)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          isResolved 
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        {isResolved ? 'Mark Unresolved' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
