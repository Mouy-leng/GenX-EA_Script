import unittest
import os
import unittest
import os
from core.execution.bybit import BybitAPI

# Manually load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '../../.env')
if os.path.exists(dotenv_path):
    with open(dotenv_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

from utils.config import BYBIT_API_KEY, BYBIT_SECRET

class TestBybitAPI(unittest.TestCase):

    def test_api_keys_are_set(self):
        """
        Tests if the Bybit API keys are set as environment variables.
        """
        self.assertIsNotNone(BYBIT_API_KEY, "BYBIT_API_KEY is not set.")
        self.assertIsNotNone(BYBIT_SECRET, "BYBIT_SECRET is not set.")

    def test_bybit_connection(self):
        """
        Tests the connection to the Bybit API using the provided API keys.
        """
        bybit = BybitAPI()
        # A simple request to a public endpoint to check the connection
        response = bybit.get_market_data("BTCUSDT", "1")
        self.assertIsNotNone(response, "Failed to connect to Bybit API.")
        # Check for a specific error code in the response if the API key is invalid
        if "ret_code" in response and response["ret_code"] == 10003:
            self.fail("Bybit API key is invalid.")

if __name__ == '__main__':
    unittest.main()
