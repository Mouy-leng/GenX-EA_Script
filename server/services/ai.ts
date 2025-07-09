import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { storage } from '../storage';
import type { MarketData, InsertTradingSignal } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || '' 
});

const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export class AIService {
  async analyzeMarketData(marketData: MarketData[]): Promise<InsertTradingSignal[]> {
    const signals: InsertTradingSignal[] = [];
    
    for (const data of marketData) {
      try {
        const signal = await this.generateSignalForSymbol(data);
        if (signal) {
          signals.push(signal);
          await storage.createSystemLog({
            level: 'INFO',
            message: `AI signal generated for ${data.symbol}: ${signal.signal}`,
            service: 'ai',
            metadata: { symbol: data.symbol, confidence: signal.confidence },
          });
        }
      } catch (error) {
        console.error(`Error generating signal for ${data.symbol}:`, error);
        await storage.createSystemLog({
          level: 'ERROR',
          message: `Failed to generate AI signal for ${data.symbol}: ${error}`,
          service: 'ai',
          metadata: { symbol: data.symbol },
        });
      }
    }
    
    return signals;
  }

  private async generateSignalForSymbol(data: MarketData): Promise<InsertTradingSignal | null> {
    const prompt = `
    Analyze the following cryptocurrency market data and generate a trading signal:
    
    Symbol: ${data.symbol}
    Current Price: $${data.price}
    24h Change: ${data.changePercent24h}%
    Volume: ${data.volume}
    24h High: $${data.high24h}
    24h Low: $${data.low24h}
    
    Based on this data, provide a trading signal with the following JSON structure:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": 0.0-1.0,
      "reasoning": "Brief explanation of the signal",
      "entryPrice": number,
      "targetPrice": number,
      "stopLoss": number
    }
    
    Consider technical indicators, market sentiment, and risk factors. Only recommend BUY/SELL if confidence is above 0.7.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cryptocurrency trader and technical analyst. Provide accurate and conservative trading signals based on market data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      if (result.signal && result.confidence >= 0.6) {
        return {
          symbol: data.symbol,
          signal: result.signal,
          confidence: result.confidence,
          entryPrice: result.entryPrice || data.price,
          targetPrice: result.targetPrice || null,
          stopLoss: result.stopLoss || null,
          aiReasoning: result.reasoning,
          technicalIndicators: {
            price: data.price,
            volume: data.volume,
            change24h: data.changePercent24h,
            high24h: data.high24h,
            low24h: data.low24h,
          },
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error generating OpenAI signal:', error);
      return await this.generateGeminiSignal(data);
    }
  }

  private async generateGeminiSignal(data: MarketData): Promise<InsertTradingSignal | null> {
    try {
      const prompt = `
      Analyze this cryptocurrency data and provide a trading signal:
      Symbol: ${data.symbol}, Price: $${data.price}, Change: ${data.changePercent24h}%
      
      Respond with JSON: {"signal": "BUY/SELL/HOLD", "confidence": 0.0-1.0, "reasoning": "explanation", "entryPrice": number, "targetPrice": number, "stopLoss": number}
      `;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              signal: { type: 'string' },
              confidence: { type: 'number' },
              reasoning: { type: 'string' },
              entryPrice: { type: 'number' },
              targetPrice: { type: 'number' },
              stopLoss: { type: 'number' },
            },
            required: ['signal', 'confidence', 'reasoning', 'entryPrice'],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.signal && result.confidence >= 0.6) {
        return {
          symbol: data.symbol,
          signal: result.signal,
          confidence: result.confidence,
          entryPrice: result.entryPrice || data.price,
          targetPrice: result.targetPrice || null,
          stopLoss: result.stopLoss || null,
          aiReasoning: result.reasoning,
          technicalIndicators: {
            price: data.price,
            volume: data.volume,
            change24h: data.changePercent24h,
            high24h: data.high24h,
            low24h: data.low24h,
          },
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error generating Gemini signal:', error);
      return null;
    }
  }

  async analyzePatterns(marketData: MarketData[]): Promise<{
    patterns: string[];
    recommendations: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    const prompt = `
    Analyze the following market data for pattern recognition:
    ${marketData.map(d => `${d.symbol}: $${d.price} (${d.changePercent24h}%)`).join('\n')}
    
    Identify patterns and provide recommendations in JSON format:
    {
      "patterns": ["list of identified patterns"],
      "recommendations": ["list of trading recommendations"],
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a pattern recognition expert for cryptocurrency markets.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return {
        patterns: [],
        recommendations: [],
        riskLevel: 'HIGH',
      };
    }
  }
}

export const aiService = new AIService();
