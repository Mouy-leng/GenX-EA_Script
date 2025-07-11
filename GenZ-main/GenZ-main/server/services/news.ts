import axios from "axios";
import { storage } from "../storage";
import { aiService } from "./ai";
import { type InsertEconomicNews } from "@shared/schema";

export interface NewsArticle {
  headline: string;
  summary?: string;
  source: string;
  publishedAt: Date;
  impact: "HIGH" | "MEDIUM" | "LOW";
  currency?: string;
  category: string;
  url?: string;
  sentiment?: number;
}

export class NewsService {
  private newsApiKey = process.env.NEWS_API_KEY || process.env.NEWS_API_KEY_ENV_VAR || "demo";
  private economicCalendarKey = process.env.ECONOMIC_CALENDAR_API_KEY || process.env.ECONOMIC_CALENDAR_KEY || "demo";

  async fetchEconomicNews(): Promise<NewsArticle[]> {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'economic OR forex OR "federal reserve" OR "central bank" OR GDP OR inflation',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: this.newsApiKey
        }
      });

      const articles: NewsArticle[] = [];
      
      for (const article of response.data.articles) {
        if (!article.title || !article.source?.name) continue;

        // Analyze news impact using AI
        const analysis = await aiService.analyzeNews(
          article.title,
          article.description || article.content || ""
        );

        const newsArticle: NewsArticle = {
          headline: article.title,
          summary: article.description,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt),
          impact: analysis.impact.toUpperCase() as "HIGH" | "MEDIUM" | "LOW",
          category: this.categorizeNews(article.title),
          url: article.url,
          sentiment: analysis.sentiment,
          currency: analysis.affectedCurrencies[0] // Take first affected currency
        };

        articles.push(newsArticle);

        // Store in database
        await storage.insertEconomicNews({
          headline: newsArticle.headline,
          summary: newsArticle.summary,
          source: newsArticle.source,
          publishedAt: newsArticle.publishedAt,
          impact: newsArticle.impact,
          currency: newsArticle.currency,
          category: newsArticle.category,
          url: newsArticle.url,
          sentiment: newsArticle.sentiment?.toString()
        });
      }

      return articles;
    } catch (error) {
      console.error('Failed to fetch economic news:', error);
      return this.getMockNews(); // Fallback to mock data
    }
  }

  async fetchForexNews(): Promise<NewsArticle[]> {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'forex OR "foreign exchange" OR EUR OR USD OR GBP OR JPY OR "currency market"',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 15,
          apiKey: this.newsApiKey
        }
      });

      const articles: NewsArticle[] = [];
      
      for (const article of response.data.articles) {
        if (!article.title || !article.source?.name) continue;

        const analysis = await aiService.analyzeNews(
          article.title,
          article.description || article.content || ""
        );

        articles.push({
          headline: article.title,
          summary: article.description,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt),
          impact: analysis.impact.toUpperCase() as "HIGH" | "MEDIUM" | "LOW",
          category: "Forex",
          url: article.url,
          sentiment: analysis.sentiment,
          currency: analysis.affectedCurrencies[0]
        });
      }

      return articles;
    } catch (error) {
      console.error('Failed to fetch forex news:', error);
      return [];
    }
  }

  async getEconomicCalendar(): Promise<any[]> {
    try {
      // This would integrate with economic calendar APIs like ForexFactory or similar
      const mockEvents = [
        {
          time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          event: "Fed Interest Rate Decision",
          currency: "USD",
          impact: "HIGH",
          forecast: "5.25%",
          previous: "5.25%"
        },
        {
          time: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          event: "ECB Press Conference",
          currency: "EUR",
          impact: "HIGH",
          forecast: "",
          previous: ""
        },
        {
          time: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
          event: "UK GDP (QoQ)",
          currency: "GBP",
          impact: "MEDIUM",
          forecast: "0.3%",
          previous: "0.2%"
        }
      ];

      return mockEvents;
    } catch (error) {
      console.error('Failed to fetch economic calendar:', error);
      return [];
    }
  }

  private categorizeNews(headline: string): string {
    const lowerHeadline = headline.toLowerCase();
    
    if (lowerHeadline.includes('fed') || lowerHeadline.includes('federal reserve')) {
      return 'Monetary Policy';
    }
    if (lowerHeadline.includes('gdp') || lowerHeadline.includes('growth')) {
      return 'Economic Growth';
    }
    if (lowerHeadline.includes('inflation') || lowerHeadline.includes('cpi')) {
      return 'Inflation';
    }
    if (lowerHeadline.includes('employment') || lowerHeadline.includes('jobs')) {
      return 'Employment';
    }
    if (lowerHeadline.includes('trade') || lowerHeadline.includes('tariff')) {
      return 'Trade';
    }
    
    return 'General Economic';
  }

  private getMockNews(): NewsArticle[] {
    return [
      {
        headline: "Fed Officials Signal Potential Rate Cuts in Q2 2024",
        summary: "Federal Reserve officials hint at possible interest rate reductions following inflation data",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        impact: "HIGH",
        currency: "USD",
        category: "Monetary Policy",
        sentiment: 0.3
      },
      {
        headline: "European Markets Rally on Positive GDP Data",
        summary: "European equities surge as eurozone GDP beats expectations",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        impact: "MEDIUM",
        currency: "EUR",
        category: "Economic Growth",
        sentiment: 0.7
      },
      {
        headline: "Oil Prices Steady Ahead of OPEC+ Meeting",
        summary: "Crude oil futures remain stable as traders await production decisions",
        source: "MarketWatch",
        publishedAt: new Date(Date.now() - 32 * 60 * 1000), // 32 minutes ago
        impact: "LOW",
        category: "Commodities",
        sentiment: 0.1
      }
    ];
  }

  async processNewsForNotifications(userId: number): Promise<void> {
    try {
      const news = await this.fetchEconomicNews();
      const highImpactNews = news.filter(n => n.impact === "HIGH");

      for (const article of highImpactNews) {
        await storage.createNotification({
          userId,
          type: "news",
          title: "High Impact News Alert",
          message: article.headline,
          priority: "high",
          data: {
            source: article.source,
            currency: article.currency,
            impact: article.impact,
            url: article.url
          }
        });
      }
    } catch (error) {
      console.error('Failed to process news for notifications:', error);
    }
  }
}

export const newsService = new NewsService();
