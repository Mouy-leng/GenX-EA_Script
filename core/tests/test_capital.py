import unittest
from unittest.mock import patch
import os
from core.execution.capital import CapitalCom

class TestCapitalCom(unittest.TestCase):
    def test_init(self):
        with patch.dict(os.environ, {"CAPITAL_COM_API_KEY": "test_api_key", "CAPITAL_COM_PASSWORD": "test_password"}):
            import importlib
            from utils import config
            from core.execution import capital
            importlib.reload(config)
            importlib.reload(capital)
            capital_com = capital.CapitalCom()
            self.assertEqual(capital_com.api_key, "test_api_key")
            self.assertEqual(capital_com.password, "test_password")

    @patch('core.execution.capital.CapitalCom.get_market_data')
    def test_get_market_data(self, mock_get_market_data):
        mock_get_market_data.return_value = [
            [1672531200000, 1800.0, 1801.0, 1799.0, 1800.5, 1000, 1800250.0],
            [1672534800000, 1800.5, 1802.0, 1800.0, 1801.5, 1200, 2161800.0],
        ]
        capital_com = CapitalCom()
        market_data = capital_com.get_market_data("GOLD", "60")
        self.assertIsNotNone(market_data)
        self.assertEqual(len(market_data), 2)

if __name__ == '__main__':
    unittest.main()
