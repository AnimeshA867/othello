"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingDockProps {
  children: React.ReactNode;
  className?: string;
  direction?: "top" | "middle" | "bottom";
}

export const FloatingDock = React.forwardRef<HTMLDivElement, FloatingDockProps>(
  ({ children, className, direction = "middle" }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 flex h-16 gap-4 items-end rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 pb-3",
          {
            "top-4": direction === "top",
            "top-1/2 -translate-y-1/2": direction === "middle",
            "bottom-4": direction === "bottom",
          },
          className
        )}
      >
        {children}
      </div>
    );
  }
);

FloatingDock.displayName = "FloatingDock";

interface FloatingDockItemProps {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export const FloatingDockItem = ({
  title,
  icon,
  href,
  onClick,
}: FloatingDockItemProps) => {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex aspect-square cursor-pointer items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900 group"
      )}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
      >
        {icon}
      </motion.div>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
        {title}
      </div>
    </Component>
  );
};
