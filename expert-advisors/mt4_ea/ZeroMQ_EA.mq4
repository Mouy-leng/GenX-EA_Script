//+------------------------------------------------------------------+
//|                                                     ZeroMQ_EA.mq4 |
//|                        Copyright 2024, https://www.metaquotes.net |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, https://www.metaquotes.net"
#property link      "https://www.metaquotes.net"
#property version   "1.00"
#property strict

#include <Zmq/Zmq.mqh>

int OnInit()
{
    ZmqSubSocket* subSocket = new ZmqSubSocket();
    subSocket.connect("tcp://localhost:5555");
    subSocket.subscribe("");

    return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
}

void OnTick()
{
    string message = subSocket.recv();
    if(message != "")
    {
        Print("Received message: " + message);
    }
}
//+------------------------------------------------------------------+
