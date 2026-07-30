"use client";

import React, { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export const Input = forwardRef(({
  label,
  error,
  success,
  icon: Icon,
  rightElement,
  type = "text",
  className,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type based on password toggle
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  // Determine if label should float
  const isFloating = isFocused || Boolean(value) || Boolean(defaultValue);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={clsx("relative flex flex-col gap-1.5", wrapperClassName)}>
      {/* Floating Label Wrapper */}
      <div
        className={clsx(
          "relative flex items-center transition-all duration-200",
          "rounded-[14px] border-[1.5px]",
          error ? "border-danger bg-danger/10" : success ? "border-success bg-background" : isFocused ? "border-primary bg-card shadow-[0_0_0_3px_rgba(253, 230, 138,0.12)]" : "border-border bg-card"
        )}
        style={{ minHeight: "56px" }}
      >
        {Icon && (
          <div className="pl-4 pr-2 text-foreground-muted shrink-0">
            <Icon size={18} className={clsx(isFocused && !error && "text-primary")} />
          </div>
        )}

        <div className="relative flex-1 px-4 flex flex-col justify-center">
          {label && (
            <motion.label
              initial={false}
              animate={{
                y: isFloating ? -12 : 0,
                scale: isFloating ? 0.85 : 1,
                color: error ? "var(--color-danger)" : isFocused ? "var(--color-primary)" : "var(--color-foreground-muted)"
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-4 origin-left pointer-events-none font-medium"
            >
              {label}
            </motion.label>
          )}

          <input
            ref={ref}
            type={actualType}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFloating || !label ? placeholder : ""}
            className={clsx(
              "w-full bg-transparent focus:outline-none text-foreground text-[15px] font-medium placeholder:text-foreground-muted",
              label && "pt-4", // Make room for floating label
              className
            )}
            {...props}
          />
        </div>

        {/* Right Adornments */}
        <div className="pr-4 pl-2 shrink-0 flex items-center gap-2">
          {rightElement}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-foreground-muted hover:text-foreground transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {error && <AlertCircle size={18} className="text-danger" />}
          {success && !error && <CheckCircle2 size={18} className="text-success" />}
        </div>
      </div>

      {/* Error Message */}
      {typeof error === 'string' && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-red-500 ml-1"
        >
          {error}
        </motion.span>
      )}
    </div>
  );
});

Input.displayName = "Input";
