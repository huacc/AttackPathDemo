import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { NetworkNode, CriticalityLevel, DataClassification } from '../../../types/ontology';

interface NodeEditModalProps {
  visible: boolean;
  node: NetworkNode | null;
  onClose: () => void;
  onSave: (nodeId: string, updates: Partial<NetworkNode>) => void;
}

/**
 * 节点编辑对话框
 * 支持编辑[编辑]标记的属性
 */
export const NodeEditModal: React.FC<NodeEditModalProps> = ({
  visible,
  node,
  onClose,
  onSave
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (node && visible) {
      form.setFieldsValue({
        name: node.name,
        zone: node.zone,
        ipv4Address: node.ipv4Address,
        hostname: node.hostname,
        vlanId: node.vlanId,
        criticalityLevel: node.criticalityLevel,
        dataClassification: node.dataClassification
      });
    }
  }, [node, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (node) {
        onSave(node.nodeId, values);
        message.success('节点信息已更新');
        form.resetFields(); // 重置表单，避免下次编辑时显示旧数据
        onClose();
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  if (!node) return null;

  return (
    <Modal
      title={`编辑节点 - ${node.name}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: node.name,
          zone: node.zone,
          ipv4Address: node.ipv4Address,
          hostname: node.hostname,
          vlanId: node.vlanId,
          criticalityLevel: node.criticalityLevel,
          dataClassification: node.dataClassification
        }}
      >
        <Form.Item
          label="节点名称"
          name="name"
          rules={[{ required: true, message: '请输入节点名称' }]}
        >
          <Input placeholder="例如: web-server-01" />
        </Form.Item>

        <Form.Item
          label="安全域"
          name="zone"
          rules={[{ required: true, message: '请选择安全域' }]}
        >
          <Select>
            <Select.Option value="external">外网 (External)</Select.Option>
            <Select.Option value="dmz">DMZ</Select.Option>
            <Select.Option value="intranet">内网 (Intranet)</Select.Option>
            <Select.Option value="cloud">云端 (Cloud)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="IPv4地址"
          name="ipv4Address"
          rules={[
            { required: true, message: '请输入IPv4地址' },
            { pattern: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, message: '请输入有效的IPv4地址' }
          ]}
        >
          <Input placeholder="例如: 192.168.1.10/24" />
        </Form.Item>

        <Form.Item
          label="主机名"
          name="hostname"
          rules={[{ required: true, message: '请输入主机名' }]}
        >
          <Input placeholder="例如: web01.corp.local" />
        </Form.Item>

        <Form.Item
          label="VLAN ID"
          name="vlanId"
        >
          <InputNumber
            min={1}
            max={4094}
            placeholder="1-4094"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="重要性等级"
          name="criticalityLevel"
          rules={[{ required: true, message: '请选择重要性等级' }]}
        >
          <Select>
            <Select.Option value="critical">关键 (Critical)</Select.Option>
            <Select.Option value="high">高 (High)</Select.Option>
            <Select.Option value="medium">中 (Medium)</Select.Option>
            <Select.Option value="low">低 (Low)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="数据敏感级别"
          name="dataClassification"
        >
          <Select allowClear placeholder="请选择数据敏感级别">
            <Select.Option value="top_secret">绝密 (Top Secret)</Select.Option>
            <Select.Option value="secret">机密 (Secret)</Select.Option>
            <Select.Option value="confidential">秘密 (Confidential)</Select.Option>
            <Select.Option value="public">公开 (Public)</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NodeEditModal;
