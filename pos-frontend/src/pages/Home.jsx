import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { MdOutlineReceiptLong } from "react-icons/md";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { getOrders } from "../https";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  // Live numbers for the summary cards — refetches quietly every 30s.
  const { data: ordersRes } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 30000,
  });

  const orders = ordersRes?.data?.data || [];
  const totalEarnings = orders.reduce(
    (sum, o) => sum + (o.bills?.totalWithTax || 0),
    0
  );
  const totalOrders = orders.length;

  return (
    <section className="bg-[#12181F] min-h-screen lg:h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row gap-4 px-3 sm:px-6 lg:px-4 py-4 pb-24 lg:pb-4 select-none">
      
      {/* Left column - Cards & Recent Orders */}
      <div className="flex-1 lg:flex-[3] min-h-0 flex flex-col overflow-y-visible lg:overflow-y-auto scrollbar-hide gap-5">
        <Greetings />
        
        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch w-full gap-4">
          <MiniCard
            title="Total Earnings"
            icon={<BsCashCoin />}
            number={Math.round(totalEarnings)}
            prefix="₹"
            footerNum={1.6}
            onClick={() => navigate("/dashboard")}
          />
          <MiniCard
            title="Total Orders"
            icon={<MdOutlineReceiptLong />}
            number={totalOrders}
            footerNum={3.6}
            onClick={() => navigate("/orders")}
          />
        </div>

        {/* Recent Orders Section */}
        <div className="flex-1 min-h-0 bg-[#1a222b]/40 rounded-2xl border border-[#26323f]/50 shadow-lg backdrop-blur-sm">
          <RecentOrders />
        </div>
      </div>

      {/* Right column - Popular Dishes */}
      <div className="flex-1 lg:flex-[1.8] xl:flex-[1.5] min-h-0 bg-[#1a222b]/40 rounded-2xl border border-[#26323f]/50 shadow-lg backdrop-blur-sm p-1 lg:overflow-y-auto scrollbar-hide">
        <PopularDishes />
      </div>

      {/* Bottom Fixed Navigation */}
      <BottomNav />
    </section>
  );
};

export default Home;