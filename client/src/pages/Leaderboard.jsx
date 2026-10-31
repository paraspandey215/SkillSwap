
import { useEffect, useState, useCallback } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  TrendingUp,
  Award,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const colors = [
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
];

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function getBadge(rank, credits) {
  if (rank === 1) return "Top Contributor";
  if (rank <= 3) return "Top Contributor";
  if (credits >= 100) return "Skill Master";
  if (credits > 0) return "Rising Star";
  return "Active Member";
}

export default function Leaderboard() {
  const [period, setPeriod] = useState("All Time");
  const [users, setUsers] = useState([]);
  const [myStats, setMyStats] = useState({
    rank: null,
    credits: 0,
    sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = useCallback(async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setUsers([]);
        setMyStats({ rank: null, credits: 0, sessions: 0 });
        setError("Please log in to view the leaderboard.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/leaderboard?period=${encodeURIComponent(selectedPeriod)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load leaderboard");
      }

      const leaderboardUsers = (data.leaderboard || []).map(
        (user, index) => {
          const rank = Number(user.rank || index + 1);
          const credits = Number(user.credits || 0);

          return {
            id: user.id,
            rank,
            name: user.name || "Unknown User",
            role: user.headline || user.role || "SkillSwap Member",
            credits,
            sessions: Number(user.sessions || 0),
            isCurrentUser: Boolean(user.isCurrentUser),
            initials: getInitials(user.name || "User"),
            color: colors[index % colors.length],
            badge: getBadge(rank, credits),
          };
        }
      );

      setUsers(leaderboardUsers);

      setMyStats({
        rank: data.myStats?.rank ?? null,
        credits: Number(data.myStats?.credits || 0),
        sessions: Number(data.myStats?.sessions || 0),
      });
    } catch (err) {
      console.error("Leaderboard Error:", err);
      setError(err.message || "Something went wrong");
      setUsers([]);
      setMyStats({ rank: null, credits: 0, sessions: 0 });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  const topThree = users.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600">
            Community Rankings
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Leaderboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Celebrate learners and mentors making an impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-violet-500"
          >
            <option>All Time</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>

          <button
            type="button"
            onClick={() => fetchLeaderboard(period)}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh leaderboard"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-violet-600" />
          <p className="text-sm text-slate-500">
            Loading real leaderboard data...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => fetchLeaderboard(period)}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Top Three */}
          <div className="grid gap-5 md:grid-cols-3">
            {topThree.map((user, index) => (
              <div
                key={user.id}
                className={`relative rounded-2xl border bg-white p-6 text-center shadow-sm ${
                  index === 0
                    ? "border-amber-200 md:-mt-3"
                    : "border-slate-200"
                }`}
              >
                {index === 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    #1 Champion
                  </span>
                )}

                <div
                  className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${user.color}`}
                >
                  {user.initials}
                </div>

                {index === 0 ? (
                  <Crown className="mx-auto mb-2 h-7 w-7 text-amber-500" />
                ) : (
                  <Medal
                    className={`mx-auto mb-2 h-7 w-7 ${
                      index === 1
                        ? "text-slate-400"
                        : "text-orange-500"
                    }`}
                  />
                )}

                <h3 className="font-bold text-slate-900">
                  {user.name}
                  {user.isCurrentUser && (
                    <span className="ml-2 text-xs font-medium text-violet-600">
                      You
                    </span>
                  )}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {user.role}
                </p>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-slate-900">
                    {user.credits}
                  </p>
                  <p className="text-xs text-slate-500">
                    Credits Earned
                  </p>
                </div>
              </div>
            ))}

            {topThree.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 md:col-span-3">
                No leaderboard data available for this period yet.
              </div>
            )}
          </div>

          {/* Personal Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Your Rank</p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {myStats.rank ? `#${myStats.rank}` : "Not Ranked"}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                  <Flame size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Credits Earned</p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {myStats.credits}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Sessions Completed
                  </p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {myStats.sessions}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Top Contributors
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Users ranked by total credits earned.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Badge</th>
                    <th className="px-6 py-4">Sessions</th>
                    <th className="px-6 py-4">Credits</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`transition hover:bg-slate-50 ${
                        user.isCurrentUser ? "bg-violet-50/60" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        #{user.rank}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${user.color}`}
                          >
                            {user.initials}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {user.name}
                              {user.isCurrentUser && (
                                <span className="ml-2 text-xs font-medium text-violet-600">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                          <Award size={13} />
                          {user.badge}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.sessions}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                          <Star size={15} className="text-amber-500" />
                          {user.credits}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        No contributors found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
