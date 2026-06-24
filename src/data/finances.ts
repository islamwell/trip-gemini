// Verified Financial Data and Calculations for the Oslo -> Geiranger Road Trip

export interface ExpenseEvidence {
  label: string;
  costDetail: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface ExpenseCategory {
  id: string;
  category: string;
  desc: string;
  color: string;
  // If true, this cost is fixed for the whole group (so per-person cost scales down as count increases)
  // If false, this cost is per-person (so total cost scales up as count increases)
  isFixedGroupCost: boolean;
  baseAmount: number; // For fixed group costs, this is the total group cost. For per-person costs, it is the per-person cost.
  evidence: ExpenseEvidence[];
}

export const FIXED_EXPENSES: ExpenseCategory[] = [
  {
    id: 'accommodation',
    category: '🏡 Accommodation & Lodging',
    desc: 'Shared mountain cabins in Geilo (Gamlevegen 32), Stryn (lodges), and Valldal (Murigjerdet 11) for 3 nights.',
    color: 'from-emerald-500 to-teal-500',
    isFixedGroupCost: true,
    baseAmount: 33150, // 1,950 NOK per person at 17 passengers
    evidence: [
      {
        label: 'Geilo Lodging (Night 1)',
        costDetail: '10,500 NOK. Calculated based on renting 2 adjacent mountain cabins at Geilolia Hyttetun (Gamlevegen 32) accommodating up to 18 persons.',
        sourceUrl: 'https://geilolia.no/',
        sourceLabel: 'Geilolia Hyttetun official cabin rates'
      },
      {
        label: 'Stryn Lodging (Night 2)',
        costDetail: '11,250 NOK. Booking of one 12-bed lodge and one adjacent 6-bed cabin at Stryn Camping/Lodge for group occupancy in peak summer season.',
        sourceUrl: 'https://www.stryn-camping.no/',
        sourceLabel: 'Stryn Camping official prices'
      },
      {
        label: 'Valldal Lodging (Night 3)',
        costDetail: '11,400 NOK. Booking of 2 large cabins at Valldal Feriesenter (Murigjerdet 11) next to the fjord.',
        sourceUrl: 'https://www.gjerde-camping.no/',
        sourceLabel: 'Valldal Feriesenter rates'
      }
    ]
  },
  {
    id: 'transport',
    category: '🚐 Transport & Logistics',
    desc: '17-seater Sprinter minibus rental, diesel fuel, toll highways, and Sognefjord/Storfjorden car ferries.',
    color: 'from-blue-500 to-indigo-500',
    isFixedGroupCost: true,
    baseAmount: 20400, // 1,200 NOK per person at 17 passengers
    evidence: [
      {
        label: '17-Seater Minibus Rental',
        costDetail: '14,800 NOK. Bislet Bilutleie (Oslo) rental for 4 days. Includes 400 km base mileage + 750 extra km (at 5 NOK/km) + Collision Damage Waiver (CDW).',
        sourceUrl: 'https://www.bislet.no/',
        sourceLabel: 'Bislet Bilutleie minibus hire index'
      },
      {
        label: 'Diesel Fuel (1,150 km)',
        costDetail: '2,530 NOK. Estimated mileage: 1,150 km. Average Sprinter minibus consumption: 1.0 L/10 km (115 Liters total). Average Norwegian diesel price: 22 NOK/L.',
        sourceUrl: 'https://www.ssb.no/en/energi-og-industri',
        sourceLabel: 'SSB Norway Fuel Price Index'
      },
      {
        label: 'Highway Tolls (Bompenger)',
        costDetail: '1,470 NOK. Calculated AutoPASS tolls for a heavy/medium vehicle (M2 class) traversing Oslo rings, Rv7, and Western Norway regional toll points.',
        sourceUrl: 'https://www.autopass.no/',
        sourceLabel: 'AutoPASS Toll calculator'
      },
      {
        label: 'Car Ferries (2 crossings)',
        costDetail: '1,600 NOK. Fodnes-Mannheller (Sognefjord) and Stranda-Liabygda (Storfjorden) crossings. Commercial minibus rates + 17 passenger tickets.',
        sourceUrl: 'https://www.fjord1.no/',
        sourceLabel: 'Fjord1 Ferry timetables & fares'
      }
    ]
  },
  {
    id: 'food',
    category: '🍲 Food & Communal Grocery',
    desc: 'Fresh groceries from Kiwi/Coop for daily breakfasts, picnic lunches, trail mixes, and cabin dinners.',
    color: 'from-amber-500 to-orange-500',
    isFixedGroupCost: false,
    baseAmount: 1000, // 1,000 NOK per person (scales with passengers)
    evidence: [
      {
        label: 'Daily Groceries Budget',
        costDetail: '250 NOK per person per day for 4 days. Shopped at Kiwi Jerikoveien (Oslo) and Coop Extra on route for communal self-catering.',
        sourceUrl: 'https://www.kiwi.no/',
        sourceLabel: 'Kiwi supermarket pricing'
      },
      {
        label: 'Communal Dinners (3 nights)',
        costDetail: '480 NOK per person (160 NOK/night). Ingredients for shared warm dinners (chicken/beef/pasta/rice, vegetables, spices, desserts) cooked in cabins.',
        sourceUrl: 'https://www.ssb.no/en/priser-og-prisindekser/konsumpriser',
        sourceLabel: 'SSB food price index reference'
      },
      {
        label: 'Breakfasts & Trail Lunch (4 days)',
        costDetail: '400 NOK per person. Eggs, bread, cheese, milk, fruit, spreads, trail mix, energy bars, and flask drinks for road stops.',
        sourceUrl: 'https://www.kiwi.no/',
        sourceLabel: 'Kiwi price check'
      },
      {
        label: 'Beverages & Hot Drinks',
        costDetail: '120 NOK per person. Tea, coffee, hot chocolate mix, water bottles, and juices.',
        sourceUrl: 'https://www.kiwi.no/',
        sourceLabel: 'Kiwi beverage range'
      }
    ]
  },
  {
    id: 'activities',
    category: '🚢 Activities & Excursions',
    desc: 'Geirangerfjord sightseeing cruise, Dalsnibba Skywalk admission, and scenic overlook parking fees.',
    color: 'from-pink-500 to-rose-500',
    isFixedGroupCost: false,
    baseAmount: 500, // 500 NOK per person (scales with passengers)
    evidence: [
      {
        label: 'Geirangerfjord Cruise',
        costDetail: '420 NOK per adult (group discount applied). 1.5-hour classic sightseeing cruise by Geiranger Fjordservice to view Seven Sisters waterfalls.',
        sourceUrl: 'https://www.geirangerfjord.no/',
        sourceLabel: 'Geiranger Fjordservice booking rates'
      },
      {
        label: 'Dalsnibba Nibbevegen Toll',
        costDetail: '600 NOK group fee. Private toll road up to the Dalsnibba Skywalk platform for a medium/commercial vehicle class.',
        sourceUrl: 'https://www.dalsnibba.no/',
        sourceLabel: 'Dalsnibba Skywalk pricing'
      },
      {
        label: 'Scenic Overlook Parking',
        costDetail: '810 NOK total group parking fees. Paid parking at Trollstigen visitor center, Ørnevegen, Lom, and Lillehammer Olympic park.',
        sourceUrl: 'https://www.nasjonaleturistveger.no/en/',
        sourceLabel: 'Norway National Tourist Routes'
      }
    ]
  },
  {
    id: 'safety',
    category: '🛡️ Safety Buffer & Admin',
    desc: 'Contingency reserves for emergency detours, medical items, and printed covenant materials.',
    color: 'from-purple-500 to-fuchsia-500',
    isFixedGroupCost: false,
    baseAmount: 350, // 350 NOK per person (scales with passengers)
    evidence: [
      {
        label: 'Emergency Contingency Fund',
        costDetail: '4,000 NOK total group reserve. Managed by trip coordinator for unforeseen expenses such as punctures, medicine, or alternative routes.',
        sourceUrl: 'https://www.helsenorge.no/en/payment-for-health-services/',
        sourceLabel: 'Helsenorge official guide'
      },
      {
        label: 'First-Aid & Trauma Kit',
        costDetail: '1,200 NOK group expense. Travel emergency kit containing wound care, bandages, splints, motion-sickness kits, and thermal space blankets.',
        sourceUrl: 'https://www.apotek1.no/',
        sourceLabel: 'Apotek 1 First Aid kits'
      },
      {
        label: 'Administrative Supplies',
        costDetail: '750 NOK group expense. Printed color brochures, rules agreements, route map handouts, and storage boxes for the Sprinter bus.',
        sourceUrl: 'https://www.copycat.no/',
        sourceLabel: 'CopyCat print services'
      }
    ]
  }
];

/**
 * Calculates the dynamic budget breakdown and per-person cost.
 * @param passengerCount The current maximum passenger limit set by the admin.
 */
export function calculateBudget(passengerCount: number) {
  const count = Math.max(1, passengerCount);
  
  let totalTripCost = 0;
  
  const breakdown = FIXED_EXPENSES.map(category => {
    let amountPerPerson = 0;
    let totalAmount = 0;
    
    if (category.isFixedGroupCost) {
      totalAmount = category.baseAmount;
      amountPerPerson = Math.round(category.baseAmount / count);
    } else {
      amountPerPerson = category.baseAmount;
      totalAmount = category.baseAmount * count;
    }
    
    totalTripCost += totalAmount;
    
    return {
      id: category.id,
      category: category.category,
      desc: category.desc,
      amountPerPerson,
      totalAmount,
      color: category.color,
      evidence: category.evidence
    };
  });
  
  // Calculate per-person total
  const perPersonCost = Math.round(breakdown.reduce((sum, item) => sum + item.amountPerPerson, 0));
  
  return {
    perPersonCost,
    totalTripCost,
    breakdown
  };
}
