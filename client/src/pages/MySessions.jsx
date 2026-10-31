import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Search,
  Code2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  UserRound,
  BookOpen,
  Wallet,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Copy,
  ExternalLink,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const filters = ["All", "Upcoming", "Pending", "Completed", "Rejected"];

const formatDate = (value) => {
  if (!value) return "Date not specified";

  // MySQL DATE values may arrive as YYYY-MM-DD or as an ISO timestamp.
  const datePart = String(value).slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const parts = String(value).split(":");
  if (parts.length < 2) return String(value);

  const hours = Number(parts[0]);
  const minutes = parts[1];
  if (Number.isNaN(hours)) return String(value);

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();

  if (value === "accepted" || value === "confirmed") return "Accepted";
  if (value === "completed") return "Completed";
  if (value === "rejected") return "Rejected";
  if (value === "cancelled") return "Cancelled";
  return "Pending";
};

const getInitials = (name = "SkillSwap User") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getToken = () => localStorage.getItem("token");

function MySessions({ onOpenCollaboration }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [notice, setNotice] = useState("");
  const [authUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const isMentor =
    authUser?.role === "mentor" ||
    authUser?.role === "both";

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    const token = getToken();
    if (!token) {
      setError("Your login session was not found. Please log in again.");
      setLoading(false);
      return;
    }

    const endpoint = isMentor
      ? `${API_URL}/api/bookings/received`
      : `${API_URL}/api/bookings/my-bookings`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to load bookings.");
      }

      // Supports either { bookings: [...] } or { success: true, data: [...] }.
      const list = Array.isArray(data)
        ? data
        : data.bookings ||
          data.myBookings ||
          data.receivedBookings ||
          data.data ||
          [];

      setSessions(
        list.map((item) => {
          const studentName =
            item.student_name ||
            item.studentName ||
            item.student?.name ||
            item.learner_name ||
            "Student";

          const mentorName =
            item.mentor_name ||
            item.mentorName ||
            item.mentor?.name ||
            "Mentor";

          return {
            id: item.id ?? item.booking_id,
            title: item.session_title || item.title || "Mentorship Session",
            description:
              item.session_description ||
              item.description ||
              "No session description provided.",
            student: studentName,
            mentor: mentorName,
            otherPerson: isMentor ? studentName : mentorName,
            initials: getInitials(isMentor ? studentName : mentorName),
            date: formatDate(item.session_date || item.date),
            rawDate: item.session_date || item.date,
            startTime: item.start_time || item.startTime || "",
            endTime: item.end_time || item.endTime || "",
            time: `${formatTime(item.start_time || item.startTime)}${
              item.end_time || item.endTime
                ? ` - ${formatTime(item.end_time || item.endTime)}`
                : ""
            }`,
            credits: Number(item.credits || 0),
            status: normalizeStatus(item.status),
            rawStatus: String(item.status || "pending").toLowerCase(),
            skill: item.skill || item.session_title || "Mentorship",
            studentId: item.student_id,
            mentorId: item.mentor_id,
          };
        })
      );
    } catch (err) {
      setError(err.message || "Something went wrong while loading bookings.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [isMentor]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleBookingAction = async (bookingId, action) => {
    if (!bookingId) {
      setError("Booking ID is missing. Please refresh and try again.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Please log in again to manage this booking.");
      return;
    }

    setActionLoading(`${bookingId}-${action}`);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || `Could not ${action} booking.`);
      }

      const messages = {
        accept: "Booking accepted successfully.",
        reject: "Booking request rejected.",
        complete: "Session marked as completed. Credits have been processed by the server.",
      };

      setNotice(messages[action] || "Booking updated successfully.");
      setSelectedSession(null);
      await loadSessions();
    } catch (err) {
      setError(err.message || "Unable to update booking.");
    } finally {
      setActionLoading(null);
    }
  };

  // The numeric booking ID is used by the access API.
  // The shared Socket.io room name is booking-<bookingId>.
  const getRoomId = (bookingId) => `booking-${bookingId}`;

  const handleCopyRoomId = async (bookingId) => {
    const roomId = getRoomId(bookingId);
    try {
      await navigator.clipboard.writeText(roomId);
      setNotice(`Room ID ${roomId} copied. Share it with the other participant.`);
      setError("");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setNotice(`Room ID ${roomId} copied. Share it with the other participant.`);
        setError("");
      } catch {
        setError(`Copy failed. Room ID: ${roomId}`);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleOpenCollaboration = (bookingId) => {
    const numericBookingId = Number(bookingId);
    if (!Number.isSafeInteger(numericBookingId) || numericBookingId <= 0) {
      setError("Invalid booking ID. Refresh your sessions and try again.");
      return;
    }

    localStorage.setItem("skillswap_active_booking_id", String(numericBookingId));

    if (typeof onOpenCollaboration === "function") {
      onOpenCollaboration(numericBookingId);
    } else {
      window.dispatchEvent(
        new CustomEvent("skillswap:open-collaboration", {
          detail: { bookingId: numericBookingId },
        })
      );
      setNotice("Room selected. Open Live Collaboration from the sidebar to join.");
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const searchable =
        `${session.title} ${session.otherPerson} ${session.skill} ${session.description}`.toLowerCase();
      const matchesSearch = searchable.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Upcoming" && session.status === "Accepted") ||
        session.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [sessions, search, activeFilter]);

  const counts = useMemo(
    () => ({
      All: sessions.length,
      Upcoming: sessions.filter((s) => s.status === "Accepted").length,
      Pending: sessions.filter((s) => s.status === "Pending").length,
      Completed: sessions.filter((s) => s.status === "Completed").length,
      Rejected: sessions.filter(
        (s) => s.status === "Rejected" || s.status === "Cancelled"
      ).length,
    }),
    [sessions]
  );

  const getStatusStyle = (status) => {
    if (status === "Accepted")
      return "bg-emerald-50 text-emerald-700";
    if (status === "Pending")
      return "bg-amber-50 text-amber-700";
    if (status === "Rejected" || status === "Cancelled")
      return "bg-rose-50 text-rose-700";
    return "bg-blue-50 text-blue-700";
  };

  const getStatusIcon = (status) => {
    if (status === "Accepted") return CheckCircle2;
    if (status === "Pending") return Clock;
    if (status === "Rejected" || status === "Cancelled") return XCircle;
    return CheckCircle2;
  };

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {isMentor ? "Session Requests" : "My Sessions"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isMentor
              ? "Review student requests and manage your mentorship sessions."
              : "Manage your mentorship sessions and learning schedule."}
          </p>
        </div>

        <button
          type="button"
          onClick={loadSessions}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh bookings
        </button>
      </section>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Sessions" value={counts.All} icon={BookOpen} color="violet" />
        <SummaryCard title="Upcoming" value={counts.Upcoming} icon={CalendarDays} color="blue" />
        <SummaryCard title="Pending" value={counts.Pending} icon={Clock} color="orange" />
        <SummaryCard title="Completed" value={counts.Completed} icon={CheckCircle2} color="emerald" />
      </section>

      {/* Bookings List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isMentor ? "Received Booking Requests" : "Your Bookings"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isMentor
                ? "Accept or reject requests sent by students."
                : "Track all your mentorship sessions in one place."}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-violet-400 md:w-72">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "bg-violet-600 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {filter} ({filter === "Rejected" ? counts.Rejected : counts[filter]})
            </button>
          ))}
        </div>

        {/* Session Cards */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <RefreshCw size={25} className="mx-auto mb-3 animate-spin text-violet-600" />
              Loading bookings...
            </div>
          ) : (
            <>
              {filteredSessions.map((session) => {
                const StatusIcon = getStatusIcon(session.status);
                const isPending = session.status === "Pending";
                const isAccepted = session.status === "Accepted";

                return (
                  <div
                    key={session.id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:shadow-sm md:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      {/* Session Info */}
                      <div className="flex gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                          <Code2 size={23} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{session.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isMentor ? "Requested by " : "With "}
                            {session.otherPerson}
                          </p>
                          <span className="mt-2 inline-block rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                            {session.skill}
                          </span>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 size={16} />
                          {session.time || "Time not specified"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(session.status)}`}>
                          <StatusIcon size={14} />
                          {session.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedSession(session)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                        >
                          Details <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-slate-400">
                          Booking ID: #{session.id}
                        </p>
                        {isAccepted && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-violet-700">
                              Room ID: {getRoomId(session.id)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyRoomId(session.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                              title="Copy collaboration room ID"
                            >
                              <Copy size={13} /> Copy ID
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCollaboration(session.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                            >
                              <ExternalLink size={13} /> Join Room
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-slate-700">
                          {session.credits} Credits
                        </p>

                        {isMentor && isPending && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading !== null}
                              onClick={() => handleBookingAction(session.id, "reject")}
                              className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              <X size={14} /> Reject
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading !== null}
                              onClick={() => handleBookingAction(session.id, "accept")}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check size={14} />
                              {actionLoading === `${session.id}-accept` ? "Accepting..." : "Accept"}
                            </button>
                          </>
                        )}

                        {isMentor && isAccepted && (
                          <button
                            type="button"
                            disabled={actionLoading !== null}
                            onClick={() => handleBookingAction(session.id, "complete")}
                            className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            {actionLoading === `${session.id}-complete` ? "Updating..." : "Mark Completed"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredSessions.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
                  <CalendarDays size={35} className="mx-auto text-slate-300" />
                  <h3 className="mt-3 font-semibold text-slate-800">
                    {sessions.length === 0
                      ? isMentor
                        ? "No booking requests yet"
                        : "No sessions booked yet"
                      : "No sessions found"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {sessions.length === 0
                      ? isMentor
                        ? "New student requests will appear here."
                        : "Find a mentor and request your first session."
                      : "Try changing your search or filter."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  Session Details · Booking #{selectedSession.id}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedSession.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {selectedSession.description}
            </p>

            <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4">
              <DetailRow icon={UserRound} label={isMentor ? "Student" : "Mentor"} value={selectedSession.otherPerson} />
              <DetailRow icon={CalendarDays} label="Date" value={selectedSession.date} />
              <DetailRow icon={Clock3} label="Time" value={selectedSession.time || "Not specified"} />
              <DetailRow icon={Wallet} label="Credits" value={`${selectedSession.credits} Credits`} />
              {selectedSession.status === "Accepted" && (
                <DetailRow
                  icon={Code2}
                  label="Collaboration Room ID"
                  value={getRoomId(selectedSession.id)}
                />
              )}
            </div>

            {selectedSession.status === "Accepted" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyRoomId(selectedSession.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700"
                >
                  <Copy size={16} /> Copy Room ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const bookingId = selectedSession.id;
                    setSelectedSession(null);
                    handleOpenCollaboration(bookingId);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <ExternalLink size={16} /> Join Room
                </button>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(selectedSession.status)}`}>
                {selectedSession.status}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        SkillSwap · Help Today. Learn Tomorrow.
      </p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-violet-600" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}

export default MySessions;
