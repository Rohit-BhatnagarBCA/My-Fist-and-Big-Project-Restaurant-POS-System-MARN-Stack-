export const DURATIONS = [
  {
    id: "Monthly",
    label: "Monthly",
    months: 1,
  },
  {
    id: "4-Month",
    label: "4 Months",
    months: 4,
  },
  {
    id: "Yearly",
    label: "Yearly",
    months: 12,
  },
];

export const BUSINESS_PLANS = [
  {
    id: "Basic",
    name: "Basic",
    tagline:
      "Everything to run daily billing smoothly",
    excelExport: false,
    prices: {
      Monthly: 799,
      "4-Month": 2899,
      Yearly: 7999,
    },
    features: [
      "Dine-In & Packing orders",
      "Live menu & category management",
      "Real-time stock tracking",
      "KOT — Kitchen ticket board with alerts",
      "Cash & Online payments",
      "USB thermal receipt printing",
      "Dashboard analytics",
    ],
  },

  {
    id: "Pro",
    name: "Pro",
    tagline:
      "For restaurants that want the full picture",
    excelExport: true,
    highlighted: true,
    prices: {
      Monthly: 1499,
      "4-Month": 5399,
      Yearly: 14999,
    },
    features: [
      "Everything in Basic",
      "Excel export & data backup",
      "Priority support",
    ],
  },
];

export const STAFF_BASE_PRICE = 299;

export const STAFF_LINKED_DISCOUNT_PRICE = 149;

export const STAFF_INDEPENDENT_DISCOUNT_PRICE = 269;

export const savingsLabel = (
  plan,
  durationId
) => {
  const monthly =
    plan.prices.Monthly;

  const duration =
    DURATIONS.find(
      (item) =>
        item.id === durationId
    );

  if (
    !duration ||
    duration.months === 1
  ) {
    return null;
  }

  const fullPrice =
    monthly * duration.months;

  const actualPrice =
    plan.prices[durationId];

  const savings =
    fullPrice - actualPrice;

  if (savings <= 0) {
    return null;
  }

  const percent = Math.round(
    (savings / fullPrice) * 100
  );

  return `Save ${percent}% (₹${savings})`;
};