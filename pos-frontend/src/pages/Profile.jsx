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
  FiArrowLeft,
  FiLock,
  FiUser,
  FiPhone,
  FiMail,
  FiSave,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
  changePassword,
} from "../https";

const Profile =
  () => {
    const navigate =
      useNavigate();

    const {
      data,
      isLoading,
      refetch,
    } = useQuery({
      queryKey: [
        "my-profile",
      ],
      queryFn:
        getMyProfile,
    });

    const user =
      data?.data?.data;

    const [
      profile,
      setProfile,
    ] = useState({
      name: "",
      phone: "",
    });

    const [
      passwordForm,
      setPasswordForm,
    ] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    React.useEffect(() => {
      if (!user) return;

      setProfile({
        name:
          user.name || "",
        phone:
          String(
            user.phone || ""
          ),
      });
    }, [user]);

    useEffect(() => {
      document.title =
        "POS | My Profile";
    }, []);

    const profileMutation =
      useMutation({
        mutationFn:
          updateMyProfile,

        onSuccess: () => {
          enqueueSnackbar(
            "Profile updated successfully.",
            {
              variant:
                "success",
            }
          );

          refetch();
        },

        onError: (
          error
        ) => {
          enqueueSnackbar(
            error
              ?.response
              ?.data
              ?.message ||
              "Unable to update profile.",
            {
              variant:
                "error",
            }
          );
        },
      });

    const passwordMutation =
      useMutation({
        mutationFn:
          changePassword,

        onSuccess: () => {
          enqueueSnackbar(
            "Password changed successfully.",
            {
              variant:
                "success",
            }
          );

          setPasswordForm({
            currentPassword:
              "",
            newPassword: "",
            confirmPassword:
              "",
          });
        },

        onError: (
          error
        ) => {
          enqueueSnackbar(
            error
              ?.response
              ?.data
              ?.message ||
              "Unable to change password.",
            {
              variant:
                "error",
            }
          );
        },
      });

    const updateProfile =
      (event) => {
        event.preventDefault();

        profileMutation.mutate({
          name:
            profile.name,
          phone:
            profile.phone,
        });
      };

    const updatePassword =
      (event) => {
        event.preventDefault();

        passwordMutation.mutate(
          passwordForm
        );
      };

    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#12181F] text-[#F3EEE3] flex items-center justify-center">
          Loading profile...
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#12181F] text-[#F3EEE3] px-5 py-8">

        <div className="max-w-4xl mx-auto">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="flex items-center gap-2 text-[#8993A1] hover:text-[#F3EEE3] mb-8"
          >
            <FiArrowLeft />
            Back
          </button>

          <div className="mb-8">

            <p className="text-xs tracking-[0.25em] text-[#BD5D31]">
              ACCOUNT
            </p>

            <h1 className="text-3xl font-bold mt-1">
              My Profile
            </h1>

            <p className="text-sm text-[#8993A1] mt-2">
              Manage your account details and password.
            </p>

          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* PROFILE */}

            <div className="bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="p-3 rounded-lg bg-[#242c38]">
                  <FiUser
                    className="text-[#BD5D31]"
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-bold">
                    Account Details
                  </h2>

                  <p className="text-xs text-[#8993A1]">
                    Email is permanently linked to this account.
                  </p>
                </div>

              </div>

              <form
                onSubmit={
                  updateProfile
                }
                className="space-y-5"
              >

                <div>

                  <label className="text-xs text-[#8993A1]">
                    NAME
                  </label>

                  <div className="flex items-center gap-3 bg-[#242c38] rounded-lg px-4 py-3 mt-2">

                    <FiUser className="text-[#8993A1]" />

                    <input
                      value={
                        profile.name
                      }
                      onChange={(e) =>
                        setProfile(
                          (prev) => ({
                            ...prev,
                            name:
                              e.target
                                .value,
                          })
                        )
                      }
                      className="bg-transparent outline-none w-full"
                    />

                  </div>

                </div>

                <div>

                  <label className="text-xs text-[#8993A1]">
                    PHONE
                  </label>

                  <div className="flex items-center gap-3 bg-[#242c38] rounded-lg px-4 py-3 mt-2">

                    <FiPhone className="text-[#8993A1]" />

                    <input
                      value={
                        profile.phone
                      }
                      maxLength={10}
                      inputMode="numeric"
                      onChange={(e) =>
                        setProfile(
                          (prev) => ({
                            ...prev,
                            phone:
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  10
                                ),
                          })
                        )
                      }
                      className="bg-transparent outline-none w-full"
                    />

                  </div>

                </div>

                <div>

                  <label className="text-xs text-[#8993A1]">
                    EMAIL
                  </label>

                  <div className="flex items-center gap-3 bg-[#242c38] rounded-lg px-4 py-3 mt-2 opacity-60">

                    <FiMail className="text-[#8993A1]" />

                    <input
                      value={
                        user?.email ||
                        ""
                      }
                      disabled
                      className="bg-transparent outline-none w-full cursor-not-allowed"
                    />

                  </div>

                </div>

                <div>

                  <label className="text-xs text-[#8993A1]">
                    ROLE
                  </label>

                  <div className="bg-[#242c38] rounded-lg px-4 py-3 mt-2">
                    {
                      user?.role
                    }
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={
                    profileMutation.isPending
                  }
                  className="w-full bg-[#BD5D31] hover:bg-[#a64e26] disabled:opacity-50 rounded-lg py-3 font-bold flex items-center justify-center gap-2"
                >
                  <FiSave />

                  {profileMutation.isPending
                    ? "Saving..."
                    : "Save Details"}
                </button>

              </form>

            </div>

            {/* PASSWORD */}

            <div className="bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="p-3 rounded-lg bg-[#242c38]">
                  <FiLock
                    className="text-[#BD5D31]"
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-bold">
                    Change Password
                  </h2>

                  <p className="text-xs text-[#8993A1]">
                    Your current password is required.
                  </p>
                </div>

              </div>

              <form
                onSubmit={
                  updatePassword
                }
                className="space-y-5"
              >

                <input
                  type="password"
                  placeholder="Current password"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={(e) =>
                    setPasswordForm(
                      (prev) => ({
                        ...prev,
                        currentPassword:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="w-full bg-[#242c38] rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#BD5D31]"
                  required
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={(e) =>
                    setPasswordForm(
                      (prev) => ({
                        ...prev,
                        newPassword:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="w-full bg-[#242c38] rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#BD5D31]"
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={(e) =>
                    setPasswordForm(
                      (prev) => ({
                        ...prev,
                        confirmPassword:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="w-full bg-[#242c38] rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#BD5D31]"
                  required
                />

                <button
                  type="submit"
                  disabled={
                    passwordMutation.isPending
                  }
                  className="w-full bg-[#242c38] hover:bg-[#303a47] disabled:opacity-50 rounded-lg py-3 font-bold flex items-center justify-center gap-2"
                >
                  <FiLock />

                  {passwordMutation.isPending
                    ? "Updating..."
                    : "Change Password"}
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>
    );
  };

export default Profile;