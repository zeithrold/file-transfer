import React from 'react'
import BetaHeaderBar from '../components/BetaHeaderBar'
import CloudCommonHeader from '../components/CloudHeaderBar'

export default function Layout({ children }: { children: any }) {
  return (
    <div>
      <CloudCommonHeader />
      <BetaHeaderBar />
      {children}
    </div>
  )
}
