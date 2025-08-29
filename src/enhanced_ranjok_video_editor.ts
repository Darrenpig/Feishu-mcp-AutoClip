import { jianYingMCP, JianYingMCPResponse, DraftConfig, TrackConfig, VideoSegmentConfig, AudioSegmentConfig, TextSegmentConfig, EffectConfig } from './jianying_mcp_adapter.js';

interface VideoClip {
  id: string;
  filePath: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
  };
}

interface VideoEffect {
  type: 'transition' | 'filter' | 'text' | 'music' | 'voiceover' | 'animation';
  id: string;
  timing: { start: number; duration: number };
  properties: Record<string, any>;
}

interface EnhancedAutoVideoConfig {
  title: string;
  style: 'vlog' | 'business' | 'education' | 'entertainment' | 'social';
  targetDuration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  sourceClips: string[];
  musicStyle?: 'upbeat' | 'calm' | 'dramatic' | 'corporate';
  includeCaptions?: boolean;
  includeIntro?: boolean;
  includeOutro?: boolean;
  exportPath?: string;
}

interface JianYingWorkflowResult {
  success: boolean;
  draftId?: string;
  trackIds: Record<string, string>; // video_1, audio_1, text_1 等
  segmentIds: string[];
  exportPath?: string;
  timeline: VideoClip[];
  effects: VideoEffect[];
  estimatedDuration: number;
  workflowSteps: Array<{ step: string; success: boolean; result?: any; error?: string }>;
}

class EnhancedRanJokVideoEditor {
  private templates: Record<string, VideoEffect[]> = {};
  private musicLibrary: Record<string, string[]> = {};

  constructor() {
    this.initializeTemplates();
    this.initializeMusicLibrary();
  }

  private initializeTemplates() {
    // Vlog 风格模板
    this.templates.vlog = [
      {
        type: 'animation',
        id: 'fade-in',
        timing: { start: 0, duration: 1 },
        properties: { type: '淡入淡出', direction: 'in' }
      },
      {
        type: 'text',
        id: 'title-overlay',
        timing: { start: 2, duration: 3 },
        properties: {
          text: '{{title}}',
          fontSize: 48,
          color: '#ffffff',
          position: 'center',
          animation: '弹跳效果'
        }
      },
      {
        type: 'transition',
        id: 'quick-cut',
        timing: { start: 0, duration: 0.5 },
        properties: { type: '滑动切换', style: 'quick' }
      }
    ];

    // 商务风格模板
    this.templates.business = [
      {
        type: 'text',
        id: 'professional-title',
        timing: { start: 1, duration: 4 },
        properties: {
          text: '{{title}}',
          fontSize: 42,
          color: '#2c3e50',
          position: 'center',
          animation: '滑动进入'
        }
      },
      {
        type: 'transition',
        id: 'professional-wipe',
        timing: { start: 0, duration: 0.8 },
        properties: { type: '页面翻转', direction: 'left' }
      },
      {
        type: 'filter',
        id: 'corporate-look',
        timing: { start: 0, duration: -1 }, // -1 表示整个视频
        properties: { type: '高对比度', strength: 0.7 }
      }
    ];

    // 教育风格模板
    this.templates.education = [
      {
        type: 'text',
        id: 'lesson-title',
        timing: { start: 0.5, duration: 2.5 },
        properties: {
          text: '第{{index}}课: {{title}}',
          fontSize: 36,
          color: '#3498db',
          position: 'top',
          animation: '缩放出现'
        }
      },
      {
        type: 'filter',
        id: 'education-clarity',
        timing: { start: 0, duration: -1 },
        properties: { type: '暖色调', strength: 0.3 }
      }
    ];

    // 娱乐风格模板
    this.templates.entertainment = [
      {
        type: 'animation',
        id: 'dynamic-intro',
        timing: { start: 0, duration: 1.5 },
        properties: { type: '旋转登场', intensity: 'high' }
      },
      {
        type: 'transition',
        id: 'flashy-cuts',
        timing: { start: 0, duration: 0.3 },
        properties: { type: '光晕过渡', energy: 'high' }
      }
    ];

    // 社交媒体风格模板
    this.templates.social = [
      {
        type: 'text',
        id: 'hashtag-overlay',
        timing: { start: 1, duration: 2 },
        properties: {
          text: '#{{title}} #RanJok',
          fontSize: 28,
          color: '#ff6b6b',
          position: 'bottom',
          animation: '弹跳效果'
        }
      },
      {
        type: 'filter',
        id: 'social-pop',
        timing: { start: 0, duration: -1 },
        properties: { type: '复古胶片', strength: 0.5 }
      }
    ];
  }

  private initializeMusicLibrary() {
    this.musicLibrary = {
      upbeat: [
        './material/upbeat-energy.mp3',
        './material/happy-pop.mp3',
        './material/modern-electronic.mp3'
      ],
      calm: [
        './material/peaceful-piano.mp3',
        './material/ambient-nature.mp3',
        './material/soft-guitar.mp3'
      ],
      dramatic: [
        './material/epic-orchestral.mp3',
        './material/cinematic-tension.mp3',
        './material/powerful-drums.mp3'
      ],
      corporate: [
        './material/professional-business.mp3',
        './material/modern-corporate.mp3',
        './material/inspiring-growth.mp3'
      ]
    };
  }

  async generateVideoWithJianYing(config: EnhancedAutoVideoConfig): Promise<JianYingWorkflowResult> {
    const workflowSteps: Array<{ step: string; success: boolean; result?: any; error?: string }> = [];
    
    try {
      console.log('🎬 开始使用剪映MCP生成视频...');
      
      // 确保剪映MCP已启动
      if (!jianYingMCP.isReady()) {
        console.log('🚀 启动剪映MCP服务器...');
        await jianYingMCP.startMCPServer();
      }

      // 步骤1: 获取制作规范
      console.log('📋 获取剪映制作规范...');
      const rules = await jianYingMCP.getRules();
      workflowSteps.push({
        step: '获取制作规范',
        success: rules.success,
        result: rules.result,
        error: rules.error
      });

      // 步骤2: 分析源视频文件
      console.log('📊 分析源视频文件...');
      const analyzedClips = await this.analyzeSourceClipsWithMCP(config.sourceClips);
      workflowSteps.push({
        step: '分析源视频文件',
        success: analyzedClips.length > 0,
        result: { clipCount: analyzedClips.length }
      });

      // 步骤3: 创建草稿项目
      console.log('📝 创建剪映草稿项目...');
      const draftConfig: DraftConfig = {
        name: config.title,
        resolution: config.aspectRatio === '16:9' ? '1080p' : '720p',
        frame_rate: 30,
        duration: config.targetDuration
      };
      
      const draftResult = await jianYingMCP.createDraft(draftConfig);
      if (!draftResult.success || !draftResult.draft_id) {
        throw new Error(`创建草稿失败: ${draftResult.error}`);
      }
      
      workflowSteps.push({
        step: '创建草稿项目',
        success: draftResult.success,
        result: { draftId: draftResult.draft_id }
      });

      const draftId = draftResult.draft_id;
      const trackIds: Record<string, string> = {};

      // 步骤4: 创建轨道
      console.log('🛤️  创建视频轨道...');
      const videoTrackResult = await jianYingMCP.createTrack({
        draft_id: draftId,
        track_type: 'video',
        track_name: 'main_video'
      });
      
      if (videoTrackResult.success && videoTrackResult.track_id) {
        trackIds.video_1 = videoTrackResult.track_id;
      }

      // 创建音频轨道
      console.log('🛤️  创建音频轨道...');
      const audioTrackResult = await jianYingMCP.createTrack({
        draft_id: draftId,
        track_type: 'audio',
        track_name: 'background_music'
      });
      
      if (audioTrackResult.success && audioTrackResult.track_id) {
        trackIds.audio_1 = audioTrackResult.track_id;
      }

      // 创建文本轨道
      console.log('🛤️  创建文本轨道...');
      const textTrackResult = await jianYingMCP.createTrack({
        draft_id: draftId,
        track_type: 'text',
        track_name: 'titles_captions'
      });
      
      if (textTrackResult.success && textTrackResult.track_id) {
        trackIds.text_1 = textTrackResult.track_id;
      }

      workflowSteps.push({
        step: '创建轨道',
        success: Object.keys(trackIds).length > 0,
        result: { trackIds }
      });

      // 步骤5: 智能剪辑和添加视频片段
      console.log('✂️  智能剪辑并添加视频片段...');
      const selectedClips = await this.intelligentClipSelection(analyzedClips, config);
      const segmentIds: string[] = [];
      
      let currentTime = 0;
      for (let i = 0; i < selectedClips.length && trackIds.video_1; i++) {
        const clip = selectedClips[i];
        const segmentDuration = Math.min(clip.duration, config.targetDuration - currentTime);
        
        if (segmentDuration <= 0) break;

        const videoSegmentConfig: VideoSegmentConfig = {
          draft_id: draftId,
          track_id: trackIds.video_1,
          material: clip.filePath,
          target_start_end: `${currentTime}-${currentTime + segmentDuration}`,
          source_start_end: `${clip.startTime}-${clip.startTime + segmentDuration}`,
          speed: 1.0,
          volume: 0.8 // 降低原始音频音量
        };

        const segmentResult = await jianYingMCP.addVideoSegment(videoSegmentConfig);
        if (segmentResult.success && segmentResult.segment_id) {
          segmentIds.push(segmentResult.segment_id);
        }

        currentTime += segmentDuration;
      }

      workflowSteps.push({
        step: '添加视频片段',
        success: segmentIds.length > 0,
        result: { segmentCount: segmentIds.length }
      });

      // 步骤6: 添加背景音乐
      if (config.musicStyle && trackIds.audio_1) {
        console.log('🎵 添加背景音乐...');
        const musicFiles = this.musicLibrary[config.musicStyle];
        const selectedMusic = musicFiles[Math.floor(Math.random() * musicFiles.length)];
        
        const audioSegmentConfig: AudioSegmentConfig = {
          draft_id: draftId,
          track_id: trackIds.audio_1,
          material: selectedMusic,
          target_start_end: `0-${currentTime}`,
          volume: 0.3,
          fade_in: 2,
          fade_out: 2
        };

        const musicResult = await jianYingMCP.addAudioSegment(audioSegmentConfig);
        workflowSteps.push({
          step: '添加背景音乐',
          success: musicResult.success,
          result: { musicFile: selectedMusic }
        });
      }

      // 步骤7: 添加标题和字幕
      if (trackIds.text_1) {
        console.log('📝 添加标题文本...');
        
        // 添加主标题
        const titleConfig: TextSegmentConfig = {
          draft_id: draftId,
          track_id: trackIds.text_1,
          content: config.title,
          target_start_end: '2-5',
          font_size: this.getStyleFontSize(config.style),
          font_color: this.getStyleFontColor(config.style),
          position: 'center',
          animation: this.getStyleAnimation(config.style)
        };

        const titleResult = await jianYingMCP.addTextSegment(titleConfig);
        
        // 添加字幕（如果启用）
        if (config.includeCaptions) {
          const segments = Math.floor(currentTime / 5); // 每5秒一个字幕
          for (let i = 0; i < segments; i++) {
            const captionConfig: TextSegmentConfig = {
              draft_id: draftId,
              track_id: trackIds.text_1,
              content: `字幕内容 ${i + 1}`,
              target_start_end: `${i * 5}-${(i + 1) * 5}`,
              font_size: 24,
              font_color: '#ffffff',
              position: 'bottom'
            };

            await jianYingMCP.addTextSegment(captionConfig);
          }
        }

        workflowSteps.push({
          step: '添加文本内容',
          success: titleResult.success,
          result: { captionsEnabled: config.includeCaptions }
        });
      }

      // 步骤8: 应用风格特效
      console.log('✨ 应用风格特效...');
      const templateEffects = this.templates[config.style] || this.templates.vlog;
      const effectResults = [];

      for (const effect of templateEffects) {
        if (effect.type === 'filter' && segmentIds.length > 0) {
          // 应用滤镜到第一个视频片段
          const filterConfig: EffectConfig = {
            draft_id: draftId,
            segment_id: segmentIds[0],
            effect_type: 'filter',
            effect_name: effect.properties.type,
            parameters: {
              strength: effect.properties.strength || 0.5
            }
          };

          const filterResult = await jianYingMCP.addEffect(filterConfig);
          effectResults.push(filterResult);
        }
        
        // 可以添加更多特效类型的处理
      }

      workflowSteps.push({
        step: '应用风格特效',
        success: effectResults.some(r => r.success),
        result: { effectCount: effectResults.length }
      });

      // 步骤9: 导出项目
      console.log('📤 导出剪映项目...');
      const exportResult = await jianYingMCP.exportDraft(draftId, config.title);
      
      workflowSteps.push({
        step: '导出项目',
        success: exportResult.success,
        result: exportResult.result
      });

      // 构建返回结果
      const timeline = selectedClips.slice(0, segmentIds.length);
      const effects = this.convertTemplateEffectsToVideoEffects(templateEffects, config);

      return {
        success: true,
        draftId,
        trackIds,
        segmentIds,
        exportPath: exportResult.result?.output_path || config.exportPath,
        timeline,
        effects,
        estimatedDuration: currentTime,
        workflowSteps
      };

    } catch (error) {
      console.error('❌ 剪映MCP视频生成失败:', error);
      
      workflowSteps.push({
        step: '错误处理',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        trackIds: {},
        segmentIds: [],
        timeline: [],
        effects: [],
        estimatedDuration: 0,
        workflowSteps
      };
    }
  }

  private async analyzeSourceClipsWithMCP(filePaths: string[]): Promise<VideoClip[]> {
    const clips: VideoClip[] = [];
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      
      try {
        // 使用剪映MCP解析媒体信息
        const mediaInfo = await jianYingMCP.parseMediaInfo(filePath);
        
        if (mediaInfo.success && mediaInfo.result) {
          clips.push({
            id: `clip_${i + 1}`,
            filePath,
            duration: mediaInfo.result.duration || 30,
            startTime: 0,
            endTime: mediaInfo.result.duration || 30,
            metadata: {
              width: 1920,
              height: 1080,
              fps: mediaInfo.result.frame_rate || 30,
              bitrate: 8000
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️  无法分析文件 ${filePath}:`, error);
        // 使用默认值
        clips.push({
          id: `clip_${i + 1}`,
          filePath,
          duration: 30,
          startTime: 0,
          endTime: 30,
          metadata: {
            width: 1920,
            height: 1080,
            fps: 30,
            bitrate: 8000
          }
        });
      }
    }

    return clips;
  }

  private async intelligentClipSelection(clips: VideoClip[], config: EnhancedAutoVideoConfig): Promise<VideoClip[]> {
    const selectedClips: VideoClip[] = [];
    let totalDuration = 0;

    for (const clip of clips) {
      if (totalDuration >= config.targetDuration) break;

      // 基于风格的智能片段选择
      const highlights = this.findHighlights(clip, config.style);
      
      for (const highlight of highlights) {
        if (totalDuration >= config.targetDuration) break;
        
        const remainingTime = config.targetDuration - totalDuration;
        const clipDuration = Math.min(highlight.duration, remainingTime);
        
        selectedClips.push({
          ...clip,
          id: `selected_${selectedClips.length + 1}`,
          startTime: highlight.startTime,
          endTime: highlight.startTime + clipDuration,
          duration: clipDuration
        });
        
        totalDuration += clipDuration;
      }
    }

    return selectedClips;
  }

  private findHighlights(clip: VideoClip, style: string): Array<{ startTime: number; duration: number; score: number }> {
    const highlights = [];
    const segmentDuration = Math.min(5, clip.duration / 3); // 动态片段时长
    
    for (let i = 0; i < clip.duration - segmentDuration; i += segmentDuration) {
      let score = Math.random();
      
      // 根据风格调整评分
      switch (style) {
        case 'vlog':
          score *= (i < 10 || i > clip.duration - 10) ? 1.3 : 1;
          break;
        case 'business':
          score *= i < clip.duration / 2 ? 1.2 : 1;
          break;
        case 'education':
          score *= 1;
          break;
        case 'entertainment':
          score *= Math.sin(i / 10) * 0.4 + 1.2;
          break;
        case 'social':
          score *= (i < 5 || i > clip.duration - 5) ? 1.5 : 0.8;
          break;
      }

      if (score > 0.6) {
        highlights.push({
          startTime: i,
          duration: Math.min(segmentDuration, clip.duration - i),
          score
        });
      }
    }

    return highlights.sort((a, b) => b.score - a.score).slice(0, 2);
  }

  private getStyleFontSize(style: string): number {
    const fontSizes = {
      vlog: 44,
      business: 38,
      education: 40,
      entertainment: 52,
      social: 36
    };
    return fontSizes[style as keyof typeof fontSizes] || 40;
  }

  private getStyleFontColor(style: string): string {
    const colors = {
      vlog: '#ffffff',
      business: '#2c3e50',
      education: '#3498db',
      entertainment: '#ff6b6b',
      social: '#e74c3c'
    };
    return colors[style as keyof typeof colors] || '#ffffff';
  }

  private getStyleAnimation(style: string): string {
    const animations = {
      vlog: '弹跳效果',
      business: '滑动进入',
      education: '缩放出现',
      entertainment: '旋转登场',
      social: '弹跳效果'
    };
    return animations[style as keyof typeof animations] || '淡入淡出';
  }

  private convertTemplateEffectsToVideoEffects(templateEffects: VideoEffect[], config: EnhancedAutoVideoConfig): VideoEffect[] {
    return templateEffects.map((effect, index) => ({
      ...effect,
      id: `${effect.id}_${index}`,
      properties: {
        ...effect.properties,
        text: effect.properties.text?.replace('{{title}}', config.title).replace('{{index}}', '1')
      }
    }));
  }

  // 批量视频生成
  async batchGenerateVideosWithJianYing(configs: EnhancedAutoVideoConfig[]): Promise<{
    results: Array<{
      config: EnhancedAutoVideoConfig;
      result: JianYingWorkflowResult;
      success: boolean;
      error?: string;
    }>
  }> {
    const results = [];

    console.log(`🔄 开始批量生成 ${configs.length} 个视频`);

    for (const config of configs) {
      try {
        console.log(`📹 处理视频: ${config.title}`);
        const result = await this.generateVideoWithJianYing(config);
        
        results.push({
          config,
          result,
          success: result.success
        });
      } catch (error) {
        results.push({
          config,
          result: {
            success: false,
            trackIds: {},
            segmentIds: [],
            timeline: [],
            effects: [],
            estimatedDuration: 0,
            workflowSteps: []
          },
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 批量生成完成: ${successCount}/${configs.length} 成功`);

    return { results };
  }
}

export { EnhancedRanJokVideoEditor, type EnhancedAutoVideoConfig, type JianYingWorkflowResult };

// 创建全局实例
export const enhancedVideoEditor = new EnhancedRanJokVideoEditor();