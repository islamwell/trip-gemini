import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckSquare, Square, ShoppingBag, Info } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'clothing' | 'spiritual' | 'electronics' | 'health';
  nameKey: string;
  descKey: string;
  storeKey: string;
}

const checklistItems: ChecklistItem[] = [
  // Clothing
  {
    id: 'c1',
    category: 'clothing',
    nameKey: 'checklist.items.c1_name',
    descKey: 'checklist.items.c1_desc',
    storeKey: 'checklist.stores.xxl_stormberg'
  },
  {
    id: 'c2',
    category: 'clothing',
    nameKey: 'checklist.items.c2_name',
    descKey: 'checklist.items.c2_desc',
    storeKey: 'checklist.stores.xxl'
  },
  {
    id: 'c3',
    category: 'clothing',
    nameKey: 'checklist.items.c3_name',
    descKey: 'checklist.items.c3_desc',
    storeKey: 'checklist.stores.kiwi_rema_xxl'
  },
  {
    id: 'c4',
    category: 'clothing',
    nameKey: 'checklist.items.c4_name',
    descKey: 'checklist.items.c4_desc',
    storeKey: 'checklist.stores.any'
  },
  // Spiritual
  {
    id: 's1',
    category: 'spiritual',
    nameKey: 'checklist.items.s1_name',
    descKey: 'checklist.items.s1_desc',
    storeKey: 'checklist.stores.online_mosque'
  },
  {
    id: 's2',
    category: 'spiritual',
    nameKey: 'checklist.items.s2_name',
    descKey: 'checklist.items.s2_desc',
    storeKey: 'checklist.stores.biltema_clas'
  },
  {
    id: 's3',
    category: 'spiritual',
    nameKey: 'checklist.items.s3_name',
    descKey: 'checklist.items.s3_desc',
    storeKey: 'checklist.stores.app'
  },
  // Electronics
  {
    id: 'e1',
    category: 'electronics',
    nameKey: 'checklist.items.e1_name',
    descKey: 'checklist.items.e1_desc',
    storeKey: 'checklist.stores.clas_kjell'
  },
  {
    id: 'e2',
    category: 'electronics',
    nameKey: 'checklist.items.e2_name',
    descKey: 'checklist.items.e2_desc',
    storeKey: 'checklist.stores.clas_biltema'
  },
  {
    id: 'e3',
    category: 'electronics',
    nameKey: 'checklist.items.e3_name',
    descKey: 'checklist.items.e3_desc',
    storeKey: 'checklist.stores.any'
  },
  // Health
  {
    id: 'h1',
    category: 'health',
    nameKey: 'checklist.items.h1_name',
    descKey: 'checklist.items.h1_desc',
    storeKey: 'checklist.stores.apotek'
  },
  {
    id: 'h2',
    category: 'health',
    nameKey: 'checklist.items.h2_name',
    descKey: 'checklist.items.h2_desc',
    storeKey: 'checklist.stores.apotek_kiwi'
  },
  {
    id: 'h3',
    category: 'health',
    nameKey: 'checklist.items.h3_name',
    descKey: 'checklist.items.h3_desc',
    storeKey: 'checklist.stores.kiwi_rema'
  }
];

export const Checklist: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'clothing' | 'spiritual' | 'electronics' | 'health'>('all');
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('geiranger-packing-checklist');
    return saved ? JSON.parse(saved) : [];
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

  const percentPacked = Math.round((checkedIds.length / checklistItems.length) * 100);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'clothing', label: '🧥 Clothing & Gear' },
    { id: 'spiritual', label: '🕋 Spiritual' },
    { id: 'electronics', label: '🔋 Electronics' },
    { id: 'health', label: '💊 Health & Hygiene' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packing Checklist</h1>
          <p className="text-slate-500 mt-2">Interactive list of mandatory and recommended items for the road trip.</p>
        </div>
        
        {/* Progress tracker */}
        <div className="glass p-4 rounded-2xl flex items-center gap-4 w-full md:w-64 border border-card-border">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Packed Progress</span>
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
      <div className="flex border-b border-card-border overflow-x-auto gap-2 pb-2">
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
              <div className="flex-1 space-y-1">
                <h3 className={`font-semibold text-lg ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {t(item.nameKey) || item.nameKey}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(item.descKey) || item.descKey}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Where to buy: {t(item.storeKey) || item.storeKey}</span>
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
          <h4 className="font-bold text-slate-800 dark:text-slate-200">Norwegian Shopping Tips:</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>XXL / Sport 1 / Stormberg:</strong> Best for high-quality outdoor rainwear, hiking boots, and wool base layers.</li>
            <li><strong>Clas Ohlson / Biltema / Kjell & Co:</strong> Best for affordable electronics (power banks), thermos flasks, and water spray bottles.</li>
            <li><strong>Apotek 1 / Vitusapotek:</strong> Best for motion sickness pills (essential for Trollstigen) and high-factor sunscreen.</li>
            <li><strong>Kiwi / Rema 1000 / Coop:</strong> Best for daily grocerie packages and snacks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
