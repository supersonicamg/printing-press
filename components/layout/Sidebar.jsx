'use client';

import React from 'react';
import { Menu, Typography, Divider } from 'antd';
import {
  DashboardOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
  PrinterOutlined,
  BgColorsOutlined,
  ScissorOutlined,
  FileOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

const Sidebar = ({ collapsed, onMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const handleMenuClick = ({ key }) => {
    router.push(key);
    onMenuClick?.();
  };

  // Define menu items based on permissions
  const getMenuItems = () => {
    const items = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: 'estimates-group',
        icon: <FileTextOutlined />,
        label: 'Estimates',
        children: [
          hasPermission('canCreateEstimate') && {
            key: '/estimates/create',
            icon: <FileAddOutlined />,
            label: 'Create Estimate',
          },
          {
            key: '/estimates',
            icon: <FileSearchOutlined />,
            label: 'Estimate List',
          },
        ].filter(Boolean),
      },
    ];

    // Masters - Admin only
    if (hasPermission('canAccessMasters')) {
      items.push({
        key: 'masters-group',
        icon: <SettingOutlined />,
        label: 'Masters',
        children: [
          {
            key: '/masters/paper',
            icon: <FileOutlined />,
            label: 'Paper Master',
          },
          {
            key: '/masters/machine',
            icon: <PrinterOutlined />,
            label: 'Machine Master',
          },
          {
            key: '/masters/ink',
            icon: <BgColorsOutlined />,
            label: 'Ink Master',
          },
          {
            key: '/masters/process',
            icon: <ScissorOutlined />,
            label: 'Process Master',
          },
        ],
      });
    }

    // Quotations - Admin and Sales
    if (hasPermission('canGenerateQuote')) {
      items.push({
        key: '/quotations',
        icon: <FileTextOutlined />,
        label: 'Quotations',
      });
    }

    // Reports - Admin only
    if (hasPermission('canViewReports')) {
      items.push({
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Reports',
      });
    }

    // Settings - Admin only
    if (hasPermission('canAccessSettings')) {
      items.push({
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Settings',
      });
    }

    return items;
  };

  // Get currently selected keys based on path
  const getSelectedKeys = () => {
    if (pathname.startsWith('/estimates/create')) return ['/estimates/create'];
    if (pathname.startsWith('/estimates')) return ['/estimates'];
    if (pathname.startsWith('/masters/paper')) return ['/masters/paper'];
    if (pathname.startsWith('/masters/machine')) return ['/masters/machine'];
    if (pathname.startsWith('/masters/ink')) return ['/masters/ink'];
    if (pathname.startsWith('/masters/process')) return ['/masters/process'];
    if (pathname.startsWith('/quotation')) return ['/quotations'];
    return [pathname];
  };

  // Get open keys for submenus
  const getOpenKeys = () => {
    const keys = [];
    if (pathname.startsWith('/estimates')) keys.push('estimates-group');
    if (pathname.startsWith('/masters')) keys.push('masters-group');
    return keys;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 16px' : '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <PrinterOutlined style={{ fontSize: 22, color: '#fff' }} />
        </div>
        {!collapsed && (
          <div>
            <Title
              level={5}
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.2
              }}
            >
              PrintMaster
            </Title>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              Estimator Pro
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={collapsed ? [] : getOpenKeys()}
        items={getMenuItems()}
        onClick={handleMenuClick}
        style={{
          flex: 1,
          borderRight: 0,
          padding: '12px 8px'
        }}
      />

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
            v2.0.0 • © 2024 PrintMaster
          </span>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
