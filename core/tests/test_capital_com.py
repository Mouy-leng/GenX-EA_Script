import unittest
import os
from dotenv import load_dotenv
from utils.config import CAPITAL_COM_API_KEY, CAPITAL_COM_PASSWORD
from core.execution.capital_com import CapitalComAPI

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '../../.env')
load_dotenv(dotenv_path=dotenv_path)

class TestCapitalComAPI(unittest.TestCase):

    def setUp(self):
        """
        Set up the test case.
        """
        self.capital_com = CapitalComAPI()

    def test_api_credentials_are_set(self):
        """
        Tests if the Capital.com API credentials are set as environment variables.
        """
        self.assertIsNotNone(CAPITAL_COM_API_KEY, "CAPITAL_COM_API_KEY is not set.")
        self.assertIsNotNone(CAPITAL_COM_PASSWORD, "CAPITAL_COM_PASSWORD is not set.")

    def test_create_session(self):
        """
        Tests the creation of a new session.
        """
        self.assertTrue(self.capital_com._create_session())
        self.assertIsNotNone(self.capital_com.session_token)
        self.assertIsNotNone(self.capital_com.cst)

    def test_get_market_data(self):
        """
        Tests fetching market data.
        """
        # First, create a session
        self.capital_com._create_session()
        # Then, fetch market data
        response = self.capital_com.get_market_data("EURUSD")
        self.assertIsNotNone(response)
        self.assertIn("prices", response)

    @unittest.skip("Skipping order execution test to avoid creating real orders.")
    def test_execute_order(self):
        """
        Tests executing an order.
        """
        # First, create a session
        self.capital_com._create_session()
        # Then, execute an order
        response = self.capital_com.execute_order("EURUSD", "BUY", "MARKET", 1)
        self.assertIsNotNone(response)
        self.assertIn("dealReference", response)

if __name__ == '__main__':
    unittest.main()
