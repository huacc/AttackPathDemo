
import React, { useState } from 'react';
import { Typography, Divider, Tag, Button, Tooltip, Space } from 'antd';
import { 
  NodeIndexOutlined, 
  CaretRightOutlined, 
  CaretDownOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReportStore } from '../stores/reportStore';
import { AnalysisResult } from '../types/index';

const { Title, Paragraph, Text } = Typography;

interface ReportContentProps {
  report: AnalysisResult;
}

/**
 * 辅助函数：将 React 节点内容转化为纯文本以便进行关键词匹配
 */
const flattenChildren = (children: any): string => {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(flattenChildren).join('');
  if (children.props && children.props.children) return flattenChildren(children.props.children);
  return '';
};

/**
 * 报告正文渲染组件 [REQ-3.4]
 * 核心功能：Markdown 渲染、结论交互、证据 ID 溯源、章节折叠
 */
export const ReportContent: React.FC<ReportContentProps> = ({ report }) => {
  const { setSelectedChain, setSelectedEvidence } = useReportStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  /**
   * 切换章节折叠状态
   */
  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /**
   * 自定义 Markdown 渲染器：处理结论标签与置信度 [REQ-3.4.1]
   */
  const renderers = {
    // 拦截 H2 作为折叠章节入口
    h2: ({ children }: any) => {
      const id = flattenChildren(children);
      const isCollapsed = collapsedSections[id];
      return (
        <div style={{ marginTop: '32px' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: '2px solid #f0f0f0', 
              paddingBottom: '8px',
              cursor: 'pointer' 
            }} 
            onClick={() => toggleSection(id)}
          >
            {isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
            <Title level={3} style={{ margin: '0 0 0 8px', fontSize: '20px' }}>{children}</Title>
          </div>
          {!isCollapsed && <Divider style={{ margin: '0 0 16px 0', visibility: 'hidden' }} />}
        </div>
      );
    },
    // 处理文本中的证据 ID 引用 [REQ-3.4.2]
    text: ({ value }: { value: string }) => {
      const evidRegex = /(EVID_\d+)/g;
      const parts = value.split(evidRegex);
      
      return (
        <>
          {parts.map((part, i) => {
            if (part.match(evidRegex)) {
              return (
                <Tooltip key={i} title="点击查看证据详情">
                  <Tag 
                    color="blue" 
                    icon={<FileSearchOutlined />}
                    style={{ cursor: 'pointer', margin: '0 2px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvidence(part);
                    }}
                  >
                    {part}
                  </Tag>
                </Tooltip>
              );
            }
            return part;
          })}
        </>
      );
    },
    // 渲染表格 (斑马纹) [REQ-3.4.1]
    table: ({ children }: any) => (
      <div style={{ overflowX: 'auto', margin: '16px 0' }}>
        <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          {children}
        </table>
      </div>
    ),
    // 拦截结论列表项，注入[查看证据链]按钮
    li: ({ children }: any) => {
      const text = flattenChildren(children);
      // 匹配核心发现：查找结论中是否包含 reasoningChains 中的关键词（如“可信度评估”）
      const matchingChain = report.reasoningChains.find(c => {
        const keyword = c.conclusion.split('：')[0];
        return text.includes(keyword);
      });

      return (
        <li style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span>{children}</span>
            {matchingChain && (
              <Button 
                type="link" 
                size="small" 
                icon={<NodeIndexOutlined />}
                onClick={() => setSelectedChain(matchingChain.chainId)}
                style={{ padding: 0, fontSize: '12px', height: 'auto' }}
              >
                [查看证据链]
              </Button>
            )}
          </div>
        </li>
      );
    }
  };

  return (
    <div className="report-content-body" style={{ color: '#262626' }}>
      <style>{`
        .report-content-body h1 { font-size: 28px; margin-bottom: 24px; border-left: 6px solid #1890ff; padding-left: 16px; }
        .report-content-body p { line-height: 1.8; margin-bottom: 16px; font-size: 15px; }
        .report-table th { background: #fafafa; padding: 12px; border: 1px solid #f0f0f0; text-align: left; font-weight: 600; }
        .report-table td { padding: 12px; border: 1px solid #f0f0f0; }
        .report-table tr:nth-child(even) { background: #fafafa; }
        .report-content-body blockquote { border-left: 4px solid #d9d9d9; padding-left: 16px; color: #8c8c8c; margin: 16px 0; font-style: italic; }
        .report-content-body ul { padding-left: 20px; }
      `}</style>

      <div className="report-markdown-container">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={renderers as any}
        >
          {report.reportMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

/**
 * 示例用法:
 * <ReportContent report={currentReportData} />
 */
