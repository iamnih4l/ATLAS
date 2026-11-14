'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full z-10 max-h-[90vh] flex flex-col bg-[#FFF4D9] border-2 border-[#171313] rounded-3xl shadow-pop-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150',
          maxWidths[maxWidth]
        )}
      >
        {/* Top Folder Tab inspired by Child Edu Mellow & Saved Folders */}
        <div className="absolute top-2 left-6 z-20 flex items-center gap-1.5 px-3.5 py-1 rounded-t-xl bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[11px] font-black text-[#171313] uppercase tracking-wider shadow-pop-sm">
          <span>📁</span>
          <span>ATLAS PASSPORT</span>
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 pt-9 border-b-2 border-[#171313] bg-white">
            <div>
              {title && (
                <h3 className="text-xl font-black text-[#171313] tracking-tight font-sans flex items-center gap-2">
                  <span>{title}</span>
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#171313]/70 mt-1 font-bold">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white bg-[#F04432] hover:bg-[#F04432]/90 border-2 border-[#171313] p-1.5 rounded-xl shadow-pop-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all focus:outline-none cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 text-[#171313] bg-warm-cream-grid">{children}</div>
      </div>
    </div>
  );
}
