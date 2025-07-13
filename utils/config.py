import os
from dotenv import load_dotenv

load_dotenv()

BYBIT_API_KEY = "gHuc8ITaUtOUaEm9Xi"
BYBIT_SECRET = "BviaaQIjPirE8i7NOd0ZXnka2tyxuwulqpgN"
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CAPITAL_COM_API_KEY = os.getenv("CAPITAL_COM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENV = os.getenv("ENV", "development")
