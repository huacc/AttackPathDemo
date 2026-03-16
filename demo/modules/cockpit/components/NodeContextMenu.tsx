import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import {
  InfoCircleOutlined,
  EditOutlined,
  BugOutlined,
  LinkOutlined
} from '@ant-design/icons';

interface NodeContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onViewDetails: () => void;
  onEdit: () => void;
  onViewVulnerabilities: () => void;
  onViewRelations: () => void;
  onClose: () => void;
}

/**
 * 节点右键菜单组件
 */
export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  visible,
  x,
  y,
  onViewDetails,
  onEdit,
  onViewVulnerabilities,
  onViewRelations,
  onClose
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (visible) {
      setPosition({ x, y });
    }
  }, [visible, x, y]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const menuItems = [
    {
      key: 'details',
      icon: <InfoCircleOutlined />,
      label: '查看详情',
      onClick: () => {
        onViewDetails();
        onClose();
      }
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑节点',
      onClick: () => {
        onEdit();
        onClose();
      }
    },
    {
      key: 'vulnerabilities',
      icon: <BugOutlined />,
      label: '查看漏洞',
      onClick: () => {
        onViewVulnerabilities();
        onClose();
      }
    },
    {
      key: 'relations',
      icon: <LinkOutlined />,
      label: '查看关联',
      onClick: () => {
        onViewRelations();
        onClose();
      }
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Menu
        items={menuItems}
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default NodeContextMenu;
