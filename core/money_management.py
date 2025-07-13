import numpy as np

def calculate_position_size(account_balance, risk_percentage, stop_loss_price, current_price):
    """
    Calculates the position size for a trade.

    Args:
        account_balance (float): The current account balance.
        risk_percentage (float): The percentage of the account balance to risk on the trade.
        stop_loss_price (float): The price at which to exit the trade if it goes against us.
        current_price (float): The current price of the asset.

    Returns:
        float: The position size in the base currency.
    """
    risk_amount = account_balance * (risk_percentage / 100)
    risk_per_share = current_price - stop_loss_price
    position_size = risk_amount / risk_per_share
    return position_size
