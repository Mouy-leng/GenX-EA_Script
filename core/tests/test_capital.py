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

if __name__ == '__main__':
    unittest.main()
