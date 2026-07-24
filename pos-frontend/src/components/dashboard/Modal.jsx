import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaPen, FaTrash } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTable,
  getTables,
  updateTable,
  deleteTable,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  addDish,
  getDishes,
  updateDish,
  deleteDish,
} from "../../https";
import { enqueueSnackbar } from "notistack";

const TABS = [
  { id: "table", label: "Table", icon: MdTableBar },
  { id: "category", label: "Category", icon: MdCategory },
  { id: "dish", label: "Dish", icon: BiSolidDish },
];

const swatches = [
  "#b73e3e", "#5b45b0", "#7f167f", "#735f32",
  "#1e3a5f", "#2f6b4f", "#8a3324", "#4a4a4a",
];

const Modal = ({ modalType = "table", setModalType }) => {
  const [activeTab, setActiveTab] = useState(modalType);

  const closeModal = () => setModalType(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">Manage Menu</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={closeModal}
            className="text-[#ababab] hover:text-red-500 transition-colors"
          >
            <IoMdClose size={22} />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-[#1f1f1f] p-1.5 rounded-xl">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? "text-[#1f1f1f]" : "text-[#ababab] hover:text-[#f5f5f5]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="modal-tab-bg"
                    className="absolute inset-0 bg-yellow-400 rounded-lg"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "table" && <TableManager />}
            {activeTab === "category" && <CategoryManager />}
            {activeTab === "dish" && <DishManager />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ---------------- Shared bits ---------------- */
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-[#ababab] mb-2 text-sm font-medium">
      {label}
    </label>
    <div className="flex items-center rounded-lg py-3 px-4 bg-[#1f1f1f] border border-transparent focus-within:border-yellow-400 transition-colors">
      {children}
    </div>
  </div>
);

const SubmitButton = ({ isLoading, label, onCancel }) => (
  <div className="flex items-center gap-2 mt-2">
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-3 rounded-lg text-sm font-semibold text-[#ababab] hover:text-[#f5f5f5] border border-[#3a3a3a] hover:border-[#4a4a4a] transition-colors"
      >
        Cancel
      </button>
    )}
    <motion.button
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.97 } : {}}
      type="submit"
      disabled={isLoading}
      className={`flex-1 rounded-lg py-3 text-lg font-bold transition-colors ${
        isLoading
          ? "bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed"
          : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
      }`}
    >
      {isLoading ? "Saving..." : label}
    </motion.button>
  </div>
);

const IconBtn = ({ onClick, variant = "edit", title }) => (
  <motion.button
    type="button"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      variant === "delete"
        ? "text-[#ababab] hover:text-red-400 hover:bg-red-500/10"
        : "text-[#ababab] hover:text-yellow-400 hover:bg-yellow-400/10"
    }`}
  >
    {variant === "delete" ? <FaTrash size={14} /> : <FaPen size={14} />}
  </motion.button>
);

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
      checked ? "bg-green-500" : "bg-[#3a3a3a]"
    }`}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
      style={{ x: checked ? 20 : 0 }}
    />
  </button>
);

const ConfirmDialog = ({ title, message, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.2 }}
      className="bg-[#262626] p-6 rounded-2xl shadow-xl w-full max-w-sm"
    >
      <h3 className="text-[#f5f5f5] text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[#ababab] text-sm mb-6">{message}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#ababab] hover:text-[#f5f5f5] border border-[#3a3a3a] hover:border-[#4a4a4a] transition-colors"
        >
          Cancel
        </button>
        <motion.button
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.97 } : {}}
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            isLoading
              ? "bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-400"
          }`}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </motion.button>
      </div>
    </motion.div>
  </div>
);

/* ---------------- Table Manager ---------------- */
const TableManager = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ tableNo: "", seats: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data } = useQuery({ queryKey: ["tables"], queryFn: getTables });
  const tables = data?.data?.data || [];

  const resetForm = () => {
    setFormData({ tableNo: "", seats: "" });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId ? updateTable({ tableId: editingId, ...payload }) : addTable(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      enqueueSnackbar(res.data?.message || "Table saved successfully!", { variant: "success" });
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong!", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTable(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      enqueueSnackbar(res.data?.message || "Table deleted!", { variant: "success" });
      setDeleteTarget(null);
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong!", {
        variant: "error",
      });
      setDeleteTarget(null);
    },
  });

  const handleEdit = (table) => {
    setEditingId(table._id);
    setFormData({ tableNo: table.tableNo || "", seats: table.seats || "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      tableNo: Number(formData.tableNo),
      seats: Number(formData.seats)
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Table Number">
          <input
            type="number"
            name="tableNo"
            value={formData.tableNo}
            onChange={handleChange}
            className="bg-transparent flex-1 text-white focus:outline-none"
            required
          />
        </FormField>
        <FormField label="Number of Seats">
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            className="bg-transparent flex-1 text-white focus:outline-none"
            required
          />
        </FormField>
        <SubmitButton
          isLoading={saveMutation.isPending}
          label={editingId ? "Update Table" : "Add Table"}
          onCancel={editingId ? resetForm : null}
        />
      </form>

      {tables.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-[#ababab] font-semibold mb-2 tracking-wide">
            EXISTING TABLES
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
            {tables.map((table) => (
              <div
                key={table._id}
                className="flex items-center justify-between bg-[#1f1f1f] px-4 py-2.5 rounded-lg"
              >
                <div>
                  <p className="text-[#f5f5f5] text-sm font-semibold">
                    Table {table.tableNo}{" "}
                    <span className="text-[#ababab] font-normal">
                      · {table.seats} seats
                    </span>
                  </p>
                  <p className="text-xs text-[#ababab]">{table.status}</p>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn onClick={() => handleEdit(table)} title="Edit" />
                  <IconBtn
                    onClick={() =>
                      setDeleteTarget({ id: table._id, label: `Table ${table.tableNo}` })
                    }
                    variant="delete"
                    title="Delete"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete this table?"
            message={`${deleteTarget.label} will be permanently removed. This can't be undone.`}
            isLoading={deleteMutation.isPending}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ---------------- Category Manager ---------------- */
const CategoryManager = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    icon: "🍽️",
    bgColor: swatches[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const categories = data?.data?.data || [];

  const resetForm = () => {
    setFormData({ name: "", icon: "🍽️", bgColor: swatches[0] });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId
        ? updateCategory({ categoryId: editingId, ...payload })
        : addCategory(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar(res.data?.message || "Category saved!", { variant: "success" });
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong!", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      enqueueSnackbar(res.data?.message || "Category removed!", { variant: "success" });
      setDeleteTarget(null);
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong!", {
        variant: "error",
      });
      setDeleteTarget(null);
    },
  });

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({ name: category.name || "", icon: category.icon || "🍽️", bgColor: category.bgColor || swatches[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="flex items-center justify-between p-4 rounded-xl h-[80px] transition-colors"
          style={{ backgroundColor: formData.bgColor }}
        >
          <h1 className="text-[#f5f5f5] text-lg font-semibold truncate">
            {formData.icon} {formData.name || "Category Name"}
          </h1>
        </div>

        <FormField label="Category Name">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Starters"
            className="bg-transparent flex-1 text-white focus:outline-none placeholder:text-[#565656]"
            required
          />
        </FormField>

        <FormField label="Icon (emoji)">
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            maxLength={2}
            placeholder="🍟"
            className="bg-transparent flex-1 text-white focus:outline-none placeholder:text-[#565656]"
            required
          />
        </FormField>

        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Color
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {swatches.map((color) => (
              <motion.button
                key={color}
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFormData((prev) => ({ ...prev, bgColor: color }))}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.bgColor === color
                    ? "border-yellow-400 scale-110"
                    : "border-transparent"
                }`}
              />
            ))}
            <input
              type="color"
              name="bgColor"
              value={formData.bgColor}
              onChange={handleChange}
              className="w-8 h-8 rounded-full overflow-hidden bg-transparent cursor-pointer border-2 border-[#3a3a3a]"
            />
          </div>
        </div>

        <SubmitButton
          isLoading={saveMutation.isPending}
          label={editingId ? "Update Category" : "Add Category"}
          onCancel={editingId ? resetForm : null}
        />
      </form>

      {categories.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-[#ababab] font-semibold mb-2 tracking-wide">
            EXISTING CATEGORIES
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{ backgroundColor: category.bgColor }}
              >
                <p className="text-[#f5f5f5] text-sm font-semibold truncate pr-2">
                  {category.icon} {category.name}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <IconBtn onClick={() => handleEdit(category)} title="Edit" />
                  <IconBtn
                    onClick={() =>
                      setDeleteTarget({ id: category._id, label: category.name })
                    }
                    variant="delete"
                    title="Delete"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete this category?"
            message={`"${deleteTarget.label}" and all its dishes will be permanently removed. This can't be undone.`}
            isLoading={deleteMutation.isPending}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ---------------- Dish Manager ---------------- */
const DishManager = () => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({ name: "", price: "", category: "", quantity: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: dishesData } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });

  const categories = categoriesData?.data?.data || [];
  const dishes = dishesData?.data?.data || [];

  const resetForm = () => {
    setFormData({ name: "", price: "", category: "", quantity: "" });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId ? updateDish({ dishId: editingId, ...payload }) : addDish(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      enqueueSnackbar(res.data?.message || "Dish saved successfully!", { variant: "success" });
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong!", {
        variant: "error",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ dishId, isAvailable }) => updateDish({ dishId, isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Could not update stock status!", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDish(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      enqueueSnackbar(res.data?.message || "Dish deleted!", { variant: "success" });
      setDeleteTarget(null);
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong!", {
        variant: "error",
      });
      setDeleteTarget(null);
    },
  });

  const handleEdit = (dish) => {
    setEditingId(dish._id);
    setFormData({ 
      name: dish.name || "", 
      price: dish.price || "", 
      category: dish.category?._id || "",
      quantity: dish.quantity || "" 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) {
      enqueueSnackbar("Please select a category!", { variant: "warning" });
      return;
    }
    saveMutation.mutate({
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity)
    });
  };

  if (categoriesLoading) {
    return <p className="text-[#ababab] text-sm text-center py-6">Loading categories...</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="text-[#ababab] text-sm text-center py-6">
        No categories yet — add a category first before adding dishes.
      </p>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Dish Name">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Paneer Tikka"
            className="bg-transparent flex-1 text-white focus:outline-none placeholder:text-[#565656]"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price (₹)">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </FormField>

          <FormField label="Stock Qty">
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 50"
              className="bg-transparent flex-1 text-white focus:outline-none placeholder:text-[#565656]"
              required
            />
          </FormField>
        </div>

        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isActive = formData.category === cat._id;
              return (
                <motion.button
                  key={cat._id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat._id }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors truncate ${
                    isActive
                      ? "border-yellow-400 text-[#f5f5f5]"
                      : "border-transparent text-[#ababab] hover:border-[#3a3a3a]"
                  }`}
                  style={{ backgroundColor: cat.bgColor }}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <SubmitButton
          isLoading={saveMutation.isPending}
          label={editingId ? "Update Dish" : "Add Dish"}
          onCancel={editingId ? resetForm : null}
        />
      </form>

      {dishes.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-[#ababab] font-semibold mb-2 tracking-wide">
            EXISTING DISHES
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {dishes.map((dish) => {
              const qty = dish.quantity || 0;
              const isLowStock = qty > 0 && qty <= 5;
              const isOut = qty <= 0;

              return (
                <div
                  key={dish._id}
                  className="flex items-center justify-between bg-[#1f1f1f] px-4 py-2.5 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-[#f5f5f5] text-sm font-semibold truncate">
                      {dish.name}{" "}
                      <span className="text-[#ababab] font-normal">₹{dish.price}</span>
                      <span
                        className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                          isOut
                            ? "bg-red-500/20 text-red-400"
                            : isLowStock
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-[#333] text-yellow-400"
                        }`}
                      >
                        {isOut ? "Out of stock" : `Qty: ${qty}`}
                      </span>
                    </p>
                    <p className="text-xs text-[#ababab] truncate">
                      {dish.category?.icon} {dish.category?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={dish.isAvailable}
                      onChange={() =>
                        toggleMutation.mutate({
                          dishId: dish._id,
                          isAvailable: !dish.isAvailable,
                        })
                      }
                    />
                    <IconBtn onClick={() => handleEdit(dish)} title="Edit" />
                    <IconBtn
                      onClick={() => setDeleteTarget({ id: dish._id, label: dish.name })}
                      variant="delete"
                      title="Delete"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete this dish?"
            message={`"${deleteTarget.label}" will be permanently removed from the menu.`}
            isLoading={deleteMutation.isPending}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Modal;