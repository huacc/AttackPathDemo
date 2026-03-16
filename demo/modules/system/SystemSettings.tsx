/**
 * P8.4 系统设置
 * 用户管理、日志查看、系统配置
 */

import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Tag,
  Select,
  InputNumber,
  message,
  Modal,
  Descriptions,
  List,
  Badge
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// ==================== 类型定义 ====================

interface User {
  userId: string;
  username: string;
  role: 'admin' | 'operator' | 'viewer';
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface LogEntry {
  logId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  module: string;
  message: string;
  operator: string;
}

interface SystemConfig {
  simulationTimeout: number;
  maxPaths: number;
  autoSave: boolean;
  enableNotifications: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  defaultAlgorithm: string;
  theme: 'light' | 'dark';
}

// ==================== Mock数据 ====================

const MOCK_USERS: User[] = [
  {
    userId: 'user-001',
    username: '张三',
    role: 'admin',
    email: 'zhangsan@example.com',
    status: 'active',
    lastLogin: '2024-03-15 10:30:00'
  },
  {
    userId: 'user-002',
    username: '李四',
    role: 'operator',
    email: 'lisi@example.com',
    status: 'active',
    lastLogin: '2024-03-15 09:15:00'
  },
  {
    userId: 'user-003',
    username: '王五',
    role: 'operator',
    email: 'wangwu@example.com',
    status: 'active',
    lastLogin: '2024-03-14 16:20:00'
  },
  {
    userId: 'user-004',
    username: '赵六',
    role: 'viewer',
    email: 'zhaoliu@example.com',
    status: 'inactive',
    lastLogin: '2024-03-10 14:00:00'
  }
];

const MOCK_LOGS: LogEntry[] = [
  {
    logId: 'log-001',
    timestamp: '2024-03-15 10:35:23',
    level: 'info',
    module: '推演引擎',
    message: '推演任务 sim-2024-001 执行成功',
    operator: '张三'
  },
  {
    logId: 'log-002',
    timestamp: '2024-03-15 10:30:15',
    level: 'info',
    module: '推演引擎',
    message: '启动推演任务 sim-2024-001',
    operator: '张三'
  },
  {
    logId: 'log-003',
    timestamp: '2024-03-15 09:45:30',
    level: 'warning',
    module: '系统配置',
    message: '系统配置已更新，部分设置需要重启生效',
    operator: '李四'
  },
  {
    logId: 'log-004',
    timestamp: '2024-03-15 09:20:10',
    level: 'error',
    module: '数据导入',
    message: '场景数据导入失败：文件格式错误',
    operator: '王五'
  },
  {
    logId: 'log-005',
    timestamp: '2024-03-15 09:15:00',
    level: 'info',
    module: '用户管理',
    message: '用户 李四 登录系统',
    operator: '系统'
  },
  {
    logId: 'log-006',
    timestamp: '2024-03-14 16:30:45',
    level: 'info',
    module: '报告生成',
    message: '生成推演报告 report-2024-003',
    operator: '王五'
  },
  {
    logId: 'log-007',
    timestamp: '2024-03-14 16:12:30',
    level: 'info',
    module: '推演引擎',
    message: '推演任务 sim-2024-003 执行成功',
    operator: '王五'
  },
  {
    logId: 'log-008',
    timestamp: '2024-03-14 15:50:20',
    level: 'warning',
    module: '算法引擎',
    message: '遗传算法执行时间超过预期',
    operator: '系统'
  }
];

const DEFAULT_CONFIG: SystemConfig = {
  simulationTimeout: 300,
  maxPaths: 10,
  autoSave: true,
  enableNotifications: true,
  logLevel: 'info',
  defaultAlgorithm: 'dijkstra',
  theme: 'light'
};

// ==================== 主组件 ====================

const SystemSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [form] = Form.useForm();
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 用户管理列定义
  const userColumns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const roleConfig = {
          admin: { color: 'red', text: '管理员' },
          operator: { color: 'blue', text: '操作员' },
          viewer: { color: 'default', text: '查看者' }
        };
        const config = roleConfig[role as keyof typeof roleConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.userId)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 日志列定义
  const logColumns: ColumnsType<LogEntry> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => {
        const levelConfig = {
          info: { color: 'blue', text: 'INFO' },
          warning: { color: 'orange', text: 'WARNING' },
          error: { color: 'red', text: 'ERROR' }
        };
        const config = levelConfig[level as keyof typeof levelConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    }
  ];

  // 编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: () => {
        setUsers(users.filter(u => u.userId !== userId));
        message.success('用户已删除');
      }
    });
  };

  // 添加用户
  const handleAddUser = () => {
    setEditingUser(null);
    setUserModalVisible(true);
  };

  // 保存用户
  const handleSaveUser = (values: any) => {
    if (editingUser) {
      setUsers(users.map(u => u.userId === editingUser.userId ? { ...u, ...values } : u));
      message.success('用户信息已更新');
    } else {
      const newUser: User = {
        userId: `user-${Date.now()}`,
        ...values,
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
      message.success('用户已添加');
    }
    setUserModalVisible(false);
  };

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      setConfig(values);
      message.success('系统配置已保存');
    } catch (error) {
      message.error('请检查配置项');
    }
  };

  // 重置配置
  const handleResetConfig = () => {
    form.setFieldsValue(DEFAULT_CONFIG);
    setConfig(DEFAULT_CONFIG);
    message.info('已重置为默认配置');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>系统设置</span>
          </Space>
        }
      >
        <Tabs defaultActiveKey="users">
          {/* 用户管理 */}
          <TabPane
            tab={
              <Space>
                <UserOutlined />
                <span>用户管理</span>
                <Badge count={users.length} showZero />
              </Space>
            }
            key="users"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddUser}
              style={{ marginBottom: 16 }}
            >
              添加用户
            </Button>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="userId"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* 日志查看 */}
          <TabPane
            tab={
              <Space>
                <FileTextOutlined />
                <span>系统日志</span>
                <Badge count={logs.length} showZero />
              </Space>
            }
            key="logs"
          >
            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="logId"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* 系统配置 */}
          <TabPane
            tab={
              <Space>
                <SettingOutlined />
                <span>系统配置</span>
              </Space>
            }
            key="config"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={config}
              style={{ maxWidth: 600 }}
            >
              <Card title="推演配置" size="small" style={{ marginBottom: 16 }}>
                <Form.Item
                  label="推演超时时间"
                  name="simulationTimeout"
                  tooltip="推演任务的最大执行时间（秒）"
                >
                  <InputNumber
                    min={60}
                    max={3600}
                    style={{ width: '100%' }}
                    addonAfter="秒"
                  />
                </Form.Item>

                <Form.Item
                  label="最大路径数"
                  name="maxPaths"
                  tooltip="推演生成的最大攻击路径数量"
                >
                  <InputNumber
                    min={1}
                    max={50}
                    style={{ width: '100%' }}
                    addonAfter="条"
                  />
                </Form.Item>

                <Form.Item
                  label="默认算法"
                  name="defaultAlgorithm"
                  tooltip="推演时默认使用的算法"
                >
                  <Select>
                    <Option value="dijkstra">Dijkstra</Option>
                    <Option value="a_star">A*</Option>
                    <Option value="genetic">遗传算法</Option>
                    <Option value="monte_carlo">蒙特卡洛</Option>
                  </Select>
                </Form.Item>
              </Card>

              <Card title="系统配置" size="small" style={{ marginBottom: 16 }}>
                <Form.Item
                  label="自动保存"
                  name="autoSave"
                  valuePropName="checked"
                  tooltip="自动保存推演配置和结果"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="启用通知"
                  name="enableNotifications"
                  valuePropName="checked"
                  tooltip="推演完成后显示通知"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="日志级别"
                  name="logLevel"
                  tooltip="系统日志的记录级别"
                >
                  <Select>
                    <Option value="debug">DEBUG</Option>
                    <Option value="info">INFO</Option>
                    <Option value="warning">WARNING</Option>
                    <Option value="error">ERROR</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="界面主题"
                  name="theme"
                  tooltip="系统界面主题"
                >
                  <Select>
                    <Option value="light">浅色</Option>
                    <Option value="dark">深色</Option>
                  </Select>
                </Form.Item>
              </Card>

              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveConfig}
                >
                  保存配置
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetConfig}
                >
                  重置为默认
                </Button>
              </Space>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editingUser || { status: 'active', role: 'viewer' }}
          onFinish={handleSaveUser}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="operator">操作员</Option>
              <Option value="viewer">查看者</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemSettings;
