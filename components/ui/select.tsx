"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectChildProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  selectedValue?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }
>(({ className, children, value, onValueChange, disabled, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<SelectChildProps>,
            {
              isOpen,
              setIsOpen,
              selectedValue,
              onSelect: handleSelect,
              disabled,
            }
          );
        }
        return child;
      })}
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    disabled?: boolean;
  }
>(({ className, children, isOpen, setIsOpen, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}
    onClick={() => !disabled && setIsOpen?.(!isOpen)}
    disabled={disabled}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
    selectedValue?: string;
  }
>(({ className, placeholder, selectedValue, ...props }, ref) => (
  <span ref={ref} className={cn(className)} {...props}>
    {selectedValue || placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean;
  }
>(({ className, children, isOpen, ...props }, ref) => (
  <>
    {isOpen && (
      <div
        ref={ref}
        className={cn(
          "absolute top-full z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-950",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )}
  </>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onSelect?: (value: string) => void;
    selectedValue?: string;
  }
>(({ className, children, value, onSelect, selectedValue, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
      selectedValue === value && "bg-slate-100 dark:bg-slate-800",
      className
    )}
    onClick={() => onSelect?.(value)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {selectedValue === value && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
