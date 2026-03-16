
/**
 * 全局应用配置
 * 所有涉及到敏感信息或环境变动的内容应在此统一维护
 */
export const APP_CONFIG = {
  // 应用名称
  TITLE: '网络攻防仿真原型系统',
  // 核心版本
  VERSION: 'v2.0.0',
  // 主色调 (Ant Design 默认主色)
  PRIMARY_COLOR: '#1890ff',
  // 模拟网络延迟 (ms)
  MOCK_DELAY: 500,
  // 是否启用 Mock 数据
  ENABLE_MOCK: true,
  // 附件上传限制 (MB)
  UPLOAD_LIMIT_MB: 50,
  // 附件数量限制
  MAX_FILE_COUNT: 10
};

/**
 * 示例用法:
 * import { APP_CONFIG } from './config';
 * console.log(APP_CONFIG.TITLE);
 */
