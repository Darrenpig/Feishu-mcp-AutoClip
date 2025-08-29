#!/usr/bin/env bun
import { monetizationEngine } from './ranjok_monetization_engine.js';

console.log('💰 测试 RanJok 变现引擎...\n');

async function testMonetizationEngine() {
    try {
        // 测试平台信息
        console.log('🌐 获取支持平台信息...');
        const platforms = monetizationEngine.getPlatforms();
        console.log(`✅ 支持 ${platforms.length} 个平台:`);
        platforms.forEach(platform => {
            console.log(`  📱 ${platform.name} (${platform.type}): ${platform.revenueModels.join(', ')}`);
        });

        // 测试启动自动变现
        console.log('\n🚀 测试启动自动变现...');
        const monetizationConfig = {
            platforms: ['xiaohongshu', 'douyin', 'wechat_channels', 'bilibili'],
            contentStrategy: 'quality' as const,
            priceStrategy: 'value' as const,
            targetRevenue: 10000,
            autoPosting: true,
            autoResponseEnabled: true,
            analyticsEnabled: true
        };

        const result = await monetizationEngine.startAutoMonetization(monetizationConfig);
        console.log('✅ 变现策略启动成功！');
        console.log(`📅 分发计划: ${result.distributionPlan.length} 个发布任务`);
        console.log(`💰 预期收益: ¥${result.expectedRevenue.toLocaleString()} 元`);
        console.log(`💡 优化建议: ${result.optimizationSuggestions.length} 条`);

        // 显示分发计划概览
        console.log('\n📋 30天分发计划概览:');
        const platformStats = new Map();
        result.distributionPlan.forEach(item => {
            const count = platformStats.get(item.platformId) || 0;
            platformStats.set(item.platformId, count + 1);
        });
        
        platformStats.forEach((count, platform) => {
            const platformName = platforms.find(p => p.id === platform)?.name || platform;
            console.log(`  📱 ${platformName}: ${count} 个发布任务`);
        });

        // 显示优化建议
        console.log('\n💡 系统优化建议:');
        result.optimizationSuggestions.forEach((suggestion, i) => {
            console.log(`  ${i + 1}. ${suggestion}`);
        });

        // 模拟添加一些收益数据
        console.log('\n📊 模拟收益数据...');
        const revenueEntries = [
            { source: 'xiaohongshu', type: 'brand_collaboration' as const, amount: 500, currency: 'CNY', date: new Date() },
            { source: 'douyin', type: 'ad_revenue' as const, amount: 300, currency: 'CNY', date: new Date() },
            { source: 'bilibili', type: 'membership' as const, amount: 200, currency: 'CNY', date: new Date() },
            { source: 'wechat_channels', type: 'live_streaming' as const, amount: 400, currency: 'CNY', date: new Date() }
        ];

        revenueEntries.forEach(entry => {
            monetizationEngine.addRevenueStream(entry);
        });

        // 测试收益追踪
        console.log('\n💹 测试收益追踪...');
        const revenueReport = await monetizationEngine.trackRevenue();
        console.log(`💰 今日收益: ¥${revenueReport.dailyRevenue.toLocaleString()} 元`);
        console.log(`📅 本月收益: ¥${revenueReport.monthlyRevenue.toLocaleString()} 元`);
        
        console.log('\n🏆 表现最佳平台:');
        revenueReport.topPerformingPlatforms.slice(0, 3).forEach((platform, i) => {
            console.log(`  ${i + 1}. ${platform.platform}: ¥${platform.revenue.toLocaleString()} 元`);
        });

        console.log('\n📈 内容表现分析:');
        revenueReport.contentPerformance.slice(0, 3).forEach((content, i) => {
            console.log(`  ${i + 1}. ${content.contentId}: ¥${content.revenue} 元 (ROI: ${(content.roi * 100).toFixed(1)}%)`);
        });

        // 测试自动互动
        console.log('\n🤖 测试自动互动功能...');
        const interactions = [
            { type: 'comment' as const, content: '这个很有趣！', userId: 'user_123' },
            { type: 'message' as const, content: '请问价格是多少？', userId: 'user_456' },
            { type: 'inquiry' as const, content: '想了解一下合作方式', userId: 'user_789' }
        ];

        for (const interaction of interactions) {
            const response = await monetizationEngine.handleAutoInteraction('xiaohongshu', interaction);
            console.log(`  💬 ${interaction.type}: "${interaction.content}"`);
            console.log(`  🤖 回复: "${response.response}" (${response.action || '标准回复'})`);
        }

        console.log('\n🎉 RanJok 变现引擎测试完成！所有功能正常运行。\n');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 运行测试
testMonetizationEngine();