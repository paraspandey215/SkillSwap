
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ["websocket"],
  auth: (callback) => {
    const token = localStorage.getItem("token");
    callback({ token });
  },
});

export default socket;
