  private async processEnhancedVideoDelivery(request: DeliveryRequest) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      console.log(`🎬 使用剪映MCP处理视频请求: ${request.id}`);
      
      const result = await enhancedVideoEditor.generateVideoWithJianYing(request.payload);
      
      request.status = 'completed';
      request.result = {
        ...result,
        processingMethod: 'JianYing MCP',
        mcpWorkflow: true
      };
      
      this.broadcastDeliveryUpdate(request);
      
      // 发送完成通知
      this.broadcast({
        type: 'jianying_workflow_completed',
        deliveryId: request.id,
        draftId: result.draftId,
        success: result.success,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(`❌ 剪映MCP处理失败:`, error);
      
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleJianYingWorkflow(req: any, res: any) {
    try {
      const deliveryId = `jianying_workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deliveryRequest: DeliveryRequest = {
        id: deliveryId,
        type: 'video',
        payload: {
          ...req.body,
          workflowType: 'jianying_enhanced'
        },
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.deliveryQueue.set(deliveryId, deliveryRequest);
      
      // 启动剪映MCP工作流
      this.processJianYingWorkflow(deliveryRequest);
      
      res.json({
        success: true,
        deliveryId,
        message: '剪映MCP专业工作流已启动',
        estimatedTime: '3-8分钟',
        workflowType: 'enhanced_jianying',
        features: [
          '专业草稿创建',
          '多轨道智能编排', 
          '自动特效应用',
          '智能字幕生成',
          '背景音乐同步',
          '一键导出'
        ]
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async processJianYingWorkflow(request: DeliveryRequest) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      console.log(`🎭 启动剪映MCP专业工作流: ${request.id}`);
      
      // 确保剪映MCP服务已启动
      if (!jianYingMCP.isReady()) {
        console.log('🚀 启动剪映MCP服务器...');
        await jianYingMCP.startMCPServer();
      }
      
      // 执行专业工作流
      const result = await enhancedVideoEditor.generateVideoWithJianYing({
        ...request.payload,
        includeCaptions: true,
        includeIntro: true,
        includeOutro: true
      });
      
      request.status = 'completed';
      request.result = {
        ...result,
        processingMethod: 'Enhanced JianYing MCP Workflow',
        professionalFeatures: {
          draftCreated: !!result.draftId,
          tracksConfigured: Object.keys(result.trackIds).length,
          segmentsAdded: result.segmentIds.length,
          effectsApplied: result.effects.length,
          workflowStepsCompleted: result.workflowSteps.filter(s => s.success).length,
          totalSteps: result.workflowSteps.length
        }
      };
      
      this.broadcastDeliveryUpdate(request);
      
      // 发送详细完成通知
      this.broadcast({
        type: 'enhanced_jianying_workflow_completed',
        deliveryId: request.id,
        draftId: result.draftId,
        trackIds: result.trackIds,
        exportPath: result.exportPath,
        duration: result.estimatedDuration,
        success: result.success,
        professionalGrade: true,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(`❌ 剪映MCP专业工作流失败:`, error);
      
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Enhanced workflow error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleJianYingStatus(req: any, res: any) {
    try {
      const isReady = jianYingMCP.isReady();
      
      res.json({
        success: true,
        jianYingMCP: {
          status: isReady ? 'ready' : 'not_ready',
          serverRunning: isReady,
          lastCheck: Date.now(),
          capabilities: [
            'create_draft',
            'create_track', 
            'add_video_segment',
            'add_audio_segment',
            'add_text_segment',
            'add_effects',
            'export_draft'
          ],
          supportedFormats: ['MP4', 'MOV', 'AVI', 'MP3', 'WAV']
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      });
    }
  }

  private async handleExportJianYingDraft(req: any, res: any) {
    try {
      const draftId = req.params.draftId;
      const exportName = req.body.exportName || `export_${Date.now()}`;
      
      console.log(`📤 导出剪映草稿: ${draftId}`);
      
      const exportResult = await jianYingMCP.exportDraft(draftId, exportName);
      
      if (exportResult.success) {
        res.json({
          success: true,
          export: {
            draftId,
            exportName,
            outputPath: exportResult.result?.output_path,
            exportedAt: Date.now()
          },
          message: '草稿导出成功'
        });
      } else {
        res.status(400).json({
          success: false,
          error: exportResult.error || 'Export failed'
        });
      }
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Export error'
      });
    }
  }