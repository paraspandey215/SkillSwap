
import { useState } from "react";
import FindMentors from "./pages/FindMentors";
import MySessions from "./pages/MySessions";
import CreditWallet from "./pages/CreditWallet";
import Leaderboard from "./pages/Leaderboard";
import MyProfile from "./pages/MyProfile";
import SettingsPage from "./pages/Settings";

import {
  LayoutDashboard,
  Search,
  CalendarDays,
  Wallet,
  Trophy,
  UserRound,
  Settings,
  Bell,
  Plus,
  ArrowUpRight,
  Clock3,
  Star,
  Code2,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";

const mentors = [
  {
    name: "Aarav Sharma",
    role: "Full Stack Developer",
    skills: ["React", "Node.js"],
    rating: "4.9",
    sessions: 48,
    credits: 5,
    initials: "AS",
    color: "bg-violet-100 text-violet-700",
    online: true,
  },
  {
    name: "Priya Verma",
    role: "UI/UX Designer",
    skills: ["Figma", "UI Design"],
    rating: "4.8",
    sessions: 36,
    credits: 4,
    initials: "PV",
    color: "bg-pink-100 text-pink-700",
    online: true,
  },
  {
    name: "Rahul Mehta",
    role: "Python Developer",
    skills: ["Python", "Django"],
    rating: "5.0",
    sessions: 62,
    credits: 6,
    initials: "RM",
    color: "bg-blue-100 text-blue-700",
    online: false,
  },
];

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Find Mentors", icon: Search },
  { name: "My Sessions", icon: CalendarDays },
  { name: "Credit Wallet", icon: Wallet },
  { name: "Leaderboard", icon: Trophy },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredMentors = mentors.filter((mentor) =>
    `${mentor.name} ${mentor.role} ${mentor.skills.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const changePage = (page) => {
    setActivePage(page);
    setMobileMenu(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Code2 size={23} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            SkillSwap
          </h1>
          <p className="text-xs text-slate-400">
            Learn. Share. Grow.
          </p>
        </div>
      </div>

      {/* Workspace Navigation */}
      <div className="px-4 pt-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => changePage(item.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />

                {item.name}

                {item.name === "My Sessions" && (
                  <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                    2
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Navigation */}
      <div className="mt-8 px-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Account
        </p>

        <button
          onClick={() => changePage("My Profile")}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
            activePage === "My Profile"
              ? "bg-violet-50 text-violet-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <UserRound size={19} />
          My Profile
        </button>

        <button
          onClick={() => changePage("Settings")}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
            activePage === "Settings"
              ? "bg-violet-50 text-violet-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Settings size={19} />
          Settings
        </button>
      </div>

      {/* Sidebar Bottom Card */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-violet-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-violet-700">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">
              Keep growing!
            </span>
          </div>

          <p className="mb-3 text-xs leading-5 text-slate-600">
            Share your knowledge and earn more learning credits.
          </p>

          <button
            onClick={() => changePage("Find Mentors")}
            className="text-xs font-semibold text-violet-700 hover:underline"
          >
            Explore mentors →
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setMobileMenu(false)}
          />

          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <button
              onClick={() => setMobileMenu(false)}
              className="absolute right-4 top-5 z-10 rounded-lg p-2 hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">

        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs text-slate-400">
                Workspace /
              </p>
              <h2 className="font-semibold text-slate-800">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              onClick={() => changePage("My Profile")}
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                PP
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  Paras Pandey
                </p>
                <p className="text-xs text-slate-400">
                  Learner
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">

          {activePage === "Find Mentors" ? (
           <FindMentors />
           ) : activePage === "My Sessions" ? (
  <MySessions />
) : activePage === "Credit Wallet" ? (
  <CreditWallet />
) : activePage === "Leaderboard" ? (
  <Leaderboard />
  ) : activePage === "My Profile" ? (
  <MyProfile />
  ) : activePage === "Settings" ? (
  <SettingsPage />
) : activePage === "Dashboard" ? (
  
            /* DASHBOARD PAGE */
            <>
              {/* Welcome Section */}
              <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
                    <Sparkles size={16} />
                    Your learning journey starts here
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Welcome back, Paras! 👋
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    Ready to learn something new or share your skills today?
                  </p>
                </div>

                <button
                  onClick={() => changePage("Find Mentors")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Plus size={18} />
                  Find a Mentor
                </button>
              </section>

              {/* Stats Cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={Wallet}
                  title="Available Credits"
                  value="25"
                  subtitle="Ready to spend"
                  color="violet"
                />

                <StatCard
                  icon={CalendarDays}
                  title="Sessions Completed"
                  value="12"
                  subtitle="Learning milestones"
                  color="blue"
                />

                <StatCard
                  icon={Users}
                  title="People Helped"
                  value="8"
                  subtitle="Knowledge shared"
                  color="emerald"
                />

                <StatCard
                  icon={TrendingUp}
                  title="Learning Hours"
                  value="18.5"
                  subtitle="Time invested"
                  color="orange"
                />
              </section>

              {/* Wallet and Progress */}
              <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* Wallet Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-100 xl:col-span-2">
                  <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />

                  <div className="absolute -bottom-24 right-36 h-52 w-52 rounded-full bg-white/10" />

                  <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-violet-100">
                        <Wallet size={18} />
                        Your credit wallet
                      </div>

                      <h2 className="mt-3 text-4xl font-bold">
                        25 Credits
                      </h2>

                      <p className="mt-2 text-sm text-violet-100">
                        Use your credits to learn from experienced peers.
                      </p>

                      <button
                        onClick={() => changePage("Credit Wallet")}
                        className="mt-5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                      >
                        View transactions
                      </button>
                    </div>

                    <div className="hidden h-28 w-28 items-center justify-center rounded-full border border-white/30 bg-white/10 sm:flex">
                      <Wallet size={48} />
                    </div>
                  </div>
                </div>

                {/* Learning Progress */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">
                      Your learning level
                    </h3>

                    <Trophy className="text-amber-500" size={21} />
                  </div>

                  <p className="mt-5 text-2xl font-bold text-slate-900">
                    Level 3
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Rising Learner
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-3/4 rounded-full bg-violet-600" />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    75 / 100 XP to next level
                  </p>
                </div>
              </section>

              {/* Recommended Mentors */}
              <section>
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Recommended Mentors
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Learn from people who know what you want to learn.
                    </p>
                  </div>

                  <button
                    onClick={() => changePage("Find Mentors")}
                    className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
                  >
                    View all <ArrowUpRight size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-violet-400">
                  <Search size={19} className="text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search mentors or skills..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Mentor Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredMentors.map((mentor) => (
                    <div
                      key={mentor.name}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-slate-200/60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="relative">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${mentor.color}`}>
                            {mentor.initials}
                          </div>

                          {mentor.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <Star
                            size={15}
                            className="fill-amber-400 text-amber-400"
                          />
                          {mentor.rating}
                        </div>
                      </div>

                      <h3 className="mt-4 font-bold text-slate-900">
                        {mentor.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {mentor.role}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {mentor.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs text-slate-400">
                            {mentor.sessions} sessions
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {mentor.credits} credits / session
                          </p>
                        </div>

                        <button
                          onClick={() => changePage("Find Mentors")}
                          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredMentors.length === 0 && (
                    <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      No mentors found. Try another search.
                    </p>
                  )}
                </div>
              </section>

              {/* Upcoming Sessions */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Upcoming Sessions
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your scheduled learning sessions.
                    </p>
                  </div>

                  <CalendarDays className="text-violet-600" size={22} />
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Code2 size={22} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        React Advanced Concepts
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        With Aarav Sharma
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      31 Oct, 2026
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      4:00 PM
                    </span>

                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-700">
                      Confirmed
                    </span>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
                <p>
                  © 2026 SkillSwap. Help Today. Learn Tomorrow.
                </p>

                <p>
                  Built for learners, by learners. 💜
                </p>
              </footer>
            </>

          ) : (

            /* OTHER PAGES PLACEHOLDER */
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold text-slate-900">
                {activePage}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This section will be developed in an upcoming phase.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* STAT CARD COMPONENT */
function StatCard({ icon: Icon, title, value, subtitle, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon size={21} />
        </div>

        <ArrowUpRight size={18} className="text-slate-300" />
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

export default App;
