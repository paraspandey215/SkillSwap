
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Mail,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    session: true,
    messages: true,
    updates: false,
  });

  const [privacy, setPrivacy] = useState({
    profile: true,
    activity: false,
  });

  const [preferences, setPreferences] = useState({
    language: "English",
    timezone: "Asia/Kolkata",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = () => {
    setPasswordMessage("");

    if (!password.current || !password.new || !password.confirm) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (password.new.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (password.new !== password.confirm) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    setPasswordMessage(
      "Password form validated. Backend integration is required to actually change your password."
    );

    setPassword({
      current: "",
      new: "",
      confirm: "",
    });
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-violet-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your account preferences and privacy.
        </p>
      </div>

      {/* Account Preferences */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
            <UserRound size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">
              Account Preferences
            </h2>
            <p className="text-sm text-slate-500">
              Customize your experience.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => {
                setPreferences({ ...preferences, language: e.target.value });
                setSaved(false);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => {
                setPreferences({ ...preferences, timezone: e.target.value });
                setSaved(false);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
            >
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Bell size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">
              Notification Settings
            </h2>
            <p className="text-sm text-slate-500">
              Choose which notifications you receive.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            {
              key: "email",
              title: "Email Notifications",
              description: "Receive important updates through email.",
            },
            {
              key: "session",
              title: "Session Reminders",
              description: "Get reminders about upcoming mentorship sessions.",
            },
            {
              key: "messages",
              title: "Messages & Requests",
              description: "Get notified about new messages and booking requests.",
            },
            {
              key: "updates",
              title: "Platform Updates",
              description: "Receive news about new features and improvements.",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>

              <Toggle
                checked={notifications[item.key]}
                onChange={() => toggleNotification(item.key)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <ShieldCheck size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">
              Privacy Settings
            </h2>
            <p className="text-sm text-slate-500">
              Control what other users can see.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Public Profile
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Allow other users to view your profile.
              </p>
            </div>
            <Toggle
              checked={privacy.profile}
              onChange={() => togglePrivacy("profile")}
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Show Learning Activity
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Display your learning activity to other users.
              </p>
            </div>
            <Toggle
              checked={privacy.activity}
              onChange={() => togglePrivacy("activity")}
            />
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
            <LockKeyhole size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">
              Change Password
            </h2>
            <p className="text-sm text-slate-500">
              Update your account password.
            </p>
          </div>
        </div>

        <div className="max-w-xl space-y-4">
          {[
            { key: "current", label: "Current Password" },
            { key: "new", label: "New Password" },
            { key: "confirm", label: "Confirm New Password" },
          ].map((item) => (
            <div key={item.key}>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {item.label}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password[item.key]}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      [item.key]: e.target.value,
                    })
                  }
                  placeholder={`Enter ${item.label.toLowerCase()}`}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-violet-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handlePasswordChange}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Update Password
          </button>

          {passwordMessage && (
            <p className="text-sm text-slate-600">
              {passwordMessage}
            </p>
          )}
        </div>
      </section>

      {/* Save Settings */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-400">
          Your preferences are currently stored in this page's state.
        </p>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-100 hover:bg-violet-700"
        >
          {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saved ? "Saved Successfully" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
