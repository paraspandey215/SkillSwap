
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import socket from "../socket";
import {
  Users,
  Radio,
  LogOut,
  DoorOpen,
  Code2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const DEFAULT_CODE = `// Welcome to SkillSwap Live Editor

function greet(name) {
  return "Hello, " + name;
}

console.log(greet("SkillSwap"));
`;

function CollaborationRoom() {
  const [bookingId, setBookingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? "Connected" : "Disconnected"
  );

  const [messages, setMessages] = useState([]);

  const editorRef = useRef(null);
  const editorSubscriptionRef = useRef(null);
  const joinedRef = useRef(false);
  const roomIdRef = useRef("");
  const bookingIdRef = useRef(null);
  const isApplyingRemoteChangeRef = useRef(false);
  const pendingRoomCodeRef = useRef(null);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  // Apply code received from the server
  const applyRemoteCode = (code) => {
    if (!editorRef.current || typeof code !== "string") return;

    isApplyingRemoteChangeRef.current = true;

    try {
      editorRef.current.setValue(code);
    } finally {
      isApplyingRemoteChangeRef.current = false;
    }
  };

  // Socket event listeners
  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus("Connected");
    };

    const handleDisconnect = () => {
      setConnectionStatus("Disconnected");
      setJoined(false);
      setJoining(false);

      joinedRef.current = false;
      roomIdRef.current = "";
      bookingIdRef.current = null;
      pendingRoomCodeRef.current = null;

      setRoomId("");

      addMessage("Connection lost. Please reconnect.");
    };

    const handleUserJoined = (data) => {
      addMessage(data?.message || "A participant joined the room");
    };

    const handleUserLeft = (data) => {
      addMessage(data?.message || "A participant left the room");
    };

    // Receive initial room code after successful server authorization
    const handleRoomState = ({ code } = {}) => {
      if (typeof code !== "string") return;

      if (!editorRef.current) {
        pendingRoomCodeRef.current = code;
      } else {
        applyRemoteCode(code);
        addMessage("Existing room code synchronized successfully");
      }

      joinedRef.current = true;
      setJoined(true);
      setJoining(false);

      addMessage("Successfully joined the collaboration room");
    };

    // Receive live code updates
    const handleCodeUpdate = ({ code } = {}) => {
      if (typeof code !== "string") return;

      if (!editorRef.current) {
        pendingRoomCodeRef.current = code;
        return;
      }

      applyRemoteCode(code);
    };

    // Handle authorization or room errors from server
    const handleRoomError = (data) => {
      joinedRef.current = false;
      roomIdRef.current = "";
      bookingIdRef.current = null;

      setJoined(false);
      setJoining(false);
      setRoomId("");

      addMessage(
        data?.message || "Unable to join collaboration room."
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("room-state", handleRoomState);
    socket.on("code-update", handleCodeUpdate);
    socket.on("room-error", handleRoomError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("room-state", handleRoomState);
      socket.off("code-update", handleCodeUpdate);
      socket.off("room-error", handleRoomError);

      editorSubscriptionRef.current?.dispose();
    };
  }, []);

  // Monaco editor initialization
  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    if (pendingRoomCodeRef.current !== null) {
      applyRemoteCode(pendingRoomCodeRef.current);
      pendingRoomCodeRef.current = null;
    }

    editorSubscriptionRef.current?.dispose();

    editorSubscriptionRef.current =
      editor.onDidChangeModelContent(() => {
        if (!joinedRef.current) return;

        if (isApplyingRemoteChangeRef.current) return;

        // Send code changes with booking ID.
        // Server must verify socket authorization before saving.
        socket.emit("code-change", {
          bookingId: bookingIdRef.current,
          code: editor.getValue(),
        });
      });
  };

  // Join collaboration room using booking ID
  const joinRoom = async () => {
    const cleanBookingId = bookingId.trim();
    const parsedBookingId = Number(cleanBookingId);

    if (
      !cleanBookingId ||
      !Number.isSafeInteger(parsedBookingId) ||
      parsedBookingId <= 0
    ) {
      alert("Please enter a valid Booking ID");
      return;
    }

    if (!socket.connected) {
      alert("Socket is disconnected. Please refresh the page.");
      return;
    }

    if (joinedRef.current || joining) return;

    if (!editorRef.current) {
      alert("Editor is still loading. Please try again.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again to continue.");
      return;
    }

    setJoining(true);

    try {
      // Verify booking access through backend REST API
      const response = await fetch(
        `${API_URL}/api/bookings/${parsedBookingId}/collaboration-access`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.allowed) {
        throw new Error(
          data.message || "You are not authorized to join this room."
        );
      }

      const authorizedRoomId = data.roomId;

      if (!authorizedRoomId) {
        throw new Error("Room ID was not returned by the server.");
      }

      // Store booking and room information
      bookingIdRef.current = parsedBookingId;
      roomIdRef.current = authorizedRoomId;

      setRoomId(authorizedRoomId);

      // Ask Socket.io server to independently authorize this booking.
      // The server must verify the participant and accepted status.
      socket.emit("join-room", {
        bookingId: parsedBookingId,
        initialCode: editorRef.current.getValue(),
      });

      addMessage(
        `Requesting access to booking #${parsedBookingId}...`
      );
    } catch (error) {
      setJoining(false);

      bookingIdRef.current = null;
      roomIdRef.current = "";

      setRoomId("");

      addMessage(error.message || "Failed to verify booking access.");

      alert(error.message || "Unable to join collaboration room.");
    }
  };

  // Leave collaboration room
  const leaveRoom = () => {
    if (!joinedRef.current) return;

    socket.emit("leave-room", {
      bookingId: bookingIdRef.current,
    });

    joinedRef.current = false;

    bookingIdRef.current = null;
    roomIdRef.current = "";
    pendingRoomCodeRef.current = null;

    setJoined(false);
    setJoining(false);
    setRoomId("");

    addMessage("You left the collaboration room");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Code2 className="text-violet-600" size={25} />

          <h1 className="text-2xl font-bold text-slate-900">
            Live Collaboration Room
          </h1>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Collaborate and write code together in real time.
        </p>
      </div>

      {/* Room Connection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            Room Connection
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              connectionStatus === "Connected"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {connectionStatus}
          </span>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Booking ID
        </label>

        <input
          type="number"
          min="1"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          disabled={joined || joining}
          placeholder="Enter your accepted Booking ID"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
        />

        <p className="mt-2 text-xs text-slate-400">
          Only the student and mentor of an accepted booking can join.
        </p>

        {!joined ? (
          <button
            onClick={joinRoom}
            disabled={
              connectionStatus !== "Connected" || joining
            }
            className="mt-4 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <DoorOpen size={18} />
            {joining ? "Verifying Access..." : "Join Room"}
          </button>
        ) : (
          <button
            onClick={leaveRoom}
            className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} />
            Leave Room
          </button>
        )}

        {roomId && (
          <p className="mt-3 text-sm text-slate-500">
            Room: <span className="font-semibold">{roomId}</span>
          </p>
        )}
      </div>

      {/* Monaco Code Editor */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Shared Code Editor
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {joined
                ? `Room: ${roomId}`
                : "Join an accepted booking to start collaborating"}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              joined
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {joined ? "Live Editing" : "Not in room"}
          </span>
        </div>

        <Editor
          height="450px"
          defaultLanguage="javascript"
          defaultValue={DEFAULT_CODE}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly: !joined,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Room Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users size={20} className="text-violet-600" />

          <h2 className="font-semibold text-slate-800">
            Room Activity
          </h2>
        </div>

        <div className="min-h-32 space-y-3 rounded-xl bg-slate-50 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">
              No activity yet. Join an accepted booking to get started.
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <Radio
                  size={16}
                  className="mt-0.5 shrink-0 text-violet-500"
                />

                <p>{message}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default CollaborationRoom;
