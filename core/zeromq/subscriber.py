import zmq

def main():
    context = zmq.Context()
    socket = context.socket(zmq.SUB)
    socket.connect("tcp://localhost:5555")
    socket.setsockopt_string(zmq.SUBSCRIBE, "")

    while True:
        message = socket.recv_string()
        print(f"Received message: {message}")

if __name__ == '__main__':
    main()
