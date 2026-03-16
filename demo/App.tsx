
import React, { useEffect, useState } from 'react';
import { AppRouter } from './router/index';
import { MockDataStorage } from './mock/storage';
import { TestRunner } from './components/TestRunner';

/**
 * App 根组件
 * P0-P1 阶段：完成基础路由、布局架设及数据初始化
 */
const App: React.FC = () => {
  const [showTestRunner, setShowTestRunner] = useState(false);
  
  // 初始化 Mock 数据到 LocalStorage
  useEffect(() => {
    MockDataStorage.init();
    console.log('心理分析系统 - Mock 数据层就绪');
    
    // 开发环境下，通过全局变量控制测试运行器的显示
    (window as any).toggleTests = () => setShowTestRunner(prev => !prev);
    console.log('提示：输入 toggleTests() 切换集成测试面板');
  }, []);

  return (
    <div className="app-container">
      {showTestRunner && (
        <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, width: 450 }}>
          <TestRunner />
        </div>
      )}
      <AppRouter />
    </div>
  );
};

export default App;
