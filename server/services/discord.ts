import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import { storage } from '../storage';
import type { TradingSignal } from '@shared/schema';

export class DiscordService {
  private client: Client;
  private isConnected = false;
  private channelId: string;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.channelId = process.env.DISCORD_CHANNEL_ID || '';
    this.initialize();
  }

  private async initialize() {
    try {
      this.client.on('ready', () => {
        console.log(`Discord bot logged in as ${this.client.user?.tag}`);
        this.isConnected = true;
        this.updateBotStatus('active');
        this.logSystemEvent('INFO', 'Discord bot connected successfully');
      });

      this.client.on('error', (error) => {
        console.error('Discord client error:', error);
        this.isConnected = false;
        this.updateBotStatus('error');
        this.logSystemEvent('ERROR', `Discord bot error: ${error.message}`);
      });

      this.client.on('disconnect', () => {
        console.log('Discord bot disconnected');
        this.isConnected = false;
        this.updateBotStatus('inactive');
        this.logSystemEvent('WARN', 'Discord bot disconnected');
      });

      const token = process.env.DISCORD_BOT_TOKEN;
      if (token) {
        await this.client.login(token);
      } else {
        throw new Error('Discord bot token not provided');
      }
    } catch (error) {
      console.error('Error initializing Discord service:', error);
      this.updateBotStatus('error');
      this.logSystemEvent('ERROR', `Failed to initialize Discord service: ${error}`);
    }
  }

  async sendTradingSignal(signal: TradingSignal): Promise<boolean> {
    if (!this.isConnected || !this.channelId) {
      return false;
    }

    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
      if (!channel) {
        throw new Error('Channel not found');
      }

      const embed = this.createSignalEmbed(signal);
      await channel.send({ embeds: [embed] });

      await storage.createSignalTransmission({
        signalId: signal.id,
        destination: 'discord',
        destinationId: this.channelId,
        status: 'sent',
        response: 'Signal sent successfully',
      });

      this.logSystemEvent('INFO', `Trading signal sent to Discord for ${signal.symbol}`);
      return true;
    } catch (error) {
      console.error('Error sending Discord signal:', error);
      
      await storage.createSignalTransmission({
        signalId: signal.id,
        destination: 'discord',
        destinationId: this.channelId,
        status: 'failed',
        response: error instanceof Error ? error.message : 'Unknown error',
      });

      this.logSystemEvent('ERROR', `Failed to send Discord signal: ${error}`);
      return false;
    }
  }

  private createSignalEmbed(signal: TradingSignal): EmbedBuilder {
    const color = signal.signal === 'BUY' ? 0x00ff00 : 
                  signal.signal === 'SELL' ? 0xff0000 : 0xffff00;

    const embed = new EmbedBuilder()
      .setTitle(`🚨 Trading Signal: ${signal.symbol}`)
      .setColor(color)
      .addFields(
        { name: 'Signal', value: signal.signal, inline: true },
        { name: 'Confidence', value: `${(signal.confidence * 100).toFixed(1)}%`, inline: true },
        { name: 'Entry Price', value: `$${signal.entryPrice.toFixed(4)}`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'Bybit Trading Bot' });

    if (signal.targetPrice) {
      embed.addFields({ name: 'Target Price', value: `$${signal.targetPrice.toFixed(4)}`, inline: true });
    }

    if (signal.stopLoss) {
      embed.addFields({ name: 'Stop Loss', value: `$${signal.stopLoss.toFixed(4)}`, inline: true });
    }

    if (signal.aiReasoning) {
      embed.addFields({ name: 'AI Reasoning', value: signal.aiReasoning, inline: false });
    }

    return embed;
  }

  private async updateBotStatus(status: string) {
    try {
      await storage.updateBotStatus({
        botName: 'discord',
        status,
        metadata: { 
          channelId: this.channelId,
          connected: this.isConnected,
        },
      });
    } catch (error) {
      console.error('Error updating Discord bot status:', error);
    }
  }

  private async logSystemEvent(level: string, message: string) {
    try {
      await storage.createSystemLog({
        level,
        message,
        service: 'discord',
        metadata: null,
      });
    } catch (error) {
      console.error('Error logging Discord system event:', error);
    }
  }

  public isOnline(): boolean {
    return this.isConnected;
  }

  public async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isConnected = false;
      this.updateBotStatus('inactive');
    }
  }
}

export const discordService = new DiscordService();
