import { BillSession, Member, BillItem, PaymentContribution } from '../types';
import { getMemberColor } from './formatters';

export interface ScenarioTemplate {
  id: string;
  name: string;
  icon: string;
  category: 'Groceries' | 'Road Trip' | 'Vacation' | 'Restaurant' | 'Flatmates' | 'General';
  description: string;
  session: BillSession;
}

export function getDemoBillSession(): BillSession {
  return getRoadTripSession();
}

/**
 * 🚗 1. Mountain Road Trip Scenario (6 People)
 */
export function getRoadTripSession(): BillSession {
  const memberNames = [
    { name: 'Kabir Mehta', upiId: 'kabir@kotak' },
    { name: 'Rhea Sen', upiId: 'rhea@okaxis' },
    { name: 'Siddharth Roy', upiId: 'sid@okhdfcbank' },
    { name: 'Tara Sharma', upiId: 'tara@upi' },
    { name: 'Neil Verma', upiId: 'neil@paytm' },
    { name: 'Maya Rao', upiId: 'maya@icici' },
  ];

  const members: Member[] = memberNames.map((m, idx) => ({
    id: `m-rt-${idx + 1}`,
    name: m.name,
    color: getMemberColor(idx),
    upiId: m.upiId,
  }));

  const mId = (idx: number) => members[idx].id;

  const items: BillItem[] = [
    {
      id: 'rt-1',
      name: 'Highway Petrol Station Full Tank #1',
      amount: 4200,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Transport',
    },
    {
      id: 'rt-2',
      name: 'Expressway FASTag Tolls & Passes',
      amount: 850,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Transport',
    },
    {
      id: 'rt-3',
      name: 'Mountain Petrol Station Fuel Tank #2',
      amount: 3800,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Transport',
    },
    {
      id: 'rt-4',
      name: 'Grand Punjab Dhaba Lunch & Lassi',
      amount: 2100,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Food',
    },
    {
      id: 'rt-5',
      name: 'Red Bull Energy Drinks & Espresso for Night Drivers',
      amount: 720,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(4)], // Kabir, Neil
      category: 'Beverages',
    },
    {
      id: 'rt-6',
      name: 'Hilltop Scenic Cafe Gourmet Coffee & Cakes',
      amount: 1400,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(1), mId(3), mId(5)], // Rhea, Tara, Maya
      category: 'Food',
    },
    {
      id: 'rt-7',
      name: 'Himalayan Herbal Sunscreen SPF 50',
      amount: 450,
      splitType: 'SOLO',
      assignedMemberIds: [mId(3)], // Tara
      category: 'Personal',
    },
    {
      id: 'rt-8',
      name: 'Dashboard Suction GoPro Mount',
      amount: 680,
      splitType: 'SOLO',
      assignedMemberIds: [mId(2)], // Siddharth
      category: 'Gear',
    },
  ];

  // Total items = 4200+850+3800+2100+720+1400+450+680 = 14,200.
  const payments: PaymentContribution[] = [
    { memberId: mId(0), amountPaid: 6000 }, // Kabir paid 6,000 (Card)
    { memberId: mId(2), amountPaid: 5000 }, // Siddharth paid 5,000 (UPI)
    { memberId: mId(4), amountPaid: 3200 }, // Neil paid 3,200 (Cash)
  ];
  // Total paid = 6000 + 5000 + 3200 = 14,200.

  return {
    id: 'session-road-trip-manali',
    title: 'Manali Scenic Road Trip (Fuel, Tolls & Food)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: '₹',
    category: 'Road Trip',
    members,
    items,
    payments,
    settledTransactionIds: [],
    notes: 'Innova road trip fuel, FASTag tolls, roadside dhaba meals and personal trail gear.',
  };
}

/**
 * 🏖️ 2. Vacation / Villa Trip Scenario (10 People)
 */
export function getVacationSession(): BillSession {
  const memberNames = [
    { name: 'Rohan Sharma', upiId: 'rohan@okhdfcbank' },
    { name: 'Priya Patel', upiId: 'priya@okaxis' },
    { name: 'Amit Verma', upiId: 'amit@paytm' },
    { name: 'Sneha Rao', upiId: 'sneha@icici' },
    { name: 'Vikram Singh', upiId: 'vikram@upi' },
    { name: 'Ananya Iyer', upiId: 'ananya@oksbi' },
    { name: 'Kabir Mehta', upiId: 'kabir@kotak' },
    { name: 'Neha Joshi', upiId: 'neha@okaxis' },
    { name: 'Arjun Nair', upiId: 'arjun@ybl' },
    { name: 'Divya Sen', upiId: 'divya@okhdfcbank' },
  ];

  const members: Member[] = memberNames.map((m, idx) => ({
    id: `m-vac-${idx + 1}`,
    name: m.name,
    color: getMemberColor(idx),
    upiId: m.upiId,
  }));

  const mId = (idx: number) => members[idx].id;

  const items: BillItem[] = [
    {
      id: 'vac-1',
      name: 'Private Pool Villa Grocery & Breakfast Essentials',
      amount: 4500,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Groceries',
    },
    {
      id: 'vac-2',
      name: 'Beach Shack Sunset Snacks & Starters',
      amount: 2800,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Food',
    },
    {
      id: 'vac-3',
      name: 'Cocktails, Craft Beer & Seltzers (6 drinkers)',
      amount: 3600,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(2), mId(4), mId(6), mId(8), mId(9)],
      category: 'Beverages',
    },
    {
      id: 'vac-4',
      name: 'Fresh Catch Kingfish & Prawns BBQ (4 members)',
      amount: 2200,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(2), mId(4), mId(8)],
      category: 'Food',
    },
    {
      id: 'vac-5',
      name: 'Artisan Gelato & Dessert Tubs (7 members)',
      amount: 1050,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(1), mId(3), mId(5), mId(6), mId(7), mId(8), mId(9)],
      category: 'Desserts',
    },
    {
      id: 'vac-6',
      name: 'Goa Surf School Board Rental (Solo)',
      amount: 900,
      splitType: 'SOLO',
      assignedMemberIds: [mId(4)], // Vikram
      category: 'Activities',
    },
    {
      id: 'vac-7',
      name: 'Organic Coconut Hair Mask & Spa Scrub',
      amount: 650,
      splitType: 'SOLO',
      assignedMemberIds: [mId(1)], // Priya
      category: 'Personal Care',
    },
  ];

  // Total items = 4500+2800+3600+2200+1050+900+650 = 15,700.
  const payments: PaymentContribution[] = [
    { memberId: mId(0), amountPaid: 7000 },
    { memberId: mId(1), amountPaid: 4500 },
    { memberId: mId(2), amountPaid: 3200 },
    { memberId: mId(3), amountPaid: 1000 },
  ];
  // Total paid = 7000+4500+3200+1000 = 15,700.

  return {
    id: 'session-vacation-goa-villa',
    title: 'Goa Private Villa & Beach Getaway',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: '₹',
    category: 'Vacation',
    members,
    items,
    payments,
    settledTransactionIds: [],
    notes: 'Anjuna villa breakfast, pool party drinks, beach shack seafood and solo rentals.',
  };
}

/**
 * 🍽️ 3. Restaurant Dinner Scenario (8 People)
 */
export function getRestaurantSession(): BillSession {
  const memberNames = [
    { name: 'Aarav Gupta', upiId: 'aarav@okhdfcbank' },
    { name: 'Diya Nair', upiId: 'diya@okaxis' },
    { name: 'Ishaan Joshi', upiId: 'ishaan@paytm' },
    { name: 'Meera Kapoor', upiId: 'meera@icici' },
    { name: 'Kunal Singhania', upiId: 'kunal@upi' },
    { name: 'Riya Sen', upiId: 'riya@oksbi' },
    { name: 'Varun Bhatia', upiId: 'varun@kotak' },
    { name: 'Pooja Reddy', upiId: 'pooja@ybl' },
  ];

  const members: Member[] = memberNames.map((m, idx) => ({
    id: `m-rest-${idx + 1}`,
    name: m.name,
    color: getMemberColor(idx),
    upiId: m.upiId,
  }));

  const mId = (idx: number) => members[idx].id;

  const items: BillItem[] = [
    {
      id: 'rest-1',
      name: 'Truffle Fries, Bruschetta & Hummus Platters',
      amount: 1850,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Starters',
    },
    {
      id: 'rest-2',
      name: 'Woodfired Neapolitan Pizzas & Garlic Bread',
      amount: 2400,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Mains',
    },
    {
      id: 'rest-3',
      name: 'Craft Cocktails & Gin Tonic Pitchers',
      amount: 4200,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(2), mId(4), mId(6)], // Aarav, Ishaan, Kunal, Varun
      category: 'Bar',
    },
    {
      id: 'rest-4',
      name: 'Herb Crusted Salmon & Lamb Chops',
      amount: 2800,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(2), mId(6), mId(7)], // Aarav, Ishaan, Varun, Pooja
      category: 'Mains',
    },
    {
      id: 'rest-5',
      name: 'Wild Mushroom Risotto (Veg Subgroup)',
      amount: 1650,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(1), mId(3), mId(4), mId(5)], // Diya, Meera, Kunal, Riya
      category: 'Mains',
    },
    {
      id: 'rest-6',
      name: 'Warm Belgian Chocolate Fondant (Solo)',
      amount: 480,
      splitType: 'SOLO',
      assignedMemberIds: [mId(1)], // Diya
      category: 'Dessert',
    },
    {
      id: 'rest-7',
      name: 'Reserve Single Malt Glass (Solo)',
      amount: 850,
      splitType: 'SOLO',
      assignedMemberIds: [mId(3)], // Meera
      category: 'Bar',
    },
  ];

  // Total items = 1850 + 2400 + 4200 + 2800 + 1650 + 480 + 850 = 14,230.
  const payments: PaymentContribution[] = [
    { memberId: mId(0), amountPaid: 8000 }, // Aarav swiped corporate credit card
    { memberId: mId(4), amountPaid: 6230 }, // Kunal paid remaining via UPI
  ];
  // Total paid = 8000 + 6230 = 14,230.

  return {
    id: 'session-restaurant-celebration',
    title: 'Olive Bistro Celebration Dinner (8 Friends)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: '₹',
    category: 'Restaurant',
    members,
    items,
    payments,
    settledTransactionIds: [],
    notes: 'Birthday dinner with shared appetizers, craft cocktail bar split, and veg/non-veg mains.',
  };
}

/**
 * 🏠 4. Shared Flat Monthly Expenses (4 Roommates)
 */
export function getFlatmatesSession(): BillSession {
  const memberNames = [
    { name: 'Aditya Rao', upiId: 'aditya@okhdfcbank' },
    { name: 'Nikhil Desai', upiId: 'nikhil@okaxis' },
    { name: 'Rishabh Shah', upiId: 'rishabh@paytm' },
    { name: 'Yash Kulkarni', upiId: 'yash@icici' },
  ];

  const members: Member[] = memberNames.map((m, idx) => ({
    id: `m-flat-${idx + 1}`,
    name: m.name,
    color: getMemberColor(idx),
    upiId: m.upiId,
  }));

  const mId = (idx: number) => members[idx].id;

  const items: BillItem[] = [
    {
      id: 'flat-1',
      name: 'High-speed 300 Mbps Fiber Broadband Bill',
      amount: 1416,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Utilities',
    },
    {
      id: 'flat-2',
      name: 'Monthly Kitchen Staples (Oil, Rice, Spices, Atta)',
      amount: 2450,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Groceries',
    },
    {
      id: 'flat-3',
      name: 'Deep Cleaning Supplies, Mop & Detergent Pack',
      amount: 880,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Household',
    },
    {
      id: 'flat-4',
      name: 'Organic Almond Milk & Greek Yogurt Subgroup',
      amount: 720,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(3)], // Aditya, Yash
      category: 'Groceries',
    },
    {
      id: 'flat-5',
      name: 'Weekly Chicken Breasts & Eggs Bulk Tray',
      amount: 1350,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(1), mId(2), mId(3)], // Nikhil, Rishabh, Yash
      category: 'Groceries',
    },
    {
      id: 'flat-6',
      name: 'Optimum Nutrition Gold Whey 2kg Tub (Solo)',
      amount: 3200,
      splitType: 'SOLO',
      assignedMemberIds: [mId(2)], // Rishabh
      category: 'Fitness',
    },
  ];

  // Total items = 1416 + 2450 + 880 + 720 + 1350 + 3200 = 10,016.
  const payments: PaymentContribution[] = [
    { memberId: mId(0), amountPaid: 6000 }, // Aditya paid 6000
    { memberId: mId(1), amountPaid: 4016 }, // Nikhil paid 4016
  ];
  // Total paid = 6000 + 4016 = 10,016.

  return {
    id: 'session-flatmates-monthly',
    title: 'Flat 402 Monthly Groceries & Utilities',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: '₹',
    category: 'Flatmates',
    members,
    items,
    payments,
    settledTransactionIds: [],
    notes: 'Monthly shared flat expenses: WiFi, kitchen staples, dietary splits, and personal whey.',
  };
}

/**
 * 🛒 5. Hypermarket / DMart Mega Haul (10 People)
 */
export function getHypermarketSession(): BillSession {
  const memberNames = [
    { name: 'Rohan Sharma', upiId: 'rohan@okhdfcbank' },
    { name: 'Priya Patel', upiId: 'priya@okaxis' },
    { name: 'Amit Verma', upiId: 'amit@paytm' },
    { name: 'Sneha Rao', upiId: 'sneha@icici' },
    { name: 'Vikram Singh', upiId: 'vikram@upi' },
    { name: 'Ananya Iyer', upiId: 'ananya@oksbi' },
    { name: 'Kabir Mehta', upiId: 'kabir@kotak' },
    { name: 'Neha Joshi', upiId: 'neha@okaxis' },
    { name: 'Arjun Nair', upiId: 'arjun@ybl' },
    { name: 'Divya Sen', upiId: 'divya@okhdfcbank' },
  ];

  const members: Member[] = memberNames.map((m, idx) => ({
    id: `m-dm-${idx + 1}`,
    name: m.name,
    color: getMemberColor(idx),
    upiId: m.upiId,
  }));

  const mId = (idx: number) => members[idx].id;

  const items: BillItem[] = [
    {
      id: 'dm-1',
      name: 'Fortune Sunlite Sunflower Oil 5L Jar',
      amount: 880,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Groceries',
    },
    {
      id: 'dm-2',
      name: 'Daawat Rozana Super Basmati Rice 5kg',
      amount: 450,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Groceries',
    },
    {
      id: 'dm-3',
      name: 'Aashirvaad Shudh Chakki Atta 10kg',
      amount: 440,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Groceries',
    },
    {
      id: 'dm-4',
      name: 'Surf Excel Matic Top Load 4kg + Liquid',
      amount: 890,
      splitType: 'ALL',
      assignedMemberIds: [],
      category: 'Cleaning',
    },
    {
      id: 'dm-5',
      name: 'Party Beverages & Soda Crate (6 members)',
      amount: 1800,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(2), mId(4), mId(6), mId(8), mId(9)],
      category: 'Beverages',
    },
    {
      id: 'dm-6',
      name: 'Gourmet Marinated BBQ & Kebabs (4 members)',
      amount: 1600,
      splitType: 'SUBSET',
      assignedMemberIds: [mId(0), mId(2), mId(4), mId(8)],
      category: 'Snacks',
    },
    {
      id: 'dm-7',
      name: 'Gillette Fusion ProGlide Razor Kit (Solo)',
      amount: 720,
      splitType: 'SOLO',
      assignedMemberIds: [mId(0)],
      category: 'Personal Care',
    },
    {
      id: 'dm-8',
      name: "L'Oreal Total Repair Shampoo & Mask (Solo)",
      amount: 690,
      splitType: 'SOLO',
      assignedMemberIds: [mId(1)],
      category: 'Personal Care',
    },
  ];

  // Total items = 880+450+440+890+1800+1600+720+690 = 7,470.
  const payments: PaymentContribution[] = [
    { memberId: mId(0), amountPaid: 4500 },
    { memberId: mId(1), amountPaid: 2970 },
  ];
  // Total paid = 4500 + 2970 = 7,470.

  return {
    id: 'session-dmart-mega-haul',
    title: 'DMart Supermarket Mega Haul (10 People)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: '₹',
    category: 'Groceries',
    members,
    items,
    payments,
    settledTransactionIds: [],
    notes: 'Weekend supermarket run with communal pantry items and personal toiletries.',
  };
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'road-trip',
    name: 'Road Trip (Fuel, Tolls & Food)',
    icon: '🚗',
    category: 'Road Trip',
    description: 'Fuel stops, FASTag tolls, roadside dhaba meals, and driver energy drinks.',
    session: getRoadTripSession(),
  },
  {
    id: 'vacation',
    name: 'Vacation / Goa Villa Trip',
    icon: '🏖️',
    category: 'Vacation',
    description: 'Villa supplies, party drinks, seafood BBQ, and solo gear rentals.',
    session: getVacationSession(),
  },
  {
    id: 'restaurant',
    name: 'Restaurant Dinner & Drinks',
    icon: '🍽️',
    category: 'Restaurant',
    description: 'Shared appetizers, alcohol subset, veg/non-veg splits, and solo desserts.',
    session: getRestaurantSession(),
  },
  {
    id: 'flatmates',
    name: 'Shared Flat Monthly Expenses',
    icon: '🏠',
    category: 'Flatmates',
    description: 'Broadband, kitchen staples, dietary preferences, and personal supplements.',
    session: getFlatmatesSession(),
  },
  {
    id: 'hypermarket',
    name: 'Hypermarket / DMart Haul',
    icon: '🛒',
    category: 'Groceries',
    description: '10-person grocery haul with shared pantry items and personal care goods.',
    session: getHypermarketSession(),
  },
];
