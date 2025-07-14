import requests
from utils.config import CAPITAL_COM_API_KEY, CAPITAL_COM_PASSWORD

class CapitalComAPI:
    def __init__(self):
        self.api_key = CAPITAL_COM_API_KEY
        self.password = CAPITAL_COM_PASSWORD
        self.base_url = "https://api-capital.backend-capital.com/api/v1"
        self.session_token = None
        self.cst = None

    def _create_session(self):
        """
        Creates a new session and obtains a session token.
        """
        path = "/session"
        headers = {
            "X-CAP-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        data = {
            "identifier": self.api_key,
            "password": self.password,
            "encryptedPassword": False
        }
        try:
            response = requests.post(f"{self.base_url}{path}", json=data, headers=headers)
            response.raise_for_status()
            self.session_token = response.headers.get("X-SECURITY-TOKEN")
            self.cst = response.headers.get("CST")
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error creating Capital.com session: {e}")
            return False

    def get_market_data(self, epic, resolution='MINUTE', limit=200):
        """
        Fetches historical market data for a given epic.
        """
        if not self.session_token:
            if not self._create_session():
                return None

        path = f"/prices/{epic}"
        params = {
            "resolution": resolution,
            "max": limit
        }
        headers = {
            "X-SECURITY-TOKEN": self.session_token,
            "CST": self.cst
        }
        try:
            response = requests.get(f"{self.base_url}{path}", params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching market data from Capital.com: {e}")
            return None

    def execute_order(self, epic, side, order_type, size, stop_loss=None, take_profit=None):
        """
        Executes a trade on Capital.com.
        """
        if not self.session_token:
            if not self._create_session():
                return None

        path = "/positions"
        headers = {
            "X-SECURITY-TOKEN": self.session_token,
            "CST": self.cst,
            "Content-Type": "application/json"
        }
        data = {
            "epic": epic,
            "direction": side.upper(),
            "orderType": order_type.upper(),
            "size": size
        }
        if stop_loss:
            data["stopLevel"] = stop_loss
        if take_profit:
            data["profitLevel"] = take_profit

        try:
            response = requests.post(f"{self.base_url}{path}", json=data, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error executing order on Capital.com: {e}")
            return None
