import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  FiArrowUpRight,
  FiCheck,
  FiCoffee,
  FiGrid,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import {
  MdOutlineReceiptLong,
} from "react-icons/md";

import {
  BiSolidDish,
} from "react-icons/bi";

import logo from "../assets/images/logo.png";

import {
  logout,
} from "../https";

import {
  removeUser,
} from "../redux/slices/userSlice";

import {
  DURATIONS,
  BUSINESS_PLANS,
  savingsLabel,
} from "../constants/pricing";
    


const monoFont =
  "font-['Space_Mono',_monospace]";

const bodyFont =
  "font-['Manrope',_sans-serif]";

// ============================================================
// REVEAL
// ============================================================

const Reveal = ({
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const featureCards = [
  {
    number: "01",
    eyebrow: "ORDERS",
    icon: FiShoppingBag,
    title: "Orders move without the back-and-forth.",
    text: "Take an order once and let the right people see it at the right time.",
  },
  {
    number: "02",
    eyebrow: "KITCHEN",
    icon: BiSolidDish,
    title: "Your kitchen knows what matters next.",
    text: "See active tickets, manage availability and keep service moving during the rush.",
  },
  {
    number: "03",
    eyebrow: "TABLES",
    icon: FiGrid,
    title: "Your floor stays easy to understand.",
    text: "Know which tables are free, busy or waiting without relying on memory or paper.",
  },
  {
    number: "04",
    eyebrow: "TEAM",
    icon: FiUsers,
    title: "Everyone gets the right job.",
    text: "Admins manage the business, waiters handle service and kitchen stays focused on food.",
  },
  {
    number: "05",
    eyebrow: "BILLING",
    icon: MdOutlineReceiptLong,
    title: "The last step should be the easiest.",
    text: "Handle payment, billing and printing without jumping between different systems.",
  },
  {
    number: "06",
    eyebrow: "CONTROL",
    icon: FiTrendingUp,
    title: "Know what is happening at a glance.",
    text: "Keep important restaurant activity visible without drowning the owner in unnecessary numbers.",
  },
];

const problems = [
  "Orders getting lost between floor and kitchen",
  "Staff checking item availability again and again",
  "Tables being tracked manually",
  "Too many steps for simple restaurant work",
  "Slow billing when the restaurant gets busy",
];

const reasons = [
  {
    icon: FiZap,
    title: "Fast to understand",
    text: "A waiter should be productive after a few minutes, not after a training session.",
  },
  {
    icon: FiShield,
    title: "Built around your team",
    text: "Each role sees what it actually needs, keeping the important work clear and the rest out of the way.",
  },
  {
    icon: FiCoffee,
    title: "Made for real restaurants",
    text: "The focus is practical day-to-day restaurant work, not bloated enterprise software.",
  },
  {
    icon: FiRefreshCw,
    title: "Keeps getting better",
    text: "The product can grow with your restaurant instead of forcing you to change the way you work.",
  },
];

const About = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);

  const [duration, setDuration] = useState("Monthly");
  const [activeReason, setActiveReason] = useState(0);

  const { scrollYProgress } = useScroll();

  const heroY = useTransform(
    scrollYProgress,
    [0, 0.18],
    [0, -45]
  );

  const heroScale = useTransform(
    scrollYProgress,
    [0, 0.18],
    [1, 0.985]
  );

  useEffect(() => {
    document.title =
      "Restro POS — Restaurant Management Made Simple";
  }, []);

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth", { replace: true });
    },

    onError: () => {
      dispatch(removeUser());
      navigate("/auth", { replace: true });
    },
  });

  const handleLogout = () => {
    if (logoutMutation.isPending) {
      return;
    }

    logoutMutation.mutate();
  };

  const handleGetStarted = () => {
    if (userData?.isAuth) {
      navigate("/subscription");
      return;
    }

    navigate("/auth");
  };

  const pricingPlans = useMemo(
    () =>
      BUSINESS_PLANS.map((plan) => ({
        ...plan,
        currentPrice: plan.prices[duration],
        savings: savingsLabel(plan, duration),
      })),
    [duration]
  );

  return (
    <div
      className={`${bodyFont} min-h-screen overflow-x-hidden bg-[#FFFDF8] text-[#241B16]`}
    >
      {/* ======================================================
          SOFT BACKGROUND
         ====================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0">

        <div className="absolute -top-40 left-[5%] h-[520px] w-[520px] rounded-full bg-[#F7B68E]/20 blur-[130px]" />

        <div className="absolute top-[45%] right-[-10%] h-[480px] w-[480px] rounded-full bg-[#FFDCC8]/45 blur-[120px]" />

        <div className="absolute bottom-[10%] left-[-12%] h-[400px] w-[400px] rounded-full bg-[#FCE7D8]/60 blur-[120px]" />

      </div>

      {/* ======================================================
          NAVBAR
         ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#E9DDD3] bg-[#FFFDF8]/88 backdrop-blur-xl">

        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* LOGO */}

          <button
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-3"
          >

            <img
              src={logo}
              alt="Restro POS"
              className="h-9 w-9 rounded-full"
            />

            <div className="text-left">
              <p
                className={`${monoFont} text-[11px] font-bold tracking-[0.28em] text-[#241B16]`}
              >
                RESTRO
              </p>

              <p className="text-[9px] tracking-wide text-[#8C7C71]">
                RESTAURANT POS
              </p>
            </div>

          </button>

          {/* LINKS */}

          <div className="hidden items-center gap-7 text-sm text-[#796B61] md:flex">

            <a
              href="#why"
              className="transition hover:text-[#C65A2E]"
            >
              Why Restro
            </a>

            <a
              href="#features"
              className="transition hover:text-[#C65A2E]"
            >
              Features
            </a>

            <a
              href="#founder"
              className="transition hover:text-[#C65A2E]"
            >
              Founder
            </a>

            <a
              href="#customer"
              className="transition hover:text-[#C65A2E]"
            >
              Customer
            </a>

            <a
              href="#pricing"
              className="transition hover:text-[#C65A2E]"
            >
              Pricing
            </a>

          </div>

          {/* ACTIONS */}

          {userData?.isAuth ? (
            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  navigate(
                    "/profile"
                  )
                }
                className="hidden rounded-full border border-[#E5D9D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#30241E] transition hover:border-[#D7B7A5] hover:bg-[#FFF8F2] sm:flex"
              >
                Profile
              </button>

              <button
                onClick={
                  handleLogout
                }
                className="rounded-full bg-[#C65A2E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#AB4922]"
              >
                {logoutMutation.isPending
                  ? "Logging out..."
                  : "Logout"}
              </button>

            </div>
          ) : (
            <button
              onClick={() =>
                navigate(
                  "/auth"
                )
              }
              className="rounded-full bg-[#241B16] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3B2B23]"
            >
              Login
            </button>
          )}

        </div>

      </nav>

      {/* ======================================================
          HERO
         ====================================================== */}

      <section className="relative z-10 overflow-hidden">

        <motion.div
          style={{
            y: heroY,
            scale:
              heroScale,
          }}
        >

          <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:px-10">

            <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">

              {/* LEFT */}

              <div>

                <Reveal>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E5B69E] bg-[#FFF0E7] px-3 py-1.5 text-[#B9532B]">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#C65A2E]" />

                    <span
                      className={`${monoFont} text-[9px] tracking-[0.2em]`}
                    >
                      BUILT FOR BUSY RESTAURANTS
                    </span>

                  </div>

                </Reveal>

                <Reveal
                  delay={0.06}
                >

                  <h1 className="mt-7 max-w-4xl text-[clamp(3.4rem,7.5vw,6.8rem)] font-black leading-[0.9] tracking-[-0.055em] text-[#241B16]">
                    Run your
                    restaurant.
                    <br />

                    <span className="text-[#C65A2E]">
                      Not the chaos.
                    </span>
                  </h1>

                </Reveal>

                <Reveal
                  delay={0.12}
                >

                  <p className="mt-7 max-w-xl text-base leading-relaxed text-[#75685F] sm:text-lg">
                    One simple place for your tables,
                    orders, kitchen, team and billing.
                    Built to make restaurant work feel
                    lighter when the day gets busy.
                  </p>

                </Reveal>

                <Reveal
                  delay={0.17}
                >

                  <div className="mt-9 flex flex-wrap gap-3">

                    <button
                      onClick={
                        handleGetStarted
                      }
                      className="group inline-flex items-center gap-3 rounded-full bg-[#C65A2E] px-6 py-3.5 font-bold text-white shadow-[0_12px_35px_rgba(198,90,46,.22)] transition hover:bg-[#AB4922]"
                    >
                      Get started

                      <FiArrowUpRight
                        className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </button>

                    <a
                      href="#features"
                      className="inline-flex items-center gap-2 rounded-full border border-[#E3D7CE] bg-white px-6 py-3.5 font-semibold text-[#4D3D34] transition hover:border-[#D2BAAA] hover:bg-[#FFF9F5]"
                    >
                      Explore the product
                    </a>

                  </div>

                </Reveal>

                <Reveal
                  delay={0.22}
                >

                  <div className="mt-11 grid max-w-xl grid-cols-3 gap-3">

                    {[
                      [
                        "01",
                        "Simple",
                      ],
                      [
                        "24/7",
                        "Ready",
                      ],
                      [
                        "₹",
                        "Pocket friendly",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          className="rounded-2xl border border-[#E8DCD3] bg-white/75 p-4"
                        >
                          <p className="text-xl font-extrabold text-[#241B16]">
                            {
                              value
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#8B7A70]">
                            {
                              label
                            }
                          </p>
                        </div>
                      )
                    )}

                  </div>

                </Reveal>

              </div>

              {/* HERO VISUAL */}

              <Reveal
                delay={0.12}
              >

                <div className="relative mx-auto w-full max-w-xl">

                  <motion.div
                    animate={{
                      y: [
                        0,
                        -8,
                        0,
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat:
                        Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >

                    <div className="absolute -inset-5 rounded-[36px] bg-[#F7B68E]/20 blur-3xl" />

                    <div className="relative overflow-hidden rounded-[30px] border border-[#E4D6CC] bg-white shadow-[0_30px_80px_rgba(79,48,33,.12)]">

                      {/* TOP */}

                      <div className="flex items-center justify-between border-b border-[#EFE5DE] px-5 py-4">

                        <div className="flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-[#C65A2E]" />

                          <span className="text-xs font-semibold tracking-wide text-[#65564D]">
                            TODAY
                          </span>

                        </div>

                        <span className="text-[10px] text-[#A19389]">
                          LIVE RESTAURANT
                        </span>

                      </div>

                      <div className="p-5 sm:p-6">

                        {/* METRICS */}

                        <div className="grid grid-cols-2 gap-3">

                          {[
                            [
                              "OPEN TABLES",
                              "08",
                              FiGrid,
                            ],
                            [
                              "ACTIVE ORDERS",
                              "17",
                              FiShoppingBag,
                            ],
                            [
                              "KITCHEN",
                              "06",
                              BiSolidDish,
                            ],
                            [
                              "TEAM",
                              "09",
                              FiUsers,
                            ],
                          ].map(
                            ([
                              label,
                              value,
                              Icon,
                            ]) => (
                              <div
                                key={
                                  label
                                }
                                className="rounded-2xl border border-[#EEE3DB] bg-[#FFF9F5] p-4"
                              >

                                <div className="flex items-center justify-between">

                                  <span className="text-[#C65A2E]">
                                    <Icon
                                      size={17}
                                    />
                                  </span>

                                  <span className="h-1.5 w-1.5 rounded-full bg-[#79A287]" />

                                </div>

                                <p className="mt-5 text-2xl font-extrabold text-[#241B16]">
                                  {
                                    value
                                  }
                                </p>

                                <p className="mt-1 text-[9px] tracking-[0.12em] text-[#94857A]">
                                  {
                                    label
                                  }
                                </p>

                              </div>
                            )
                          )}

                        </div>

                        {/* KITCHEN */}

                        <div className="mt-3 rounded-2xl border border-[#EEE3DB] bg-[#FFF9F5] p-4">

                          <div className="flex items-center justify-between">

                            <div>
                              <p className="text-xs text-[#95857A]">
                                Kitchen status
                              </p>

                              <p className="mt-1 font-bold text-[#2B201B]">
                                Everything under control
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold text-[#70927D]">
                              <span className="h-2 w-2 rounded-full bg-[#70927D]" />
                              Live
                            </div>

                          </div>

                          <div className="mt-4 grid grid-cols-5 gap-2">

                            {[
                              72,
                              55,
                              88,
                              63,
                              80,
                            ].map(
                              (
                                height,
                                index
                              ) => (
                                <div
                                  key={
                                    index
                                  }
                                  className="flex h-20 items-end overflow-hidden rounded-xl bg-[#F3E7DE]"
                                >

                                  <motion.div
                                    initial={{
                                      height: 0,
                                    }}
                                    whileInView={{
                                      height: `${height}%`,
                                    }}
                                    viewport={{
                                      once: true,
                                    }}
                                    transition={{
                                      duration: 0.8,
                                      delay:
                                        index *
                                        0.07,
                                    }}
                                    className="w-full rounded-t-xl bg-[#E27A4B]"
                                  />

                                </div>
                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* FLOATING ORDER */}

                    <motion.div
                      animate={{
                        y: [
                          0,
                          7,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat:
                          Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -bottom-5 -left-4 hidden w-52 rounded-2xl border border-[#E4D8CF] bg-white p-4 shadow-[0_20px_50px_rgba(71,43,28,.14)] sm:block"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0E7] text-[#C65A2E]">
                          <FiCheck />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#2A1F1A]">
                            Order #0248
                          </p>

                          <p className="mt-1 text-[10px] text-[#8A7B71]">
                            Ready for table 06
                          </p>
                        </div>

                      </div>

                    </motion.div>

                    {/* FLOATING STATUS */}

                    <motion.div
                      animate={{
                        y: [
                          0,
                          -6,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 4.5,
                        repeat:
                          Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -right-3 top-14 hidden rounded-2xl border border-[#E4D8CF] bg-white px-4 py-3 shadow-[0_20px_50px_rgba(71,43,28,.14)] sm:block"
                    >

                      <div className="flex items-center gap-2">

                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF7F0] text-[#70927D]">
                          <FiZap />
                        </span>

                        <div>
                          <p className="text-[9px] tracking-widest text-[#9A8B81]">
                            SERVICE
                          </p>

                          <p className="text-sm font-extrabold text-[#2B201B]">
                            Smooth
                          </p>
                        </div>

                      </div>

                    </motion.div>

                  </motion.div>

                </div>

              </Reveal>

            </div>

          </div>

        </motion.div>

      </section>

      {/* ======================================================
          TRUST STRIP
         ====================================================== */}

      <section className="relative z-10 border-y border-[#EDE1D8] bg-[#FFF8F2]">

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-5 sm:px-8 md:grid-cols-3 lg:px-10">

          {[
            [
              "01",
              "Simple enough for the floor",
            ],
            [
              "02",
              "Powerful enough for the owner",
            ],
            [
              "03",
              "Affordable enough to make sense",
            ],
          ].map(
            ([
              number,
              text,
            ]) => (
              <div
                key={
                  number
                }
                className="flex items-center gap-4 border-[#EDE1D8] py-6 md:border-r md:px-7 md:last:border-r-0"
              >

                <span
                  className={`${monoFont} text-[10px] tracking-[0.2em] text-[#C65A2E]`}
                >
                  {
                    number
                  }
                </span>

                <span className="text-sm font-semibold text-[#4A3A31]">
                  {text}
                </span>

              </div>
            )
          )}

        </div>

      </section>

      {/* ======================================================
          WHY
         ====================================================== */}

      <section
        id="why"
        className="relative z-10"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">

          <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">

            <Reveal>

              <div className="max-w-lg">

                <p
                  className={`${monoFont} text-[10px] tracking-[0.25em] text-[#C65A2E]`}
                >
                  WHY RESTRO
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#241B16] sm:text-5xl">
                  Restaurant software should remove work.
                </h2>

                <p className="mt-6 leading-relaxed text-[#75685F]">
                  When the restaurant gets busy, every
                  unnecessary tap, question and repeated
                  task adds up.
                </p>

              </div>

            </Reveal>

            <Reveal
              delay={0.08}
            >

              <div className="grid gap-3 sm:grid-cols-2">

                {problems.map(
                  (
                    problem
                  ) => (
                    <div
                      key={
                        problem
                      }
                      className="flex items-start gap-3 rounded-2xl border border-[#E9DDD4] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(72,43,28,.07)]"
                    >

                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF0E7] text-[#C65A2E]">
                        <FiMinus
                          size={13}
                        />
                      </span>

                      <span className="text-sm leading-relaxed text-[#615249]">
                        {
                          problem
                        }
                      </span>

                    </div>
                  )
                )}

              </div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* ======================================================
          FEATURES
         ====================================================== */}

      <section
        id="features"
        className="relative z-10 bg-[#FFF8F2]"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">

          <Reveal>

            <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <p
                  className={`${monoFont} text-[10px] tracking-[0.25em] text-[#C65A2E]`}
                >
                  THE PRODUCT
                </p>

                <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.045em] text-[#241B16] sm:text-6xl">
                  Everything your restaurant actually needs.
                </h2>
              </div>

              <p className="max-w-sm leading-relaxed text-[#796C62]">
                No feature theatre. Just the things your
                team will actually use.
              </p>

            </div>

          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {featureCards.map(
              (
                feature,
                index
              ) => {
                const Icon =
                  feature.icon;

                return (
                  <Reveal
                    key={
                      feature.title
                    }
                    delay={
                      index *
                      0.04
                    }
                  >

                    <div className="group h-full rounded-[25px] border border-[#E9DDD4] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#DAB9A7] hover:shadow-[0_22px_45px_rgba(70,42,27,.08)]">

                      <div className="flex items-center justify-between">

                        <span
                          className={`${monoFont} text-[10px] tracking-[0.2em] text-[#B39F92]`}
                        >
                          {
                            feature.number
                          }
                        </span>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0E7] text-[#C65A2E] transition group-hover:bg-[#C65A2E] group-hover:text-white">
                          <Icon
                            size={18}
                          />
                        </div>

                      </div>

                      <p
                        className={`${monoFont} mt-10 text-[9px] tracking-[0.2em] text-[#AD9B90]`}
                      >
                        {
                          feature.eyebrow
                        }
                      </p>

                      <h3 className="mt-2 text-xl font-bold leading-tight text-[#2A1F1A]">
                        {
                          feature.title
                        }
                      </h3>

                      <p className="mt-4 text-sm leading-relaxed text-[#766960]">
                        {
                          feature.text
                        }
                      </p>

                    </div>

                  </Reveal>
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* ======================================================
          FOUNDER
         ====================================================== */}

      <section
        id="founder"
        className="relative z-10"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">

          <div className="grid items-stretch gap-8 lg:grid-cols-[.9fr_1.1fr]">

            <Reveal>

              <div className="relative min-h-[500px] overflow-hidden rounded-[30px] border border-[#E4D6CC] bg-[#F5E1D3]">

                {/* REAL PHOTO CAN BE PLACED HERE LATER */}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(198,90,46,.20),transparent_40%)]" />

                <div className="absolute inset-0">
                  <img
                    src="/about/rohit-bhatnagar.jpg"
                    alt="Rohit Bhatnagar — Founder of Restro POS"
                    className="h-full w-full object-cover object-center"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B1E17]/75 via-transparent to-[#C65A2E]/10" />
                </div>

                {/* <div className="absolute left-1/2 top-1/2 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/45 shadow-[0_25px_60px_rgba(74,44,29,.10)] backdrop-blur-sm sm:h-56 sm:w-56">

                  <span className="text-[7rem] font-black tracking-[-0.08em] text-white/75 drop-shadow-lg sm:text-[8rem]">
                    R
                  </span>

                </div> */}

                <div className="absolute left-6 top-6 rounded-full border border-[#D5B5A1] bg-white/65 px-3 py-1.5 backdrop-blur">
                  <span
                    className={`${monoFont} text-[9px] tracking-[0.2em] text-[#9A7866]`}
                  >
                    FOUNDER
                  </span>
                </div>

                <div className="absolute inset-x-6 bottom-6">

                  <div className="rounded-2xl border border-white/60 bg-white/75 p-5 shadow-lg backdrop-blur-xl">

                    <p className="text-xl font-extrabold text-[#2A1F1A]">
                      Rohit Bhatnagar
                    </p>

                    <p className="mt-1 text-xs text-[#7D6D62]">
                      Founder, Restro POS
                    </p>

                  </div>

                </div>

              </div>

            </Reveal>

            <Reveal
              delay={0.08}
            >

              <div className="flex h-full flex-col justify-center rounded-[30px] border border-[#E9DDD4] bg-white p-7 sm:p-10">

                <p
                  className={`${monoFont} text-[10px] tracking-[0.25em] text-[#C65A2E]`}
                >
                  FROM THE FOUNDER
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#241B16] sm:text-5xl">
                  I wanted restaurant software to feel less complicated.
                </h2>

                <div className="mt-7 space-y-5 leading-relaxed text-[#75685F]">

                  <p>
                    I’m Rohit Bhatnagar, founder of
                    Restro POS.
                  </p>

                  <p>
                    Restaurants already have enough
                    moving parts. Orders, staff, tables,
                    kitchen, billing, customers — every
                    part matters, and every minute matters.
                  </p>

                  <p>
                    The idea behind Restro POS is simple:
                    bring those daily tasks into one place
                    without making the software itself
                    another headache.
                  </p>

                  <p className="font-semibold text-[#33251D]">
                    We are building a product that is
                    practical first, affordable second,
                    and beautiful because it should be
                    pleasant to use every day.
                  </p>

                </div>

                <div className="mt-9 flex items-center gap-3 border-t border-[#EFE3DB] pt-7">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E7] text-[#C65A2E]">
                    <FiStar />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#2B211C]">
                      Built with ownership
                    </p>

                    <p className="mt-1 text-xs text-[#897A70]">
                      Small details matter.
                    </p>

                  </div>

                </div>

              </div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* ======================================================
          HAPPY CUSTOMER
         ====================================================== */}

      <section
        id="customer"
        className="relative z-10 bg-[#FFF8F2]"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">

          <Reveal>

            <div className="mx-auto max-w-2xl text-center">

              <p
                className={`${monoFont} text-[10px] tracking-[0.25em] text-[#C65A2E]`}
              >
                HAPPY CUSTOMER #01
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#241B16] sm:text-6xl">
                The first restaurant
                that trusted us.
              </h2>

              <p className="mt-5 leading-relaxed text-[#796B61]">
                Sugarbrecks is our first happy customer —
                and that makes this one special.
              </p>

            </div>

          </Reveal>

          <Reveal
            delay={0.08}
          >

            <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[30px] border border-[#E3D4C9] bg-white shadow-[0_24px_70px_rgba(72,43,28,.08)]">

              <div className="grid md:grid-cols-[1fr_1.05fr]">

                {/* IMAGE PLACEHOLDER */}
                                                     

                <div className="relative min-h-[350px] overflow-hidden bg-[#F4DFD1] md:min-h-[500px]">

                  {/* Replace later with real Sugarbrecks image */}
                  

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(198,90,46,.20),transparent_34%)]" />

                  <div className="absolute inset-0">
                    <img
                      src="/about/sugarbrecks.jpg"
                      alt="Sugarbrecks — Restro POS first happy customer"
                      className="h-full w-full object-cover object-center"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B1E17]/65 via-transparent to-[#C65A2E]/10" />
                  </div>

                  <div className="absolute inset-x-8 bottom-8">
                    <div className="rounded-2xl border border-white/50 bg-white/75 p-5 shadow-xl backdrop-blur-md">

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E7] text-[#C65A2E]">
                          <FiCoffee />
                        </div>

                        <div>
                          <p className="text-xl font-black tracking-tight text-[#2A1F1A]">
                            Sugarbrecks
                          </p>

                          <p className="mt-1 text-xs text-[#8A7A70]">
                            Our first happy customer
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="absolute left-6 top-6 rounded-full bg-[#2A1F1A]/85 px-3 py-1.5 text-[9px] font-bold tracking-widest text-white">
                    CUSTOMER #01
                  </div>

                </div>

                {/* TESTIMONIAL */}

                <div className="flex flex-col justify-center p-7 sm:p-10">

                  <div className="flex gap-1 text-[#E0A35C]">
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                    ].map(
                      (star) => (
                        <FiStar
                          key={
                            star
                          }
                          fill="currentColor"
                          size={15}
                        />
                      )
                    )}
                  </div>

                  <p className="mt-6 text-2xl font-black leading-tight text-[#2A1F1A] sm:text-3xl">
                    “The first customer
                    always means the most.”
                  </p>

                  <p className="mt-6 leading-relaxed text-[#776960]">
                    Sugarbrecks gave Restro POS its
                    first real restaurant environment to
                    learn from. That trust helped turn an
                    idea into something people could
                    actually use.
                  </p>

                  <div className="mt-8 flex items-center gap-4 border-t border-[#EFE2DA] pt-7">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0E7] text-[#C65A2E]">
                      <FiCoffee />
                    </div>

                    <div>

                      <p className="font-bold text-[#2A1F1A]">
                        Sugarbrecks
                      </p>

                      <p className="mt-1 text-xs text-[#8A7A70]">
                        First happy customer
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </Reveal>

        </div>

      </section>

      {/* ======================================================
          WHY US
         ====================================================== */}

      <section className="relative z-10">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">

            <Reveal>

              <div className="lg:sticky lg:top-28 lg:self-start">

                <p
                  className={`${monoFont} text-[10px] tracking-[0.25em] text-[#C65A2E]`}
                >
                  WHY CHOOSE RESTRO
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#241B16] sm:text-5xl">
                  More useful.
                  <br />
                  Less expensive.
                  <br />
                  Easier every day.
                </h2>

                <p className="mt-6 max-w-md leading-relaxed text-[#75685F]">
                  You should not need to buy a huge
                  system just to solve everyday restaurant
                  problems.
                </p>

              </div>

            </Reveal>

            <div className="space-y-3">

              {reasons.map(
                (
                  reason,
                  index
                ) => {
                  const Icon =
                    reason.icon;

                  const active =
                    activeReason ===
                    index;

                  return (
                    <Reveal
                      key={
                        reason.title
                      }
                      delay={
                        index *
                        0.04
                      }
                    >

                      <button
                        onClick={() =>
                          setActiveReason(
                            index
                          )
                        }
                        className={`w-full rounded-[23px] border p-6 text-left transition ${
                          active
                            ? "border-[#E1B7A1] bg-[#FFF0E7] shadow-[0_15px_35px_rgba(72,43,28,.06)]"
                            : "border-[#E9DDD4] bg-white hover:border-[#D8C0B1]"
                        }`}
                      >

                        <div className="flex items-start gap-5">

                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-[#C65A2E] text-white"
                                : "bg-[#F8EEE8] text-[#A57B67]"
                            }`}
                          >
                            <Icon
                              size={18}
                            />
                          </div>

                          <div className="flex-1">

                            <div className="flex items-center justify-between gap-4">

                              <h3 className="text-lg font-bold text-[#2B211C]">
                                {
                                  reason.title
                                }
                              </h3>

                              {active ? (
                                <FiMinus className="text-[#C65A2E]" />
                              ) : (
                                <FiPlus className="text-[#8F7D72]" />
                              )}

                            </div>

                            <motion.div
                              initial={
                                false
                              }
                              animate={{
                                height:
                                  active
                                    ? "auto"
                                    : 0,
                                opacity:
                                  active
                                    ? 1
                                    : 0,
                              }}
                              className="overflow-hidden"
                            >
                              <p className="max-w-2xl pt-3 text-sm leading-relaxed text-[#796C62]">
                                {
                                  reason.text
                                }
                              </p>
                            </motion.div>

                          </div>

                        </div>

                      </button>

                    </Reveal>
                  );
                }
              )}

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          PRICING
         ====================================================== */}

      <section
        id="pricing"
        className="relative z-10 bg-[#FFF8F2]"
      >

        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">

          <Reveal>

            <div className="mx-auto max-w-3xl text-center">

              <p
                className={`${monoFont} text-[10px] tracking-[0.25em] text-[#C65A2E]`}
              >
                SIMPLE PRICING
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#241B16] sm:text-6xl">
                Good software.
                <br />
                Sensible pricing.
              </h2>

              <p className="mt-5 leading-relaxed text-[#796C62]">
                Start with what you need today and
                upgrade when your restaurant grows.
              </p>

            </div>

          </Reveal>

          {/* DURATION */}

          <Reveal
            delay={0.05}
          >

            <div className="mt-9 flex justify-center">

              <div className="inline-flex flex-wrap justify-center rounded-full border border-[#E4D8CF] bg-white p-1">

                {DURATIONS.map(
                  (item) => {
                    const active =
                      duration ===
                      item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        onClick={() =>
                          setDuration(
                            item.id
                          )
                        }
                        className={`rounded-full px-5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                          active
                            ? "bg-[#C65A2E] text-white"
                            : "text-[#7E7168] hover:text-[#2E241F]"
                        }`}
                      >
                        {
                          item.label
                        }
                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </Reveal>

          {/* PLANS */}

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">

            {pricingPlans.map(
              (
                item,
                index
              ) => (
                <Reveal
                  key={
                    item.id
                  }
                  delay={
                    index *
                    0.06
                  }
                >

                  <div
                    className={`h-full rounded-[28px] border p-7 sm:p-8 ${
                      item.highlighted
                        ? "border-[#D67A51] bg-[#C65A2E] text-white shadow-[0_25px_55px_rgba(198,90,46,.20)]"
                        : "border-[#E4D8CF] bg-white text-[#241B16]"
                    }`}
                  >

                    {item.highlighted && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[9px] font-bold tracking-wider text-[#C65A2E]">
                        <FiStar />
                        MOST POPULAR
                      </div>
                    )}

                    <h3 className="mt-4 text-2xl font-bold">
                      {
                        item.name
                      }
                    </h3>

                    <p
                      className={`mt-2 text-sm ${
                        item.highlighted
                          ? "text-white/80"
                          : "text-[#7D7066]"
                      }`}
                    >
                      {
                        item.tagline
                      }
                    </p>

                    <div className="mt-7">

                      <span className="text-5xl font-black tracking-tight">
                        ₹
                        {item.currentPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span
                        className={`ml-2 text-xs ${
                          item.highlighted
                            ? "text-white/75"
                            : "text-[#8E8077]"
                        }`}
                      >
                        /{" "}
                        {duration ===
                        "Yearly"
                          ? "year"
                          : duration ===
                            "4-Month"
                          ? "4 months"
                          : "month"}
                      </span>

                    </div>

                    {item.savings && (
                      <p
                        className={`mt-2 text-xs font-bold ${
                          item.highlighted
                            ? "text-white"
                            : "text-[#70927D]"
                        }`}
                      >
                        {
                          item.savings
                        }
                      </p>
                    )}

                    <div
                      className={`my-7 h-px ${
                        item.highlighted
                          ? "bg-white/20"
                          : "bg-[#EFE2DA]"
                      }`}
                    />

                    <ul className="space-y-3">

                      {item.features.map(
                        (
                          feature
                        ) => (
                          <li
                            key={
                              feature
                            }
                            className="flex items-start gap-3 text-sm"
                          >

                            <span
                              className={
                                item.highlighted
                                  ? "text-white"
                                  : "text-[#C65A2E]"
                              }
                            >
                              <FiCheck />
                            </span>

                            <span
                              className={
                                item.highlighted
                                  ? "text-white/90"
                                  : "text-[#6F6259]"
                              }
                            >
                              {
                                feature
                              }
                            </span>

                          </li>
                        )
                      )}

                    </ul>

                    <button
                      onClick={
                        handleGetStarted
                      }
                      className={`mt-8 w-full rounded-full py-3.5 font-bold transition ${
                        item.highlighted
                          ? "bg-white text-[#C65A2E] hover:bg-[#FFF7F2]"
                          : "bg-[#C65A2E] text-white hover:bg-[#AB4922]"
                      }`}
                    >
                      Get started
                    </button>

                  </div>

                </Reveal>
              )
            )}

          </div>

        </div>

      </section>

      {/* ======================================================
          FINAL CTA
         ====================================================== */}

      <section className="relative z-10 px-5 pb-16 sm:px-8 sm:pb-24 lg:px-10">

        <Reveal>

          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-[#E2CCBE] bg-[#F5DFD1]">

            <div className="absolute right-[-10%] top-[-30%] h-[400px] w-[400px] rounded-full bg-[#F6B08A]/35 blur-[90px]" />

            <div className="absolute bottom-[-30%] left-[20%] h-[300px] w-[300px] rounded-full bg-white/50 blur-[80px]" />

            <div className="relative px-7 py-14 sm:px-12 sm:py-20 lg:px-16">

              <div className="max-w-3xl">

                <p
                  className={`${monoFont} text-[10px] tracking-[0.25em] text-[#A74B27]`}
                >
                  READY WHEN YOU ARE
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#2A1F1A] sm:text-6xl">
                  Your restaurant
                  deserves software
                  that works as hard
                  as your team.
                </h2>

                <p className="mt-6 max-w-xl leading-relaxed text-[#705E53]">
                  Start simple. Run smoother. Grow
                  when you are ready.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">

                  <button
                    onClick={
                      handleGetStarted
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-[#241B16] px-6 py-3.5 font-bold text-white transition hover:bg-[#3A2A22]"
                  >
                    Start with Restro POS
                    <FiArrowUpRight />
                  </button>

                  <a
                    href="#customer"
                    className="rounded-full border border-[#D3B3A1] bg-white/55 px-6 py-3.5 font-semibold text-[#4B3A31] transition hover:bg-white"
                  >
                    Meet our first customer
                  </a>

                </div>

              </div>

            </div>

          </div>

        </Reveal>

      </section>

      {/* ======================================================
          FOOTER
         ====================================================== */}
<footer className="border-t border-[#E9DDD4] bg-[#FFFDF8]">

  <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

    <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

      {/* BRAND */}
      <div className="flex items-center gap-2">
        <img
          src={logo}
          alt="Restro POS"
          className="h-7 w-7 rounded-full"
        />

        <span className="text-sm font-bold text-[#2A201B]">
          Restro POS
        </span>
      </div>

      {/* TAGLINE */}
      <p className="text-center text-xs text-[#0f0f0f]">
        Built for restaurants that want
        less chaos and more control.
      </p>

      {/* CONTACT */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">

        {/* EMAIL */}
        <a
          href="mailto:YOUR_EMAIL@gmail.com"
          className="text-[#0f0f0f] transition hover:text-[#C65A2E]"
        >
          rohitxmohit@gmail.com
        </a>

        {/* PHONE */}
        <a
          href="tel:+91 9131621271"
          className="text-[#0f0f0f] transition hover:text-[#C65A2E]"
        >
          +91 91316 21271
        </a>

        {/* INSTAGRAM */}
        <a
          href="https://www.instagram.com/tryrestro_pos?igsi=MWU2dG02bGRnejhyOQ=="
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#0f0f0f] transition hover:text-[#C65A2E]"
        >
          Instagram
        </a>

      </div>

    </div>

    {/* BOTTOM */}
    <div className="mt-6 border-t border-[#E9DDD4] pt-5 text-center">

      <p className="text-[10px] text-[#0f0f0f]">
        © {new Date().getFullYear()} Restro POS
      </p>

    </div>

  </div>

</footer>

    </div>
  );
};

export default About;