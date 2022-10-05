import Layout from './Layout';
import NavigationBar from '@/components/NavigationBar';
import React from 'react';
import { UserinfoResponse } from 'openid-client';

export interface DefaultPageLayoutProps {
  userinfo?: UserinfoResponse;
  children: any;
}

export default function DefaultPageLayout({
  children,
  userinfo,
}: DefaultPageLayoutProps) {
  return (
    <Layout>
      <NavigationBar username={userinfo?.preferred_username} />
      {children}
    </Layout>
  );
}
