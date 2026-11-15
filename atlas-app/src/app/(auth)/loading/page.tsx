'use client';

import React from 'react';
import { AtlasPixelLoader } from '@/components/loading/atlas-pixel-loader';

export default function LoadingPage() {
  return <AtlasPixelLoader destination="/globe" />;
}
