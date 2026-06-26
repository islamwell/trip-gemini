import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckSquare, Square, ShoppingBag, Info, ZoomIn, X } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, doc, setDoc, query, onSnapshot, getDocs } from 'firebase/firestore';
import { defaultPackingList } from '../../data/packingList';
import type { PackingItem } from '../../data/packingList';

export const Checklist: React.FC = () => {
  const { t, language } = useLanguage();
  const getLocText = (obj: { en: string; no: string; ur: string } | undefined) => {
    if (!obj) return '';
    const lang = (language || 'en') as 'en' | 'no' | 'ur';
    return obj[lang] || obj['en'];
  };

  const [checklistItems, setChecklistItems] = useState<PackingItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string; desc: string } | null>(null);

  // Fetch packing list items from Firestore and handle seeding/syncing
  useEffect(() => {
    const checkAndSync = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'packing_list')));
        if (querySnapshot.empty) {
          console.log("Seeding packing list items in Firestore...");
          for (const item of defaultPackingList) {
            await setDoc(doc(db, 'packing_list', item.id), item);
          }
        } else {
          let needsSync = false;
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data() as PackingItem;
            const defaultItem = defaultPackingList.find(i => i.id === data.id);
            if (defaultItem && defaultItem.imageUrl && !data.imageUrl) {
              needsSync = true;
            }
          });

          if (needsSync) {
            console.log("Syncing packing list items with new image URLs...");
            for (const item of defaultPackingList) {
              await setDoc(doc(db, 'packing_list', item.id), item, { merge: true });
            }
          }
        }
      } catch (err) {
        console.error("Error during packing list check/sync:", err);
      }
    };

    checkAndSync();

    // Real-time listener to track updates
    const q = query(collection(db, 'packing_list'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const list: PackingItem[] = [];
        snap.forEach(docSnap => {
          list.push({ ...docSnap.data() } as PackingItem);
        });
        setChecklistItems(list);
      }
    });
    return () => unsub();
  }, []);

  // Listen for Escape key to close the lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [activeCategory, setActiveCategory] = useState<'all' | 'clothing' | 'spiritual' | 'electronics' | 'health' | 'documents' | 'comfort'>('all');
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geiranger-packing-checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed && typeof parsed === 'object') {
          return Object.keys(parsed).filter(key => parsed[key] === true);
        }
      }
    } catch (e) {
      console.error("Failed to parse checklist items:", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('geiranger-packing-checklist', JSON.stringify(checkedIds));
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredItems = activeCategory === 'all' 
    ? checklistItems 
    : checklistItems.filter(item => item.category === activeCategory);

  const percentPacked = checklistItems.length > 0
    ? Math.round((checkedIds.length / checklistItems.length) * 100)
    : 0;

  const categories = [
    { id: 'all', label: t('checklist.category.all', 'All Items') },
    { id: 'clothing', label: t('checklist.category.clothing', '🧥 Clothing & Gear') },
    { id: 'spiritual', label: t('checklist.category.spiritual', '🕋 Spiritual') },
    { id: 'electronics', label: t('checklist.category.electronics', '🔋 Electronics') },
    { id: 'health', label: t('checklist.category.health', '💊 Health & Hygiene') },
    { id: 'documents', label: t('checklist.category.documents', '📄 Documents') },
    { id: 'comfort', label: t('checklist.category.comfort', '🎒 Comfort & Supplies') }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('checklist.title', 'Packing Checklist')}</h1>
          <p className="text-slate-500 mt-2">{t('checklist.subtitle', 'Interactive list of mandatory and recommended items for the road trip.')}</p>
        </div>
        
        {/* Progress tracker */}
        <div className="glass p-4 rounded-2xl flex items-center gap-4 w-full md:w-64 border border-card-border">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">{t('checklist.progress', 'Packed Progress')}</span>
              <span className="text-primary-600 dark:text-primary-400">{percentPacked}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary-500 h-full transition-all duration-300"
                style={{ width: `${percentPacked}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 font-bold font-mono">
            {checkedIds.length}/{checklistItems.length}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap border-b border-card-border gap-2 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === cat.id 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          return (
            <div 
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`glass p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-4 hover-lift ${
                isChecked 
                  ? 'border-success/30 bg-success/5 dark:bg-success/5' 
                  : 'border-card-border hover:border-primary-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isChecked ? (
                  <CheckSquare className="w-6 h-6 text-success" />
                ) : (
                  <Square className="w-6 h-6 text-slate-400" />
                )}
              </div>

              {/* Mini picture preview */}
              {item.imageUrl && (
                <div 
                  className="relative w-16 h-16 rounded-xl overflow-hidden group/img border border-slate-200 dark:border-slate-800 shrink-0 cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid checking/unchecking card
                    setSelectedImage({ 
                      url: item.imageUrl!, 
                      name: getLocText(item.name), 
                      desc: getLocText(item.desc) 
                    });
                  }}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={getLocText(item.name)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-1 min-w-0">
                <h3 className={`font-semibold text-lg break-words ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {getLocText(item.name)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                  {getLocText(item.desc)}
                </p>
                <div className="pt-2 flex items-start gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="break-words">{t('checklist.whereToBuy', 'Where to buy')}: {getLocText(item.store)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shopping guide help banner */}
      <div className="bg-slate-100 dark:bg-slate-900/40 border border-card-border p-6 rounded-3xl flex items-start gap-4 mt-8">
        <Info className="w-6 h-6 text-primary-500 mt-0.5 shrink-0" />
        <div className="space-y-1 text-sm">
          <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('checklist.bannerTitle', 'Norwegian Shopping Tips:')}</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>{t('checklist.bannerTip1', 'XXL / Sport 1 / Stormberg: Best for high-quality outdoor rainwear, hiking boots, and wool base layers.')}</li>
            <li>{t('checklist.bannerTip2', 'Clas Ohlson / Biltema / Kjell & Co: Best for affordable electronics (power banks), thermos flasks, and water spray bottles.')}</li>
            <li>{t('checklist.bannerTip3', 'Apotek 1 / Vitusapotek: Best for motion sickness pills (essential for Trollstigen) and high-factor sunscreen.')}</li>
            <li>{t('checklist.bannerTip4', 'Kiwi / Rema 1000 / Coop: Best for daily grocerie packages and snacks.')}</li>
          </ul>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all cursor-pointer shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-card-border shadow-2xl flex flex-col scale-100 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video md:aspect-[4/3] bg-slate-950 flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedImage.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
