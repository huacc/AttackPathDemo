import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';

    return {
      server: {
        port: 3008,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // 打包体积分析（仅在生产环境）
        isProduction && visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        })
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // 构建优化
      build: {
        // 代码分割
        rollupOptions: {
          output: {
            // 手动分包
            manualChunks: {
              // React核心
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // Ant Design
              'antd-vendor': ['antd', '@ant-design/icons'],
              // 图表库
              'chart-vendor': ['echarts', 'echarts-for-react', '@antv/g6'],
              // 工具库
              'utils-vendor': ['dayjs', 'lodash-es']
            },
            // 文件命名
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
          }
        },
        // 压缩配置
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: isProduction, // 生产环境移除console
            drop_debugger: isProduction
          }
        },
        // chunk大小警告阈值
        chunkSizeWarningLimit: 1000,
        // 启用CSS代码分割
        cssCodeSplit: true,
        // 生成sourcemap（开发环境）
        sourcemap: !isProduction
      },
      // 优化依赖预构建
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          'antd',
          '@ant-design/icons',
          'echarts',
          'echarts-for-react',
          '@antv/g6'
        ]
      }
    };
});
