'use client';

import React from 'react';
import { Layout, Button, Dropdown, Avatar, Tag, Space, Breadcrumb, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, ROLES } from '../../context/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ collapsed, onToggle, isMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, signOut } = useAuth();

  // Role colors
  const ROLE_COLORS = {
    [ROLES.ADMIN]: { bg: '#ff4d4f', text: 'Admin' },
    [ROLES.ESTIMATOR]: { bg: '#1890ff', text: 'Estimator' },
    [ROLES.SALES]: { bg: '#52c41a', text: 'Sales' },
    [ROLES.VIEWER]: { bg: '#8c8c8c', text: 'Viewer' }
  };

  // Generate breadcrumb items from path
  const getBreadcrumbItems = () => {
    const pathParts = pathname.split('/').filter(Boolean);
    const items = [
      { title: <Link href="/">Home</Link> }
    ];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === pathParts.length - 1;
      const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

      items.push({
        title: isLast ? title : <Link href={currentPath}>{title}</Link>
      });
    });

    return items;
  };

  const roleColor = ROLE_COLORS[currentUser?.role] ?? { bg: '#8c8c8c', text: 'User' };

  const handleMenuClick = async ({ key }) => {
    if (key === 'logout') {
      await signOut();
      router.push('/login');
    } else if (key === 'profile') {
      router.push('/profile');
    } else if (key === 'settings') {
      router.push('/settings');
    }
  };

  // Profile dropdown menu
  const profileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true
    }
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: isMobile ? '0 16px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        height: 64
      }}
    >
      {/* Left Section */}
      <Space size="middle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 18 }}
        />

        {!isMobile && (
          <Breadcrumb items={getBreadcrumbItems()} />
        )}
      </Space>

      {/* Right Section */}
      <Space size={isMobile ? 'small' : 'middle'}>
          {/* Notifications */}
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ position: 'relative' }}
        >
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              background: '#ff4d4f',
              borderRadius: '50%'
            }}
          />
        </Button>

        {/* User Profile */}
        <Dropdown
          menu={{ items: profileMenuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space
            style={{
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: 8,
              transition: 'background 0.2s'
            }}
            className="hover:bg-gray-100"
          >
            <Avatar
              style={{
                background: roleColor.bg,
                verticalAlign: 'middle'
              }}
              icon={<UserOutlined />}
            />
            {!isMobile && currentUser && (
              <div style={{ lineHeight: 1.3 }}>
                <Text strong style={{ display: 'block', fontSize: 13 }}>
                  {currentUser.name}
                </Text>
                <Tag
                  color={roleColor.bg}
                  style={{
                    fontSize: 10,
                    padding: '0 6px',
                    margin: 0,
                    lineHeight: '16px'
                  }}
                >
                  {roleColor.text}
                </Tag>
              </div>
            )}
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
