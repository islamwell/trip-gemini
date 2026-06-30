import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, addDoc, getDocs, doc, setDoc, deleteDoc, serverTimestamp, where, deleteField, orderBy } from 'firebase/firestore';
import { ShieldCheck, Users, Wallet, CheckCircle, AlertCircle, Clock, Map, Clipboard, Trash2, Settings, LogOut, Globe, Search } from 'lucide-react';
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
  createdAt?: any;
  favoriteFoods?: string;
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
  adminReply?: string;
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
  const { role, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [participants, setParticipants] = useState<ParticipantProfile[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintReplies, setComplaintReplies] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<Payment[]>([]);
  const [itinerary, setItinerary] = useState<Record<string, any[]>>({});

  const [maxPassengers, setMaxPassengers] = useState(17);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'budget' | 'duties' | 'itinerary' | 'complaints' | 'translations' | 'covenant' | 'packing'>('users');

  // Real-time rules & packing list states
  const [rules, setRules] = useState<any[]>([]);
  const [packingList, setPackingList] = useState<any[]>([]);

  // Covenant Rules forms states
  const [newRuleTitleEn, setNewRuleTitleEn] = useState('');
  const [newRuleTitleNo, setNewRuleTitleNo] = useState('');
  const [newRuleTitleUr, setNewRuleTitleUr] = useState('');
  const [newRuleIcon, setNewRuleIcon] = useState('HelpCircle');
  const [newRuleQuoteEn, setNewRuleQuoteEn] = useState('');
  const [newRuleQuoteNo, setNewRuleQuoteNo] = useState('');
  const [newRuleQuoteUr, setNewRuleQuoteUr] = useState('');
  const [newRuleQuranAyat, setNewRuleQuranAyat] = useState('');

  // Inline editing state for covenant rules
  const [editingField, setEditingField] = useState<{
    type: 'section_title' | 'section_quote' | 'section_quran_ayat' | 'rule_item';
    sectionDocId: string;
    itemId?: string;
    lang?: 'en' | 'no' | 'ur';
    value: string;
  } | null>(null);

  // Editing items states inside Covenant rules
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [newRuleItemEn, setNewRuleItemEn] = useState('');
  const [newRuleItemNo, setNewRuleItemNo] = useState('');
  const [newRuleItemUr, setNewRuleItemUr] = useState('');
  
  // Packing List forms states
  const [newPackNameEn, setNewPackNameEn] = useState('');
  const [newPackNameNo, setNewPackNameNo] = useState('');
  const [newPackNameUr, setNewPackNameUr] = useState('');
  const [newPackDescEn, setNewPackDescEn] = useState('');
  const [newPackDescNo, setNewPackDescNo] = useState('');
  const [newPackDescUr, setNewPackDescUr] = useState('');
  const [newPackStoreEn, setNewPackStoreEn] = useState('');
  const [newPackStoreNo, setNewPackStoreNo] = useState('');
  const [newPackStoreUr, setNewPackStoreUr] = useState('');
  const [newPackImageUrl, setNewPackImageUrl] = useState('');
  const [newPackCategory, setNewPackCategory] = useState<'clothing' | 'spiritual' | 'electronics' | 'health' | 'documents' | 'comfort'>('clothing');
  const [editingPackItemId, setEditingPackItemId] = useState<string | null>(null);

  const handleAddRuleSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitleEn || !newRuleTitleNo || !newRuleTitleUr) {
      showError("Please enter the title in all languages.");
      return;
    }
    try {
      const nextId = rules.length > 0 ? Math.max(...rules.map(r => r.id || 0)) + 1 : 1;
      const sectionData: any = {
        id: nextId,
        title: { en: newRuleTitleEn, no: newRuleTitleNo, ur: newRuleTitleUr },
        iconName: newRuleIcon,
        items: []
      };
      if (newRuleQuoteEn || newRuleQuoteNo || newRuleQuoteUr) {
        sectionData.quote = { en: newRuleQuoteEn, no: newRuleQuoteNo, ur: newRuleQuoteUr };
      }
      if (newRuleQuranAyat) {
        sectionData.quranAyat = newRuleQuranAyat.trim();
      }
      await setDoc(doc(db, 'covenant', `section_${nextId}`), sectionData);
      showSuccess("New rules section added!");
      setNewRuleTitleEn('');
      setNewRuleTitleNo('');
      setNewRuleTitleUr('');
      setNewRuleQuoteEn('');
      setNewRuleQuoteNo('');
      setNewRuleQuoteUr('');
      setNewRuleQuranAyat('');
    } catch (err) {
      console.error(err);
      showError("Failed to add section");
    }
  };

  const handleDeleteRuleSection = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this section and all its rules?")) return;
    try {
      await deleteDoc(doc(db, 'covenant', docId));
      showSuccess("Rules section deleted.");
      if (selectedRuleId && docId === `section_${selectedRuleId}`) {
        setSelectedRuleId(null);
      }
    } catch (err) {
      console.error(err);
      showError("Failed to delete section");
    }
  };

  const handleAddRuleItem = async (sectionDocId: string) => {
    if (!newRuleItemEn || !newRuleItemNo || !newRuleItemUr) {
      showError("Please fill in item text in all languages.");
      return;
    }
    try {
      const section = rules.find(r => r.docId === sectionDocId);
      if (!section) return;

      const items = section.items || [];
      const nextItemIndex = items.length + 1;
      const sectionNum = section.id;
      const newItemId = `${sectionNum}_${nextItemIndex}_${Date.now()}`;

      const newItem = {
        id: newItemId,
        en: newRuleItemEn,
        no: newRuleItemNo,
        ur: newRuleItemUr
      };

      const updatedItems = [...items, newItem];
      await setDoc(doc(db, 'covenant', sectionDocId), { items: updatedItems }, { merge: true });
      showSuccess("Rule item added!");
      setNewRuleItemEn('');
      setNewRuleItemNo('');
      setNewRuleItemUr('');
    } catch (err) {
      console.error(err);
      showError("Failed to add rule item");
    }
  };

  const handleDeleteRuleItem = async (sectionDocId: string, itemId: string) => {
    if (!window.confirm("Delete this rule item?")) return;
    try {
      const section = rules.find(r => r.docId === sectionDocId);
      if (!section) return;
      const updatedItems = (section.items || []).filter((item: any) => item.id !== itemId);
      await setDoc(doc(db, 'covenant', sectionDocId), { items: updatedItems }, { merge: true });
      showSuccess("Rule item deleted.");
    } catch (err) {
      console.error(err);
      showError("Failed to delete rule item");
    }
  };

  const handleSaveInlineEdit = async (currentFieldState?: typeof editingField) => {
    const field = currentFieldState || editingField;
    if (!field) return;
    const { type, sectionDocId, itemId, lang, value } = field;
    setEditingField(null);
    const section = rules.find(s => s.docId === sectionDocId);
    if (!section) return;

    try {
      if (type === 'section_title') {
        const updatedTitle = { ...section.title, [lang!]: value.trim() };
        await setDoc(doc(db, 'covenant', sectionDocId), { title: updatedTitle }, { merge: true });
        showSuccess("Section title updated!");
      } else if (type === 'section_quote') {
        const updatedQuote = { ...(section.quote || { en: '', no: '', ur: '' }), [lang!]: value.trim() };
        await setDoc(doc(db, 'covenant', sectionDocId), { quote: updatedQuote }, { merge: true });
        showSuccess("Section quote updated!");
      } else if (type === 'section_quran_ayat') {
        await setDoc(doc(db, 'covenant', sectionDocId), { quranAyat: value.trim() }, { merge: true });
        showSuccess("Section Quranic Verse updated!");
      } else if (type === 'rule_item') {
        const updatedItems = (section.items || []).map((item: any) => {
          if (item.id === itemId) {
            return { ...item, [lang!]: value.trim() };
          }
          return item;
        });
        await setDoc(doc(db, 'covenant', sectionDocId), { items: updatedItems }, { merge: true });
        showSuccess("Rule item updated!");
      }
    } catch (err) {
      console.error("Failed to save inline edit:", err);
      showError("Failed to save change.");
    }
  };

  const handleAddOrEditPackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackNameEn || !newPackNameNo || !newPackNameUr) {
      showError("Please fill in the item name in all languages.");
      return;
    }
    try {
      const itemId = editingPackItemId || `pack_${Date.now()}`;
      const itemData: any = {
        id: itemId,
        category: newPackCategory,
        name: { en: newPackNameEn, no: newPackNameNo, ur: newPackNameUr },
        desc: { en: newPackDescEn, no: newPackDescNo, ur: newPackDescUr },
        store: { en: newPackStoreEn, no: newPackStoreNo, ur: newPackStoreUr },
        imageUrl: newPackImageUrl.trim() || undefined
      };
      await setDoc(doc(db, 'packing_list', itemId), itemData);
      showSuccess(editingPackItemId ? "Packing item updated!" : "New packing item added!");
      
      setNewPackNameEn('');
      setNewPackNameNo('');
      setNewPackNameUr('');
      setNewPackDescEn('');
      setNewPackDescNo('');
      setNewPackDescUr('');
      setNewPackStoreEn('');
      setNewPackStoreNo('');
      setNewPackStoreUr('');
      setNewPackImageUrl('');
      setEditingPackItemId(null);
    } catch (err) {
      console.error(err);
      showError("Failed to save packing item");
    }
  };

  const handleDeletePackingItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this packing item?")) return;
    try {
      await deleteDoc(doc(db, 'packing_list', itemId));
      showSuccess("Packing item deleted.");
      if (editingPackItemId === itemId) {
        setEditingPackItemId(null);
      }
    } catch (err) {
      console.error(err);
      showError("Failed to delete packing item");
    }
  };

  const handleStartEditPackingItem = (item: any) => {
    setEditingPackItemId(item.id);
    setNewPackCategory(item.category);
    setNewPackNameEn(item.name.en || '');
    setNewPackNameNo(item.name.no || '');
    setNewPackNameUr(item.name.ur || '');
    setNewPackDescEn(item.desc.en || '');
    setNewPackDescNo(item.desc.no || '');
    setNewPackDescUr(item.desc.ur || '');
    setNewPackStoreEn(item.store.en || '');
    setNewPackStoreNo(item.store.no || '');
    setNewPackStoreUr(item.store.ur || '');
    setNewPackImageUrl(item.imageUrl || '');
    const formEl = document.getElementById('packing-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Translation Editor state
  const [defaultLocales, setDefaultLocales] = useState<Record<string, string>>({});
  const [selectedLang, setSelectedLang] = useState<'en' | 'no' | 'ur'>('ur');
  const [firestoreOverrides, setFirestoreOverrides] = useState<Record<string, string>>({});
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

    // 7. Listen to covenant rules
    const unsubRules = onSnapshot(query(collection(db, 'covenant'), orderBy('id', 'asc')), (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ docId: docSnap.id, ...docSnap.data() });
      });
      setRules(list);
    });

    // 8. Listen to packing list items
    const unsubPackingList = onSnapshot(collection(db, 'packing_list'), (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ docId: docSnap.id, ...docSnap.data() });
      });
      setPackingList(list);
    });

    return () => {
      unsubParticipants();
      unsubSignatures();
      unsubComplaints();
      unsubPayments();
      unsubItinerary();
      unsubSettings();
      unsubRules();
      unsubPackingList();
    };
  }, [role]);

  // Load default English locales baseline keys
  useEffect(() => {
    fetch('/locales/en/translation.json')
      .then(res => res.json())
      .then(data => {
        const flat: Record<string, string> = {};
        const flatten = (obj: any, prefix = '') => {
          for (const key in obj) {
            const val = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof val === 'object' && val !== null) {
              flatten(val, newKey);
            } else {
              flat[newKey] = String(val);
            }
          }
        };
        flatten(data);
        setDefaultLocales(flat);
      })
      .catch(err => console.error("Error loading default locales:", err));
  }, []);

  // Listen to active translation overrides from Firestore
  useEffect(() => {
    const unsubOverrides = onSnapshot(doc(db, 'translations', selectedLang), (docSnap) => {
      if (docSnap.exists()) {
        setFirestoreOverrides(docSnap.data() as Record<string, string>);
      } else {
        setFirestoreOverrides({});
      }
    });
    return () => unsubOverrides();
  }, [selectedLang]);

  // Reset page when search or lang changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLang]);

  const handleSaveOverride = async (key: string, value: string) => {
    try {
      await setDoc(doc(db, 'translations', selectedLang), {
        [key]: value
      }, { merge: true });
      showSuccess(`Override for "${key}" saved successfully!`);
    } catch (err) {
      console.error(err);
      showError("Failed to save override");
    }
  };

  const handleDeleteOverride = async (key: string) => {
    try {
      await setDoc(doc(db, 'translations', selectedLang), {
        [key]: deleteField()
      }, { merge: true });
      showSuccess(`Override reverted to default.`);
    } catch (err) {
      console.error(err);
      showError("Failed to delete override");
    }
  };

  const filteredKeys = Object.keys(defaultLocales).filter(key => 
    key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (defaultLocales[key] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const keysPerPage = 50;
  const totalPages = Math.ceil(filteredKeys.length / keysPerPage);
  const startIndex = (currentPage - 1) * keysPerPage;
  const paginatedKeys = filteredKeys.slice(startIndex, startIndex + keysPerPage);

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
      const payload: any = {
        status: currentStatus === 'resolved' ? 'unresolved' : 'resolved'
      };
      if (currentStatus !== 'resolved' && complaintReplies[cId]) {
        payload.adminReply = complaintReplies[cId];
      }
      await setDoc(doc(db, 'complaints', cId), payload, { merge: true });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
          <p className="text-slate-500 mt-2">Manage user signatures, assign duties, edit the itinerary, and resolve feedback.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-error bg-error/10 hover:bg-error/20 rounded-xl font-bold transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
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
      <div className="flex flex-wrap border-b border-card-border gap-2 mb-4">
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
        <button
          onClick={() => setActiveTab('translations')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'translations' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Translations
        </button>
        <button
          onClick={() => setActiveTab('covenant')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'covenant' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Covenant Rules
        </button>
        <button
          onClick={() => setActiveTab('packing')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'packing' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Packing List
        </button>
      </div>

      {/* Tab Panels */}
      <div className="glass rounded-3xl p-6 border border-card-border">
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Summary of Favorite Foods */}
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-4 rounded-2xl mb-6">
              <h3 className="font-bold text-sm text-primary-800 dark:text-primary-300">Favorite Foods Summary</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {participants.filter(p => p.favoriteFoods).map(p => (
                  <span key={p.id} className="bg-white dark:bg-slate-800 border border-card-border px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
                    {p.name}: <span className="font-semibold text-primary-600 dark:text-primary-400">{p.favoriteFoods}</span>
                  </span>
                ))}
                {participants.filter(p => p.favoriteFoods).length === 0 && (
                  <span className="text-xs text-slate-500 italic">No favorite foods recorded yet.</span>
                )}
              </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-4">
              {participants.map((p) => {
                const sig = signatures.find(s => s.participantId === p.id);
                return (
                  <div key={p.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-card-border space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.name}</span>
                      <button
                        onClick={() => handleDeleteParticipant(p.id, p.name)}
                        className="flex items-center gap-1 text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-2 py-1 rounded-lg transition-all"
                        title="Delete passenger permanently"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                    <div className="text-slate-500 font-mono break-all">{p.email}</div>
                    {p.favoriteFoods && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Favorite Foods</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{p.favoriteFoods}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Registered At</span>
                      <span className="text-slate-600 dark:text-slate-400">{p.createdAt ? (p.createdAt.toDate ? p.createdAt.toDate().toLocaleString() : new Date(p.createdAt).toLocaleString()) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-card-border/50">
                      <span className="text-slate-400 font-semibold">Rules Status</span>
                      {sig ? (
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-semibold px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Signed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-warning/10 text-warning text-xs font-semibold px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    {sig && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">IP Address</span>
                          <span className="font-mono text-slate-600 dark:text-slate-355">{sig.ipAddress}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Timestamp</span>
                          <span className="text-slate-500">{new Date(sig.signedAt).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border text-slate-400 text-sm uppercase font-semibold">
                  <th className="py-3 px-4">Name & Fav Foods</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Registered</th>
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
                      <td className="py-4 px-4 font-bold">
                        {p.name}
                        {p.favoriteFoods && <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">Foods: {p.favoriteFoods}</div>}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm">{p.email}</td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {p.createdAt ? (p.createdAt.toDate ? p.createdAt.toDate().toLocaleString() : new Date(p.createdAt).toLocaleString()) : 'N/A'}
                      </td>
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
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-4">
              {participants.map((p) => {
                const totalPaid = payments.filter(pay => pay.participantId === p.id).reduce((sum, pay) => sum + pay.amount, 0);
                const isPaid = totalPaid >= perPersonCost;
                
                return (
                  <div key={p.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-card-border space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.name}</span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Paid in Full
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-error/10 text-error text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-card-border/50">
                      <span className="text-slate-400 font-semibold">Required Share</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{perPersonCost.toLocaleString()} NOK</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Outstanding Balance</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{Math.max(0, perPersonCost - totalPaid).toLocaleString()} NOK</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleTogglePayment(p.id, isPaid)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                          isPaid 
                            ? 'bg-error/10 text-error hover:bg-error/25' 
                            : 'bg-success/10 text-success hover:bg-success/25'
                        }`}
                      >
                        {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <table className="hidden md:table w-full text-left border-collapse">
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
          </div>
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

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-4">
              {participants.map((p) => (
                <div key={p.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-card-border space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.name}</span>
                    {p.duty ? (
                      <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-semibold px-2.5 py-0.5 rounded-full">
                        {p.duty}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No Duty Assigned</span>
                    )}
                  </div>
                  <div className="text-slate-500 font-mono break-all">{p.email}</div>
                  <div className="flex justify-between items-center pt-2 border-t border-card-border/50">
                    <span className="text-slate-400 font-semibold">Assign Duty</span>
                    <select
                      value={p.duty || 'None / General Help'}
                      onChange={(e) => handleAssignDuty(p.id, e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-card-border px-2.5 py-1 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      {DUTY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <table className="hidden md:table w-full text-left border-collapse">
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
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-slate-400 block">Submitted by: {c.participantName}</span>
                        <p className="mt-2 text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">{c.text}</p>
                        
                        {!isResolved ? (
                          <div className="mt-4">
                            <textarea
                              placeholder="Write a reply to the user (optional)..."
                              value={complaintReplies[c.id] || ''}
                              onChange={(e) => setComplaintReplies(prev => ({ ...prev, [c.id]: e.target.value }))}
                              className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                              rows={2}
                            />
                          </div>
                        ) : (
                          c.adminReply && (
                            <div className="mt-4 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-card-border">
                              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 block mb-1">Admin Reply:</span>
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{c.adminReply}</p>
                            </div>
                          )
                        )}
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

        {activeTab === 'translations' && (
          <div className="space-y-6">
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-4 rounded-2xl flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-primary-800 dark:text-primary-300">Live Translation Manager</h3>
                <p className="text-xs text-primary-700 dark:text-primary-400 mt-1">
                  Correct typos or translate the application text dynamically. Changes are saved directly to Firestore and update instantly in real-time on all active user devices without requiring a website redeployment.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-card-border">
              {/* Language Selector */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(['en', 'no', 'ur'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      selectedLang === lang 
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {lang === 'en' ? '🇬🇧 English' : lang === 'no' ? '🇳🇴 Norsk' : '🇵🇰 Urdu'}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search translation keys or values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-card-border pl-10 pr-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Keys list */}
            <div className="space-y-4 border border-card-border rounded-2xl overflow-hidden divide-y divide-card-border bg-white/50 dark:bg-slate-900/10">
              {paginatedKeys.length === 0 ? (
                <div className="text-center p-8 text-slate-500">No translation keys found matching your search.</div>
              ) : (
                paginatedKeys.map((key) => {
                  const defaultValue = defaultLocales[key] || '';
                  const overrideValue = firestoreOverrides[key] || '';
                  const activeEditValue = editingValues[key] !== undefined ? editingValues[key] : overrideValue;
                  const isModified = activeEditValue !== overrideValue;

                  return (
                    <div key={key} className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start justify-between">
                      <div className="space-y-1.5 flex-1 w-full">
                        <span className="font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                          {key}
                        </span>
                        <p className="text-xs text-slate-400">
                          <strong>Default baseline (EN):</strong> {defaultValue}
                        </p>
                        {overrideValue && (
                          <p className="text-xs text-success font-medium">
                            Current Override: &ldquo;{overrideValue}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Editing inputs */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 items-stretch sm:items-center">
                        <input
                          type="text"
                          value={activeEditValue}
                          placeholder="Type custom override here..."
                          onChange={(e) => {
                            setEditingValues(prev => ({ ...prev, [key]: e.target.value }));
                          }}
                          className="w-full sm:w-80 bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveOverride(key, activeEditValue)}
                            disabled={!isModified}
                            className="px-4 py-2 bg-success text-white hover:bg-success/90 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-xs font-bold rounded-xl transition-all shadow-sm flex-1 sm:flex-none"
                          >
                            Save
                          </button>
                          {overrideValue && (
                            <button
                              onClick={() => {
                                handleDeleteOverride(key);
                                setEditingValues(prev => {
                                  const next = { ...prev };
                                  delete next[key];
                                  return next;
                                });
                              }}
                              className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 text-xs font-bold rounded-xl transition-all shadow-sm flex-1 sm:flex-none"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-card-border text-sm">
                <span className="text-slate-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + keysPerPage, filteredKeys.length)} of {filteredKeys.length} keys
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg text-xs"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-2 font-bold text-xs">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'covenant' && (
          <div className="space-y-8">
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-5 rounded-2xl">
              <h3 className="font-bold text-sm text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5" /> Manage Covenant Rules & Sections
              </h3>
              <p className="text-xs text-primary-700 dark:text-primary-400 mt-1.5 leading-relaxed">
                Add, edit, or remove rules sections and individual checklist rules. These rules are signed by passengers in onboarding and shown in the Covenant tab.
              </p>
            </div>

            {/* Add Section Form */}
            <form onSubmit={handleAddRuleSection} className="p-5 bg-slate-50 dark:bg-slate-900/30 border border-card-border rounded-2xl space-y-4 max-w-3xl">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">➕ Add New Rules Section</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Title (EN)</label>
                  <input
                    type="text"
                    value={newRuleTitleEn}
                    onChange={(e) => setNewRuleTitleEn(e.target.value)}
                    placeholder="e.g. Salah First"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Title (NO)</label>
                  <input
                    type="text"
                    value={newRuleTitleNo}
                    onChange={(e) => setNewRuleTitleNo(e.target.value)}
                    placeholder="e.g. Salah først"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Title (UR)</label>
                  <input
                    type="text"
                    value={newRuleTitleUr}
                    onChange={(e) => setNewRuleTitleUr(e.target.value)}
                    placeholder="e.g. نماز مقدم ہے"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Icon Name</label>
                  <select
                    value={newRuleIcon}
                    onChange={(e) => setNewRuleIcon(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    {['Heart', 'Clock', 'BookOpen', 'Smile', 'Users', 'Car', 'Utensils', 'PhoneOff', 'Compass', 'Coins', 'Calendar', 'Handshake', 'Navigation', 'HelpCircle'].map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quote/Ayat (EN - Optional)</label>
                  <input
                    type="text"
                    value={newRuleQuoteEn}
                    onChange={(e) => setNewRuleQuoteEn(e.target.value)}
                    placeholder="Surah / translation"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quote/Ayat (NO - Optional)</label>
                  <input
                    type="text"
                    value={newRuleQuoteNo}
                    onChange={(e) => setNewRuleQuoteNo(e.target.value)}
                    placeholder="Surah / oversettelse"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quote/Ayat (UR - Optional)</label>
                  <input
                    type="text"
                    value={newRuleQuoteUr}
                    onChange={(e) => setNewRuleQuoteUr(e.target.value)}
                    placeholder="آیت یا حدیث"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quran Ayat (AR Only)</label>
                  <input
                    type="text"
                    value={newRuleQuranAyat}
                    onChange={(e) => setNewRuleQuranAyat(e.target.value)}
                    placeholder="﴿الآية الكريمة﴾"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none text-right font-serif"
                    dir="rtl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Add Section
              </button>
            </form>

            <hr className="border-card-border my-6" />

            {/* List of Sections */}
            <div className="space-y-6">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">📋 Current Sections & Rules ({rules.length})</h4>
              
              {rules.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No rules sections found. They will seed automatically when rules page is viewed.</p>
              ) : (
                rules.map((section: any) => (
                  <div key={section.docId} className="border border-card-border rounded-2xl p-5 bg-white dark:bg-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-card-border pb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded">
                            #{section.id}
                          </span>
                          <span className="text-sm font-semibold text-slate-400">Icon: {section.iconName}</span>
                        </div>
                        <div className="mt-1.5 text-slate-800 dark:text-slate-100 text-base font-bold flex flex-wrap items-center gap-1.5">
                          {/* EN */}
                          {editingField?.type === 'section_title' && editingField.sectionDocId === section.docId && editingField.lang === 'en' ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingField.value}
                              onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                              onBlur={() => handleSaveInlineEdit()}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                              }}
                              className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-semibold focus:ring-1 focus:ring-primary-500 outline-none w-fit"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingField({ type: 'section_title', sectionDocId: section.docId, lang: 'en', value: section.title.en })} 
                              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 px-1.5 py-0.5 rounded transition-colors"
                              title="Click to edit English title"
                            >
                              {section.title.en}
                            </span>
                          )}
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          {/* NO */}
                          {editingField?.type === 'section_title' && editingField.sectionDocId === section.docId && editingField.lang === 'no' ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingField.value}
                              onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                              onBlur={() => handleSaveInlineEdit()}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                              }}
                              className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-semibold focus:ring-1 focus:ring-primary-500 outline-none w-fit"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingField({ type: 'section_title', sectionDocId: section.docId, lang: 'no', value: section.title.no })} 
                              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 px-1.5 py-0.5 rounded transition-colors"
                              title="Click to edit Norwegian title"
                            >
                              {section.title.no}
                            </span>
                          )}
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          {/* UR */}
                          {editingField?.type === 'section_title' && editingField.sectionDocId === section.docId && editingField.lang === 'ur' ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingField.value}
                              onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                              onBlur={() => handleSaveInlineEdit()}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                              }}
                              className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-semibold focus:ring-1 focus:ring-primary-500 outline-none w-fit text-right"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingField({ type: 'section_title', sectionDocId: section.docId, lang: 'ur', value: section.title.ur })} 
                              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 px-1.5 py-0.5 rounded transition-colors"
                              title="Click to edit Urdu title"
                            >
                              {section.title.ur}
                            </span>
                          )}
                        </div>

                        {/* Inline Quotes list */}
                        <div className="text-xs space-y-1 mt-2 text-slate-400 font-serif">
                          {/* EN Quote */}
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-400 shrink-0">Quote (EN):</span>
                            {editingField?.type === 'section_quote' && editingField.sectionDocId === section.docId && editingField.lang === 'en' ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingField.value}
                                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                onBlur={() => handleSaveInlineEdit()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                                }}
                                className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full font-sans text-slate-800 dark:text-slate-100"
                              />
                            ) : (
                              <span 
                                onClick={() => setEditingField({ type: 'section_quote', sectionDocId: section.docId, lang: 'en', value: section.quote?.en || '' })} 
                                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 px-1 rounded transition-colors italic block min-w-[100px]"
                              >
                                {section.quote?.en ? `"${section.quote.en}"` : <span className="text-slate-350 dark:text-slate-500 font-sans text-xs not-italic">(Click to add English quote/Ayat)</span>}
                              </span>
                            )}
                          </div>
                          {/* NO Quote */}
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-400 shrink-0">Quote (NO):</span>
                            {editingField?.type === 'section_quote' && editingField.sectionDocId === section.docId && editingField.lang === 'no' ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingField.value}
                                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                onBlur={() => handleSaveInlineEdit()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                                }}
                                className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full font-sans text-slate-800 dark:text-slate-100"
                              />
                            ) : (
                              <span 
                                onClick={() => setEditingField({ type: 'section_quote', sectionDocId: section.docId, lang: 'no', value: section.quote?.no || '' })} 
                                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 px-1 rounded transition-colors italic block min-w-[100px]"
                              >
                                {section.quote?.no ? `"${section.quote.no}"` : <span className="text-slate-350 dark:text-slate-500 font-sans text-xs not-italic">(Klikk for å legge til norsk sitat)</span>}
                              </span>
                            )}
                          </div>
                          
                          {/* UR Quote */}
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-400 shrink-0">Quote (UR):</span>
                            {editingField?.type === 'section_quote' && editingField.sectionDocId === section.docId && editingField.lang === 'ur' ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingField.value}
                                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                onBlur={() => handleSaveInlineEdit()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                                }}
                                className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full font-sans text-slate-800 dark:text-slate-100"
                              />
                            ) : (
                              <span 
                                onClick={() => setEditingField({ type: 'section_quote', sectionDocId: section.docId, lang: 'ur', value: section.quote?.ur || '' })} 
                                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-755 px-1 rounded transition-colors italic block min-w-[100px]"
                              >
                                {section.quote?.ur ? `"${section.quote.ur}"` : <span className="text-slate-355 dark:text-slate-500 font-sans text-xs not-italic">(اردو اقتباس شامل کرنے کے لیے کلک کریں)</span>}
                              </span>
                            )}
                          </div>

                          {/* Quranic Verse (Arabic Only) */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-1">
                            <span className="font-mono text-xs text-slate-400 shrink-0">Quran (AR):</span>
                            {editingField?.type === 'section_quran_ayat' && editingField.sectionDocId === section.docId ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingField.value}
                                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                onBlur={() => handleSaveInlineEdit()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                  if (e.key === 'Escape') setEditingField(null);
                                }}
                                className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full font-serif text-slate-800 dark:text-slate-100 text-right dir-rtl"
                                dir="rtl"
                              />
                            ) : (
                              <span 
                                onClick={() => setEditingField({ type: 'section_quran_ayat', sectionDocId: section.docId, value: section.quranAyat || '' })} 
                                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-755 px-1 rounded block min-w-[100px] text-right font-serif dir-rtl font-bold"
                                dir="rtl"
                              >
                                {section.quranAyat ? `﴿ ${section.quranAyat} ﴾` : <span className="text-slate-350 dark:text-slate-500 font-sans text-xs not-italic font-normal">(Click to add Arabic Quranic Verse)</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRuleSection(section.docId)}
                        className="px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Section
                      </button>
                    </div>

                    {/* Rule Items in this section */}
                    <div className="space-y-3 pl-4 border-l border-slate-100 dark:border-slate-700">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Rules Checklist Items ({section.items?.length || 0})</span>
                      {(section.items || []).map((item: any, idx: number) => (
                        <div key={item.id || idx} className="flex justify-between items-start gap-4 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl text-xs">
                          <div className="space-y-1 flex-1">
                            {/* EN Rule Item */}
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-400 font-mono shrink-0">EN:</strong>
                              {editingField?.type === 'rule_item' && editingField.sectionDocId === section.docId && editingField.itemId === item.id && editingField.lang === 'en' ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingField.value}
                                  onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                  onBlur={() => handleSaveInlineEdit()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                    if (e.key === 'Escape') setEditingField(null);
                                  }}
                                  className="bg-white dark:bg-slate-800 border border-primary-500/50 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full"
                                />
                              ) : (
                                <span 
                                  onClick={() => setEditingField({ type: 'rule_item', sectionDocId: section.docId, itemId: item.id, lang: 'en', value: item.en })} 
                                  className="cursor-pointer hover:bg-slate-150 dark:hover:bg-slate-700/55 px-1 rounded transition-colors text-slate-800 dark:text-slate-200 w-full block"
                                  title="Click to edit English rule"
                                >
                                  {item.en}
                                </span>
                              )}
                            </div>
                            
                            {/* NO Rule Item */}
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-400 font-mono shrink-0">NO:</strong>
                              {editingField?.type === 'rule_item' && editingField.sectionDocId === section.docId && editingField.itemId === item.id && editingField.lang === 'no' ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingField.value}
                                  onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                  onBlur={() => handleSaveInlineEdit()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                    if (e.key === 'Escape') setEditingField(null);
                                  }}
                                  className="bg-white dark:bg-slate-800 border border-primary-500/50 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full"
                                />
                              ) : (
                                <span 
                                  onClick={() => setEditingField({ type: 'rule_item', sectionDocId: section.docId, itemId: item.id, lang: 'no', value: item.no })} 
                                  className="cursor-pointer hover:bg-slate-150 dark:hover:bg-slate-700/55 px-1 rounded transition-colors text-slate-650 dark:text-slate-400 w-full block"
                                  title="Click to edit Norwegian rule"
                                >
                                  {item.no}
                                </span>
                              )}
                            </div>
                            
                            {/* UR Rule Item */}
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-400 font-mono shrink-0">UR:</strong>
                              {editingField?.type === 'rule_item' && editingField.sectionDocId === section.docId && editingField.itemId === item.id && editingField.lang === 'ur' ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingField.value}
                                  onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                  onBlur={() => handleSaveInlineEdit()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInlineEdit(editingField);
                                    if (e.key === 'Escape') setEditingField(null);
                                  }}
                                  className="bg-white dark:bg-slate-800 border border-primary-500/50 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-primary-500 outline-none w-full text-right"
                                />
                              ) : (
                                <span 
                                  onClick={() => setEditingField({ type: 'rule_item', sectionDocId: section.docId, itemId: item.id, lang: 'ur', value: item.ur })} 
                                  className="cursor-pointer hover:bg-slate-150 dark:hover:bg-slate-700/55 px-1 rounded transition-colors text-slate-650 dark:text-slate-400 w-full block"
                                  title="Click to edit Urdu rule"
                                >
                                  {item.ur}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteRuleItem(section.docId, item.id)}
                            className="text-error hover:text-error/80 font-bold p-1 hover:bg-error/5 rounded-lg transition-colors cursor-pointer"
                            title="Delete rule item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Item Form for this section */}
                      <div className="pt-2 max-w-2xl">
                        <span className="text-xs font-bold text-slate-500 block mb-1">Add Rule Item to Section:</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Rule text in English"
                            value={selectedRuleId === section.id ? newRuleItemEn : ''}
                            onChange={(e) => {
                              setSelectedRuleId(section.id);
                              setNewRuleItemEn(e.target.value);
                            }}
                            className="bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Regeltekst på norsk"
                            value={selectedRuleId === section.id ? newRuleItemNo : ''}
                            onChange={(e) => {
                              setSelectedRuleId(section.id);
                              setNewRuleItemNo(e.target.value);
                            }}
                            className="bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="قاعدہ اردو میں"
                            value={selectedRuleId === section.id ? newRuleItemUr : ''}
                            onChange={(e) => {
                              setSelectedRuleId(section.id);
                              setNewRuleItemUr(e.target.value);
                            }}
                            className="bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddRuleItem(section.docId)}
                          disabled={selectedRuleId !== section.id || !newRuleItemEn || !newRuleItemNo || !newRuleItemUr}
                          className="mt-2 px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Add Rule Item
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'packing' && (
          <div className="space-y-8">
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-5 rounded-2xl">
              <h3 className="font-bold text-sm text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                <Clipboard className="w-5 h-5" /> Manage Packing Checklist
              </h3>
              <p className="text-xs text-primary-700 dark:text-primary-400 mt-1.5 leading-relaxed">
                Add, edit, or remove packing items in the trip packing list. Items are organized by categories and shown in the Checklist tab.
              </p>
            </div>

            {/* Add/Edit Packing Item Form */}
            <form id="packing-form" onSubmit={handleAddOrEditPackingItem} className="p-5 bg-slate-50 dark:bg-slate-900/30 border border-card-border rounded-2xl space-y-4 max-w-4xl">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {editingPackItemId ? "📝 Edit Packing Item" : "➕ Add New Packing Item"}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newPackCategory}
                    onChange={(e) => setNewPackCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="clothing">🧥 Clothing & Gear</option>
                    <option value="spiritual">🕋 Spiritual</option>
                    <option value="electronics">🔋 Electronics</option>
                    <option value="health">💊 Health & Hygiene</option>
                    <option value="documents">📄 Documents</option>
                    <option value="comfort">🎒 Comfort & Supplies</option>
                  </select>
                </div>
                
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Item Name (EN)</label>
                    <input
                      type="text"
                      value={newPackNameEn}
                      onChange={(e) => setNewPackNameEn(e.target.value)}
                      placeholder="e.g. Waterproof Jacket"
                      className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Item Name (NO)</label>
                    <input
                      type="text"
                      value={newPackNameNo}
                      onChange={(e) => setNewPackNameNo(e.target.value)}
                      placeholder="e.g. Vanntett jakke"
                      className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Item Name (UR)</label>
                    <input
                      type="text"
                      value={newPackNameUr}
                      onChange={(e) => setNewPackNameUr(e.target.value)}
                      placeholder="e.g. واٹر پروف جیکٹ"
                      className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (EN)</label>
                  <textarea
                    rows={2}
                    value={newPackDescEn}
                    onChange={(e) => setNewPackDescEn(e.target.value)}
                    placeholder="English description"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (NO)</label>
                  <textarea
                    rows={2}
                    value={newPackDescNo}
                    onChange={(e) => setNewPackDescNo(e.target.value)}
                    placeholder="Norsk beskrivelse"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (UR)</label>
                  <textarea
                    rows={2}
                    value={newPackDescUr}
                    onChange={(e) => setNewPackDescUr(e.target.value)}
                    placeholder="اردو تفصیل"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Where to buy (EN)</label>
                  <input
                    type="text"
                    value={newPackStoreEn}
                    onChange={(e) => setNewPackStoreEn(e.target.value)}
                    placeholder="e.g. XXL Sport"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Where to buy (NO)</label>
                  <input
                    type="text"
                    value={newPackStoreNo}
                    onChange={(e) => setNewPackStoreNo(e.target.value)}
                    placeholder="e.g. XXL Sport"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Where to buy (UR)</label>
                  <input
                    type="text"
                    value={newPackStoreUr}
                    onChange={(e) => setNewPackStoreUr(e.target.value)}
                    placeholder="e.g. ایکس ایکس ایل اسپورٹس"
                    className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={newPackImageUrl}
                  onChange={(e) => setNewPackImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white dark:bg-slate-800 border border-card-border px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  {editingPackItemId ? "Update Item" : "Add Item"}
                </button>
                {editingPackItemId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackItemId(null);
                      setNewPackNameEn('');
                      setNewPackNameNo('');
                      setNewPackNameUr('');
                      setNewPackDescEn('');
                      setNewPackDescNo('');
                      setNewPackDescUr('');
                      setNewPackStoreEn('');
                      setNewPackStoreNo('');
                      setNewPackStoreUr('');
                      setNewPackImageUrl('');
                    }}
                    className="px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <hr className="border-card-border my-6" />

            {/* List of Packing Items grouped by Category */}
            <div className="space-y-6">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">📋 Packing Items ({packingList.length})</h4>
              
              {packingList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No packing items found. They will seed automatically when packing list is viewed.</p>
              ) : (
                ['clothing', 'spiritual', 'electronics', 'health', 'documents', 'comfort'].map((catKey) => {
                  const catItems = packingList.filter(item => item.category === catKey);
                  const catLabels: Record<string, string> = {
                    clothing: '🧥 Clothing & Gear',
                    spiritual: '🕋 Spiritual',
                    electronics: '🔋 Electronics',
                    health: '💊 Health & Hygiene',
                    documents: '📄 Documents',
                    comfort: '🎒 Comfort & Supplies'
                  };

                  if (catItems.length === 0) return null;

                  return (
                    <div key={catKey} className="space-y-3">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">{catLabels[catKey] || catKey} ({catItems.length})</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catItems.map((item) => (
                          <div key={item.id} className="border border-card-border rounded-xl p-4 bg-white dark:bg-slate-800 flex justify-between gap-3 text-xs">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name.en} 
                                className="w-12 h-12 rounded-lg object-cover border border-card-border shrink-0" 
                              />
                            )}
                            <div className="space-y-2 min-w-0 flex-1">
                              <div>
                                <h6 className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.name.en} | {item.name.no} | {item.name.ur}</h6>
                                {item.desc.en && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc.en}</p>}
                              </div>
                              {item.store.en && (
                                <p className="text-xs font-bold text-primary-500">
                                  🛒 Store: {item.store.en}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 shrink-0 justify-start">
                              <button
                                onClick={() => handleStartEditPackingItem(item)}
                                className="px-2.5 py-1.5 bg-primary-500/10 hover:bg-primary-500/25 text-primary-500 font-bold rounded-lg transition-colors cursor-pointer text-center text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePackingItem(item.id)}
                                className="px-2.5 py-1.5 bg-error/10 hover:bg-error/25 text-error font-bold rounded-lg transition-colors cursor-pointer text-center text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
