import DefaultPageLayout, { DefaultPageLayoutProps } from './DefaultPageLayout';

import Container from '@mui/joy/Container';
import React from 'react';

export interface ContainerPageLayoutProps extends DefaultPageLayoutProps {}

export default function ContainerPageLayout({
  children,
  userinfo,
}: DefaultPageLayoutProps) {
  return (
    <DefaultPageLayout userinfo={userinfo}>
      <Container maxWidth="md">{children}</Container>
    </DefaultPageLayout>
  );
}
