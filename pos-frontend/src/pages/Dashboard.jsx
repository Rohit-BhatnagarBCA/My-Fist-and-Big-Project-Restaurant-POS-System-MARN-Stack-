import React, { useState, useEffect } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  MdTableBar,
  MdCategory,
  MdPrint,
  MdPeople,
} from "react-icons/md";

import { BiSolidDish } from "react-icons/bi";

import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";

import { usePrinter } from "../context/PrinterContext";
import { enqueueSnackbar } from "notistack";

const buttons = [
  {
    label: "Add Table",
    icon: <MdTableBar />,
    action: "table",
  },
  {
    label: "Add Category",
    icon: <MdCategory />,
    action: "category",
  },
  {
    label: "Add Dishes",
    icon: <BiSolidDish />,
    action: "dish",
  },
];

const tabs = [
  "Metrics",
  "Orders",
  "Payments",
];

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title =
      "POS | Admin Dashboard";
  }, []);

  // modalType is null (closed) or one of:
  // "table" | "category" | "dish"
  const [modalType, setModalType] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("Metrics");

  const {
    isSupported,
    isConnected,
    pairPrinter,
  } = usePrinter();

  const handleOpenModal = (
    action
  ) => {
    setModalType(action);
  };

  const handleAddPrinter =
    async () => {
      try {
        await pairPrinter();

        enqueueSnackbar(
          "Printer connected!",
          {
            variant:
              "success",
          }
        );
      } catch (error) {
        if (
          error?.name ===
          "NotFoundError"
        ) {
          return;
        }

        enqueueSnackbar(
          error?.message ||
            "Could not connect printer!",
          {
            variant:
              "error",
          }
        );
      }
    };

  const handleManageStaff =
    () => {
      navigate("/staff");
    };

  return (
    <div className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-10">

      {/* =====================================================
          TOP ACTIONS + TABS
         ===================================================== */}

      <div className="container mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-6 md:py-10 px-4 sm:px-6">

        {/* =================================================
            ACTION BUTTON GROUP
           ================================================= */}

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2 sm:gap-3 w-full lg:w-auto">

          {/* Existing Buttons */}

          {buttons.map(
            ({
              label,
              icon,
              action,
            }) => {
              return (
                <button
                  key={action}
                  onClick={() =>
                    handleOpenModal(
                      action
                    )
                  }
                  className="bg-[#1a1a1a] hover:bg-[#262626] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-[#f5f5f5] font-semibold text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 transition-colors active:scale-95"
                >
                  <span className="truncate">
                    {label}
                  </span>

                  <span className="text-sm sm:text-lg shrink-0">
                    {icon}
                  </span>
                </button>
              );
            }
          )}

          {/* =================================================
              PRINTER
             ================================================= */}

          <button
            onClick={
              handleAddPrinter
            }
            title={
              isSupported
                ? ""
                : "Needs Chrome or Edge"
            }
            className={`col-span-2 sm:col-span-1 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 transition-colors active:scale-95 ${
              isConnected
                ? "bg-green-900/40 text-green-400"
                : "bg-[#1a1a1a] hover:bg-[#262626] text-[#f5f5f5]"
            }`}
          >
            <span className="truncate">
              {isConnected
                ? "Printer Connected"
                : "Add Printer"}
            </span>

            <MdPrint className="text-sm sm:text-lg shrink-0" />
          </button>

          {/* =================================================
              MANAGE STAFF
             ================================================= */}

          <button
            onClick={
              handleManageStaff
            }
            className="col-span-2 sm:col-span-1 bg-[#1a1a1a] hover:bg-[#262626] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-[#f5f5f5] font-semibold text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 transition-colors active:scale-95"
          >
            <span className="truncate">
              Manage Staff
            </span>

            <MdPeople className="text-sm sm:text-lg shrink-0" />
          </button>
        </div>

        {/* =================================================
            TABS
           ================================================= */}

        <div className="flex items-center gap-1.5 sm:gap-3 bg-[#131313] sm:bg-transparent p-1 rounded-xl sm:p-0 w-full lg:w-auto mt-2 lg:mt-0">

          {tabs.map(
            (tab) => {
              const isActive =
                activeTab === tab;

              return (
                <button
                  key={tab}
                  className={`
                    flex-1 sm:flex-none px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-[#f5f5f5] font-semibold text-xs xs:text-sm sm:text-base text-center transition-colors
                    ${
                      isActive
                        ? "bg-[#262626] shadow-sm"
                        : "bg-transparent sm:bg-[#1a1a1a] hover:bg-[#262626]"
                    }
                  `}
                  onClick={() =>
                    setActiveTab(
                      tab
                    )
                  }
                >
                  {tab}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================================
          MAIN TAB CONTENT
         ===================================================== */}

      <div className="w-full">

        {activeTab ===
          "Metrics" && (
          <Metrics />
        )}

        {activeTab ===
          "Orders" && (
          <RecentOrders />
        )}

        {activeTab ===
          "Payments" && (
          <div className="text-white p-6 container mx-auto">
            Payment Component Coming Soon
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL
         ===================================================== */}

      {modalType && (
        <Modal
          modalType={
            modalType
          }
          setModalType={
            setModalType
          }
        />
      )}
    </div>
  );
};

export default Dashboard;