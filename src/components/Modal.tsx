import { Dialog } from "@headlessui/react";
import React, { useRef } from "react";

export function Modal({
  open,
  onClose = () => {},
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  let overlayRef = useRef<HTMLDivElement | null>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      initialFocus={overlayRef}
      className="fixed inset-0 z-10 flex items-center justify-center"
    >
      <Dialog.Overlay
        ref={overlayRef}
        className="fixed inset-0 bg-gray-800/60"
      />
      <div className="relative flex w-1/2 items-center justify-center">
        {children}
      </div>
    </Dialog>
  );
}
