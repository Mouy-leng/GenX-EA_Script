import pytest
from core.execution.bybit import BybitAPI

@pytest.fixture
def bybit_api(mocker):
    """
    Pytest fixture to mock the pybit HTTP session.
    This prevents real API calls during tests.
    """
    # Mock the HTTP class from pybit.unified_trading
    mock_session = mocker.patch('pybit.unified_trading.HTTP', autospec=True)

    # To mock the instance of the class, we mock its return value
    mock_instance = mock_session.return_value

    # Instantiate BybitAPI, which will now use the mocked session
    api = BybitAPI()
    # Attach the mock to the instance for easy access in tests
    api.session = mock_instance
    return api

def test_get_market_data_success(bybit_api):
    """
    Tests the get_market_data method for a successful API call.
    """
    # Arrange: Set up the mock response
    mock_response = {"retCode": 0, "result": {"list": [1, 2, 3]}}
    bybit_api.session.get_kline.return_value = mock_response

    # Act: Call the method
    result = bybit_api.get_market_data("BTCUSDT", "60")

    # Assert: Check that the mock was called correctly and the result is as expected
    bybit_api.session.get_kline.assert_called_once_with(category="spot", symbol="BTCUSDT", interval="60", limit=200)
    assert result == mock_response