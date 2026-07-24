import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BsCheckCircleFill as BsCheckIcon } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, getDishes } from "../../https";
import { enqueueSnackbar } from "notistack";

const MenuContainer = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [justAdded, setJustAdded] = useState(null);

  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);

  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: dishesRes, isLoading: dishesLoading } = useQuery({
    queryKey: ["dishes"],
    queryFn: getDishes,
  });

  const categories = categoriesRes?.data?.data || [];
  const dishes = dishesRes?.data?.data || [];

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  const getCartQuantity = (dishId) => {
    const list = Array.isArray(cartData) ? cartData : cartData?.items || [];
    const found = list.find(
      (item) =>
        String(item.id) === String(dishId) ||
        String(item.dishId) === String(dishId) ||
        String(item._id) === String(dishId)
    );
    return found ? Number(found.quantity) : 0;
  };

  const getLocalCount = (id) => quantities[id] || 0;

  // Helper function: Strictly check if a dish has an explicit active stock limit (> 0)
  const getStockLimit = (item) => {
    const rawQty = item.quantity ?? item.stockQty ?? item.stock;
    if (rawQty === undefined || rawQty === null || rawQty === "") return null;
    const num = Number(rawQty);
    return !isNaN(num) && num > 0 ? num : null;
  };

  const increment = (item) => {
    const stockLimit = getStockLimit(item);
    const inCart = getCartQuantity(item._id);
    const local = getLocalCount(item._id);

    // Agar stockLimit null hai (yaani limit set nahi hai), to hamesha increment allow hoga
    if (stockLimit === null || inCart + local + 1 <= stockLimit) {
      setQuantities((prev) => ({
        ...prev,
        [item._id]: local + 1,
      }));
    } else {
      enqueueSnackbar(`Maximum stock limit of ${stockLimit} reached`, {
        variant: "warning",
      });
    }
  };

  const decrement = (item) => {
    const local = getLocalCount(item._id);
    setQuantities((prev) => ({
      ...prev,
      [item._id]: Math.max(local - 1, 0),
    }));
  };

  const handleAddToCart = (item) => {
    const count = getLocalCount(item._id);
    if (count === 0) return;

    const { name, price, _id } = item;

    const newObj = {
      id: _id,
      dishId: _id,
      name,
      pricePerQuantity: price,
      quantity: count,
      price: price * count,
    };

    dispatch(addItems(newObj));
    enqueueSnackbar(`${count}x ${name} added to cart`, { variant: "success" });

    setQuantities((prev) => ({ ...prev, [_id]: 0 }));
    setJustAdded(_id);
    setTimeout(() => setJustAdded(null), 700);
  };

  const isLoading = categoriesLoading || dishesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-[#ababab] text-sm">Loading menu...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
        <p className="text-[#ababab] text-sm">
          No categories yet. Go to Dashboard to add categories.
        </p>
      </div>
    );
  }

  const itemsInSelectedCategory = dishes.filter(
    (dish) => dish.category?._id === selectedCategoryId
  );

  return (
    <>
      {/* Categories Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-10 py-4">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category._id;
          const itemCount = dishes.filter(
            (d) => d.category?._id === category._id
          ).length;

          return (
            <motion.div
              key={category._id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategoryId(category._id)}
              className={`relative flex flex-col items-start justify-between p-4 rounded-xl h-[100px] cursor-pointer overflow-hidden transition-shadow ${
                isSelected ? "ring-2 ring-white/70 shadow-lg" : ""
              }`}
              style={{ backgroundColor: category.bgColor }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold truncate pr-2">
                  {category.icon} {category.name}
                </h1>
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <BsCheckIcon className="text-white shrink-0" size={18} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[#e5e5e5]/80 text-sm font-semibold">
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </p>
            </motion.div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-2" />

      {/* Dishes Grid */}
      <motion.div
        key={selectedCategoryId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-10 py-4"
      >
        {itemsInSelectedCategory.length === 0 ? (
          <p className="text-[#ababab] text-sm col-span-full text-center py-10">
            No dishes in this category yet.
          </p>
        ) : (
          itemsInSelectedCategory.map((item) => {
            const localCount = getLocalCount(item._id);
            const inCartCount = getCartQuantity(item._id);

            // Fetch explicit stock limit (returns null if unlimited)
            const stockLimit = getStockLimit(item);

            // OUT OF STOCK tabhi hoga jab:
            // 1. Explicitly isAvailable === false ho
            // 2. Ya stockLimit set ho (>0) aur cart me itna stock pahuch gaya ho
            const isOutOfStock =
              item.isAvailable === false ||
              (stockLimit !== null && inCartCount >= stockLimit);

            // Max reached tabhi check hoga jab stock limit defined ho
            const isMaxReached =
              stockLimit !== null && inCartCount + localCount >= stockLimit;

            const wasJustAdded = justAdded === item._id;

            return (
              <div
                key={item._id}
                className={`relative flex flex-col items-start justify-between p-4 rounded-xl min-h-[150px] cursor-default transition-colors border ${
                  isOutOfStock
                    ? "bg-[#161616] border-transparent opacity-60"
                    : "bg-[#1a1a1a] hover:bg-[#242424] border-transparent hover:border-[#333]"
                }`}
              >
                {/* Out of stock tag */}
                {isOutOfStock && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                    Out of stock
                  </span>
                )}

                <div className="flex items-start justify-between w-full">
                  <div>
                    <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold pr-2">
                      {item.name}
                    </h1>
                    {inCartCount > 0 && (
                      <p className="text-xs text-[#02ca3a] mt-0.5 font-medium">
                        {inCartCount} in cart
                      </p>
                    )}
                  </div>

                  {/* Add to cart toggle button */}
                  {!isOutOfStock && (
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleAddToCart(item)}
                      disabled={localCount === 0}
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        localCount === 0
                          ? "bg-[#242424] text-[#555] cursor-not-allowed"
                          : "bg-[#2e4a40] text-[#02ca3a] hover:bg-[#345a4c]"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {wasJustAdded ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <BsCheckIcon size={20} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="cart"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <FaShoppingCart size={20} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center justify-between w-full mt-3">
                  <p className="text-[#f5f5f5] text-lg sm:text-xl font-bold">
                    ₹{item.price}
                  </p>

                  {/* Counter */}
                  {!isOutOfStock && (
                    <div className="flex items-center justify-between bg-[#1f1f1f] px-3 sm:px-4 py-2.5 rounded-lg gap-4 sm:gap-6">
                      <button
                        onClick={() => decrement(item)}
                        disabled={localCount === 0}
                        className={`text-xl sm:text-2xl leading-none transition-colors ${
                          localCount === 0
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-yellow-500 hover:text-yellow-400"
                        }`}
                      >
                        &minus;
                      </button>

                      <span className="text-white w-4 text-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={localCount}
                            initial={{ y: -6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 6, opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="inline-block font-semibold"
                          >
                            {localCount}
                          </motion.span>
                        </AnimatePresence>
                      </span>

                      <button
                        onClick={() => increment(item)}
                        disabled={isMaxReached}
                        className={`text-xl sm:text-2xl leading-none transition-colors ${
                          isMaxReached
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-yellow-500 hover:text-yellow-400"
                        }`}
                      >
                        &#43;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </>
  );
};

export default MenuContainer;