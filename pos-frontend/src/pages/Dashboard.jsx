import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory, MdPrint } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import { usePrinter } from "../context/PrinterContext";
import { enqueueSnackbar } from "notistack";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Category", icon: <MdCategory />, action: "category" },
  { label: "Add Dishes", icon: <BiSolidDish />, action: "dish" },
];

const tabs = ["Metrics", "Orders", "Payments"];

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  // modalType is null (closed) or one of "table" | "category" | "dish"
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState("Metrics");
  const { isSupported, isConnected, pairPrinter } = usePrinter();

  const handleOpenModal = (action) => {
    setModalType(action);
  };

  const handleAddPrinter = async () => {
    try {
      await pairPrinter();
      enqueueSnackbar("Printer connected!", { variant: "success" });
    } catch (error) {
      if (error?.name === "NotFoundError") return; // user closed the picker
      enqueueSnackbar(error.message || "Could not connect printer!", {
        variant: "error",
      });
    }
  };

  return (
    // min-h-[calc(100vh-5rem)] lagaya taaki wrap hone par mobile content cut na ho aur scroll ho sake
    <div className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-10">
      {/* 
        Container Padding aur Gap ko responsive banaya: 
        Mobile par py-4 aur items direct flex-col me convert honge taaki overlaps na ho.
      */}
      <div className="container mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-6 md:py-10 px-4 sm:px-6">
        
        {/* Actions Button Group: Grid layout for mobile (2 cols) and flex for desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2 sm:gap-3 w-full lg:w-auto">
          {buttons.map(({ label, icon, action }) => {
            return (
              <button
                key={action}
                onClick={() => handleOpenModal(action)}
                // px-3/py-2.5 on small screens, scale up smoothly to px-6/py-3 on tablets/laptops
                className="bg-[#1a1a1a] hover:bg-[#262626] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-[#f5f5f5] font-semibold text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 transition-colors active:scale-95"
              >
                <span className="truncate">{label}</span>
                <span className="text-sm sm:text-lg shrink-0">{icon}</span>
              </button>
            );
          })}

          {/* Printer Button: Col-span-2 ensures it fits beautifully on mobile grid systems */}
          <button
            onClick={handleAddPrinter}
            title={isSupported ? "" : "Needs Chrome or Edge"}
            className={`col-span-2 sm:col-span-1 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 transition-colors active:scale-95 ${
              isConnected
                ? "bg-green-900/40 text-green-400"
                : "bg-[#1a1a1a] hover:bg-[#262626] text-[#f5f5f5]"
            }`}
          >
            <span className="truncate">
              {isConnected ? "Printer Connected" : "Add Printer"}
            </span>
            <MdPrint className="text-sm sm:text-lg shrink-0" />
          </button>
        </div>

        {/* Tab Selection Group: Beautiful full width container on mobile, fits perfectly without wrapping */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-[#131313] sm:bg-transparent p-1 rounded-xl sm:p-0 w-full lg:w-auto mt-2 lg:mt-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                className={`
                  flex-1 sm:flex-none px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-[#f5f5f5] font-semibold text-xs xs:text-sm sm:text-base text-center transition-colors ${
                    isActive
                      ? "bg-[#262626] shadow-sm"
                      : "bg-transparent sm:bg-[#1a1a1a] hover:bg-[#262626]"
                  }
                `}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content components wrapper */}
      <div className="w-full">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "Payments" && (
          <div className="text-white p-6 container mx-auto">
            Payment Component Coming Soon
          </div>
        )}
      </div>

      {modalType && <Modal modalType={modalType} setModalType={setModalType} />}
    </div>
  );
};

export default Dashboard;