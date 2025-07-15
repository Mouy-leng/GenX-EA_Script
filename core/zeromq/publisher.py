import zmq
import time

def main():
    context = zmq.Context()
    socket = context.socket(zmq.PUB)
    socket.bind("tcp://*:5555")

    while True:
        socket.send_string("hello world")
        time.sleep(1)

if __name__ == '__main__':
    main()
