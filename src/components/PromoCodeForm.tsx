/**
 * PromoCodeForm Component
 *
 * Handles promo code input, validation feedback, and display of applied codes.
 *
 * Design Decisions:
 * - Separated from Cart component for single responsibility
 * - Manages its own input state (controlled component)
 * - Shows validation feedback inline
 * - Displays applied code with option to remove
 */

import React, { useState, useCallback, useId } from "react";
import type { PromoCode } from "../types";

interface PromoCodeFormProps {
  readonly appliedPromoCode: PromoCode | null;
  readonly availablePromoCodes: readonly PromoCode[];
  readonly onApplyPromoCode: (code: string) => boolean;
  readonly onRemovePromoCode: () => void;
  readonly disabled?: boolean;
}
type ValidationState = "idle" | "error" | "success";

export const PromoCodeForm = ({
  appliedPromoCode,
  availablePromoCodes,
  onApplyPromoCode,
  onRemovePromoCode,
  disabled = false,
}: PromoCodeFormProps) => {
  const [inputValue, setInputValue] = useState("");
  const [validationState, setValidationState] =
    useState<ValidationState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Generate unique IDs for accessibility
  const errorId = useId();
  const hintId = useId();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value.toUpperCase());
      // Clear error when user starts typing
      if (validationState === "error") {
        setValidationState("idle");
        setErrorMessage("");
      }
    },
    [validationState]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedCode = inputValue.trim();

      if (!trimmedCode) {
        setValidationState("error");
        setErrorMessage("Please enter a promo code");
        return;
      }

      const success = onApplyPromoCode(trimmedCode);

      if (success) {
        setInputValue("");
        setValidationState("success");
        setErrorMessage("");
      } else {
        setValidationState("error");
        setErrorMessage("Invalid promo code. Please try again.");
      }
    },
    [inputValue, onApplyPromoCode]
  );

  const handleRemove = useCallback(() => {
    onRemovePromoCode();
    setValidationState("idle");
  }, [onRemovePromoCode]);

  // Show applied promo code
  if (appliedPromoCode) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Promo code applied!
            </p>
            <p className="text-green-700 mt-1">
              <span className="font-bold">{appliedPromoCode.code}</span>
              {" — "}
              <span>{appliedPromoCode.displayText}</span>
            </p>
          </div>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 
                       hover:bg-green-100 rounded-lg transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label="Remove promo code"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // Show promo code input form
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Have a promo code?
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder="Enter code"
            className={`
              flex-1 px-3 py-2 border rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${
                validationState === "error"
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
              }
            `}
            aria-label="Promo code"
            aria-describedby={validationState === "error" ? errorId : hintId}
            aria-invalid={validationState === "error"}
          />
          <button
            type="submit"
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>

        {/* Error message */}
        {validationState === "error" && errorMessage && (
          <p
            id={errorId}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}

        {/* Hint text */}
        <p id={hintId} className="text-xs text-gray-500">
          Try: {availablePromoCodes.map((pc) => pc.code).join(", ")}
        </p>
      </form>
    </div>
  );
};
