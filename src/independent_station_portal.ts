import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import { artisticMCP } from './artistic_creation_mcp.js';
import { posterDesigner } from './ranjok_poster_designer.js';
import { enhancedVideoEditor } from './enhanced_ranjok_video_editor.js';
import { monetizationEngine } from './ranjok_monetization_engine.js';
import { jianYingMCP } from './jianying_mcp_adapter.js';

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (req: any, res: any) => Promise<void>;
  authenticated?: boolean;
  rateLimit?: number;
}

interface CyberDeliveryConfig {
  apiKey: string;
  maxRequestsPerHour: number;
  allowedOrigins: string[];
  enableRealTimeSync: boolean;
  webhookUrl?: string;
}

interface DeliveryRequest {
  id: string;
  type: 'poster' | 'video' | 'workflow' | 'monetization';
  payload: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

class IndependentStationPortal {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private config: CyberDeliveryConfig;
  private deliveryQueue: Map<string, DeliveryRequest> = new Map();
  private connectedClients: Set<WebSocket> = new Set();

  constructor(config: CyberDeliveryConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocketServer();
  }

  private setupMiddleware() {
    // CORS配置
    this.app.use(cors({
      origin: this.config.allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // API密钥验证中间件
    this.app.use('/api', (req, res, next) => {
      const apiKey = req.headers['x-api-key'];
      if (apiKey !== this.config.apiKey) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      next();
    });

    // 速率限制
    const rateLimitMap = new Map<string, number[]>();
    this.app.use((req, res, next) => {
      const clientIP = req.ip || 'unknown';
      const now = Date.now();
      const requests = rateLimitMap.get(clientIP) || [];
      
      // 清除1小时前的请求记录
      const recentRequests = requests.filter(time => now - time < 3600000);
      
      if (recentRequests.length >= this.config.maxRequestsPerHour) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          resetTime: now + 3600000
        });
      }
      
      recentRequests.push(now);
      rateLimitMap.set(clientIP, recentRequests);
      next();
    });
  }

  private setupRoutes() {
    const endpoints: APIEndpoint[] = [
      // 状态检查
      {
        path: '/health',
        method: 'GET',
        handler: this.handleHealthCheck.bind(this)
      },
      
      // 海报设计API
      {
        path: '/api/poster/create',
        method: 'POST',
        handler: this.handleCreatePoster.bind(this)
      },
      {
        path: '/api/poster/batch',
        method: 'POST',
        handler: this.handleBatchCreatePosters.bind(this)
      },
      {
        path: '/api/poster/templates',
        method: 'GET',
        handler: this.handleGetPosterTemplates.bind(this)
      },
      
      // 视频编辑API
      {
        path: '/api/video/create',
        method: 'POST',
        handler: this.handleCreateVideo.bind(this)
      },
      {
        path: '/api/video/batch',
        method: 'POST',
        handler: this.handleBatchCreateVideos.bind(this)
      },
      {
        path: '/api/video/optimize',
        method: 'POST',
        handler: this.handleOptimizeVideo.bind(this)
      },
      {
        path: '/api/video/jianying-workflow',
        method: 'POST',
        handler: this.handleJianYingWorkflow.bind(this)
      },
      {
        path: '/api/jianying/status',
        method: 'GET',
        handler: this.handleJianYingStatus.bind(this)
      },
      {
        path: '/api/jianying/draft/:draftId/export',
        method: 'POST',
        handler: this.handleExportJianYingDraft.bind(this)
      },
      
      // 变现管理API
      {
        path: '/api/monetization/start',
        method: 'POST',
        handler: this.handleStartMonetization.bind(this)
      },
      {
        path: '/api/monetization/revenue',
        method: 'GET',
        handler: this.handleGetRevenue.bind(this)
      },
      {
        path: '/api/monetization/platforms',
        method: 'GET',
        handler: this.handleGetPlatforms.bind(this)
      },
      
      // 创意工作流API
      {
        path: '/api/workflow/create',
        method: 'POST',
        handler: this.handleCreateWorkflow.bind(this)
      },
      {
        path: '/api/workflow/:id/status',
        method: 'GET',
        handler: this.handleGetWorkflowStatus.bind(this)
      },
      {
        path: '/api/workflow/list',
        method: 'GET',
        handler: this.handleListWorkflows.bind(this)
      },
      
      // 内容优化API
      {
        path: '/api/optimize/content',
        method: 'POST',
        handler: this.handleOptimizeContent.bind(this)
      },
      
      // 实时同步API
      {
        path: '/api/sync/status',
        method: 'GET',
        handler: this.handleSyncStatus.bind(this)
      },
      
      // 交付状态API
      {
        path: '/api/delivery/:id',
        method: 'GET',
        handler: this.handleGetDeliveryStatus.bind(this)
      },
      {
        path: '/api/delivery/list',
        method: 'GET',
        handler: this.handleListDeliveries.bind(this)
      }
    ];

    // 注册所有端点
    endpoints.forEach(endpoint => {
      const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
      this.app[method](endpoint.path, endpoint.handler);
    });

    // 静态文件服务
    this.app.use('/static', express.static('public'));
    
    // 主页面
    this.app.get('/', (req, res) => {
      res.sendFile('lao_ruan_interface.html', { root: './src' });
    });
  }

  private setupWebSocketServer() {
    // 创建WebSocket服务器
    this.wss = new WebSocketServer({ port: 8081 });
    
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      this.connectedClients.add(ws);
      
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data);
      });
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.connectedClients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.connectedClients.delete(ws);
      });
      
      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected to RanJok Independent Station',
        timestamp: Date.now()
      }));
    });
  }

  private handleWebSocketMessage(ws: WebSocket, data: Buffer | string) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe_updates':
          // 订阅更新
          ws.send(JSON.stringify({
            type: 'subscription_confirmed',
            subscriptions: ['workflow_updates', 'delivery_status', 'revenue_updates']
          }));
          break;
          
        case 'request_status':
          // 状态请求
          this.sendStatusUpdate(ws);
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type',
            receivedType: message.type
          }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  }

  private sendStatusUpdate(ws: WebSocket) {
    const status = {
      type: 'status_update',
      timestamp: Date.now(),
      data: {
        activeDeliveries: this.deliveryQueue.size,
        connectedClients: this.connectedClients.size,
        systemHealth: 'operational'
      }
    };
    
    ws.send(JSON.stringify(status));
  }

  // 广播消息给所有连接的客户端
  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // API处理器实现
  private async handleHealthCheck(req: any, res: any) {
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      services: {
        posterDesigner: 'operational',
        videoEditor: 'operational',
        monetizationEngine: 'operational',
        artisticMCP: 'operational'
      }
    });
  }

  private async handleCreatePoster(req: any, res: any) {
    try {
      const deliveryId = `poster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 创建交付请求
      const deliveryRequest: DeliveryRequest = {
        id: deliveryId,
        type: 'poster',
        payload: req.body,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.deliveryQueue.set(deliveryId, deliveryRequest);
      
      // 异步处理
      this.processPosterDelivery(deliveryRequest);
      
      res.json({
        success: true,
        deliveryId,
        message: '海报创建请求已提交，正在处理中',
        estimatedTime: '30-60秒'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async processPosterDelivery(request: DeliveryRequest) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      const result = await posterDesigner.generatePoster(request.payload);
      
      request.status = 'completed';
      request.result = result;
      
      this.broadcastDeliveryUpdate(request);
      
    } catch (error) {
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleBatchCreatePosters(req: any, res: any) {
    try {
      const configs = req.body.configs;
      const deliveryId = `batch_poster_${Date.now()}`;
      
      const deliveryRequest: DeliveryRequest = {
        id: deliveryId,
        type: 'poster',
        payload: { configs, batch: true },
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.deliveryQueue.set(deliveryId, deliveryRequest);
      
      // 异步批量处理
      this.processBatchPosterDelivery(deliveryRequest, configs);
      
      res.json({
        success: true,
        deliveryId,
        message: `批量海报创建请求已提交 (${configs.length} 个海报)`,
        estimatedTime: `${configs.length * 30}-${configs.length * 60}秒`
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async processBatchPosterDelivery(request: DeliveryRequest, configs: any[]) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      const result = await posterDesigner.batchGeneratePosters(configs);
      
      request.status = 'completed';
      request.result = result;
      
      this.broadcastDeliveryUpdate(request);
      
    } catch (error) {
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleGetPosterTemplates(req: any, res: any) {
    try {
      // 模拟获取模板列表
      const templates = [
        { id: 'modern-minimal', name: '现代简约', category: 'business' },
        { id: 'business-pro', name: '商务专业', category: 'business' },
        { id: 'creative-bold', name: '创意大胆', category: 'creative' },
        { id: 'elegant-classic', name: '优雅经典', category: 'elegant' }
      ];
      
      res.json({
        success: true,
        templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleCreateVideo(req: any, res: any) {
    try {
      const deliveryId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deliveryRequest: DeliveryRequest = {
        id: deliveryId,
        type: 'video',
        payload: req.body,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.deliveryQueue.set(deliveryId, deliveryRequest);
      
      // 异步处理视频
      this.processVideoDelivery(deliveryRequest);
      
      res.json({
        success: true,
        deliveryId,
        message: '视频剪辑请求已提交，正在处理中',
        estimatedTime: '2-5分钟'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async processVideoDelivery(request: DeliveryRequest) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      const result = await videoEditor.generateVideo(request.payload);
      
      request.status = 'completed';
      request.result = result;
      
      this.broadcastDeliveryUpdate(request);
      
    } catch (error) {
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleBatchCreateVideos(req: any, res: any) {
    try {
      const configs = req.body.configs;
      const deliveryId = `batch_video_${Date.now()}`;
      
      const deliveryRequest: DeliveryRequest = {
        id: deliveryId,
        type: 'video',
        payload: { configs, batch: true },
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.deliveryQueue.set(deliveryId, deliveryRequest);
      
      // 异步批量处理
      this.processBatchVideoDelivery(deliveryRequest, configs);
      
      res.json({
        success: true,
        deliveryId,
        message: `批量视频创建请求已提交 (${configs.length} 个视频)`,
        estimatedTime: `${configs.length * 2}-${configs.length * 5}分钟`
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async processBatchVideoDelivery(request: DeliveryRequest, configs: any[]) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      const result = await videoEditor.batchGenerateVideos(configs);
      
      request.status = 'completed';
      request.result = result;
      
      this.broadcastDeliveryUpdate(request);
      
    } catch (error) {
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleOptimizeVideo(req: any, res: any) {
    try {
      const suggestions = await videoEditor.getVideoOptimizationSuggestions(req.body);
      res.json({
        success: true,
        suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleStartMonetization(req: any, res: any) {
    try {
      const deliveryId = `monetization_${Date.now()}`;
      
      const deliveryRequest: DeliveryRequest = {
        id: deliveryId,
        type: 'monetization',
        payload: req.body,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.deliveryQueue.set(deliveryId, deliveryRequest);
      
      // 异步处理变现策略
      this.processMonetizationDelivery(deliveryRequest);
      
      res.json({
        success: true,
        deliveryId,
        message: '变现策略启动请求已提交',
        estimatedTime: '1-2分钟'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async processMonetizationDelivery(request: DeliveryRequest) {
    try {
      request.status = 'processing';
      this.broadcastDeliveryUpdate(request);
      
      const result = await monetizationEngine.startAutoMonetization(request.payload);
      
      request.status = 'completed';
      request.result = result;
      
      this.broadcastDeliveryUpdate(request);
      
    } catch (error) {
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.broadcastDeliveryUpdate(request);
    }
  }

  private async handleGetRevenue(req: any, res: any) {
    try {
      const revenue = await monetizationEngine.trackRevenue();
      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleGetPlatforms(req: any, res: any) {
    try {
      const platforms = monetizationEngine.getPlatforms();
      res.json({
        success: true,
        platforms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleCreateWorkflow(req: any, res: any) {
    try {
      const result = await artisticMCP.startCreativeWorkflow(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleGetWorkflowStatus(req: any, res: any) {
    try {
      const workflowId = req.params.id;
      const workflow = artisticMCP.getWorkflowStatus(workflowId);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }
      
      res.json({
        success: true,
        workflow
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleListWorkflows(req: any, res: any) {
    try {
      const workflows = artisticMCP.listWorkflows();
      res.json({
        success: true,
        workflows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleOptimizeContent(req: any, res: any) {
    try {
      const result = await artisticMCP.optimizeContentPerformance(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleSyncStatus(req: any, res: any) {
    try {
      res.json({
        success: true,
        sync: {
          enabled: this.config.enableRealTimeSync,
          connectedClients: this.connectedClients.size,
          activeDeliveries: this.deliveryQueue.size,
          lastUpdate: Date.now()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleGetDeliveryStatus(req: any, res: any) {
    try {
      const deliveryId = req.params.id;
      const delivery = this.deliveryQueue.get(deliveryId);
      
      if (!delivery) {
        return res.status(404).json({
          success: false,
          error: 'Delivery not found'
        });
      }
      
      res.json({
        success: true,
        delivery: {
          id: delivery.id,
          type: delivery.type,
          status: delivery.status,
          timestamp: delivery.timestamp,
          result: delivery.result,
          error: delivery.error
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleListDeliveries(req: any, res: any) {
    try {
      const deliveries = Array.from(this.deliveryQueue.values()).map(delivery => ({
        id: delivery.id,
        type: delivery.type,
        status: delivery.status,
        timestamp: delivery.timestamp
      }));
      
      res.json({
        success: true,
        deliveries
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private broadcastDeliveryUpdate(request: DeliveryRequest) {
    const update = {
      type: 'delivery_update',
      deliveryId: request.id,
      status: request.status,
      timestamp: Date.now(),
      result: request.result,
      error: request.error
    };
    
    this.broadcast(update);
  }

  // 剪映MCP相关处理方法
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
      
      this.processJianYingWorkflow(deliveryRequest);
      
      res.json({
        success: true,
        deliveryId,
        message: '剪映MCP专业工作流已启动',
        estimatedTime: '3-8分钟',
        workflowType: 'enhanced_jianying'
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
      
      if (!jianYingMCP.isReady()) {
        await jianYingMCP.startMCPServer();
      }
      
      const result = await enhancedVideoEditor.generateVideoWithJianYing({
        ...request.payload,
        includeCaptions: true,
        includeIntro: true,
        includeOutro: true
      });
      
      request.status = 'completed';
      request.result = {
        ...result,
        processingMethod: 'Enhanced JianYing MCP Workflow'
      };
      
      this.broadcastDeliveryUpdate(request);
      
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

  // 启动服务器
  public start(port: number = 3000) {
    this.server = this.app.listen(port, () => {
      console.log(`🚀 RanJok Independent Station Portal running on port ${port}`);
      console.log(`📡 WebSocket server running on port 8081`);
      console.log(`🌐 Web interface: http://localhost:${port}`);
      console.log(`📚 API documentation: http://localhost:${port}/api-docs`);
    });
    
    return this.server;
  }

  // 停止服务器
  public stop() {
    if (this.server) {
      this.server.close();
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

// 使用示例和导出
export { IndependentStationPortal, type CyberDeliveryConfig, type DeliveryRequest };

// 创建默认配置
const defaultConfig: CyberDeliveryConfig = {
  apiKey: process.env.RANJOK_API_KEY || 'ranjok_2024_api_key_default',
  maxRequestsPerHour: 1000,
  allowedOrigins: ['*'], // 生产环境应该限制特定域名
  enableRealTimeSync: true,
  webhookUrl: process.env.WEBHOOK_URL
};

// 创建服务器实例
export const independentStation = new IndependentStationPortal(defaultConfig);

// 如果直接运行此文件，启动服务器
if (import.meta.main) {
  console.log('🚀 启动 RanJok 独立站门户服务...\n');
  independentStation.start(3000);
}