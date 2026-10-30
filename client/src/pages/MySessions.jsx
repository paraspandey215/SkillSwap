
import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Search,
  Video,
  Code2,
  Palette,
  Database,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  X,
  UserRound,
  BookOpen,
} from "lucide-react";

const sessionsData = [
  {
    id: 1,
    title: "React Advanced Concepts",
    mentor: "Aarav Sharma",
    initials: "AS",
    skill: "React",
    date: "31 Oct, 2026",
    time: "4:00 PM - 5:00 PM",
    credits: 5,
    status: "Confirmed",
    icon: Code2,
    color: "bg-blue-100 text-blue-700",
    description:
      "Learn advanced React concepts including hooks, context API, performance optimization and component architecture.",
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    mentor: "Priya Verma",
    initials: "PV",
    skill: "UI/UX Design",
    date: "1 Nov, 2026",
    time: "11:00 AM - 12:00 PM",
    credits: 4,
    status: "Pending",
    icon: Palette,
    color: "bg-pink-100 text-pink-700",
    description:
      "Understand design principles, wireframing, prototyping and creating user-friendly interfaces.",
  },
  {
    id: 3,
    title: "Python for Beginners",
    mentor: "Rahul Mehta",
    initials: "RM",
    skill: "Python",
    date: "25 Oct, 2026",
    time: "2:00 PM - 3:00 PM",
    credits: 6,
    status: "Completed",
    icon: Database,
    color: "bg-emerald-100 text-emerald-700",
    description:
      "A beginner-friendly session covering Python basics, variables, loops and functions.",
  },
  {
    id: 4,
    title: "Java & DSA Practice",
    mentor: "Sneha Kapoor",
    initials: "SK",
    skill: "Java",
    date: "28 Oct, 2026",
    time: "3:00 PM - 4:00 PM",
    credits: 4,
    status: "Completed",
    icon: Code2,
    color: "bg-orange-100 text-orange-700",
    description:
      "Practice Java programming and understand important data structures and algorithms.",
  },
];

const filters = ["All", "Upcoming", "Pending", "Completed"];

function MySessions() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const filteredSessions = sessionsData.filter((session) => {
    const matchesSearch =
      `${session.title} ${session.mentor} ${session.skill}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Upcoming" && session.status === "Confirmed") ||
      session.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const counts = {
    All: sessionsData.length,
    Upcoming: sessionsData.filter(
      (s) => s.status === "Confirmed"
    ).length,
    Pending: sessionsData.filter(
      (s) => s.status === "Pending"
    ).length,
    Completed: sessionsData.filter(
      (s) => s.status === "Completed"
    ).length,
  };

  const getStatusStyle = (status) => {
    if (status === "Confirmed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "Pending") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-blue-50 text-blue-700";
  };

  const getStatusIcon = (status) => {
    if (status === "Confirmed") return CheckCircle2;
    if (status === "Pending") return Clock;
    return CheckCircle2;
  };

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            My Sessions
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your mentorship sessions and learning schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
          <CalendarDays size={18} />
          Your learning schedule
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Sessions"
          value={counts.All}
          icon={BookOpen}
          color="violet"
        />

        <SummaryCard
          title="Upcoming"
          value={counts.Upcoming}
          icon={CalendarDays}
          color="blue"
        />

        <SummaryCard
          title="Pending"
          value={counts.Pending}
          icon={Clock}
          color="orange"
        />

        <SummaryCard
          title="Completed"
          value={counts.Completed}
          icon={CheckCircle2}
          color="emerald"
        />
      </section>

      {/* Sessions List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your Bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track all your mentorship sessions in one place.
            </p>
          </div>

          {/* Search */}
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
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "bg-violet-600 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {filter} ({counts[filter]})
            </button>
          ))}
        </div>

        {/* Session Cards */}
        <div className="mt-5 space-y-4">
          {filteredSessions.map((session) => {
            const Icon = session.icon;
            const StatusIcon = getStatusIcon(session.status);

            return (
              <div
                key={session.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:shadow-sm md:p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                  {/* Session Info */}
                  <div className="flex gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${session.color}`}>
                      <Icon size={23} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        {session.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        with {session.mentor}
                      </p>

                      <span className="mt-2 inline-block rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                        {session.skill}
                      </span>
                    </div>
                  </div>

                  {/* Date and Status */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {session.date}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      {session.time}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(session.status)}`}>
                      <StatusIcon size={14} />
                      {session.status}
                    </span>

                    <button
                      onClick={() => setSelectedSession(session)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      Details
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400">
                    Session duration: 60 minutes
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {session.credits} Credits
                  </p>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <CalendarDays
                size={35}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-slate-800">
                No sessions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filter.
              </p>
            </div>
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
                  Session Details
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedSession.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {selectedSession.description}
            </p>

            <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <UserRound size={18} className="text-violet-600" />
                <div>
                  <p className="text-xs text-slate-400">Mentor</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedSession.mentor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-violet-600" />
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedSession.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-violet-600" />
                <div>
                  <p className="text-xs text-slate-400">Time</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedSession.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wallet size={18} className="text-violet-600" />
                <div>
                  <p className="text-xs text-slate-400">Credits</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedSession.credits} Credits
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(selectedSession.status)}`}>
                {selectedSession.status}
              </span>

              <button
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

      <h3 className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </h3>
    </div>
  );
}

export default MySessions;
