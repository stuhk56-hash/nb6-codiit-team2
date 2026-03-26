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
        className={`fixed inset-0 z-40 ${isDimmed ? "bg-black/50" : "bg-black/10"}`}
        onClick={handleBackdropClick}
      ></div>

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-[600px] rounded-2xl bg-white shadow-xl">
          <div className="max-h-[90vh] overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
