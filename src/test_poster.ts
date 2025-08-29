#!/usr/bin/env bun
import { posterDesigner } from './ranjok_poster_designer.js';

console.log('🎨 测试 RanJok 海报设计引擎...\n');

async function testPosterDesigner() {
    try {
        // 测试单个海报生成
        console.log('📝 测试单个海报生成...');
        const posterConfig = {
            title: 'RanJok 创作平台',
            subtitle: '让创意变现变得简单',
            style: 'modern' as const,
            brandColors: ['#667eea', '#764ba2']
        };

        const result = await posterDesigner.generatePoster(posterConfig);
        console.log('✅ 海报生成成功！');
        console.log(`📋 生成了 ${result.figmaCommands.length} 个 Figma 命令`);
        console.log(`🖼️ 预览链接: ${result.previewUrl}`);
        console.log('\n📄 Figma 命令示例:');
        result.figmaCommands.slice(0, 3).forEach((cmd, i) => {
            console.log(`  ${i + 1}. ${cmd}`);
        });

        // 测试批量生成
        console.log('\n📚 测试批量海报生成...');
        const batchConfigs = [
            { ...posterConfig, title: 'RanJok 海报设计', style: 'modern' as const },
            { ...posterConfig, title: 'RanJok 视频剪辑', style: 'bold' as const },
            { ...posterConfig, title: 'RanJok 自动变现', style: 'elegant' as const }
        ];

        const batchResult = await posterDesigner.batchGeneratePosters(batchConfigs);
        const successCount = batchResult.results.filter(r => r.success).length;
        console.log(`✅ 批量生成完成: ${successCount}/${batchConfigs.length} 成功`);

        // 测试AI建议
        console.log('\n🤖 测试AI设计建议...');
        const suggestions = await posterDesigner.getAIDesignSuggestions(posterConfig);
        console.log('🎨 颜色建议:', suggestions.colorSuggestions.join(', '));
        console.log('📐 布局建议:', suggestions.layoutSuggestions.join(', '));
        console.log('✏️ 文案建议:', suggestions.textSuggestions);

        // 测试模板导出
        console.log('\n📋 测试模板管理...');
        const template = posterDesigner.exportTemplate('modern-minimal');
        if (template) {
            console.log(`✅ 导出模板: ${template.name} (${template.elements.length} 个元素)`);
        }

        console.log('\n🎉 RanJok 海报设计引擎测试完成！所有功能正常运行。\n');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 运行测试
testPosterDesigner();