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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full z-10 max-h-[90vh] flex flex-col bg-[#121215] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150',
          maxWidths[maxWidth]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-[#1c1c22]">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-[#f5f5f0] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#a1a1aa] mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#71717a] hover:text-[#f5f5f0] hover:bg-[#1a1a20] p-1.5 rounded-lg transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
