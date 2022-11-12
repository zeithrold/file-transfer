import BetaHeaderBar from '@/components/BetaHeaderBar';
import BirthdayHeaderBar from '@/components/BirthDayHeaderBar';
// import CloudCommonHeader from '@/components/CloudHeaderBar';
import React from 'react';

export default function Layout({ children }: { children: any }) {
  return (
    <div>
      {/* <CloudCommonHeader /> */}
      <BirthdayHeaderBar />
      <BetaHeaderBar />
      {children}
    </div>
  );
}
