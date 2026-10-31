
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Clock3,
  Users,
  Code2,
  SlidersHorizontal,
  X,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

function FindMentors() {
  const [mentorData, setMentorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All Skills");
  const [experience, setExperience] = useState("All Levels");
  const [availability, setAvailability] = useState("Any Time");
  const [language, setLanguage] = useState("All Languages");

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [notice, setNotice] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking form
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionDate, setSessionDate] = useState(getToday());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:00");

  // Fetch real mentors from backend
  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/mentors`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load mentors.");
      }

      const formattedMentors = (data.mentors || []).map(
        (mentor, index) => ({
          id: Number(mentor.mentor_id || mentor.user_id),
          name: mentor.name || "Unknown Mentor",
          role: mentor.headline || "Mentor",
          skills: (mentor.skills || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          experience: `${mentor.experience || 0} years`,
          experienceValue: Number(mentor.experience || 0),
          availability: mentor.availability || "Not specified",
          credits: Number(mentor.hourly_credits || 1),
          initials: getInitials(mentor.name),
          color: COLORS[index % COLORS.length],
          languages: (mentor.languages || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          description:
            mentor.description || "Mentor available for skill exchange.",
          location: mentor.location || "Not specified",
        })
      );

      setMentorData(formattedMentors);
    } catch (err) {
      console.error("Fetch Mentors Error:", err);
      setError(err.message || "Failed to load mentors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // Dynamic filter options based on database mentors
  const skillOptions = useMemo(
    () => [
      "All Skills",
      ...new Set(mentorData.flatMap((mentor) => mentor.skills)),
    ],
    [mentorData]
  );

  const experienceOptions = useMemo(
    () => [
      "All Levels",
      ...new Set(mentorData.map((mentor) => mentor.experience)),
    ],
    [mentorData]
  );

  const availabilityOptions = useMemo(
    () => [
      "Any Time",
      ...new Set(mentorData.map((mentor) => mentor.availability)),
    ],
    [mentorData]
  );

  const languageOptions = useMemo(
    () => [
      "All Languages",
      ...new Set(mentorData.flatMap((mentor) => mentor.languages)),
    ],
    [mentorData]
  );

  // Search and filter mentors
  const filteredMentors = useMemo(() => {
    return mentorData.filter((mentor) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        mentor.name.toLowerCase().includes(searchText) ||
        mentor.role.toLowerCase().includes(searchText) ||
        mentor.skills.some((item) =>
          item.toLowerCase().includes(searchText)
        );

      const matchesSkill =
        skill === "All Skills" || mentor.skills.includes(skill);

      const matchesExperience =
        experience === "All Levels" ||
        mentor.experience === experience;

      const matchesAvailability =
        availability === "Any Time" ||
        mentor.availability === availability;

      const matchesLanguage =
        language === "All Languages" ||
        mentor.languages.includes(language);

      return (
        matchesSearch &&
        matchesSkill &&
        matchesExperience &&
        matchesAvailability &&
        matchesLanguage
      );
    });
  }, [
    mentorData,
    search,
    skill,
    experience,
    availability,
    language,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSkill("All Skills");
    setExperience("All Levels");
    setAvailability("Any Time");
    setLanguage("All Languages");
  };

  const hasFilters =
    search ||
    skill !== "All Skills" ||
    experience !== "All Levels" ||
    availability !== "Any Time" ||
    language !== "All Languages";

  // Open booking modal
  const openBookingModal = (mentor) => {
    setSelectedMentor(mentor);
    setNotice("");
    setSessionTitle("");
    setSessionDescription("");
    setSessionDate(getToday());
    setStartTime("18:00");
    setEndTime("19:00");
  };

  // Submit actual booking request
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedMentor) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setNotice("Please login again to create a booking.");
      return;
    }

    if (!sessionTitle.trim()) {
      setNotice("Please enter a session title.");
      return;
    }

    if (startTime >= endTime) {
      setNotice("End time must be after start time.");
      return;
    }

    try {
      setBookingLoading(true);
      setNotice("");

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentor_id: selectedMentor.id,
          session_title: sessionTitle.trim(),
          session_description: sessionDescription.trim(),
          session_date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          credits: selectedMentor.credits,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Booking request failed.");
      }

      setNotice(
        `Booking request submitted successfully! Booking ID: ${data.bookingId}. Waiting for mentor approval.`
      );

      setSessionTitle("");
      setSessionDescription("");
    } catch (err) {
      console.error("Booking Error:", err);
      setNotice(err.message || "Unable to submit booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Heading */}
      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
          <Sparkles size={16} />
          Find your learning partner
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Discover Mentors
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Connect with skilled people and learn something new every day.
        </p>
      </section>

      {/* Search Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white md:p-8">
        <h2 className="text-xl font-bold md:text-2xl">
          Find the right person to help you grow.
        </h2>

        <p className="mt-2 text-sm text-violet-100">
          Search skills, explore mentors and exchange knowledge.
        </p>

        <div className="mt-5 flex max-w-2xl items-center gap-3 rounded-xl bg-white px-4 py-3">
          <Search className="shrink-0 text-slate-400" size={20} />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search React, Python, Java, UI/UX..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X size={18} className="text-slate-400" />
            </button>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-violet-600" />
            <h3 className="font-semibold text-slate-800">
              Filter Mentors
            </h3>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-violet-600 hover:text-violet-800"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Skill / Technology"
            value={skill}
            onChange={setSkill}
            options={skillOptions}
          />

          <FilterSelect
            label="Experience"
            value={experience}
            onChange={setExperience}
            options={experienceOptions}
          />

          <FilterSelect
            label="Availability"
            value={availability}
            onChange={setAvailability}
            options={availabilityOptions}
          />

          <FilterSelect
            label="Language"
            value={language}
            onChange={setLanguage}
            options={languageOptions}
          />
        </div>
      </section>

      {/* Results Heading */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available Mentors
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading mentors..." : `${filteredMentors.length} mentors found`}
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live database profiles
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading mentors from database...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              onClick={fetchMentors}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Mentor Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-slate-200/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${mentor.color}`}
                    >
                      {mentor.initials}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        {mentor.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {mentor.role}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Mentor
                  </span>
                </div>

                <p className="mt-4 min-h-10 text-sm leading-5 text-slate-500">
                  {mentor.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {mentor.skills.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-2">
                      <Code2 size={15} />
                      {mentor.experience} experience
                    </span>

                    <span className="flex items-center gap-2">
                      <Users size={15} />
                      {mentor.location}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-slate-500">
                      <CalendarDays size={15} />
                      {mentor.availability}
                    </span>

                    <span className="font-medium text-slate-600">
                      {mentor.languages.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Session cost
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {mentor.credits} credits
                    </p>
                  </div>

                  <button
                    onClick={() => openBookingModal(mentor)}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                  >
                    Request Session
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredMentors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <Search size={32} className="mx-auto text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-800">
              No mentors found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-violet-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Request a Session
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Selected mentor
                </p>
              </div>

              <button
                onClick={() => setSelectedMentor(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${selectedMentor.color}`}
                >
                  {selectedMentor.initials}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedMentor.name}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {selectedMentor.role}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm text-slate-500">
                  Session cost
                </span>

                <span className="font-bold text-violet-700">
                  {selectedMentor.credits} credits
                </span>
              </div>
            </div>

            <form onSubmit={handleBooking} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Session Title
                </label>

                <input
                  type="text"
                  required
                  maxLength={200}
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. JavaScript Advanced Concepts"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Session Description
                </label>

                <textarea
                  rows={3}
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  placeholder="What would you like to learn?"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Session Date
                </label>

                <input
                  type="date"
                  required
                  min={getToday()}
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start Time
                  </label>

                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End Time
                  </label>

                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {notice && (
                <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={17} />
                {bookingLoading ? "Submitting..." : "Submit Booking Request"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable filter component
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FindMentors;
