
//+------------------------------------------------------------------+
//|                                               GenZTradingEA.mq4 |
//|                                    GenZ Trading Platform Client |
//|                                               Signal Receiver EA |
//+------------------------------------------------------------------+
#property copyright "GenZ Trading Platform"
#property link      "https://genztradingbot.com"
#property version   "1.00"
#property strict

#include <WinInet.mqh>

//--- Input parameters
input string ServerURL = "http://localhost:3000"; // Server URL
input string EAName = "GenZ_Scalping_Bot"; // EA identification name
input double LotSize = 0.01; // Trade lot size
input int MagicNumber = 12345; // Magic number for trades
input int MaxSpread = 3; // Maximum spread in pips
input bool EnableAutoTrading = true; // Enable automatic trading
input int HeartbeatInterval = 30; // Heartbeat interval in seconds
input int SignalCheckInterval = 5; // Check for signals every X seconds

//--- Global variables
datetime lastHeartbeat = 0;
datetime lastSignalCheck = 0;
string connectionId = "";
bool isConnected = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    Print("GenZ Trading EA starting...");
    
    // Generate unique connection ID
    connectionId = EAName + "_" + IntegerToString(AccountNumber()) + "_" + TimeToString(TimeCurrent(), TIME_SECONDS);
    
    // Register with server
    if(RegisterWithServer())
    {
        isConnected = true;
        Print("Successfully connected to GenZ Trading Platform");
        Print("Connection ID: ", connectionId);
    }
    else
    {
        Print("Failed to connect to GenZ Trading Platform");
        return(INIT_FAILED);
    }
    
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    Print("GenZ Trading EA shutting down. Reason: ", reason);
    
    // Unregister from server
    if(isConnected)
    {
        UnregisterFromServer();
    }
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
    // Send heartbeat
    if(TimeCurrent() - lastHeartbeat >= HeartbeatInterval)
    {
        SendHeartbeat();
        lastHeartbeat = TimeCurrent();
    }
    
    // Check for new signals
    if(TimeCurrent() - lastSignalCheck >= SignalCheckInterval)
    {
        CheckForSignals();
        lastSignalCheck = TimeCurrent();
    }
}

//+------------------------------------------------------------------+
//| Register EA with the server                                      |
//+------------------------------------------------------------------+
bool RegisterWithServer()
{
    string url = ServerURL + "/api/mt45/register";
    string headers = "Content-Type: application/json\r\n";
    string data = StringFormat(
        "{\"eaName\":\"%s\",\"connectionId\":\"%s\",\"accountNumber\":%d,\"symbol\":\"%s\",\"timeframe\":%d}",
        EAName, connectionId, AccountNumber(), Symbol(), Period()
    );
    
    string response = HttpRequest(url, "POST", headers, data);
    
    if(StringFind(response, "\"success\":true") >= 0)
    {
        return true;
    }
    
    Print("Registration failed. Response: ", response);
    return false;
}

//+------------------------------------------------------------------+
//| Unregister EA from the server                                   |
//+------------------------------------------------------------------+
void UnregisterFromServer()
{
    string url = ServerURL + "/api/mt45/unregister";
    string headers = "Content-Type: application/json\r\n";
    string data = StringFormat("{\"connectionId\":\"%s\"}", connectionId);
    
    HttpRequest(url, "POST", headers, data);
}

//+------------------------------------------------------------------+
//| Send heartbeat to maintain connection                            |
//+------------------------------------------------------------------+
void SendHeartbeat()
{
    string url = ServerURL + "/api/mt45/heartbeat";
    string headers = "Content-Type: application/json\r\n";
    string data = StringFormat(
        "{\"connectionId\":\"%s\",\"status\":\"active\",\"balance\":%.2f,\"equity\":%.2f}",
        connectionId, AccountBalance(), AccountEquity()
    );
    
    HttpRequest(url, "POST", headers, data);
}

//+------------------------------------------------------------------+
//| Check for new trading signals                                   |
//+------------------------------------------------------------------+
void CheckForSignals()
{
    string url = ServerURL + "/api/mt45/signals/" + connectionId;
    string response = HttpRequest(url, "GET", "", "");
    
    if(StringLen(response) > 0 && StringFind(response, "\"signals\"") >= 0)
    {
        ProcessSignals(response);
    }
}

//+------------------------------------------------------------------+
//| Process received signals                                         |
//+------------------------------------------------------------------+
void ProcessSignals(string jsonResponse)
{
    // Parse JSON response (simplified parsing)
    int signalStart = StringFind(jsonResponse, "\"signals\":[");
    if(signalStart < 0) return;
    
    string signalsArray = StringSubstr(jsonResponse, signalStart + 11);
    int arrayEnd = StringFind(signalsArray, "]");
    if(arrayEnd < 0) return;
    
    signalsArray = StringSubstr(signalsArray, 0, arrayEnd);
    
    // Process each signal
    string signals[];
    int signalCount = SplitSignals(signalsArray, signals);
    
    for(int i = 0; i < signalCount; i++)
    {
        ProcessSingleSignal(signals[i]);
    }
}

//+------------------------------------------------------------------+
//| Process a single trading signal                                 |
//+------------------------------------------------------------------+
void ProcessSingleSignal(string signalJson)
{
    // Extract signal data
    string signal = ExtractJsonValue(signalJson, "signal");
    string symbol = ExtractJsonValue(signalJson, "symbol");
    double entryPrice = StrToDouble(ExtractJsonValue(signalJson, "entryPrice"));
    double stopLoss = StrToDouble(ExtractJsonValue(signalJson, "stopLoss"));
    double takeProfit = StrToDouble(ExtractJsonValue(signalJson, "targetPrice"));
    double confidence = StrToDouble(ExtractJsonValue(signalJson, "confidence"));
    
    // Validate signal
    if(symbol != Symbol()) return; // Only trade current symbol
    if(confidence < 0.7) return; // Minimum confidence threshold
    if(!EnableAutoTrading) return;
    
    // Check spread
    double spread = (Ask - Bid) / Point;
    if(spread > MaxSpread) 
    {
        Print("Spread too high: ", spread, " pips. Signal ignored.");
        return;
    }
    
    // Execute trade based on signal
    if(signal == "BUY")
    {
        ExecuteBuyOrder(entryPrice, stopLoss, takeProfit);
    }
    else if(signal == "SELL")
    {
        ExecuteSellOrder(entryPrice, stopLoss, takeProfit);
    }
    
    // Send confirmation back to server
    SendTradeConfirmation(signalJson, "executed");
}

//+------------------------------------------------------------------+
//| Execute buy order                                                |
//+------------------------------------------------------------------+
void ExecuteBuyOrder(double entryPrice, double stopLoss, double takeProfit)
{
    double price = Ask;
    double sl = (stopLoss > 0) ? stopLoss : 0;
    double tp = (takeProfit > 0) ? takeProfit : 0;
    
    int ticket = OrderSend(Symbol(), OP_BUY, LotSize, price, 3, sl, tp, 
                          "GenZ Signal Buy", MagicNumber, 0, clrBlue);
    
    if(ticket > 0)
    {
        Print("BUY order executed. Ticket: ", ticket, " Price: ", price);
    }
    else
    {
        Print("BUY order failed. Error: ", GetLastError());
    }
}

//+------------------------------------------------------------------+
//| Execute sell order                                               |
//+------------------------------------------------------------------+
void ExecuteSellOrder(double entryPrice, double stopLoss, double takeProfit)
{
    double price = Bid;
    double sl = (stopLoss > 0) ? stopLoss : 0;
    double tp = (takeProfit > 0) ? takeProfit : 0;
    
    int ticket = OrderSend(Symbol(), OP_SELL, LotSize, price, 3, sl, tp, 
                          "GenZ Signal Sell", MagicNumber, 0, clrRed);
    
    if(ticket > 0)
    {
        Print("SELL order executed. Ticket: ", ticket, " Price: ", price);
    }
    else
    {
        Print("SELL order failed. Error: ", GetLastError());
    }
}

//+------------------------------------------------------------------+
//| Send trade confirmation to server                               |
//+------------------------------------------------------------------+
void SendTradeConfirmation(string originalSignal, string status)
{
    string url = ServerURL + "/api/mt45/trade-confirmation";
    string headers = "Content-Type: application/json\r\n";
    string data = StringFormat(
        "{\"connectionId\":\"%s\",\"originalSignal\":%s,\"status\":\"%s\",\"timestamp\":\"%s\"}",
        connectionId, originalSignal, status, TimeToString(TimeCurrent())
    );
    
    HttpRequest(url, "POST", headers, data);
}

//+------------------------------------------------------------------+
//| HTTP Request function                                            |
//+------------------------------------------------------------------+
string HttpRequest(string url, string method, string headers, string data)
{
    string result = "";
    
    // Simple HTTP request implementation
    // Note: This is a simplified version. For production, use more robust HTTP library
    
    int handle = InternetOpenW("GenZ Trading EA", 1, "", "", 0);
    if(handle == 0) return "";
    
    int connect = InternetConnectW(handle, "localhost", 3000, "", "", 3, 0, 0);
    if(connect == 0) 
    {
        InternetCloseHandle(handle);
        return "";
    }
    
    // Implementation would continue with actual HTTP request
    // This is a placeholder - actual implementation requires WinInet functions
    
    InternetCloseHandle(connect);
    InternetCloseHandle(handle);
    
    return result;
}

//+------------------------------------------------------------------+
//| Extract value from JSON string                                  |
//+------------------------------------------------------------------+
string ExtractJsonValue(string json, string key)
{
    string searchKey = "\"" + key + "\":";
    int start = StringFind(json, searchKey);
    if(start < 0) return "";
    
    start += StringLen(searchKey);
    
    // Skip whitespace and quotes
    while(start < StringLen(json) && (StringGetChar(json, start) == ' ' || StringGetChar(json, start) == '"'))
        start++;
    
    int end = start;
    bool inQuotes = false;
    
    // Find end of value
    while(end < StringLen(json))
    {
        int char = StringGetChar(json, end);
        if(char == '"') inQuotes = !inQuotes;
        if(!inQuotes && (char == ',' || char == '}' || char == ']')) break;
        end++;
    }
    
    return StringSubstr(json, start, end - start);
}

//+------------------------------------------------------------------+
//| Split signals array                                             |
//+------------------------------------------------------------------+
int SplitSignals(string signalsString, string &signals[])
{
    // Simplified signal splitting - in production, use proper JSON parser
    return 0;
}
