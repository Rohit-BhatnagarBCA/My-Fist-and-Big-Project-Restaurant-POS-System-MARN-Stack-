import React, {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  enqueueSnackbar,
} from "notistack";

import {
  FiPercent,
  FiSave,
} from "react-icons/fi";

import {
  getMyTax,
  updateMyTax,
} from "../../https";

const TaxSettings =
  () => {
    const queryClient =
      useQueryClient();

    const [
      taxRate,
      setTaxRate,
    ] = useState(
      "0"
    );

    const {
      data:
        response,
      isLoading,
    } = useQuery({
      queryKey: [
        "my-tax",
      ],
      queryFn:
        getMyTax,
    });

    useEffect(() => {
      const rate =
        response?.data
          ?.data
          ?.taxRate;

      if (
        rate !==
        undefined
      ) {
        setTaxRate(
          String(rate)
        );
      }
    }, [
      response,
    ]);

    const mutation =
      useMutation({
        mutationFn:
          updateMyTax,

        onSuccess:
          (result) => {
            const saved =
              result?.data
                ?.data
                ?.taxRate ?? 0;

            setTaxRate(
              String(saved)
            );

            queryClient.invalidateQueries({
              queryKey: [
                "my-tax",
              ],
            });

            enqueueSnackbar(
              "Tax rate saved successfully.",
              {
                variant:
                  "success",
              }
            );
          },

        onError:
          (error) => {
            enqueueSnackbar(
              error?.response
                ?.data
                ?.message ||
                "Unable to save tax rate.",
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

        const value =
          Number(
            taxRate
          );

        if (
          !Number.isFinite(
            value
          ) ||
          value < 0 ||
          value > 100
        ) {
          enqueueSnackbar(
            "Tax must be between 0% and 100%.",
            {
              variant:
                "warning",
            }
          );

          return;
        }

        mutation.mutate(
          value
        );
      };

    return (
      <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-6">

        <div className="flex items-start gap-3">

          <div className="p-3 rounded-xl bg-[#BD5D31]/10 text-[#BD5D31]">
            <FiPercent
              size={20}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#F3EEE3]">
              Tax Settings
            </h2>

            <p className="text-xs text-[#8993A1] mt-1">
              Set the tax rate for your restaurant.
            </p>
          </div>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6"
        >

          <label className="block text-xs font-semibold text-[#8993A1] mb-2">
            TAX RATE (%)
          </label>

          <div className="flex gap-3">

            <div className="relative flex-1">

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  taxRate
                }
                disabled={
                  isLoading
                }
                onChange={(
                  event
                ) =>
                  setTaxRate(
                    event.target
                      .value
                  )
                }
                className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 pr-10 text-sm text-[#F3EEE3] outline-none focus:border-[#BD5D31]"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8993A1]">
                %
              </span>

            </div>

            <button
              type="submit"
              disabled={
                mutation.isPending ||
                isLoading
              }
              className="px-5 py-3 rounded-lg bg-[#BD5D31] hover:bg-[#a64e26] font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave />

              {mutation.isPending
                ? "Saving..."
                : "Save"}
            </button>

          </div>

        </form>

        <div className="mt-4 rounded-lg bg-[#242c38] px-4 py-3 text-xs text-[#8993A1]">
          Example: ₹1,000 bill with a 5% tax =
          ₹1,050 total.
        </div>

      </div>
    );
  };

export default TaxSettings;