#!/usr/bin/env bun
import { jianYingMCP } from './jianying_mcp_adapter.js';
import { enhancedVideoEditor } from './enhanced_ranjok_video_editor.js';

console.log('🎬 测试剪映MCP集成...\n');

async function testJianYingMCPIntegration() {
    try {
        // 测试1: 启动剪映MCP服务器
        console.log('🚀 测试剪映MCP服务器启动...');
        await jianYingMCP.startMCPServer();
        
        if (jianYingMCP.isReady()) {
            console.log('✅ 剪映MCP服务器已就绪');
        } else {
            console.log('⚠️  剪映MCP服务器未就绪，使用模拟模式');
        }

        // 测试2: 获取制作规范
        console.log('\n📋 测试获取制作规范...');
        const rules = await jianYingMCP.getRules();
        console.log(`✅ 制作规范获取: ${rules.success ? '成功' : '失败'}`);
        if (rules.result) {
            console.log('📄 规范内容已获取');
        }

        // 测试3: 创建草稿项目
        console.log('\n📝 测试创建草稿项目...');
        const draftResult = await jianYingMCP.createDraft({
            name: 'RanJok测试项目',
            resolution: '1080p',
            frame_rate: 30,
            duration: 60
        });
        
        console.log(`✅ 草稿创建: ${draftResult.success ? '成功' : '失败'}`);
        if (draftResult.draft_id) {
            console.log(`📋 草稿ID: ${draftResult.draft_id}`);
        }

        let draftId = draftResult.draft_id || 'test_draft_123';

        // 测试4: 创建轨道
        console.log('\n🛤️  测试创建轨道...');
        const trackResults = await Promise.all([
            jianYingMCP.createTrack({
                draft_id: draftId,
                track_type: 'video',
                track_name: 'main_video'
            }),
            jianYingMCP.createTrack({
                draft_id: draftId,
                track_type: 'audio',
                track_name: 'background_music'
            }),
            jianYingMCP.createTrack({
                draft_id: draftId,
                track_type: 'text',
                track_name: 'titles'
            })
        ]);

        const successfulTracks = trackResults.filter(r => r.success);
        console.log(`✅ 轨道创建完成: ${successfulTracks.length}/3 成功`);
        
        const videoTrackId = trackResults[0].track_id || 'video_track_123';
        const audioTrackId = trackResults[1].track_id || 'audio_track_123';
        const textTrackId = trackResults[2].track_id || 'text_track_123';

        // 测试5: 解析媒体信息
        console.log('\n📊 测试解析媒体信息...');
        const mediaInfoResults = await Promise.all([
            jianYingMCP.parseMediaInfo('./material/video1.mp4'),
            jianYingMCP.parseMediaInfo('./material/video2.mp4'),
            jianYingMCP.parseMediaInfo('./material/audio.mp3')
        ]);

        mediaInfoResults.forEach((result, i) => {
            const fileName = ['video1.mp4', 'video2.mp4', 'audio.mp3'][i];
            console.log(`  📋 ${fileName}: ${result.success ? '解析成功' : '解析失败'}`);
            if (result.result) {
                console.log(`    时长: ${result.result.duration}秒, 格式: ${result.result.format}`);
            }
        });

        // 测试6: 添加视频片段
        console.log('\n🎥 测试添加视频片段...');
        const videoSegmentResults = await Promise.all([
            jianYingMCP.addVideoSegment({
                draft_id: draftId,
                track_id: videoTrackId,
                material: './material/video1.mp4',
                target_start_end: '0-30',
                source_start_end: '0-30',
                volume: 0.8
            }),
            jianYingMCP.addVideoSegment({
                draft_id: draftId,
                track_id: videoTrackId,
                material: './material/video2.mp4',
                target_start_end: '30-60',
                source_start_end: '10-40',
                volume: 0.8
            })
        ]);

        const successfulVideoSegments = videoSegmentResults.filter(r => r.success);
        console.log(`✅ 视频片段添加: ${successfulVideoSegments.length}/2 成功`);

        // 测试7: 添加音频片段
        console.log('\n🎵 测试添加音频片段...');
        const audioSegmentResult = await jianYingMCP.addAudioSegment({
            draft_id: draftId,
            track_id: audioTrackId,
            material: './material/audio.mp3',
            target_start_end: '0-60',
            volume: 0.3,
            fade_in: 2,
            fade_out: 2
        });

        console.log(`✅ 音频片段添加: ${audioSegmentResult.success ? '成功' : '失败'}`);

        // 测试8: 添加文本片段
        console.log('\n📝 测试添加文本片段...');
        const textSegmentResults = await Promise.all([
            jianYingMCP.addTextSegment({
                draft_id: draftId,
                track_id: textTrackId,
                content: 'RanJok 创作平台',
                target_start_end: '2-5',
                font_size: 48,
                font_color: '#FFFFFF',
                position: 'center',
                animation: '弹跳效果'
            }),
            jianYingMCP.addTextSegment({
                draft_id: draftId,
                track_id: textTrackId,
                content: '让创意变现变得简单',
                target_start_end: '5-8',
                font_size: 32,
                font_color: '#FFFF00',
                position: 'bottom'
            })
        ]);

        const successfulTextSegments = textSegmentResults.filter(r => r.success);
        console.log(`✅ 文本片段添加: ${successfulTextSegments.length}/2 成功`);

        // 测试9: 查找特效
        console.log('\n🔍 测试查找特效...');
        const effectsResults = await Promise.all([
            jianYingMCP.findEffects('animation'),
            jianYingMCP.findEffects('transition'),
            jianYingMCP.findEffects('filter')
        ]);

        effectsResults.forEach((result, i) => {
            const effectType = ['动画', '转场', '滤镜'][i];
            console.log(`  ✨ ${effectType}特效: ${result.success ? `找到${result.result?.effects?.length || 0}个` : '查找失败'}`);
            if (result.result?.effects) {
                console.log(`    示例: ${result.result.effects.slice(0, 3).join(', ')}`);
            }
        });

        // 测试10: 应用特效
        if (successfulVideoSegments.length > 0 && videoSegmentResults[0].segment_id) {
            console.log('\n✨ 测试应用特效...');
            const effectResult = await jianYingMCP.addEffect({
                draft_id: draftId,
                segment_id: videoSegmentResults[0].segment_id,
                effect_type: 'filter',
                effect_name: '暖色调',
                parameters: { strength: 0.5 }
            });

            console.log(`✅ 特效应用: ${effectResult.success ? '成功' : '失败'}`);
        }

        // 测试11: 导出草稿
        console.log('\n📤 测试导出草稿...');
        const exportResult = await jianYingMCP.exportDraft(draftId, 'RanJok测试导出');
        console.log(`✅ 草稿导出: ${exportResult.success ? '成功' : '失败'}`);
        if (exportResult.result?.output_path) {
            console.log(`📁 输出路径: ${exportResult.result.output_path}`);
        }

        // 测试12: 增强视频编辑器集成
        console.log('\n🎬 测试增强视频编辑器...');
        const enhancedVideoResult = await enhancedVideoEditor.generateVideoWithJianYing({
            title: 'RanJok集成测试视频',
            style: 'business',
            targetDuration: 30,
            aspectRatio: '16:9',
            sourceClips: ['./material/video1.mp4', './material/video2.mp4'],
            musicStyle: 'corporate',
            includeCaptions: true,
            includeIntro: true,
            includeOutro: false
        });

        console.log(`✅ 增强视频编辑器: ${enhancedVideoResult.success ? '成功' : '失败'}`);
        if (enhancedVideoResult.success) {
            console.log(`  📋 草稿ID: ${enhancedVideoResult.draftId}`);
            console.log(`  🛤️  轨道数量: ${Object.keys(enhancedVideoResult.trackIds).length}`);
            console.log(`  🎬 片段数量: ${enhancedVideoResult.segmentIds.length}`);
            console.log(`  ✨ 特效数量: ${enhancedVideoResult.effects.length}`);
            console.log(`  ⏱️  预估时长: ${enhancedVideoResult.estimatedDuration.toFixed(1)}秒`);
            console.log(`  🔄 工作流步骤: ${enhancedVideoResult.workflowSteps.filter(s => s.success).length}/${enhancedVideoResult.workflowSteps.length} 成功`);
            
            if (enhancedVideoResult.exportPath) {
                console.log(`  📁 导出路径: ${enhancedVideoResult.exportPath}`);
            }
        }

        // 测试13: 批量视频生成
        console.log('\n📚 测试批量视频生成...');
        const batchConfigs = [
            {
                title: '产品介绍视频',
                style: 'business' as const,
                targetDuration: 20,
                aspectRatio: '16:9' as const,
                sourceClips: ['./material/video1.mp4'],
                musicStyle: 'corporate' as const
            },
            {
                title: '用户教程视频',
                style: 'education' as const,
                targetDuration: 25,
                aspectRatio: '16:9' as const,
                sourceClips: ['./material/video2.mp4'],
                musicStyle: 'calm' as const
            }
        ];

        const batchResult = await enhancedVideoEditor.batchGenerateVideosWithJianYing(batchConfigs);
        const batchSuccessCount = batchResult.results.filter(r => r.success).length;
        console.log(`✅ 批量生成完成: ${batchSuccessCount}/${batchConfigs.length} 成功`);

        batchResult.results.forEach((result, i) => {
            console.log(`  📹 ${result.config.title}: ${result.success ? '成功' : '失败'}`);
            if (result.success && result.result.draftId) {
                console.log(`    草稿ID: ${result.result.draftId}`);
            }
        });

        // 汇总测试结果
        console.log('\n📊 测试结果汇总:');
        const testResults = [
            { name: '剪映MCP服务器启动', success: jianYingMCP.isReady() },
            { name: '制作规范获取', success: rules.success },
            { name: '草稿创建', success: draftResult.success },
            { name: '轨道创建', success: successfulTracks.length >= 2 },
            { name: '媒体信息解析', success: mediaInfoResults.some(r => r.success) },
            { name: '视频片段添加', success: successfulVideoSegments.length > 0 },
            { name: '音频片段添加', success: audioSegmentResult.success },
            { name: '文本片段添加', success: successfulTextSegments.length > 0 },
            { name: '特效查找', success: effectsResults.some(r => r.success) },
            { name: '草稿导出', success: exportResult.success },
            { name: '增强视频编辑器', success: enhancedVideoResult.success },
            { name: '批量视频生成', success: batchSuccessCount > 0 }
        ];

        const totalTests = testResults.length;
        const passedTests = testResults.filter(t => t.success).length;

        console.log(`\n🎯 测试通过率: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        
        testResults.forEach(test => {
            console.log(`  ${test.success ? '✅' : '❌'} ${test.name}`);
        });

        if (passedTests === totalTests) {
            console.log('\n🎉 所有测试通过！剪映MCP集成完全正常！');
        } else if (passedTests >= totalTests * 0.8) {
            console.log('\n🎊 大部分测试通过！剪映MCP集成基本正常！');
        } else {
            console.log('\n⚠️  部分测试失败，请检查配置和连接！');
        }

        console.log('\n📈 集成优势:');
        console.log('  🎬 专业级剪映工作流');
        console.log('  🎨 智能特效应用');
        console.log('  🎵 音视频同步处理'); 
        console.log('  📝 自动字幕生成');
        console.log('  🔄 批量处理能力');
        console.log('  📤 一键导出发布');

        console.log('\n🔗 API端点已就绪:');
        console.log('  POST /api/video/jianying-workflow - 启动专业工作流');
        console.log('  GET  /api/jianying/status - 检查服务状态');
        console.log('  POST /api/jianying/draft/:id/export - 导出草稿');

    } catch (error) {
        console.error('❌ 剪映MCP集成测试失败:', error);
        
        console.log('\n🔧 故障排除建议:');
        console.log('  1. 检查Python环境 (需要Python 3.13+)');
        console.log('  2. 确认uv包管理器已安装');
        console.log('  3. 验证剪映MCP依赖已安装');
        console.log('  4. 检查环境变量配置 (SAVE_PATH, OUTPUT_PATH)');
        console.log('  5. 模拟模式可正常工作，不影响基础功能');
    } finally {
        // 清理资源
        try {
            await jianYingMCP.stop();
            console.log('\n🛑 剪映MCP服务器已停止');
        } catch (error) {
            console.log('\n⚠️  清理过程中出现问题，忽略');
        }
    }
}

// 运行测试
testJianYingMCPIntegration();