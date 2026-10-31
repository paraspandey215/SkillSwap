
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket"],

  // Send JWT token when Socket.io connects
  auth: (callback) => {
    const token = localStorage.getItem("token");

    callback({
      token: token,
    });
  },
});

export default socket;
