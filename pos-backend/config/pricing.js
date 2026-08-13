// Single source of truth for all subscription pricing. Amounts are always
// computed here on the server — never trust a price sent from the client.

const BUSINESS_PLANS = {
  Basic: {
    label: "Basic",
    excelExport: false,
    prices: {
      Monthly: 799,
      "4-Month": 2899,
      Yearly: 7999,
    },
  },
  Pro: {
    label: "Pro",
    excelExport: true,
    prices: {
      Monthly: 1499,
      "4-Month": 5399,
      Yearly: 14999,
    },
  },
};

// Waiter / Kitchen seats — always monthly, priced off the same base with a
// discount depending on whether they're riding on a paying Admin's email.
const STAFF_BASE_PRICE = 299;
const STAFF_LINKED_DISCOUNT = 0.5; // same email as an active-paid Admin
const STAFF_INDEPENDENT_DISCOUNT = 0.1; // different email, standalone seat

const DURATION_MONTHS = {
  Monthly: 1,
  "4-Month": 4,
  Yearly: 12,
};

function calculateAmount({ role, plan, duration, isLinkedToAdmin }) {
  if (role === "Admin") {
    const planConfig = BUSINESS_PLANS[plan];
    if (!planConfig) throw new Error("Invalid plan selected.");
    const amount = planConfig.prices[duration];
    if (!amount) throw new Error("Invalid duration selected.");
    return amount;
  }

  // Waiter / Kitchen seat — monthly only.
  const discount = isLinkedToAdmin ? STAFF_LINKED_DISCOUNT : STAFF_INDEPENDENT_DISCOUNT;
  return Math.round(STAFF_BASE_PRICE * (1 - discount));
}

function calculateExpiry(duration, from = new Date()) {
  const months = DURATION_MONTHS[duration] || 1;
  const expiry = new Date(from);
  expiry.setMonth(expiry.getMonth() + months);
  return expiry;
}

module.exports = {
  BUSINESS_PLANS,
  STAFF_BASE_PRICE,
  STAFF_LINKED_DISCOUNT,
  STAFF_INDEPENDENT_DISCOUNT,
  calculateAmount,
  calculateExpiry,
};