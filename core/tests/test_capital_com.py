import unittest
from unittest.mock import patch, MagicMock
from core.execution.capital_com import CapitalComAPI

class TestCapitalComAPI(unittest.TestCase):

    @patch('core.execution.capital_com.requests.post')
    def test_create_session_success(self, mock_post):
        # Mock the API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {}
        mock_response.headers = {'X-SECURITY-TOKEN': 'test_token', 'CST': 'test_cst'}
        mock_post.return_value = mock_response

        # Instantiate the CapitalComAPI and call the method
        capital_com_api = CapitalComAPI()
        self.assertTrue(capital_com_api._create_session())
        self.assertEqual(capital_com_api.session_token, 'test_token')
        self.assertEqual(capital_com_api.cst, 'test_cst')

    @patch('core.execution.capital_com.requests.post')
    def test_create_session_failure(self, mock_post):
        # Mock the API response for a failure case
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.raise_for_status.side_effect = Exception("400 Client Error")
        mock_post.return_value = mock_response

        # Instantiate the CapitalComAPI and call the method
        capital_com_api = CapitalComAPI()
        with self.assertRaises(Exception):
            capital_com_api._create_session()

    @patch('core.execution.capital_com.requests.get')
    def test_get_market_data_success(self, mock_get):
        # Mock the API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"prices": [1, 2, 3]}
        mock_get.return_value = mock_response

        # Instantiate the CapitalComAPI and call the method
        capital_com_api = CapitalComAPI()
        capital_com_api.session_token = 'test_token'  # Mock session token
        capital_com_api.cst = 'test_cst'  # Mock CST
        data = capital_com_api.get_market_data("EURUSD")

        # Assert that the data is what we expect
        self.assertEqual(data, {"prices": [1, 2, 3]})

    @patch('core.execution.capital_com.requests.get')
    def test_get_market_data_failure(self, mock_get):
        # Mock the API response for a failure case
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.raise_for_status.side_effect = Exception("400 Client Error")
        mock_get.return_value = mock_response

        # Instantiate the CapitalComAPI and call the method
        capital_com_api = CapitalComAPI()
        capital_com_api.session_token = 'test_token'  # Mock session token
        capital_com_api.cst = 'test_cst'  # Mock CST
        with self.assertRaises(Exception):
            capital_com_api.get_market_data("EURUSD")

if __name__ == '__main__':
    unittest.main()
