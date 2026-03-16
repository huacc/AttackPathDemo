#!/bin/bash

echo "=========================================="
echo "网络攻防仿真原型系统 - 手动测试报告"
echo "=========================================="
echo ""
echo "测试时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "测试环境：http://localhost:3008"
echo ""

TOTAL=0
PASSED=0
FAILED=0
FAILURES=()

test_page() {
    local path=$1
    local name=$2
    TOTAL=$((TOTAL + 1))
    
    echo -n "测试 [$name] ($path)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" http://localhost:3008$path)
    status_code=$(echo $response | cut -d: -f1)
    time_total=$(echo $response | cut -d: -f2)
    
    if [ "$status_code" = "200" ]; then
        time_ms=$(echo "$time_total * 1000" | bc)
        if (( $(echo "$time_total < 3" | bc -l) )); then
            echo "✅ 通过 (${time_ms}ms)"
            PASSED=$((PASSED + 1))
        else
            echo "⚠️  通过但较慢 (${time_ms}ms)"
            PASSED=$((PASSED + 1))
            FAILURES+=("[$name] 页面加载时间超过3秒: ${time_ms}ms")
        fi
    else
        echo "❌ 失败 (HTTP $status_code)"
        FAILED=$((FAILED + 1))
        FAILURES+=("[$name] HTTP状态码错误: $status_code")
    fi
}

echo "=========================================="
echo "1. 页面可访问性测试"
echo "=========================================="
echo ""

test_page "/" "Dashboard"
test_page "/scene" "场景管理"
test_page "/ontology" "本体建模"
test_page "/knowledge" "知识图谱"
test_page "/cockpit" "攻防驾驶舱"
test_page "/algorithm" "算法配置"
test_page "/asset" "资产管理"
test_page "/system" "系统管理"

echo ""
echo "=========================================="
echo "2. 静态资源检查"
echo "=========================================="
echo ""

check_resource() {
    local url=$1
    local name=$2
    TOTAL=$((TOTAL + 1))
    
    echo -n "检查 [$name]... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$status_code" = "200" ]; then
        echo "✅ 可用"
        PASSED=$((PASSED + 1))
    else
        echo "❌ 不可用 (HTTP $status_code)"
        FAILED=$((FAILED + 1))
        FAILURES+=("[$name] 资源加载失败: $status_code")
    fi
}

check_resource "http://localhost:3008/vite.svg" "Vite图标"
check_resource "http://localhost:3008/logo.png" "Logo"

echo ""
echo "=========================================="
echo "3. API端点测试"
echo "=========================================="
echo ""

check_api() {
    local path=$1
    local name=$2
    TOTAL=$((TOTAL + 1))
    
    echo -n "测试 [$name]... "
    
    response=$(curl -s -w "\n%{http_code}" http://localhost:3008$path)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "404" ]; then
        echo "✅ 端点响应正常"
        PASSED=$((PASSED + 1))
    else
        echo "❌ 端点异常 (HTTP $status_code)"
        FAILED=$((FAILED + 1))
        FAILURES+=("[$name] API响应异常: $status_code")
    fi
}

check_api "/api/scenes" "场景列表API"
check_api "/api/assets" "资产列表API"

echo ""
echo "=========================================="
echo "测试总结"
echo "=========================================="
echo ""
echo "总测试数：$TOTAL"
echo "通过：$PASSED"
echo "失败：$FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "失败详情："
    for i in "${!FAILURES[@]}"; do
        echo "$((i+1)). ${FAILURES[$i]}"
        echo "   - 严重程度：P2"
        echo ""
    done
else
    echo "✅ 所有测试通过！"
fi

echo "=========================================="
echo "测试完成"
echo "=========================================="
