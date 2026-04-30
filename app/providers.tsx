'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '../context/AuthContext';
import { EstimateProvider } from '../context/EstimateContext';
import { MasterDataProvider } from '../context/MasterDataContext';
import { TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/toaster';
import { Toaster as Sonner } from '../components/ui/sonner';
import { useState } from 'react';

const antTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Select: {
      optionSelectedBg: 'hsl(210 100% 95%)',
      optionActiveBg: 'hsl(210 20% 96%)',
      zIndexPopup: 1050,
    },
    Dropdown: {
      zIndexPopup: 1050,
    },
    DatePicker: {
      zIndexPopup: 1050,
    }
  }
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antTheme}>
        <AuthProvider>
          <MasterDataProvider>
            <EstimateProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
              </TooltipProvider>
            </EstimateProvider>
          </MasterDataProvider>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
