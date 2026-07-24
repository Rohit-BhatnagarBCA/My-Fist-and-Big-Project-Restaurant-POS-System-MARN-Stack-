import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaUtensils,
  FaCreditCard,
} from "react-icons/fa";
import { getOrders, getTables } from "../../https";

const RANGE_OPTIONS = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 30 Days", value: 30 },
  { label: "Last 90 Days", value: 90 },
];

const COLORS = {
  revenue: "#8a3324",
  orders: "#2f6b4f",
  avgOrder: "#5b45b0",
  tables: "#1e3a5f",
  chartLine: "#BD5D31",
  sage: "#8FB89C",
  amber: "#e0a35c",
  slate: "#7d8797",
};

// Premium, modern gradient color palette
const PIE_COLORS = ["#BD5D31", "#8FB89C", "#5b45b0", "#e0a35c", "#3b82f6"];

const formatShortDate = (isoStr) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const dayKey = (dateLike) => new Date(dateLike).toISOString().slice(0, 10);

const buildDailySeries = (orders, days, valueFn) => {
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets[dayKey(d)] = 0;
  }
  orders.forEach((o) => {
    const key = dayKey(o.orderDate);
    if (buckets[key] !== undefined) buckets[key] += valueFn(o);
  });
  return Object.entries(buckets).map(([date, value]) => ({
    date: formatShortDate(date),
    value: Number(value.toFixed(2)),
  }));
};

/* ---------------- KPI Card ---------------- */
const KpiCard = ({ title, value, change, color, onClick }) => {
  const isIncrease = change >= 0;
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer shadow-md rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-white/5 transition-all backdrop-blur-md"
      style={{ backgroundColor: `${color}f5` }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="font-medium text-sm text-[#f5f5f5]/80 uppercase tracking-wider text-[11px]">{title}</p>
        {Number.isFinite(change) && (
          <div className="flex items-center gap-1 shrink-0 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {isIncrease ? (
              <FaArrowUp size={9} className="text-emerald-300" />
            ) : (
              <FaArrowDown size={9} className="text-rose-300" />
            )}
            <p className={`font-semibold text-xs ${isIncrease ? "text-emerald-300" : "text-rose-300"}`}>
              {Math.abs(change).toFixed(1)}%
            </p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="font-bold text-2xl sm:text-3xl text-white tracking-tight">{value}</p>
        <p className="text-[11px] text-[#f5f5f5]/50 mt-2 font-light flex items-center gap-1">
          <span>Click to view timeline analytics</span>
        </p>
      </div>
    </motion.div>
  );
};

/* ---------------- Chart Modal ---------------- */
const ChartModal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[70] px-4 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      className="bg-[#121820] w-full max-w-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[#f5f5f5] text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-xs text-[#7d8797] mt-1">{subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#7d8797] hover:text-[#f5f5f5] bg-white/5 p-2 rounded-full transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>
      <div className="h-64 sm:h-76">{children}</div>
    </motion.div>
  </div>
);

/* ---------------- Main ---------------- */
const Metrics = () => {
  const [range, setRange] = useState(7);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [activeChart, setActiveChart] = useState(null);

  const { data: ordersRes } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const { data: tablesRes } = useQuery({ queryKey: ["tables"], queryFn: getTables });

  const orders = ordersRes?.data.data || [];
  const tables = tablesRes?.data.data || [];

  const stats = useMemo(() => {
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - range);
    rangeStart.setHours(0, 0, 0, 0);

    const prevStart = new Date(rangeStart);
    prevStart.setDate(prevStart.getDate() - range);

    const inRange = orders.filter((o) => new Date(o.orderDate) >= rangeStart);
    const prevRange = orders.filter(
      (o) => new Date(o.orderDate) >= prevStart && new Date(o.orderDate) < rangeStart
    );

    const sumRevenue = (list) =>
      list.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

    const totalRevenue = sumRevenue(inRange);
    const prevRevenue = sumRevenue(prevRange);
    const totalOrders = inRange.length;
    const prevOrders = prevRange.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const prevAvgOrderValue = prevOrders ? prevRevenue / prevOrders : 0;

    const pctChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const bookedTables = tables.filter((t) => t.status === "Booked").length;

    const revenueTrend = buildDailySeries(inRange, range, (o) => o.bills?.totalWithTax || 0);
    const ordersTrend = buildDailySeries(inRange, range, () => 1);
    const avgTrend = revenueTrend.map((r, i) => ({
      date: r.date,
      value: ordersTrend[i].value ? Number((r.value / ordersTrend[i].value).toFixed(2)) : 0,
    }));

    const dishMap = {};
    let maxQty = 0;
    inRange.forEach((o) => {
      (o.items || []).forEach((item) => {
        if (!dishMap[item.name]) dishMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        dishMap[item.name].quantity += item.quantity;
        dishMap[item.name].revenue += item.price;
        if (dishMap[item.name].quantity > maxQty) maxQty = dishMap[item.name].quantity;
      });
    });
    
    const topDishes = Object.values(dishMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(item => ({
        ...item,
        percentage: maxQty > 0 ? (item.quantity / maxQty) * 100 : 0
      }));

    const paymentMap = {};
    inRange.forEach((o) => {
      const key = o.paymentMethod || "Unknown";
      paymentMap[key] = (paymentMap[key] || 0) + 1;
    });
    const paymentSplit = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));

    const tableSplit = [
      { name: "Booked", value: bookedTables },
      { name: "Available", value: Math.max(tables.length - bookedTables, 0) },
    ];

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      bookedTables,
      totalTables: tables.length,
      revenueChange: pctChange(totalRevenue, prevRevenue),
      ordersChange: pctChange(totalOrders, prevOrders),
      avgOrderChange: pctChange(avgOrderValue, prevAvgOrderValue),
      revenueTrend,
      ordersTrend,
      avgTrend,
      topDishes,
      paymentSplit,
      tableSplit,
    };
  }, [orders, tables, range]);

  const kpis = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      change: stats.revenueChange,
      color: COLORS.revenue,
    },
    {
      id: "orders",
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString("en-IN"),
      change: stats.ordersChange,
      color: COLORS.orders,
    },
    {
      id: "avgOrder",
      title: "Avg Order Value",
      value: `₹${stats.avgOrderValue.toFixed(0)}`,
      change: stats.avgOrderChange,
      color: COLORS.avgOrder,
    },
    {
      id: "tables",
      title: "Tables Occupied",
      value: `${stats.bookedTables} / ${stats.totalTables}`,
      change: null,
      color: COLORS.tables,
    },
  ];

  const rangeLabel = RANGE_OPTIONS.find((r) => r.value === range)?.label;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 bg-[#0B0F14] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 border-b border-white/5 pb-6">
        <div>
          <h2 className="font-bold text-white text-xl sm:text-2xl tracking-tight">
            Overall Performance Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time visual insights generated from live orders, kitchen transactions, and tables.
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setRangeOpen((p) => !p)}
            className="flex items-center justify-between gap-3 w-full sm:w-auto px-4 py-2.5 rounded-xl text-white bg-[#161B22] border border-white/10 text-xs sm:text-sm hover:bg-[#1f2630] transition-all font-medium shadow-sm"
          >
            <span>{rangeLabel}</span>
            <FaChevronDown size={10} className="text-slate-400" />
          </button>
          <AnimatePresence>
            {rangeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 mt-2 bg-[#161B22] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 w-full sm:w-44"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setRange(opt.value);
                      setRangeOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-xs sm:text-sm transition-colors hover:bg-white/5 ${
                      range === opt.value ? "text-[#BD5D31] font-bold bg-[#BD5D31]/10" : "text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} onClick={() => setActiveChart(kpi.id)} />
        ))}
      </div>

      {/* Analytics Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Dishes - Professional Clean Row Bars Layout */}
        <div className="lg:col-span-2 bg-[#121820] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaUtensils className="text-[#BD5D31]" size={16} />
              <h2 className="font-bold text-white text-lg tracking-tight">Top Selling Dishes</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Highest performing dishes quantified by absolute sales volume in {rangeLabel.toLowerCase()}
            </p>
            
            <div className="space-y-4">
              {stats.topDishes.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-20">No analytics data available.</p>
              ) : (
                stats.topDishes.map((dish, idx) => (
                  <div key={dish.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="text-xs bg-white/5 text-slate-400 w-5 h-5 rounded-md flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {dish.name}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {dish.quantity} units <span className="text-emerald-400 ml-1">₹{dish.revenue.toFixed(0)}</span>
                      </span>
                    </div>
                    {/* Visual bar container instead of wide heavy charting blocks */}
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dish.percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-white/5 pt-4 mt-6 text-right">
            Live catalog reporting active
          </div>
        </div>

        {/* Payment Split & Revenue Channel Split - Styled as Modern Doughnut Rings */}
        <div className="bg-[#121820] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaCreditCard className="text-[#8FB89C]" size={16} />
              <h2 className="font-bold text-white text-lg tracking-tight">Payment Channel Split</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Volume breakdown by platform method
            </p>
            
            <div className="h-48 relative flex items-center justify-center">
              {stats.paymentSplit.length === 0 ? (
                <p className="text-slate-500 text-sm text-center pt-12">No data captured.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* Inner radius creates the high-end minimalist ring structure */}
                    <Pie
                      data={stats.paymentSplit}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {stats.paymentSplit.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Premium Custom Custom Legend layout instead of default cluttered styles */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
            {stats.paymentSplit.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-slate-400 truncate font-medium">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Modals for KPI cards */}
      <AnimatePresence>
        {activeChart === "revenue" && (
          <ChartModal
            title="Revenue Performance Trend"
            subtitle={`Daily absolute evaluation — ${rangeLabel.toLowerCase()}`}
            onClose={() => setActiveChart(null)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="#526071" fontSize={11} tickLine={false} />
                <YAxis stroke="#526071" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.revenue}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartModal>
        )}

        {activeChart === "orders" && (
          <ChartModal
            title="Transactional Volume Trend"
            subtitle={`Daily dynamic order aggregates — ${rangeLabel.toLowerCase()}`}
            onClose={() => setActiveChart(null)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ordersTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="#526071" fontSize={11} tickLine={false} />
                <YAxis stroke="#526071" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                  formatter={(value) => [value, "Orders"]}
                />
                <Bar dataKey="value" fill={COLORS.orders} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartModal>
        )}

        {activeChart === "avgOrder" && (
          <ChartModal
            title="Average Ticket Value Analysis"
            subtitle={`Mean dynamic basket value — ${rangeLabel.toLowerCase()}`}
            onClose={() => setActiveChart(null)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.avgTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="#526071" fontSize={11} tickLine={false} />
                <YAxis stroke="#526071" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                  formatter={(value) => [`₹${value}`, "Avg Order Value"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.avgOrder}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.avgOrder, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartModal>
        )}

        {activeChart === "tables" && (
          <ChartModal
            title="Table Occupancy Distribution"
            subtitle="Live table real-estate monitoring snapshot"
            onClose={() => setActiveChart(null)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.tableSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {stats.tableSplit.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.name === "Booked" ? COLORS.amber : COLORS.sage}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: 13, color: "#f5f5f5" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Metrics;