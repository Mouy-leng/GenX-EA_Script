import unittest
from unittest.mock import patch, MagicMock
from core.execution.bybit import BybitAPI

class TestBybitAPI(unittest.TestCase):

    @patch('core.execution.bybit.requests.get')
    def test_get_market_data_success(self, mock_get):
        # Mock the API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": {"list": [1, 2, 3]}}
        mock_get.return_value = mock_response

        # Instantiate the BybitAPI and call the method
        bybit_api = BybitAPI()
        data = bybit_api.get_market_data("BTCUSDT", "1")

        # Assert that the data is what we expect
        self.assertEqual(data, {"result": {"list": [1, 2, 3]}})

    @patch('core.execution.bybit.requests.get')
    def test_get_market_data_failure(self, mock_get):
        # Mock the API response for a failure case
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.raise_for_status.side_effect = Exception("403 Client Error: Forbidden for url")
        mock_get.return_value = mock_response

        # Instantiate the BybitAPI and call the method
        bybit_api = BybitAPI()
        with self.assertRaises(Exception):
            bybit_api.get_market_data("BTCUSDT", "1")

if __name__ == '__main__':
    unittest.main()
