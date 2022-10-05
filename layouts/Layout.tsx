import BetaHeaderBar from '@/components/BetaHeaderBar';
import CloudCommonHeader from '@/components/CloudHeaderBar';
import React from 'react';

export default function Layout({ children }: { children: any }) {
  return (
    <div>
      <CloudCommonHeader />
      <BetaHeaderBar />
      {children}
    </div>
  );
}
