import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../https/index";
import { newActivity } from "../../redux/slices/notificationSlice";

// One consistent alert tone for every kind of activity — new order, order
// marked Ready, or a table freed up. Built with the Web Audio API so no
// audio file needs to ship with the app.
const playAlertTone = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [880, 1108].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.16;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  } catch (e) {
    // Sound is a nice-to-have — never let it break anything.
  }
};

// Mounted once at the app root (outside <Routes>) so it keeps polling and
// remembering what it has already seen no matter which page the person
// navigates to. Renders nothing — it's a pure background listener.
const NotificationListener = () => {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.user);
  // orderId -> { status, tableStatus } snapshot from the last poll.
  const knownState = useRef(null);

  const { data: resData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000,
    enabled: isAuth,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!isAuth) return;
    const orders = resData?.data?.data || [];

    if (knownState.current === null) {
      // First load after login — just record the baseline, no alerts for
      // orders that already existed before this session started.
      const baseline = new Map();
      orders.forEach((o) => {
        baseline.set(o._id, {
          status: o.orderStatus,
          tableStatus: o.table?.status,
        });
      });
      knownState.current = baseline;
      return;
    }

    let hasEvent = false;

    orders.forEach((order) => {
      const prev = knownState.current.get(order._id);

      if (!prev) {
        // A brand-new order showed up.
        hasEvent = true;
      } else {
        if (prev.status !== "Ready" && order.orderStatus === "Ready") {
          // An order just got marked Ready.
          hasEvent = true;
        }
        if (
          prev.tableStatus !== "Available" &&
          order.table?.status === "Available"
        ) {
          // A table just got freed.
          hasEvent = true;
        }
      }

      knownState.current.set(order._id, {
        status: order.orderStatus,
        tableStatus: order.table?.status,
      });
    });

    if (hasEvent) {
      playAlertTone();
      dispatch(newActivity());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resData, isAuth]);

  return null;
};

export default NotificationListener;