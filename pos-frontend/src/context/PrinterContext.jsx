import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const PrinterContext = createContext(null);

const STORAGE_KEY = "restro_printer_device";

// --- ESC/POS byte helpers -----------------------------------------------
const ESC = 0x1b;
const GS = 0x1d;

const cmd = {
  init: [ESC, 0x40],
  alignLeft: [ESC, 0x61, 0x00],
  alignCenter: [ESC, 0x61, 0x01],
  boldOn: [ESC, 0x45, 0x01],
  boldOff: [ESC, 0x45, 0x00],
  cut: [GS, 0x56, 0x00],
};

const encoder = new TextEncoder();

// Builds a simple, readable ESC/POS byte sequence for a receipt.
const buildReceiptBytes = (order) => {
  const bytes = [];
  const push = (arr) => bytes.push(...arr);
  const text = (str) => push(Array.from(encoder.encode(str)));

  push(cmd.init);
  push(cmd.alignCenter);
  push(cmd.boldOn);
  text("RESTRO POS\n");
  push(cmd.boldOff);
  text("------------------------------\n");
  push(cmd.alignLeft);
  text(`Order: #${Math.floor(new Date(order.orderDate || Date.now()).getTime())}\n`);
  text(`Table: ${order.table?.tableNo ?? "N/A"}\n`);
  text(`Customer: ${order.customerDetails?.name || "-"}\n`);
  text("------------------------------\n");

  (order.items || []).forEach((item) => {
    const line = `${item.name} x${item.quantity}`;
    const price = `Rs.${item.price}`;
    const padding = Math.max(1, 30 - line.length - price.length);
    text(`${line}${" ".repeat(padding)}${price}\n`);
  });

  text("------------------------------\n");
  push(cmd.boldOn);
  text(`TOTAL: Rs.${order.bills?.totalWithTax?.toFixed?.(2) ?? "0.00"}\n`);
  push(cmd.boldOff);
  text("\nThank you, visit again!\n\n\n");
  push(cmd.cut);

  return new Uint8Array(bytes);
};

export const PrinterProvider = ({ children }) => {
  const isSupported = typeof navigator !== "undefined" && !!navigator.usb;
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const getStoredDeviceInfo = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // On mount, silently check if a previously-paired printer is currently
  // plugged in (getDevices() does NOT prompt the user, only requestDevice does).
  const checkConnection = useCallback(async () => {
    if (!isSupported) return;
    const stored = getStoredDeviceInfo();
    if (!stored) return;

    try {
      const devices = await navigator.usb.getDevices();
      const match = devices.find(
        (d) => d.vendorId === stored.vendorId && d.productId === stored.productId
      );
      setDevice(match || null);
      setIsConnected(Boolean(match));
    } catch {
      setIsConnected(false);
    }
  }, [isSupported]);

  useEffect(() => {
    checkConnection();

    if (!isSupported) return;
    const handleConnect = () => checkConnection();
    const handleDisconnect = () => checkConnection();

    navigator.usb.addEventListener("connect", handleConnect);
    navigator.usb.addEventListener("disconnect", handleDisconnect);
    return () => {
      navigator.usb.removeEventListener("connect", handleConnect);
      navigator.usb.removeEventListener("disconnect", handleDisconnect);
    };
  }, [isSupported, checkConnection]);

  // Opens the browser's "select a USB device" picker — this is the only
  // WebUSB action that requires a direct user click, so it's used just
  // once during pairing (Dashboard > Add Printer).
  const pairPrinter = async () => {
    if (!isSupported) {
      throw new Error(
        "This browser doesn't support direct printer connections. Please use Chrome or Edge."
      );
    }
    const selected = await navigator.usb.requestDevice({ filters: [] });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ vendorId: selected.vendorId, productId: selected.productId })
    );
    setDevice(selected);
    setIsConnected(true);
    return selected;
  };

  const forgetPrinter = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDevice(null);
    setIsConnected(false);
  };

  // Sends a receipt to the printer. Throws on any failure so the caller
  // (Bill.jsx) can show the appropriate alert.
  const printReceipt = async (order) => {
    if (!isConnected || !device) {
      throw new Error("PRINTER_NOT_CONNECTED");
    }

    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    // Find an interface with a bulk OUT endpoint (varies by printer model).
    let targetInterface = null;
    let outEndpoint = null;

    for (const iface of device.configuration.interfaces) {
      for (const alt of iface.alternates) {
        const found = alt.endpoints.find((e) => e.direction === "out");
        if (found) {
          targetInterface = iface.interfaceNumber;
          outEndpoint = found.endpointNumber;
          break;
        }
      }
      if (targetInterface !== null) break;
    }

    if (targetInterface === null) {
      await device.close();
      throw new Error("No printable USB endpoint found on this device.");
    }

    await device.claimInterface(targetInterface);
    const bytes = buildReceiptBytes(order);
    await device.transferOut(outEndpoint, bytes);
    await device.releaseInterface(targetInterface);
    await device.close();
  };

  return (
    <PrinterContext.Provider
      value={{ isSupported, isConnected, device, pairPrinter, forgetPrinter, printReceipt, checkConnection }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = () => {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error("usePrinter must be used within a PrinterProvider");
  return ctx;
};