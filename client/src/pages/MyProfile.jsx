
import { useState } from "react";
import {
  UserRound,
  Mail,
  MapPin,
  CalendarDays,
  Edit3,
  Award,
  BookOpen,
  Users,
  Star,
  X,
  Save,
} from "lucide-react";

export default function MyProfile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Paras Pandey",
    role: "Frontend Developer",
    email: "paras@example.com",
    location: "Haldwani, Uttarakhand",
    bio: "BCA student passionate about programming, web development and learning new technologies.",
    skills: ["HTML", "CSS", "JavaScript", "React", "C++", "Python"],
  });

  const [form, setForm] = useState(profile);

  const handleSave = () => {
    setProfile(form);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your profile and showcase your skills.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-500" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-violet-100 text-3xl font-bold text-violet-700">
                {profile.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {profile.role}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setForm(profile);
                setEditing(true);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Mail size={16} />
              {profile.email}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} />
              {profile.location}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={16} />
              Joined October 2026
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sessions Completed", value: "24", icon: BookOpen },
          { label: "People Helped", value: "8", icon: Users },
          { label: "Credits Earned", value: "185", icon: Award },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <Icon size={21} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {item.value}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* About and Skills */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-900">About Me</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {profile.bio}
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="font-bold text-slate-900">My Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">Achievements</h3>

          <div className="mt-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Award size={21} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Rising Star
                </p>
                <p className="text-xs text-slate-500">
                  Earned 100+ credits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Star size={21} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Active Learner
                </p>
                <p className="text-xs text-slate-500">
                  Completed 20+ sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Edit Profile
              </h2>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name" },
                { label: "Role", key: "role" },
                { label: "Email", key: "email" },
                { label: "Location", key: "location" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    value={form[field.key]}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  About Me
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
