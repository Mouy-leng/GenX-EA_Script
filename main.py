from core.patterns.pattern_detector import detect_patterns
from core.strategies.signal_analyzer import generate_signals
from core.execution.bybit import BybitAPI
# from services.telegram_bot import send_alert

def get_realtime_data(symbol):
    """
    Fetches real-time market data from Bybit.
    """
    bybit_api = BybitAPI()
    # Fetch 1-hour kline data for the last 200 hours
    market_data = bybit_api.get_market_data(symbol, "60")

    if market_data and market_data.get("retCode") == 0 and market_data.get("result", {}).get("list"):
        # The Bybit API returns data in a nested structure.
        # We need to extract the kline data and format it for our pattern detection functions.
        kline_data = market_data["result"]["list"]

        # The kline data is returned in reverse chronological order. We need to reverse it.
        kline_data.reverse()

        # Extract the close prices from the kline data.
        close_prices = [float(k[4]) for k in kline_data]

        return {
            "symbol": symbol,
            "open": [float(k[1]) for k in kline_data],
            "high": [float(k[2]) for k in kline_data],
            "low": [float(k[3]) for k in kline_data],
            "close": close_prices,
            "volume": [float(k[5]) for k in kline_data],
        }
    else:
        print(f"Error fetching market data: {market_data}")
        return None

if __name__ == "__main__":
    market_data = get_realtime_data("BTCUSDT")

    if market_data:
        patterns = detect_patterns(market_data)
        signals = generate_signals(patterns)

        if signals:
            print("Signals generated:", signals)
            # bybit_api = BybitAPI()
            # bybit_api.execute_order("BTCUSDT", "Buy", "Market", 0.01)
            # send_alert(signals)
        else:
            print("No signals generated.")
