import DefaultPageLayout, { DefaultPageLayoutProps } from './DefaultPageLayout';

import Container from '@mui/joy/Container';
import React from 'react';
import { SxProps } from '@mui/joy/styles/types';

export interface ContainerPageLayoutProps extends DefaultPageLayoutProps {
  sx?: SxProps;
}

export default function ContainerPageLayout({
  children,
  userinfo,
  sx,
}: ContainerPageLayoutProps) {
  return (
    <DefaultPageLayout userinfo={userinfo}>
      <Container maxWidth="md" sx={sx}>
        {children}
      </Container>
    </DefaultPageLayout>
  );
}
