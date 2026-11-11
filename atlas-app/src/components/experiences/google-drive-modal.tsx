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
          <div className="p-3.5 bg-[#18181e] border border-[#27272a] rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#f5f5f0] flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" /> Google Drive OAuth Integration
              </span>
              <Badge variant="outline" size="sm">Configurable in .env</Badge>
            </div>
            <p className="text-[#a1a1aa] text-[11px] leading-relaxed">
              To connect your real Google Drive, add <code className="text-emerald-300 font-mono">GOOGLE_CLIENT_ID</code> and <code className="text-emerald-300 font-mono">GOOGLE_CLIENT_SECRET</code> to your <code className="font-mono text-white">.env.local</code>.
              For testing right now, you can connect to the authenticated simulation workspace below.
            </p>
            <div className="pt-1">
              <Button size="sm" variant="primary" onClick={handleConnect}>
                Authorize Test Drive Account
              </Button>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Connected to Google Account (Read-only Photos Scope)</span>
            </div>
            <button
              onClick={() => setIsConnected(false)}
              className="text-[#a1a1aa] hover:text-rose-400 text-[11px] underline"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Photo Browser Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block">
            Cloud Photos ({SAMPLE_DRIVE_PHOTOS.length} available)
          </label>

          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {SAMPLE_DRIVE_PHOTOS.map((file) => {
              const isSelected = selectedFile?.id === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 glow-emerald-subtle'
                      : 'border-[#27272a] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden bg-[#1c1c22]">
                    <img
                      src={file.thumbnailLink}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-[#121215]">
                    <p className="text-xs text-[#f5f5f0] font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#71717a]">{file.size}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c1c22]">
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
