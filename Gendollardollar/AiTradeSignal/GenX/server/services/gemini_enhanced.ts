
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
  technicalIndicators?: {
    rsi?: number;
    macd?: string;
    sma?: number;
    volume?: string;
  };
}

interface MarketAnalysis {
  overall_sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  key_levels: {
    support: number[];
    resistance: number[];
  };
  volume_analysis: string;
  trend_direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  risk_factors: string[];
}

export class GeminiEnhancedAI {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateAdvancedTradingSignal(
    symbol: string, 
    marketData: any[], 
    indicators: any,
    economicData?: any
  ): Promise<TradingSignal> {
    try {
      const prompt = `
        As an expert AI trading analyst for Historymaker-1, analyze the following data and generate a comprehensive trading signal:
        
        SYMBOL: ${symbol}
        
        RECENT PRICE DATA:
        ${JSON.stringify(marketData.slice(-20), null, 2)}
        
        TECHNICAL INDICATORS:
        ${JSON.stringify(indicators, null, 2)}
        
        ${economicData ? `ECONOMIC DATA:\n${JSON.stringify(economicData, null, 2)}` : ''}
        
        ANALYSIS REQUIREMENTS:
        1. Multi-timeframe analysis (1H, 4H, 1D)
        2. Smart Money Concepts (SMC) - Order Blocks, Fair Value Gaps, Break of Structure
        3. Candlestick pattern recognition
        4. Volume analysis and liquidity zones
        5. Risk management with proper R:R ratios
        6. Market sentiment and economic impact
        
        Provide your analysis in JSON format:
        {
          "symbol": "${symbol}",
          "action": "buy|sell|hold",
          "confidence": number (0 to 1),
          "reasoning": "Detailed explanation with SMC and technical analysis",
          "targetPrice": number,
          "stopLoss": number,
          "takeProfit": number,
          "riskLevel": "LOW|MEDIUM|HIGH",
          "timeframe": "suggested timeframe for trade",
          "technicalIndicators": {
            "rsi": number,
            "macd": "bullish|bearish|neutral",
            "sma": number,
            "volume": "high|normal|low"
          }
        }
        
        Focus on high-probability setups with clear entry/exit points.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating advanced trading signal:', error);
      throw error;
    }
  }

  async performMarketAnalysis(symbols: string[], marketConditions: any): Promise<MarketAnalysis> {
    try {
      const prompt = `
        Perform a comprehensive market analysis for the following symbols: ${symbols.join(', ')}
        
        Current Market Conditions:
        ${JSON.stringify(marketConditions, null, 2)}
        
        Provide analysis in JSON format:
        {
          "overall_sentiment": "BULLISH|BEARISH|NEUTRAL",
          "key_levels": {
            "support": [numbers],
            "resistance": [numbers]
          },
          "volume_analysis": "description",
          "trend_direction": "UP|DOWN|SIDEWAYS",
          "risk_factors": ["factor1", "factor2", ...]
        }
        
        Consider:
        - VIX levels and market volatility
        - Economic indicators impact
        - Sector rotation patterns
        - Institutional flow analysis
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid market analysis response');
    } catch (error) {
      console.error('Error performing market analysis:', error);
      throw error;
    }
  }

  async generatePortfolioRecommendations(
    currentPositions: any[], 
    riskProfile: string,
    marketConditions: any
  ): Promise<any> {
    try {
      const prompt = `
        As Historymaker-1 portfolio manager, analyze current positions and provide recommendations:
        
        CURRENT POSITIONS:
        ${JSON.stringify(currentPositions, null, 2)}
        
        RISK PROFILE: ${riskProfile}
        
        MARKET CONDITIONS:
        ${JSON.stringify(marketConditions, null, 2)}
        
        Provide recommendations in JSON format:
        {
          "portfolio_health": "EXCELLENT|GOOD|FAIR|POOR",
          "recommended_actions": [
            {
              "action": "BUY|SELL|HOLD|REDUCE",
              "symbol": "string",
              "reasoning": "string",
              "urgency": "HIGH|MEDIUM|LOW"
            }
          ],
          "risk_assessment": "string",
          "diversification_score": number (0-100),
          "suggested_allocations": {
            "stocks": number,
            "crypto": number,
            "cash": number
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid portfolio recommendation response');
    } catch (error) {
      console.error('Error generating portfolio recommendations:', error);
      throw error;
    }
  }

  async analyzeNewsImpact(newsData: any[], symbols: string[]): Promise<any> {
    try {
      const prompt = `
        Analyze the impact of recent news on trading positions for symbols: ${symbols.join(', ')}
        
        NEWS DATA:
        ${JSON.stringify(newsData, null, 2)}
        
        Provide impact analysis in JSON format:
        {
          "overall_impact": "POSITIVE|NEGATIVE|NEUTRAL",
          "symbol_impacts": [
            {
              "symbol": "string",
              "impact": "POSITIVE|NEGATIVE|NEUTRAL",
              "confidence": number (0-1),
              "reasoning": "string",
              "recommended_action": "BUY|SELL|HOLD|MONITOR"
            }
          ],
          "market_sentiment_shift": "string",
          "time_sensitivity": "IMMEDIATE|SHORT_TERM|LONG_TERM"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid news analysis response');
    } catch (error) {
      console.error('Error analyzing news impact:', error);
      throw error;
    }
  }

  async optimizeRiskManagement(
    currentRisk: number, 
    marketVolatility: number, 
    positions: any[]
  ): Promise<any> {
    try {
      const prompt = `
        Optimize risk management for Historymaker-1 trading system:
        
        CURRENT RISK LEVEL: ${currentRisk}%
        MARKET VOLATILITY: ${marketVolatility}
        POSITIONS: ${JSON.stringify(positions, null, 2)}
        
        Provide risk optimization in JSON format:
        {
          "recommended_risk_level": number,
          "position_adjustments": [
            {
              "symbol": "string",
              "current_size": number,
              "recommended_size": number,
              "reasoning": "string"
            }
          ],
          "stop_loss_adjustments": [
            {
              "symbol": "string",
              "current_stop": number,
              "recommended_stop": number
            }
          ],
          "diversification_improvements": ["suggestion1", "suggestion2"],
          "emergency_actions": ["action1", "action2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid risk management response');
    } catch (error) {
      console.error('Error optimizing risk management:', error);
      throw error;
    }
  }
}

export default GeminiEnhancedAI;
