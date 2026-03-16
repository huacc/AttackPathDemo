
import React, { useState } from 'react';
import { Button, Typography, Space, Divider, Spin, Tabs, message } from 'antd';
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  FileTextOutlined,
  NodeIndexOutlined,
  SearchOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useReportStore, ReportTabKey } from '../stores/reportStore';
import { ReportContent } from './ReportContent';
import { EvidenceIndexTab } from './EvidenceIndexTab';
import { ReasoningChainTab } from './ReasoningChainTab';
import { EvidenceModal } from './EvidenceModal';

const { Title } = Typography;

/**
 * 报告全屏侧滑面板组件 [REQ-3.1 / REQ-3.3]
 * 核心功能：实现报告全屏展示、双栏布局（60/40）及平滑侧滑动画
 */
export const ReportPanel: React.FC = () => {
  const { visible, currentReport, activeTab, closeReport, setActiveTab } = useReportStore();
  const [exporting, setExporting] = useState<string | null>(null);

  /**
   * 模拟导出功能 [Gate G4 - 导出功能正常]
   */
  const handleExport = (type: 'PDF' | 'JSON') => {
    setExporting(type);
    message.loading({ content: `正在生成 ${type} 报告...`, key: 'exporting' });
    
    // 模拟导出延迟
    setTimeout(() => {
      setExporting(null);
      message.success({ 
        content: `${type} 报告导出成功！`, 
        key: 'exporting', 
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> 
      });
    }, 1500);
  };

  // 侧滑样式逻辑
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    zIndex: 2000,
    transition: 'transform 300ms ease-out',
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
  };

  const items = [
    {
      key: 'evidence' as ReportTabKey,
      label: (
        <span>
          <SearchOutlined />
          证据索引
        </span>
      ),
      children: <EvidenceIndexTab />,
    },
    {
      key: 'reasoning' as ReportTabKey,
      label: (
        <span>
          <NodeIndexOutlined />
          推理链条
        </span>
      ),
      children: <ReasoningChainTab />,
    },
  ];

  return (
    <div style={panelStyle}>
      {/* 1. 顶部操作栏 */}
      <div style={{ 
        height: '64px', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff'
      }}>
        <Space size={16}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={closeReport}
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            返回对话
          </Button>
          <Divider type="vertical" />
          <Title level={5} style={{ margin: 0 }}>
            {currentReport ? `${currentReport.person.name} 的心理分析报告` : '分析报告'}
          </Title>
        </Space>

        <Space>
          <Button 
            icon={<FilePdfOutlined />} 
            loading={exporting === 'PDF'}
            onClick={() => handleExport('PDF')}
          >
            导出 PDF
          </Button>
          <Button 
            icon={<FileTextOutlined />} 
            loading={exporting === 'JSON'}
            onClick={() => handleExport('JSON')}
          >
            导出 JSON
          </Button>
        </Space>
      </div>

      {/* 2. 报告主体区域 - 60/40 布局 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* 2.1 报告正文区域 (60%) */}
        <div style={{ 
          width: '60%', 
          height: '100%', 
          overflowY: 'auto', 
          padding: '40px 80px',
          borderRight: '1px solid #f0f0f0',
          scrollBehavior: 'smooth'
        }}>
          {currentReport ? (
            <ReportContent report={currentReport} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin tip="载入分析报告中..." />
            </div>
          )}
        </div>

        {/* 2.2 证据追溯面板 (40%) [REQ-3.5] */}
        <div style={{ 
          width: '40%', 
          height: '100%', 
          backgroundColor: '#fcfcfc', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ flex: 1, padding: '12px 24px', overflow: 'hidden' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={val => setActiveTab(val as ReportTabKey)} 
              items={items} 
              style={{ height: '100%' }}
              className="report-side-tabs"
            />
          </div>
        </div>
      </div>

      {/* 3. 证据详情弹窗 */}
      <EvidenceModal />

      <style>{`
        .report-side-tabs .ant-tabs-content { height: 100%; }
        .report-side-tabs .ant-tabs-tabpane { height: 100%; padding-bottom: 40px; }
      `}</style>
    </div>
  );
};
