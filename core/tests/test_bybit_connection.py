import unittest
from core.execution.bybit import BybitAPI

class TestBybitConnection(unittest.TestCase):

    def test_get_market_data_real(self):
        """
        Tests a real connection to the Bybit API.
        This test will use the API keys from the .env file.
        """
        bybit_api = BybitAPI()
        data = bybit_api.get_market_data("BTCUSDT", "1")

        self.assertIsNotNone(data)
        self.assertIn("result", data)
        self.assertIn("list", data["result"])

if __name__ == '__main__':
    unittest.main()
