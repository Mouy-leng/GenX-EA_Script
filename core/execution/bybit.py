import hmac
import hashlib
import time
import requests
from utils.config import BYBIT_API_KEY, BYBIT_SECRET

class BybitAPI:
    def __init__(self):
        self.api_key = BYBIT_API_KEY
        self.api_secret = BYBIT_SECRET
        self.base_url = "https://api.bybit.com"

    def _generate_signature(self, params):
        if not self.api_key or not self.api_secret:
            return ""
        param_str = str(int(time.time() * 1000)) + self.api_key + "5000" + '&'.join([f'{key}={value}' for key, value in sorted(params.items())])
        return hmac.new(self.api_secret.encode('utf-8'), param_str.encode('utf-8'), hashlib.sha256).hexdigest()

    def get_market_data(self, symbol, interval, limit=200, **kwargs):
        """
        Fetches market data from Bybit.
        """
        path = "/v5/market/kline"
        params = {
            "category": "spot",
            "symbol": symbol,
            "interval": interval,
            "limit": limit
        }
        params.update(kwargs)

        timestamp = int(time.time() * 1000)

        headers = {
            "X-BAPI-API-KEY": self.api_key,
            "X-BAPI-TIMESTAMP": str(timestamp),
            "X-BAPI-RECV-WINDOW": "5000",
            "X-BAPI-SIGN": self._generate_signature(params)
        }

        try:
            response = requests.get(f"{self.base_url}{path}", params=params, headers=headers)
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from Bybit: {e}")
            return None

    def execute_order(self, symbol, side, order_type, qty):
        """
        Executes an order on Bybit.
        """
        path = "/v5/order/create"
        params = {
            "category": "spot",
            "symbol": symbol,
            "side": side,
            "orderType": order_type,
            "qty": str(qty)
        }

        timestamp = int(time.time() * 1000)

        headers = {
            "X-BAPI-API-KEY": self.api_key,
            "X-BAPI-TIMESTAMP": str(timestamp),
            "X-BAPI-RECV-WINDOW": "5000",
            "X-BAPI-SIGN": self._generate_signature(params)
        }

        try:
            response = requests.post(f"{self.base_url}{path}", json=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error executing order on Bybit: {e}")
            return None
