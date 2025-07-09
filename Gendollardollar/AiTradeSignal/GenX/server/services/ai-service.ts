import { TradingSignal, MarketData, NewsItem } from "@shared/trading-schema";
import OpenAI from "openai";

export class AIService {
  private openai: OpenAI;
  private geminiApiKey: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    this.geminiApiKey = process.env.GEMINI_API_KEY || "";
  }

  // Generate trading signal using AI analysis
  async generateTradingSignal(
    symbol: string, 
    marketData: MarketData, 
    newsData: NewsItem[]
  ): Promise<TradingSignal | null> {
    try {
      const newsContext = newsData.map(item => 
        `${item.title}: ${item.description} (Sentiment: ${item.sentiment})`
      ).join("\n");

      const prompt = `
        Analyze the following market data and news for ${symbol}:
        
        Market Data:
        - Current Price: $${marketData.price}
        - Change: ${marketData.changePercent}%
        - Volume: ${marketData.volume}
        - High: $${marketData.high}
        - Low: $${marketData.low}
        
        Recent News:
        ${newsContext}
        
        Based on this information, provide a trading recommendation with:
        1. Action (BUY/SELL/HOLD)
        2. Confidence level (0-1)
        3. Stop loss level
        4. Take profit level
        5. Reasoning
        
        Respond in JSON format with these fields: action, confidence, stopLoss, takeProfit, reasoning
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert financial analyst and trading advisor. Provide accurate, data-driven trading recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const analysis = response.choices[0].message.content;
      if (!analysis) return null;

      // Parse the AI response
      const parsedAnalysis = JSON.parse(analysis);
      
      const signal: TradingSignal = {
        id: `signal-${Date.now()}`,
        symbol,
        action: parsedAnalysis.action,
        price: marketData.price,
        confidence: parsedAnalysis.confidence,
        stopLoss: parsedAnalysis.stopLoss,
        takeProfit: parsedAnalysis.takeProfit,
        lotSize: this.calculateLotSize(parsedAnalysis.confidence),
        timestamp: new Date(),
        source: "AI",
        reasoning: parsedAnalysis.reasoning,
        platform: "BYBIT",
        status: "PENDING"
      };

      return signal;
    } catch (error) {
      console.error("Error generating AI trading signal:", error);
      return null;
    }
  }

  // Analyze market sentiment from news
  async analyzeMarketSentiment(newsItems: NewsItem[]): Promise<{
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    confidence: number;
    summary: string;
  }> {
    try {
      const newsText = newsItems.map(item => item.title + ": " + item.description).join("\n");
      
      const prompt = `
        Analyze the market sentiment from the following news items:
        
        ${newsText}
        
        Provide:
        1. Overall sentiment (POSITIVE/NEGATIVE/NEUTRAL)
        2. Confidence level (0-1)
        3. Brief summary of key factors
        
        Respond in JSON format with fields: sentiment, confidence, summary
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a market sentiment analyst. Analyze news and provide accurate sentiment assessments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2
      });

      const analysis = response.choices[0].message.content;
      if (!analysis) {
        return { sentiment: "NEUTRAL", confidence: 0.5, summary: "Unable to analyze sentiment" };
      }

      return JSON.parse(analysis);
    } catch (error) {
      console.error("Error analyzing market sentiment:", error);
      return { sentiment: "NEUTRAL", confidence: 0.5, summary: "Error analyzing sentiment" };
    }
  }

  // Calculate optimal lot size based on confidence
  private calculateLotSize(confidence: number): number {
    // Simple risk management: higher confidence = larger position size
    if (confidence >= 0.8) return 0.1;
    if (confidence >= 0.6) return 0.05;
    if (confidence >= 0.4) return 0.02;
    return 0.01;
  }

  // Get market analysis using Gemini API
  async getGeminiAnalysis(symbol: string, marketData: MarketData): Promise<string> {
    try {
      // This would integrate with Google's Gemini API
      // For now, return a placeholder
      return `Gemini analysis for ${symbol}: Based on current price of $${marketData.price} and recent market trends, the symbol shows ${marketData.changePercent > 0 ? 'positive' : 'negative'} momentum.`;
    } catch (error) {
      console.error("Error getting Gemini analysis:", error);
      return "Unable to get Gemini analysis";
    }
  }
}