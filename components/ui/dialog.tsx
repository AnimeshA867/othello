"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div
      className={cn(
        "relative bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-6 shadow-2xl max-w-md w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-lg font-semibold text-white mb-2">{children}</h2>;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-sm text-slate-300">{children}</p>;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="flex justify-end gap-3 mt-6">{children}</div>;
}

export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-4 right-4 h-8 w-8 p-0 text-slate-400 hover:text-white"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
