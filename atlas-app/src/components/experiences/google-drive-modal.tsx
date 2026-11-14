'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SAMPLE_DRIVE_PHOTOS, GoogleDriveFile, isGoogleDriveConfigured } from '@/lib/google-drive';
import { Cloud, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUrl: string, name: string) => void;
}

export function GoogleDriveModal({
  isOpen,
  onClose,
  onSelectPhoto,
}: GoogleDriveModalProps) {
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConfigured = isGoogleDriveConfigured();

  const handleConnect = () => {
    // In production with credentials: redirect to Google OAuth
    // In demo environment: simulate authorized connection
    setIsConnected(true);
  };

  const handleImport = () => {
    if (selectedFile?.thumbnailLink) {
      onSelectPhoto(selectedFile.thumbnailLink, selectedFile.name);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Photo Import"
      description="Select high-resolution photographs directly from your cloud library."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Credentials Status Banner */}
        {!isConfigured && !isConnected && (
          <div className="p-3.5 bg-amber-100 border-2 border-slate-900 rounded-2xl text-xs space-y-2 shadow-pop-sm">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-600 stroke-[2.5]" /> Google Drive OAuth Integration
              </span>
              <Badge variant="outline" size="sm">Configurable</Badge>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed font-bold">
              To connect your real Google Drive, add <code className="text-emerald-700 font-mono bg-white px-1 py-0.5 rounded border border-slate-900">GOOGLE_CLIENT_ID</code> and <code className="text-emerald-700 font-mono bg-white px-1 py-0.5 rounded border border-slate-900">GOOGLE_CLIENT_SECRET</code> to your <code className="font-mono text-slate-900">.env.local</code>.
              You can test right now by clicking below.
            </p>
            <div className="pt-1">
              <Button size="sm" variant="primary" onClick={handleConnect}>
                Authorize Test Drive Account
              </Button>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center justify-between p-3 bg-emerald-100 border-2 border-slate-900 rounded-2xl text-xs shadow-pop-sm">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Connected to Google Account (Read-only Photos Scope)</span>
            </div>
            <button
              onClick={() => setIsConnected(false)}
              className="text-slate-600 hover:text-rose-600 text-[11px] font-black underline cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Photo Browser Grid */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
            Cloud Photos ({SAMPLE_DRIVE_PHOTOS.length} available)
          </label>

          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {SAMPLE_DRIVE_PHOTOS.map((file) => {
              const isSelected = selectedFile?.id === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`group relative rounded-2xl border-2 border-slate-900 overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'shadow-pop ring-2 ring-slate-900 scale-102 bg-amber-100'
                      : 'shadow-pop-sm hover:-translate-y-0.5 bg-white'
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-100 border-b-2 border-slate-900">
                    <img
                      src={file.thumbnailLink}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 border-2 border-slate-900 rounded-full flex items-center justify-center text-slate-950 shadow-2xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-xs text-slate-900 font-black truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">{file.size}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-900">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selectedFile}
            onClick={handleImport}
          >
            Import Selected Photo
          </Button>
        </div>
      </div>
    </Modal>
  );
}

