
import { useState } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";

const users = [
  {
    rank: 1,
    name: "Aarav Sharma",
    role: "Full Stack Developer",
    credits: 320,
    sessions: 42,
    badge: "Expert Mentor",
    initials: "AS",
    color: "bg-amber-100 text-amber-700",
  },
  {
    rank: 2,
    name: "Priya Verma",
    role: "UI/UX Designer",
    credits: 285,
    sessions: 38,
    badge: "Top Contributor",
    initials: "PV",
    color: "bg-violet-100 text-violet-700",
  },
  {
    rank: 3,
    name: "Rahul Mehta",
    role: "Python Developer",
    credits: 250,
    sessions: 35,
    badge: "Skill Master",
    initials: "RM",
    color: "bg-blue-100 text-blue-700",
  },
  {
    rank: 4,
    name: "Sneha Kapoor",
    role: "Java Developer",
    credits: 210,
    sessions: 29,
    badge: "Active Learner",
    initials: "SK",
    color: "bg-pink-100 text-pink-700",
  },
  {
    rank: 5,
    name: "Paras Pandey",
    role: "Frontend Developer",
    credits: 185,
    sessions: 24,
    badge: "Rising Star",
    initials: "PP",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    rank: 6,
    name: "Aditya Singh",
    role: "Web Developer",
    credits: 160,
    sessions: 21,
    badge: "Active Learner",
    initials: "AS",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState("All Time");

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

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-violet-500"
        >
          <option>All Time</option>
          <option>This Month</option>
          <option>This Week</option>
        </select>
      </div>

      {/* Top Three */}
      <div className="grid gap-5 md:grid-cols-3">
        {topThree.map((user, index) => (
          <div
            key={user.rank}
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

            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">
              {user.initials}
            </div>

            {index === 0 ? (
              <Crown className="mx-auto mb-2 h-7 w-7 text-amber-500" />
            ) : (
              <Medal
                className={`mx-auto mb-2 h-7 w-7 ${
                  index === 1 ? "text-slate-400" : "text-orange-500"
                }`}
              />
            )}

            <h3 className="font-bold text-slate-900">{user.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{user.role}</p>

            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">
                {user.credits}
              </p>
              <p className="text-xs text-slate-500">Credits Earned</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Your Rank</p>
              <h3 className="text-xl font-bold text-slate-900">#5</h3>
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
              <h3 className="text-xl font-bold text-slate-900">185</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sessions Completed</p>
              <h3 className="text-xl font-bold text-slate-900">24</h3>
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
                  key={user.rank}
                  className={`transition hover:bg-slate-50 ${
                    user.name === "Paras Pandey" ? "bg-violet-50/60" : ""
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
                        </p>
                        <p className="text-xs text-slate-500">{user.role}</p>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
