// src/layouts/MainLayout.tsx
import { ReactNode } from 'react';
import { Box, Container, VStack } from '@chakra-ui/react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {children}
        </VStack>
      </Container>
    </Box>
  );
};