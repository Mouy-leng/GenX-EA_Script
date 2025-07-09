import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface MarketAnalysis {
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  summary: string;
  signals: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface NewsAnalysis {
  sentiment: number;
  impact: "low" | "medium" | "high";
  affectedCurrencies: string[];
  summary: string;
}

export interface TradingSignal {
  symbol: string;
  action: "buy" | "sell" | "hold";
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export class AIService {
  async analyzeMarketSentiment(marketData: any[], economicNews: any[]): Promise<MarketAnalysis> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        sentiment: 0,
        confidence: 0,
        summary: "AI analysis unavailable - OpenAI API key not configured",
        signals: [],
        riskLevel: "medium"
      };
    }

    try {
      const prompt = `
        Analyze the following market data and economic news to provide a comprehensive market sentiment analysis.
        
        Market Data: ${JSON.stringify(marketData.slice(-10))}
        Economic News: ${JSON.stringify(economicNews.slice(0, 5))}
        
        Provide analysis in the following JSON format:
        {
          "sentiment": number (-1 to 1, where -1 is very bearish, 1 is very bullish),
          "confidence": number (0 to 1),
          "summary": "Brief summary of market outlook",
          "signals": ["signal1", "signal2", "signal3"],
          "riskLevel": "low|medium|high"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert financial analyst specializing in forex and commodities trading. Analyze market data and provide actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sentiment: Math.max(-1, Math.min(1, analysis.sentiment || 0)),
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0)),
        summary: analysis.summary || "No analysis available",
        signals: analysis.signals || [],
        riskLevel: analysis.riskLevel || "medium"
      };
    } catch (error) {
      console.error("AI market analysis failed:", error);
      return {
        sentiment: 0,
        confidence: 0,
        summary: "Market analysis temporarily unavailable",
        signals: [],
        riskLevel: "medium"
      };
    }
  }

  async analyzeNews(headline: string, content: string): Promise<NewsAnalysis> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        sentiment: 0,
        impact: "low",
        affectedCurrencies: [],
        summary: "News analysis unavailable - OpenAI API key not configured"
      };
    }

    try {
      const prompt = `
        Analyze this economic news for trading impact:
        
        Headline: ${headline}
        Content: ${content}
        
        Provide analysis in JSON format:
        {
          "sentiment": number (-1 to 1),
          "impact": "low|medium|high",
          "affectedCurrencies": ["USD", "EUR", etc.],
          "summary": "Brief impact summary"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a financial news analyst. Analyze news impact on currency markets."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sentiment: Math.max(-1, Math.min(1, analysis.sentiment || 0)),
        impact: analysis.impact || "low",
        affectedCurrencies: analysis.affectedCurrencies || [],
        summary: analysis.summary || "No impact analysis available"
      };
    } catch (error) {
      console.error("AI news analysis failed:", error);
      return {
        sentiment: 0,
        impact: "low",
        affectedCurrencies: [],
        summary: "News analysis temporarily unavailable"
      };
    }
  }

  async generateTradingSignal(symbol: string, marketData: any[], indicators: any): Promise<TradingSignal> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        symbol,
        action: "hold",
        confidence: 0,
        reasoning: "Signal generation unavailable - OpenAI API key not configured"
      };
    }

    try {
      const prompt = `
        Generate a trading signal for ${symbol} based on the following data:
        
        Recent Price Data: ${JSON.stringify(marketData.slice(-20))}
        Technical Indicators: ${JSON.stringify(indicators)}
        
        Provide signal in JSON format:
        {
          "symbol": "${symbol}",
          "action": "buy|sell|hold",
          "confidence": number (0 to 1),
          "reasoning": "Explanation of the signal",
          "targetPrice": number (optional),
          "stopLoss": number (optional),
          "takeProfit": number (optional)
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert technical analyst. Generate precise trading signals with proper risk management."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const signal = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        symbol: signal.symbol || symbol,
        action: signal.action || "hold",
        confidence: Math.max(0, Math.min(1, signal.confidence || 0)),
        reasoning: signal.reasoning || "No signal analysis available",
        targetPrice: signal.targetPrice,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit
      };
    } catch (error) {
      console.error("AI signal generation failed:", error);
      return {
        symbol,
        action: "hold",
        confidence: 0,
        reasoning: "Signal generation temporarily unavailable"
      };
    }
  }

  async optimizeTradingBot(botPerformance: any, marketConditions: any): Promise<any> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        recommendations: [],
        parameterAdjustments: {},
        reasoning: "Bot optimization unavailable - OpenAI API key not configured"
      };
    }

    try {
      const prompt = `
        Optimize trading bot parameters based on performance and market conditions:
        
        Bot Performance: ${JSON.stringify(botPerformance)}
        Market Conditions: ${JSON.stringify(marketConditions)}
        
        Suggest optimizations in JSON format:
        {
          "recommendations": ["recommendation1", "recommendation2"],
          "parameterAdjustments": {
            "riskLevel": number,
            "positionSize": number,
            "stopLoss": number
          },
          "reasoning": "Explanation of optimizations"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trading bot optimization expert. Suggest improvements to maximize performance while managing risk."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("AI bot optimization failed:", error);
      return {
        recommendations: [],
        parameterAdjustments: {},
        reasoning: "Optimization temporarily unavailable"
      };
    }
  }
}

export const aiService = new AIService();