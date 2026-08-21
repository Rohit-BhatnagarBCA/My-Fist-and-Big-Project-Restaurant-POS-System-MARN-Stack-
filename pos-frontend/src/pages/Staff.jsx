import React, {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  enqueueSnackbar,
} from "notistack";

import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  createStaff,
  getMyStaff,
  updateStaff,
  deleteStaff,
} from "../https";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "Waiter",
};

const Staff = () => {
  const [form, setForm] =
    useState(initialForm);

  const [editingStaff, setEditingStaff] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  useEffect(() => {
    document.title =
      "POS | Staff Management";
  }, []);

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-staff"],
    queryFn: getMyStaff,
  });

  const staff =
    data?.data?.data || [];

  const counts =
    data?.data?.counts || {
      total: 0,
      waiter: 0,
      kitchen: 0,
    };

  const createMutation =
    useMutation({
      mutationFn: createStaff,

      onSuccess: () => {
        enqueueSnackbar(
          "Staff account created successfully.",
          {
            variant:
              "success",
          }
        );

        setForm(
          initialForm
        );

        setShowForm(false);

        refetch();
      },

      onError: (error) => {
        enqueueSnackbar(
          error?.response?.data
            ?.message ||
            "Unable to create staff account.",
          {
            variant:
              "error",
          }
        );
      },
    });

  const updateMutation =
    useMutation({
      mutationFn: updateStaff,

      onSuccess: () => {
        enqueueSnackbar(
          "Staff updated successfully.",
          {
            variant:
              "success",
          }
        );

        setEditingStaff(
          null
        );

        setForm(
          initialForm
        );

        setShowForm(false);

        refetch();
      },

      onError: (error) => {
        enqueueSnackbar(
          error?.response?.data
            ?.message ||
            "Unable to update staff.",
          {
            variant:
              "error",
          }
        );
      },
    });

  const deleteMutation =
    useMutation({
      mutationFn: deleteStaff,

      onSuccess: () => {
        enqueueSnackbar(
          "Staff account removed.",
          {
            variant:
              "success",
          }
        );

        refetch();
      },

      onError: (error) => {
        enqueueSnackbar(
          error?.response?.data
            ?.message ||
            "Unable to remove staff.",
          {
            variant:
              "error",
          }
        );
      },
    });

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      if (
        name === "phone"
      ) {
        const digits =
          value
            .replace(/\D/g, "")
            .slice(0, 10);

        setForm(
          (previous) => ({
            ...previous,
            phone: digits,
          })
        );

        return;
      }

      setForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const handleSubmit =
    (event) => {
      event.preventDefault();

      if (
        form.phone.length !==
        10
      ) {
        enqueueSnackbar(
          "Phone number must be exactly 10 digits.",
          {
            variant:
              "warning",
          }
        );

        return;
      }

      if (
        editingStaff
      ) {
        updateMutation.mutate(
          {
            staffId:
              editingStaff._id,

            name: form.name,

            phone: form.phone,

            role: form.role,
          }
        );

        return;
      }

      createMutation.mutate(
        form
      );
    };

  const startCreate =
    () => {
      setEditingStaff(
        null
      );

      setForm(
        initialForm
      );

      setShowForm(true);
    };

  const startEdit =
    (staffMember) => {
      setEditingStaff(
        staffMember
      );

      setForm({
        name:
          staffMember.name ||
          "",

        email:
          staffMember.email ||
          "",

        phone:
          String(
            staffMember.phone ||
              ""
          ),

        password: "",

        role:
          staffMember.role ||
          "Waiter",
      });

      setShowForm(true);
    };

  const handleDelete =
    (staffMember) => {
      const confirmed =
        window.confirm(
          `Remove ${staffMember.name}'s account?`
        );

      if (!confirmed) {
        return;
      }

      deleteMutation.mutate(
        staffMember._id
      );
    };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#1f1f1f] text-white pb-10">
      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">

        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <p className="text-xs text-[#BD5D31] tracking-[0.25em] font-semibold">
              RESTAURANT MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Staff
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Manage Waiter and Kitchen accounts for your restaurant.
            </p>
          </div>

          <button
            onClick={
              startCreate
            }
            className="bg-[#BD5D31] hover:bg-[#a84f28] px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <FiPlus />
            Add Staff
          </button>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-xs text-gray-500">
              TOTAL STAFF
            </p>

            <p className="text-3xl font-bold mt-2">
              {counts.total}
            </p>
          </div>

          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-xs text-gray-500">
              WAITERS
            </p>

            <p className="text-3xl font-bold mt-2">
              {counts.waiter}
            </p>
          </div>

          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-xs text-gray-500">
              KITCHEN
            </p>

            <p className="text-3xl font-bold mt-2">
              {counts.kitchen}
            </p>
          </div>
        </div>

        {/* Staff list */}

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-[#2a2a2a] flex items-center gap-3">
            <FiUsers className="text-[#BD5D31]" />

            <div>
              <h2 className="font-bold">
                Restaurant Staff
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Every account below belongs only to your restaurant.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading staff...
            </div>
          ) : staff.length ===
            0 ? (
            <div className="p-10 text-center">
              <FiUsers
                size={36}
                className="mx-auto text-gray-600"
              />

              <p className="mt-4 text-gray-400">
                No staff accounts yet.
              </p>

              <button
                onClick={
                  startCreate
                }
                className="mt-4 text-[#BD5D31] font-semibold"
              >
                Add your first staff member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a] text-left text-xs text-gray-500">
                    <th className="px-6 py-4">
                      NAME
                    </th>

                    <th className="px-6 py-4">
                      EMAIL
                    </th>

                    <th className="px-6 py-4">
                      PHONE
                    </th>

                    <th className="px-6 py-4">
                      ROLE
                    </th>

                    <th className="px-6 py-4">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map(
                    (member) => (
                      <tr
                        key={
                          member._id
                        }
                        className="border-b border-[#2a2a2a] last:border-0"
                      >
                        <td className="px-6 py-5 font-semibold">
                          {
                            member.name
                          }
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-400">
                          {
                            member.email
                          }
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-400">
                          {
                            member.phone
                          }
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              member.role ===
                              "Kitchen"
                                ? "bg-[#3a2c1f] text-[#e0a35c]"
                                : "bg-[#25392c] text-[#8FB89C]"
                            }`}
                          >
                            {
                              member.role
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                startEdit(
                                  member
                                )
                              }
                              className="p-2.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-gray-300"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  member
                                )
                              }
                              disabled={
                                deleteMutation.isPending
                              }
                              className="p-2.5 rounded-lg bg-[#3a2925] hover:bg-[#4a312c] text-[#d77958] disabled:opacity-50"
                              title="Remove"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Staff Modal */}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">
          <div className="w-full max-w-lg bg-[#1B222B] border border-[#333] rounded-2xl shadow-2xl">

            <div className="px-6 py-5 border-b border-[#333] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingStaff
                    ? "Edit Staff"
                    : "Add Staff"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {editingStaff
                    ? "Update this staff account."
                    : "Create a Waiter or Kitchen account."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(
                    false
                  );

                  setEditingStaff(
                    null
                  );

                  setForm(
                    initialForm
                  );
                }}
                className="p-2 rounded-lg hover:bg-[#292929]"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 space-y-4"
            >

              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  NAME
                </label>

                <input
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full bg-[#242424] border border-[#3a3a3a] rounded-lg px-4 py-3 outline-none focus:border-[#BD5D31]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  EMAIL
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    Boolean(
                      editingStaff
                    )
                  }
                  className="w-full bg-[#242424] border border-[#3a3a3a] rounded-lg px-4 py-3 outline-none focus:border-[#BD5D31] disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  PHONE
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full bg-[#242424] border border-[#3a3a3a] rounded-lg px-4 py-3 outline-none focus:border-[#BD5D31]"
                  required
                />
              </div>

              {!editingStaff && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    PASSWORD
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full bg-[#242424] border border-[#3a3a3a] rounded-lg px-4 py-3 outline-none focus:border-[#BD5D31]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  ROLE
                </label>

                <select
                  name="role"
                  value={
                    form.role
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full bg-[#242424] border border-[#3a3a3a] rounded-lg px-4 py-3 outline-none focus:border-[#BD5D31]"
                >
                  <option value="Waiter">
                    Waiter
                  </option>

                  <option value="Kitchen">
                    Kitchen
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="w-full bg-[#BD5D31] hover:bg-[#a84f28] disabled:opacity-50 rounded-lg py-3.5 font-bold"
              >
                {createMutation.isPending ||
                updateMutation.isPending
                  ? "SAVING..."
                  : editingStaff
                  ? "UPDATE STAFF"
                  : "CREATE STAFF"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;