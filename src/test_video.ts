#!/usr/bin/env bun
import { videoEditor } from './ranjok_video_editor.js';

console.log('🎬 测试 RanJok 视频编辑引擎...\n');

async function testVideoEditor() {
    try {
        // 测试单个视频生成
        console.log('🎥 测试单个视频剪辑...');
        const videoConfig = {
            title: 'RanJok 教程视频',
            style: 'education' as const,
            sourceClips: [
                '/videos/intro.mp4',
                '/videos/demo.mp4',
                '/videos/tutorial.mp4'
            ],
            targetDuration: 60,
            aspectRatio: '16:9' as const,
            includeCaptions: true,
            musicStyle: 'calm' as const
        };

        const result = await videoEditor.generateVideo(videoConfig);
        console.log('✅ 视频剪辑方案生成成功！');
        console.log(`⏱️ 预估时长: ${result.estimatedDuration.toFixed(1)} 秒`);
        console.log(`🎬 时间轴片段: ${result.timeline.length} 个`);
        console.log(`✨ 特效数量: ${result.effects.length} 个`);
        console.log(`🔧 剪映命令: ${result.jianYingCommands.length} 个`);

        console.log('\n📋 时间轴概览:');
        result.timeline.forEach((clip, i) => {
            const duration = clip.endTime - clip.startTime;
            console.log(`  ${i + 1}. ${clip.id}: ${clip.startTime}s - ${clip.endTime}s (${duration.toFixed(1)}s)`);
        });

        console.log('\n✨ 特效列表:');
        result.effects.slice(0, 5).forEach((effect, i) => {
            const duration = effect.timing.duration;
            console.log(`  ${i + 1}. ${effect.type}: ${effect.timing.start}s (+${duration}s)`);
        });

        console.log('\n🔧 剪映命令示例:');
        result.jianYingCommands.slice(0, 3).forEach((cmd, i) => {
            console.log(`  ${i + 1}. ${cmd.action}: ${JSON.stringify(cmd.parameters).substring(0, 50)}...`);
        });

        // 测试批量视频生成
        console.log('\n📚 测试批量视频生成...');
        const batchConfigs = [
            { ...videoConfig, title: 'RanJok Vlog', style: 'vlog' as const, targetDuration: 30 },
            { ...videoConfig, title: 'RanJok 商务', style: 'business' as const, targetDuration: 45 },
            { ...videoConfig, title: 'RanJok 娱乐', style: 'entertainment' as const, targetDuration: 15 }
        ];

        const batchResult = await videoEditor.batchGenerateVideos(batchConfigs);
        const successCount = batchResult.results.filter(r => r.success).length;
        console.log(`✅ 批量生成完成: ${successCount}/${batchConfigs.length} 成功`);

        // 测试优化建议
        console.log('\n🤖 测试视频优化建议...');
        const suggestions = await videoEditor.getVideoOptimizationSuggestions(videoConfig);
        console.log(`⏱️ 建议时长: ${suggestions.durationSuggestion} 秒`);
        console.log('🎭 风格建议:', suggestions.styleSuggestions.join(', '));
        console.log('🎵 音乐建议:', suggestions.musicSuggestions.join(', '));
        console.log('✨ 特效建议:', suggestions.effectSuggestions.join(', '));

        // 测试不同风格
        console.log('\n🎨 测试不同视频风格...');
        const styles = ['vlog', 'business', 'social', 'entertainment'] as const;
        
        for (const style of styles) {
            const styleConfig = { ...videoConfig, style, targetDuration: 30 };
            const styleResult = await videoEditor.generateVideo(styleConfig);
            console.log(`  📱 ${style}: ${styleResult.timeline.length} 片段, ${styleResult.effects.length} 特效`);
        }

        console.log('\n🎉 RanJok 视频编辑引擎测试完成！所有功能正常运行。\n');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 运行测试
testVideoEditor();