'use client';

import React, { useState } from 'react';
import { Layout, Grid, Drawer } from 'antd';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const screens = useBreakpoint();

  const isMobile = !screens.lg;

  const toggleCollapse = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          collapsedWidth={80}
          theme="dark"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflow: 'auto'
          }}
          trigger={null}
        >
          <Sidebar collapsed={collapsed} onMenuClick={() => {}} />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={closeMobileDrawer}
          open={mobileDrawerOpen}
          width={280}
          styles={{
            body: { padding: 0, background: 'hsl(210 30% 12%)' },
            header: { display: 'none' }
          }}
        >
          <Sidebar collapsed={false} onMenuClick={closeMobileDrawer} />
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 260,
          transition: 'margin-left 0.2s ease'
        }}
      >
        <AppHeader
          collapsed={collapsed}
          onToggle={toggleCollapse}
          isMobile={isMobile}
        />
        <Content
          style={{
            margin: isMobile ? '16px 12px' : '24px',
            minHeight: 'calc(100vh - 88px)',
          }}
        >
          <div className="animate-fade-in">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
