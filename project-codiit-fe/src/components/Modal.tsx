import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
  isDimmed?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = false,
  isDimmed = true,
}: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* 배경 */}
      <div
        className={`fixed inset-0 z-[70] ${isDimmed ? "bg-black/50" : "bg-black/10"}`}
        onClick={handleBackdropClick}
      ></div>

      {/* 모달 */}
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto p-4 pt-6">
        <div className="relative w-full max-w-[600px] rounded-2xl bg-white shadow-xl">
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto overflow-x-hidden p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
