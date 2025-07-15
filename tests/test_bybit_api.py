import pytest
from core.execution.bybit import BybitAPI

@pytest.fixture
def mock_bybit_session(mocker):
    """
    Pytest fixture to mock the pybit HTTP session.
    This prevents real API calls during tests.
    """
    # Mock the HTTP class from pybit.unified_trading
    mock_session = mocker.patch('pybit.unified_trading.HTTP', autospec=True)

    # To mock the instance of the class, we mock its return value
    mock_instance = mock_session.return_value
    return mock_instance

def test_get_market_data_success(mock_bybit_session):
    """
    Tests the get_market_data method for a successful API call.
    """
    # Arrange: Set up the mock response
    mock_response = {"retCode": 0, "result": {"list": [1, 2, 3]}}
    mock_bybit_session.get_kline.return_value = mock_response

    # Act: Call the method
    bybit_api = BybitAPI()
    result = bybit_api.get_market_data("BTCUSDT", "60")

    # Assert: Check that the mock was called correctly and the result is as expected
    mock_bybit_session.get_kline.assert_called_once_with(category="spot", symbol="BTCUSDT", interval="60", limit=200)
    assert result == mock_response