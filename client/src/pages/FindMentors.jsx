
import { useMemo, useState } from "react";
import {
  Search,
  Star,
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

const mentorData = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Full Stack Developer",
    skills: ["React", "Node.js", "MongoDB"],
    experience: "Advanced",
    availability: "Available Today",
    rating: 4.9,
    sessions: 48,
    credits: 5,
    initials: "AS",
    color: "bg-violet-100 text-violet-700",
    languages: ["English", "Hindi"],
    description: "I help students build modern web applications and understand full-stack development.",
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "UI/UX Designer",
    skills: ["Figma", "UI Design", "Prototyping"],
    experience: "Intermediate",
    availability: "Available Today",
    rating: 4.8,
    sessions: 36,
    credits: 4,
    initials: "PV",
    color: "bg-pink-100 text-pink-700",
    languages: ["English", "Hindi"],
    description: "Passionate about user-friendly interfaces, design systems and creative problem solving.",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    role: "Python Developer",
    skills: ["Python", "Django", "Machine Learning"],
    experience: "Advanced",
    availability: "Available Tomorrow",
    rating: 5.0,
    sessions: 62,
    credits: 6,
    initials: "RM",
    color: "bg-blue-100 text-blue-700",
    languages: ["English", "Hindi"],
    description: "Helping beginners understand Python, backend development and machine learning.",
  },
  {
    id: 4,
    name: "Sneha Kapoor",
    role: "Java Developer",
    skills: ["Java", "DSA", "Spring Boot"],
    experience: "Intermediate",
    availability: "Available Today",
    rating: 4.7,
    sessions: 29,
    credits: 4,
    initials: "SK",
    color: "bg-orange-100 text-orange-700",
    languages: ["English"],
    description: "Let's solve programming problems and improve your Java and DSA fundamentals.",
  },
  {
    id: 5,
    name: "Aditya Singh",
    role: "Frontend Developer",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    experience: "Beginner",
    availability: "Available Tomorrow",
    rating: 4.6,
    sessions: 18,
    credits: 3,
    initials: "AS",
    color: "bg-emerald-100 text-emerald-700",
    languages: ["Hindi", "English"],
    description: "I enjoy helping beginners create their first websites and understand frontend basics.",
  },
  {
    id: 6,
    name: "Neha Gupta",
    role: "Database Developer",
    skills: ["SQL", "MongoDB", "MySQL"],
    experience: "Advanced",
    availability: "Available Today",
    rating: 4.9,
    sessions: 54,
    credits: 5,
    initials: "NG",
    color: "bg-rose-100 text-rose-700",
    languages: ["English", "Hindi"],
    description: "Learn database design, queries, normalization and practical database concepts.",
  },
];

function FindMentors() {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All Skills");
  const [experience, setExperience] = useState("All Levels");
  const [availability, setAvailability] = useState("Any Time");
  const [language, setLanguage] = useState("All Languages");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [notice, setNotice] = useState("");

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
  }, [search, skill, experience, availability, language]);

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
            options={[
              "All Skills",
              "React",
              "Node.js",
              "Python",
              "Java",
              "DSA",
              "Figma",
              "SQL",
              "MongoDB",
              "HTML",
              "CSS",
              "JavaScript",
            ]}
          />

          <FilterSelect
            label="Experience Level"
            value={experience}
            onChange={setExperience}
            options={[
              "All Levels",
              "Beginner",
              "Intermediate",
              "Advanced",
            ]}
          />

          <FilterSelect
            label="Availability"
            value={availability}
            onChange={setAvailability}
            options={[
              "Any Time",
              "Available Today",
              "Available Tomorrow",
            ]}
          />

          <FilterSelect
            label="Language"
            value={language}
            onChange={setLanguage}
            options={[
              "All Languages",
              "English",
              "Hindi",
            ]}
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
              {filteredMentors.length} mentors found
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sample mentor profiles
          </span>
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <article
              key={mentor.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${mentor.color}`}>
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

                <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  {mentor.rating}
                </div>
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
                    <Code2 size={15} /> {mentor.experience}
                  </span>

                  <span className="flex items-center gap-2">
                    <Users size={15} /> {mentor.sessions} sessions
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
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
                  <p className="text-xs text-slate-400">Session cost</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {mentor.credits} credits
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setNotice("");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                  Request Session
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredMentors.length === 0 && (
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

      {/* Booking Preview Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${selectedMentor.color}`}>
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

            {notice ? (
              <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                {notice}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Booking requests and credit verification will be connected
                to the backend in a later development phase. This is
                currently a preview only.
              </p>
            )}

            <button
              onClick={() =>
                setNotice(
                  "Booking preview only. The actual booking system will be implemented in Phase 5."
                )
              }
              className="mt-5 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Continue
            </button>

            <button
              onClick={() => setSelectedMentor(null)}
              className="mt-2 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
