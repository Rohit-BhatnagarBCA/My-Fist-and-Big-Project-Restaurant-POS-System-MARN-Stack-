import React, {
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
  getAllUsers,
  getAllRestaurants,
  sendNotification,
} from "../../https";

const NotificationComposer =
  () => {
    const [
      targetType,
      setTargetType,
    ] = useState(
      "all"
    );

    const [
      targetId,
      setTargetId,
    ] = useState("");

    const [
      type,
      setType,
    ] = useState(
      "announcement"
    );

    const [
      title,
      setTitle,
    ] = useState("");

    const [
      message,
      setMessage,
    ] = useState("");

    const [
      expiresAt,
      setExpiresAt,
    ] = useState("");

    const {
      data:
        usersResponse,
    } = useQuery({
      queryKey: [
        "super-admin-users",
      ],
      queryFn:
        getAllUsers,
    });

    const {
      data:
        restaurantsResponse,
    } = useQuery({
      queryKey: [
        "super-admin-restaurants",
      ],
      queryFn:
        getAllRestaurants,
    });

    const users =
      usersResponse?.data?.data ||
      [];

    const restaurants =
      restaurantsResponse?.data?.data ||
      [];

    const mutation =
      useMutation({
        mutationFn:
          sendNotification,

        onSuccess:
          (response) => {
            enqueueSnackbar(
              response?.data
                ?.message ||
                "Notification sent.",
              {
                variant:
                  "success",
              }
            );

            setTitle("");
            setMessage("");
            setExpiresAt("");
            setTargetId("");
          },

        onError:
          (
            error
          ) => {
            enqueueSnackbar(
              error?.response
                ?.data
                ?.message ||
                "Unable to send notification.",
              {
                variant:
                  "error",
              }
            );
          },
      });

    const handleSubmit =
      (event) => {
        event.preventDefault();

        if (
          targetType !==
            "all" &&
          !targetId
        ) {
          enqueueSnackbar(
            "Please select a target.",
            {
              variant:
                "warning",
            }
          );

          return;
        }

        mutation.mutate(
          {
            targetType,
            targetId:
              targetType ===
              "all"
                ? null
                : targetId,

            type,

            title:
              title.trim(),

            message:
              message.trim(),

            expiresAt:
              expiresAt ||
              null,
          }
        );
      };

    return (
      <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-6">

        <h2 className="text-xl font-bold text-[#F3EEE3]">
          Send Notification
        </h2>

        <p className="text-xs text-[#7d8797] mt-1">
          Send read-only messages to users.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-5"
        >

          {/* TARGET */}

          <div>

            <label className="block text-xs text-[#8993A1] mb-2">
              TARGET
            </label>

            <select
              value={
                targetType
              }
              onChange={(
                event
              ) => {
                setTargetType(
                  event.target
                    .value
                );

                setTargetId(
                  ""
                );
              }}
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none"
            >
              <option value="all">
                All Users
              </option>

              <option value="restaurant">
                Entire Restaurant
              </option>

              <option value="user">
                Specific User
              </option>
            </select>

          </div>

          {/* TARGET SELECT */}

          {targetType ===
            "restaurant" && (
            <div>

              <label className="block text-xs text-[#8993A1] mb-2">
                RESTAURANT
              </label>

              <select
                value={
                  targetId
                }
                onChange={(
                  event
                ) =>
                  setTargetId(
                    event.target
                      .value
                  )
                }
                className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none"
                required
              >
                <option value="">
                  Select restaurant
                </option>

                {restaurants.map(
                  (
                    restaurant
                  ) => (
                    <option
                      key={
                        restaurant._id
                      }
                      value={
                        restaurant._id
                      }
                    >
                      {
                        restaurant.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>
          )}

          {targetType ===
            "user" && (
            <div>

              <label className="block text-xs text-[#8993A1] mb-2">
                USER
              </label>

              <select
                value={
                  targetId
                }
                onChange={(
                  event
                ) =>
                  setTargetId(
                    event.target
                      .value
                  )
                }
                className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none"
                required
              >
                <option value="">
                  Select user
                </option>

                {users
                  .filter(
                    (
                      user
                    ) =>
                      user.role !==
                      "SuperAdmin"
                  )
                  .map(
                    (
                      user
                    ) => (
                      <option
                        key={
                          user._id
                        }
                        value={
                          user._id
                        }
                      >
                        {user.name} —{" "}
                        {user.email}
                      </option>
                    )
                  )}

              </select>

            </div>
          )}

          {/* TYPE */}

          <div>

            <label className="block text-xs text-[#8993A1] mb-2">
              TYPE
            </label>

            <select
              value={type}
              onChange={(
                event
              ) =>
                setType(
                  event.target
                    .value
                )
              }
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none"
            >

              <option value="announcement">
                Announcement
              </option>

              <option value="subscription">
                Subscription
              </option>

              <option value="warning">
                Warning
              </option>

              <option value="system">
                System
              </option>

            </select>

          </div>

          {/* TITLE */}

          <div>

            <label className="block text-xs text-[#8993A1] mb-2">
              TITLE
            </label>

            <input
              value={title}
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
              }
              placeholder="Example: New feature available"
              maxLength={120}
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none"
              required
            />

          </div>

          {/* MESSAGE */}

          <div>

            <label className="block text-xs text-[#8993A1] mb-2">
              MESSAGE
            </label>

            <textarea
              value={message}
              onChange={(
                event
              ) =>
                setMessage(
                  event.target
                    .value
                )
              }
              placeholder="Write your message..."
              rows={5}
              maxLength={1000}
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none resize-none"
              required
            />

          </div>

          {/* EXPIRY */}

          <div>

            <label className="block text-xs text-[#8993A1] mb-2">
              MESSAGE EXPIRY
            </label>

            <input
              type="datetime-local"
              value={
                expiresAt
              }
              onChange={(
                event
              ) =>
                setExpiresAt(
                  event.target
                    .value
                )
              }
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 outline-none"
            />

          </div>

          <button
            type="submit"
            disabled={
              mutation.isPending
            }
            className="w-full bg-[#BD5D31] hover:bg-[#a34f27] disabled:opacity-50 rounded-lg py-3.5 font-bold"
          >
            {mutation.isPending
              ? "Sending..."
              : "Send Notification"}
          </button>

        </form>

      </div>
    );
  };

export default NotificationComposer;