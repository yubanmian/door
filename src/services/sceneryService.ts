import { GoogleGenAI } from "@google/genai";
import { Scenery } from "../types";

const SCENES: Omit<Scenery, 'quote'>[] = [
  {
    id: 'fuji',
    name: '富士山',
    country: '日本',
    imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=1920&auto=format&fit=crop',
    lat: 35.3606,
    lng: 138.7274
  },
  {
    id: 'eiffel',
    name: '埃菲尔铁塔',
    country: '法国',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1920&auto=format&fit=crop',
    lat: 48.8584,
    lng: 2.2945
  },
  {
    id: 'uyuni',
    name: '乌尤尼盐沼',
    country: '玻利维亚',
    imageUrl: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=1920&auto=format&fit=crop',
    lat: -20.1338,
    lng: -67.4891
  },
  {
    id: 'santorini',
    name: '圣托里尼',
    country: '希腊',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1920&auto=format&fit=crop',
    lat: 36.3932,
    lng: 25.4615
  },
  {
    id: 'machu',
    name: '马丘比丘',
    country: '秘鲁',
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1920&auto=format&fit=crop',
    lat: -13.1631,
    lng: -72.545
  },
  {
    id: 'canyon',
    name: '科罗拉多大峡谷',
    country: '美国',
    imageUrl: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=1920&auto=format&fit=crop',
    lat: 36.0544,
    lng: -112.1401
  },
  {
    id: 'pyramid',
    name: '吉萨大金字塔',
    country: '埃及',
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1920&auto=format&fit=crop',
    lat: 29.9792,
    lng: 31.1342
  },
  {
    id: 'banff',
    name: '班夫国家公园',
    country: '加拿大',
    imageUrl: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=1920&auto=format&fit=crop',
    lat: 51.1784,
    lng: -115.5708
  },
  {
    id: 'taj',
    name: '泰姬陵',
    country: '印度',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920&auto=format&fit=crop',
    lat: 27.1751,
    lng: 78.0421
  },
  {
    id: 'venice',
    name: '威尼斯',
    country: '意大利',
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee2887ad8e?q=80&w=1920&auto=format&fit=crop',
    lat: 45.4408,
    lng: 12.3155
  },
  {
    id: 'petra',
    name: '佩特拉古城',
    country: '约旦',
    imageUrl: 'https://images.unsplash.com/photo-1579606052847-50a9fc2796e6?q=80&w=1920&auto=format&fit=crop',
    lat: 30.3285,
    lng: 35.4444
  },
  {
    id: 'greatbarrier',
    name: '大堡礁',
    country: '澳大利亚',
    imageUrl: 'https://images.unsplash.com/photo-1544257740-420427b38e07?q=80&w=1920&auto=format&fit=crop',
    lat: -18.2871,
    lng: 147.6992
  },
  {
    id: 'dubai',
    name: '哈利法塔',
    country: '阿联酋',
    imageUrl: 'https://images.unsplash.com/photo-1526495124232-a02e18494cd5?q=80&w=1920&auto=format&fit=crop',
    lat: 25.1972,
    lng: 55.2744
  },
  {
    id: 'bluelagoon',
    name: '蓝湖',
    country: '冰岛',
    imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1920&auto=format&fit=crop',
    lat: 63.8804,
    lng: -22.4495
  }
];

const FALLBACK_QUOTES = [
  "哪怕身处幽谷，也要记得仰望星空。",
  "世界是一本书，不旅行的人只读了其中一页。",
  "如果生活不够慷慨，我们就去创造浪漫。",
  "每个终点，都是一段新旅程的起点。",
  "既然来到人间，就要去看看最美的风景。",
  "有些事现在不做，一辈子都不会做了。"
];

export class SceneryService {
  private ai: GoogleGenAI;
  private seenIds: Set<string> = new Set();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async getRandomScenery(): Promise<Scenery> {
    const availableScenes = SCENES.filter(s => !this.seenIds.has(s.id));
    
    // Reset if all seen
    const pool = availableScenes.length > 0 ? availableScenes : SCENES;
    if (availableScenes.length === 0) this.seenIds.clear();

    const baseScene = pool[Math.floor(Math.random() * pool.length)];
    this.seenIds.add(baseScene.id);

    const quote = await this.getAIQuote(baseScene.name, baseScene.country);

    return {
      ...baseScene,
      quote
    };
  }

  private async getAIQuote(name: string, country: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `针对由于“任意门”穿越到的美景 [${name}, ${country}]，写一句15字以内的超级治愈、充满浪漫气息的文案（中文）。只需返回文案本身，不要包含其他解释、引号。`,
      });

      return response.text?.trim() || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    } catch (error) {
      console.error("Failed to generate AI quote:", error);
      return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    }
  }
}

export const sceneryService = new SceneryService();
