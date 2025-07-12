import unittest
from unittest.mock import patch, MagicMock
import asyncio
import pandas as pd

# Since main.py is now in a different directory, we need to add the parent directory to the path
import sys
sys.path.append('services/python')

from main import TradingEngine

class TestTradingEngine(unittest.TestCase):

    def setUp(self):
        self.engine = TradingEngine()

    def test_initialization(self):
        self.assertIsNotNone(self.engine.pattern_detector)
        self.assertIsNotNone(self.engine.signal_analyzer)
        self.assertIsNotNone(self.engine.market_predictor)
        self.assertFalse(self.engine.is_running)

    @patch('main.TradingEngine.get_sample_data')
    def test_process_market_data(self, mock_get_sample_data):
        # Create a sample dataframe
        data = {'close': [100, 101, 102]}
        df = pd.DataFrame(data)
        mock_get_sample_data.return_value = df

        # Mock the other components
        self.engine.pattern_detector.detect_patterns = MagicMock(return_value=[])
        self.engine.signal_analyzer.analyze_signals = MagicMock(return_value=[])
        self.engine.market_predictor.get_prediction_signals = MagicMock(return_value=[])

        # Run the method
        asyncio.run(self.engine.process_market_data())

        # Assert that the methods were called
        self.engine.pattern_detector.detect_patterns.assert_called_once_with(df)
        self.engine.signal_analyzer.analyze_signals.assert_called_once()
        self.engine.market_predictor.get_prediction_signals.assert_not_called() # Not trained yet

if __name__ == '__main__':
    unittest.main()
