import { v4 as uuidv4 } from 'uuid';

interface PosterTemplate {
  id: string;
  name: string;
  category: string;
  elements: PosterElement[];
  dimensions: { width: number; height: number };
}

interface PosterElement {
  type: 'text' | 'image' | 'shape' | 'background';
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
}

interface AutoPosterConfig {
  title: string;
  subtitle?: string;
  mainImage?: string;
  brandColors: string[];
  style: 'modern' | 'vintage' | 'minimal' | 'bold' | 'elegant';
  template?: string;
}

class RanJokPosterDesigner {
  private templates: PosterTemplate[] = [];
  private aiApiKey?: string;

  constructor(aiApiKey?: string) {
    this.aiApiKey = aiApiKey;
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // 现代简约模板
    this.templates.push({
      id: 'modern-minimal',
      name: '现代简约',
      category: 'business',
      dimensions: { width: 1080, height: 1350 },
      elements: [
        {
          type: 'background',
          id: 'bg-1',
          position: { x: 0, y: 0 },
          size: { width: 1080, height: 1350 },
          properties: { 
            gradient: ['#667eea', '#764ba2'],
            opacity: 1 
          }
        },
        {
          type: 'text',
          id: 'title-1',
          position: { x: 60, y: 200 },
          size: { width: 960, height: 120 },
          properties: {
            fontSize: 48,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'left',
            fontFamily: 'PingFang SC'
          }
        },
        {
          type: 'text',
          id: 'subtitle-1',
          position: { x: 60, y: 350 },
          size: { width: 960, height: 80 },
          properties: {
            fontSize: 24,
            fontWeight: 'normal',
            color: '#ffffff',
            opacity: 0.8,
            textAlign: 'left'
          }
        },
        {
          type: 'shape',
          id: 'decoration-1',
          position: { x: 60, y: 450 },
          size: { width: 200, height: 4 },
          properties: {
            fill: '#ff6b6b',
            borderRadius: 2
          }
        }
      ]
    });

    // 商务专业模板
    this.templates.push({
      id: 'business-pro',
      name: '商务专业',
      category: 'business',
      dimensions: { width: 1080, height: 1350 },
      elements: [
        {
          type: 'background',
          id: 'bg-2',
          position: { x: 0, y: 0 },
          size: { width: 1080, height: 1350 },
          properties: { 
            gradient: ['#2c3e50', '#34495e'],
            opacity: 1 
          }
        },
        {
          type: 'shape',
          id: 'header-bg',
          position: { x: 0, y: 0 },
          size: { width: 1080, height: 400 },
          properties: {
            fill: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 0
          }
        },
        {
          type: 'text',
          id: 'title-2',
          position: { x: 80, y: 150 },
          size: { width: 920, height: 100 },
          properties: {
            fontSize: 42,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center'
          }
        }
      ]
    });
  }

  async generatePoster(config: AutoPosterConfig): Promise<{ figmaCommands: string[], previewUrl?: string }> {
    const template = this.selectTemplate(config);
    const figmaCommands = this.generateFigmaCommands(template, config);
    
    return {
      figmaCommands,
      previewUrl: this.generatePreviewUrl(config)
    };
  }

  private selectTemplate(config: AutoPosterConfig): PosterTemplate {
    if (config.template) {
      const found = this.templates.find(t => t.id === config.template);
      if (found) return found;
    }

    // 基于风格自动选择模板
    switch (config.style) {
      case 'modern':
      case 'minimal':
        return this.templates.find(t => t.id === 'modern-minimal')!;
      case 'bold':
      case 'elegant':
        return this.templates.find(t => t.id === 'business-pro')!;
      default:
        return this.templates[0];
    }
  }

  private generateFigmaCommands(template: PosterTemplate, config: AutoPosterConfig): string[] {
    const commands: string[] = [];
    const frameId = uuidv4();

    // 创建主框架
    commands.push(`create_frame(${template.dimensions.width}, ${template.dimensions.height}, 0, 0, "RanJok_Poster_${Date.now()}")`);

    // 为每个元素生成Figma命令
    template.elements.forEach(element => {
      switch (element.type) {
        case 'background':
          this.addBackgroundCommands(commands, element, config);
          break;
        case 'text':
          this.addTextCommands(commands, element, config);
          break;
        case 'shape':
          this.addShapeCommands(commands, element, config);
          break;
      }
    });

    return commands;
  }

  private addBackgroundCommands(commands: string[], element: PosterElement, config: AutoPosterConfig) {
    const rectId = `bg_${Date.now()}`;
    commands.push(`create_rectangle(${element.size.width}, ${element.size.height}, ${element.position.x}, ${element.position.y}, "${rectId}")`);
    
    if (element.properties.gradient) {
      // 使用品牌色彩或默认渐变
      const colors = config.brandColors.length >= 2 ? config.brandColors : element.properties.gradient;
      commands.push(`set_fill_color("${rectId}", "${colors[0]}")`);
    }
  }

  private addTextCommands(commands: string[], element: PosterElement, config: AutoPosterConfig) {
    let textContent = '';
    
    if (element.id.includes('title')) {
      textContent = config.title;
    } else if (element.id.includes('subtitle')) {
      textContent = config.subtitle || '让创意变现变得简单';
    }

    if (textContent) {
      const textId = `text_${Date.now()}`;
      commands.push(`create_text("${textContent}", ${element.position.x}, ${element.position.y}, "${textId}")`);
      commands.push(`set_text_properties("${textId}", ${element.properties.fontSize}, "${element.properties.color}", "${element.properties.fontFamily || 'PingFang SC'}")`);
    }
  }

  private addShapeCommands(commands: string[], element: PosterElement, config: AutoPosterConfig) {
    const shapeId = `shape_${Date.now()}`;
    commands.push(`create_rectangle(${element.size.width}, ${element.size.height}, ${element.position.x}, ${element.position.y}, "${shapeId}")`);
    
    if (element.properties.fill) {
      const color = config.brandColors[0] || element.properties.fill;
      commands.push(`set_fill_color("${shapeId}", "${color}")`);
    }

    if (element.properties.borderRadius) {
      commands.push(`set_corner_radius("${shapeId}", ${element.properties.borderRadius})`);
    }
  }

  private generatePreviewUrl(config: AutoPosterConfig): string {
    // 生成预览URL（实际实现中可能需要渲染服务）
    const params = new URLSearchParams({
      title: config.title,
      style: config.style,
      colors: config.brandColors.join(',')
    });
    
    return `/api/poster/preview?${params.toString()}`;
  }

  // 批量海报生成
  async batchGeneratePosters(configs: AutoPosterConfig[]): Promise<{ 
    results: Array<{ config: AutoPosterConfig; commands: string[]; success: boolean; error?: string }> 
  }> {
    const results = [];
    
    for (const config of configs) {
      try {
        const result = await this.generatePoster(config);
        results.push({
          config,
          commands: result.figmaCommands,
          success: true
        });
      } catch (error) {
        results.push({
          config,
          commands: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { results };
  }

  // AI增强设计建议
  async getAIDesignSuggestions(config: AutoPosterConfig): Promise<{
    colorSuggestions: string[];
    layoutSuggestions: string[];
    textSuggestions: { title?: string; subtitle?: string };
  }> {
    // 模拟AI建议（实际实现中会调用AI API）
    const suggestions = {
      colorSuggestions: this.generateColorSuggestions(config.style),
      layoutSuggestions: this.generateLayoutSuggestions(config.style),
      textSuggestions: this.generateTextSuggestions(config.title)
    };

    return suggestions;
  }

  private generateColorSuggestions(style: string): string[] {
    const colorSchemes = {
      modern: ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4'],
      vintage: ['#d4a574', '#8b5a3c', '#f4e4c1', '#6b4423'],
      minimal: ['#2c3e50', '#ecf0f1', '#3498db', '#e74c3c'],
      bold: ['#e74c3c', '#f39c12', '#9b59b6', '#2ecc71'],
      elegant: ['#34495e', '#95a5a6', '#bdc3c7', '#ecf0f1']
    };

    return colorSchemes[style as keyof typeof colorSchemes] || colorSchemes.modern;
  }

  private generateLayoutSuggestions(style: string): string[] {
    const layouts = {
      modern: ['左对齐标题', '分层设计', '简约线条装饰'],
      vintage: ['居中排版', '复古边框', '手写字体效果'],
      minimal: ['大量留白', '单色配色', '细线分割'],
      bold: ['大字标题', '对比色彩', '几何图形'],
      elegant: ['优雅字体', '金色装饰', '对称布局']
    };

    return layouts[style as keyof typeof layouts] || layouts.modern;
  }

  private generateTextSuggestions(title: string): { title?: string; subtitle?: string } {
    // 基于标题生成建议的副标题
    const subtitles = [
      '让创意变现变得简单',
      '专业 • 高效 • 智能',
      '开启您的创作之旅',
      '品质服务 值得信赖',
      '创新科技 引领未来'
    ];

    return {
      title: title.length > 20 ? title.substring(0, 18) + '...' : undefined,
      subtitle: subtitles[Math.floor(Math.random() * subtitles.length)]
    };
  }

  // 导出模板
  exportTemplate(templateId: string): PosterTemplate | null {
    return this.templates.find(t => t.id === templateId) || null;
  }

  // 添加自定义模板
  addCustomTemplate(template: Omit<PosterTemplate, 'id'>): string {
    const newTemplate: PosterTemplate = {
      ...template,
      id: uuidv4()
    };
    
    this.templates.push(newTemplate);
    return newTemplate.id;
  }
}

// 使用示例
export { RanJokPosterDesigner, type AutoPosterConfig, type PosterTemplate };

// 创建全局实例
export const posterDesigner = new RanJokPosterDesigner();