
import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  BookOpen,
  Code2,
  Palette,
  Filter,
  X,
  CalendarDays,
  CircleHelp,
} from "lucide-react";

const transactions = [
  {
    id: 1,
    title: "Welcome Bonus",
    description: "Credits received for joining SkillSwap",
    type: "Earned",
    category: "Bonus",
    credits: 10,
    date: "30 Oct, 2026",
    time: "10:30 AM",
    icon: Gift,
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: 2,
    title: "React Mentorship Session",
    description: "Session with Aarav Sharma",
    type: "Spent",
    category: "Learning",
    credits: 5,
    date: "28 Oct, 2026",
    time: "4:00 PM",
    icon: Code2,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    title: "Mentorship Reward",
    description: "Helped a student with HTML and CSS",
    type: "Earned",
    category: "Teaching",
    credits: 8,
    date: "26 Oct, 2026",
    time: "2:15 PM",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 4,
    title: "UI/UX Design Session",
    description: "Session with Priya Verma",
    type: "Spent",
    category: "Learning",
    credits: 4,
    date: "24 Oct, 2026",
    time: "11:00 AM",
    icon: Palette,
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: 5,
    title: "Referral Bonus",
    description: "Reward for inviting a new learner",
    type: "Earned",
    category: "Bonus",
    credits: 6,
    date: "22 Oct, 2026",
    time: "9:45 AM",
    icon: Gift,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: 6,
    title: "Python Mentorship Session",
    description: "Session with Rahul Mehta",
    type: "Spent",
    category: "Learning",
    credits: 3,
    date: "20 Oct, 2026",
    time: "3:00 PM",
    icon: Code2,
    color: "bg-blue-100 text-blue-700",
  },
];

const filters = ["All", "Earned", "Spent"];

function CreditWallet() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const totalEarned = transactions
    .filter((item) => item.type === "Earned")
    .reduce((sum, item) => sum + item.credits, 0);

  const totalSpent = transactions
    .filter((item) => item.type === "Spent")
    .reduce((sum, item) => sum + item.credits, 0);

  const availableCredits = 25;

  const filteredTransactions = transactions.filter((item) => {
    const matchesFilter =
      activeFilter === "All" || item.type === activeFilter;

    const matchesSearch =
      `${item.title} ${item.description} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getCount = (filter) => {
    if (filter === "All") return transactions.length;

    return transactions.filter(
      (item) => item.type === filter
    ).length;
  };

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Credit Wallet
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your learning credits and track every transaction.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
          <Wallet size={18} />
          SkillSwap Wallet
        </div>
      </section>

      {/* Main Wallet Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-700 p-6 text-white shadow-lg shadow-violet-100 md:p-8">

        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-36 h-52 w-52 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-2 text-sm text-violet-100">
              <Wallet size={20} />
              Available Balance
            </div>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              {availableCredits}
              <span className="ml-2 text-xl font-medium text-violet-200">
                Credits
              </span>
            </h2>

            <p className="mt-3 text-sm text-violet-100">
              Your credits help you learn and exchange skills.
            </p>
          </div>

          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/10 sm:h-28 sm:w-28">
            <Wallet size={48} />
          </div>
        </div>

        <div className="relative z-10 mt-8 border-t border-white/20 pt-5">
          <p className="text-xs text-violet-200">
            SkillSwap Credit System
          </p>

          <p className="mt-1 text-sm font-medium">
            Learn skills. Share knowledge. Earn credits.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <SummaryCard
          title="Available Credits"
          value={availableCredits}
          subtitle="Current wallet balance"
          icon={Wallet}
          color="violet"
        />

        <SummaryCard
          title="Total Earned"
          value={totalEarned}
          subtitle="Credits earned so far"
          icon={TrendingUp}
          color="emerald"
        />

        <SummaryCard
          title="Total Spent"
          value={totalSpent}
          subtitle="Credits used for learning"
          icon={TrendingDown}
          color="orange"
        />
      </section>

      {/* Transaction History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <History size={20} className="text-violet-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Transaction History
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              View all your credit earnings and spending.
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-violet-400 md:w-72">
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">

          <Filter size={17} className="mr-1 text-slate-400" />

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
              {filter} ({getCount(filter)})
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="mt-5 divide-y divide-slate-100">

          {filteredTransactions.map((transaction) => {
            const Icon = transaction.icon;
            const earned = transaction.type === "Earned";

            return (
              <div
                key={transaction.id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">

                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${transaction.color}`}>
                    <Icon size={21} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {transaction.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.description}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={13} />
                      {transaction.date}
                      <span>·</span>
                      {transaction.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">

                  <div className="text-right">
                    <p className={`text-sm font-bold ${earned ? "text-emerald-600" : "text-rose-600"}`}>
                      {earned ? "+" : "-"}
                      {transaction.credits} Credits
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {transaction.category}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
                    title="View transaction details"
                  >
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <History
                size={35}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-slate-800">
                No transactions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Credit Information */}
      <section className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <CircleHelp
          size={20}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <h3 className="text-sm font-semibold text-blue-900">
            How do SkillSwap credits work?
          </h3>

          <p className="mt-1 text-xs leading-5 text-blue-800">
            Earn credits by mentoring other students and spend credits
            when learning from mentors. Credits are transferred only
            after a session is successfully completed.
          </p>
        </div>
      </section>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  Transaction Details
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedTransaction.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                {selectedTransaction.type === "Earned"
                  ? "Credits Received"
                  : "Credits Spent"}
              </p>

              <h3 className={`mt-2 text-3xl font-bold ${
                selectedTransaction.type === "Earned"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}>
                {selectedTransaction.type === "Earned" ? "+" : "-"}
                {selectedTransaction.credits}
                <span className="ml-2 text-base">Credits</span>
              </h3>
            </div>

            <div className="mt-5 space-y-4">

              <DetailRow
                label="Description"
                value={selectedTransaction.description}
              />

              <DetailRow
                label="Transaction Type"
                value={selectedTransaction.type}
              />

              <DetailRow
                label="Category"
                value={selectedTransaction.category}
              />

              <DetailRow
                label="Date"
                value={selectedTransaction.date}
              />

              <DetailRow
                label="Time"
                value={selectedTransaction.time}
              />

              <DetailRow
                label="Transaction ID"
                value={`SS-${selectedTransaction.id}2026`}
              />
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        SkillSwap · Help Today. Learn Tomorrow.
      </p>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
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

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="max-w-[65%] text-right text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ArrowRightIcon() {
  return <ArrowUpRight size={17} />;
}

export default CreditWallet;
