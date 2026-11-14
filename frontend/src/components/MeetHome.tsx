import { useMemo, useState } from "react";

/* ---------- helpers ---------- */

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, n: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const formatHeading = (d: Date) =>
  d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

/* ---------- icons (inline SVG, no extra dependencies) ---------- */

type IconProps = { className?: string };

const KeyboardIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 12H4V7h16v10ZM5 8h2v2H5V8Zm3 0h2v2H8V8Zm3 0h2v2h-2V8Zm3 0h2v2h-2V8Zm3 0h2v2h-2V8ZM5 11h2v2H5v-2Zm3 0h2v2H8v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2ZM8 14h8v2H8v-2Z" />
  </svg>
);

const NewMeetingIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17 10.5V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3.5l5 4v-11l-5 4ZM15 17H4V7h11v10Zm-6-8h2v2h2v2h-2v2H9v-2H7v-2h2V9Z" />
  </svg>
);

const HelpIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M11 18h2v-2h-2v2Zm1-16a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-14a4 4 0 0 0-4 4h2a2 2 0 1 1 4 0c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4Z" />
  </svg>
);

const SettingsIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 13.9 2h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.7 8.47a.48.48 0 0 0 .12.64l2.03 1.58c-.05.31-.07.63-.07.94s.02.63.07.94L2.82 14.14a.5.5 0 0 0-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.01-1.58ZM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Z" />
  </svg>
);

const AppsIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    {[4, 10, 16].flatMap((y) =>
      [4, 10, 16].map((x) => (
        <circle key={`${x}-${y}`} cx={x + 2} cy={y + 2} r="2" />
      ))
    )}
  </svg>
);

const CalendarIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2ZM7 12h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-8 4h2v2H7v-2Zm4 0h2v2h-2v-2Z" />
  </svg>
);

const PhoneIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
  </svg>
);

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    {dir === "left" ? (
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59Z" />
    ) : (
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41Z" />
    )}
  </svg>
);

const MeetLogo = () => (
  <svg viewBox="0 0 40 32" className="h-8 w-10" aria-hidden="true">
    <path d="M26 11.5 34.5 4.5c1-.8 2.5-.1 2.5 1.2v20.6c0 1.3-1.5 2-2.5 1.2L26 20.5v-9Z" fill="#fbbc04" />
    <path d="M26 11.5v9l-6 5.5V6l6 5.5Z" fill="#ea8600" />
    <rect x="2" y="6" width="22" height="20" rx="3" fill="#fbbc04" />
    <rect x="2" y="19" width="5" height="7" rx="1.5" fill="#ffd966" />
  </svg>
);

/* ---------- empty-state illustration ---------- */

const EmptyIllustration = () => (
  <svg
    viewBox="0 0 320 180"
    className="h-44 w-80"
    fill="none"
    stroke="#1f1f1f"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Illustration of a coffee cup, pencil and laptop"
  >
    <defs>
      <linearGradient id="cup" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbd34d" />
        <stop offset="0.55" stopColor="#fbd34d" />
        <stop offset="1" stopColor="#f6a6d8" />
      </linearGradient>
    </defs>

    {/* ground line */}
    <path d="M10 172h300" />

    {/* pink dome */}
    <path d="M10 172c0-45 30-75 62-75 0 28 10 55 18 75H10Z" fill="#f3b9e6" />

    {/* steam */}
    <path d="M70 62c-22-4-26-16-4-24 14-5 22-6 28-12" />

    {/* cup */}
    <path d="M95 118h62c0 30-12 54-31 54s-31-24-31-54Z" fill="url(#cup)" />
    <path d="M157 128c14-2 20 6 14 16-4 6-10 8-17 8" />

    {/* pencil */}
    <path d="M175 85 188 172" stroke="none" />
    <path d="m183 80 3 12 22 80h-9l-22-80-3-12 9 0Z" fill="#fdf36b" />
    <path d="m183 80 6-14 3 12-9 2Z" fill="#fff" />

    {/* laptop */}
    <path d="m235 105 70-6-12 73H225l10-67Z" fill="#fff" />
    <path d="m248 118 40-8-4 38-36 4 0-34Z" />
    <circle cx="255" cy="140" r="4" />
    <path d="m290 118-14 24" />

    {/* squiggle + sun */}
    <path d="M205 62c10-30 40-34 66-28" />
    <circle cx="282" cy="30" r="10" fill="#fbd34d" stroke="none" />
  </svg>
);

/* ---------- page ---------- */

export default function MeetHome() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selected, setSelected] = useState<Date>(today);
  const [code, setCode] = useState("");

  const weekStart = useMemo(
    () => addDays(selected, -selected.getDay()),
    [selected]
  );
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const isToday = sameDay(selected, today);
  const canJoin = code.trim().length > 0;

  return (
    <div className="min-h-screen bg-white font-sans text-[#1f1f1f]">
      {/* top bar */}
      <header className="flex items-center gap-4 px-5 py-3">
        <a href="/" className="flex items-center gap-2 rounded-lg" aria-label="Meet home">
          <MeetLogo />
          <span className="text-[22px] text-[#444746]">Meet</span>
        </a>

        <div className="mx-auto flex items-center gap-3">
          <form
            className="flex h-12 w-[26rem] max-w-[50vw] items-center gap-3 rounded-full bg-[#f0f4f9] pl-5 pr-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (canJoin) console.log("join", code);
            }}
          >
            <KeyboardIcon className="h-5 w-5 shrink-0 text-[#444746]" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter a code or nickname"
              aria-label="Meeting code or nickname"
              className="min-w-0 flex-1 bg-transparent text-base text-[#1f1f1f] placeholder:text-[#444746] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!canJoin}
              className="h-9 rounded-full px-5 text-sm font-medium text-[#0b57d0] transition enabled:hover:bg-[#d3e3fd] disabled:bg-[#e1e3e1] disabled:text-[#8e918f]"
            >
              Join
            </button>
          </form>

          <button className="flex h-12 items-center gap-2 rounded-full bg-[#c4eed0] px-5 text-sm font-medium text-[#072711] transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b57d0]">
            <NewMeetingIcon />
            New
          </button>
        </div>

        <div className="flex items-center gap-1 text-[#444746]">
          <button className="rounded-full p-2.5 hover:bg-[#f0f4f9]" aria-label="Help">
            <HelpIcon />
          </button>
          <button className="rounded-full p-2.5 hover:bg-[#f0f4f9]" aria-label="Settings">
            <SettingsIcon />
          </button>
          <button className="rounded-full p-2.5 hover:bg-[#f0f4f9]" aria-label="Apps">
            <AppsIcon />
          </button>
          <button
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#b3261e] text-lg text-white"
            aria-label="Account"
          >
            K
          </button>
        </div>
      </header>

      <div className="flex">
        {/* side nav */}
        <nav className="flex w-[4.5rem] shrink-0 flex-col items-center gap-3 pt-6" aria-label="Primary">
          <a href="#meetings" className="group flex flex-col items-center gap-1" aria-current="page">
            <span className="flex h-8 w-14 items-center justify-center rounded-full bg-[#d3e3fd] text-[#041e49]">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-[#0b57d0]">Meetings</span>
          </a>
          <a href="#calls" className="group flex flex-col items-center gap-1">
            <span className="flex h-8 w-14 items-center justify-center rounded-full text-[#444746] group-hover:bg-[#f0f4f9]">
              <PhoneIcon className="h-5 w-5" />
            </span>
            <span className="text-xs text-[#444746]">Calls</span>
          </a>
        </nav>

        {/* main */}
        <main className="mx-auto w-full max-w-[67rem] px-6 pt-6">
          {/* date row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-normal">{formatHeading(selected)}</h1>
              <button
                onClick={() => setSelected(today)}
                className="rounded-full p-1.5 text-[#444746] hover:bg-[#f0f4f9]"
                aria-label="Jump to today"
              >
                <CalendarIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#444746]">
              <button
                onClick={() => setSelected(addDays(selected, -7))}
                className="rounded-full p-1.5 hover:bg-[#f0f4f9]"
                aria-label="Previous week"
              >
                <Chevron dir="left" />
              </button>

              <ul className="flex gap-1">
                {week.map((d) => {
                  const active = sameDay(d, selected);
                  return (
                    <li key={d.toISOString()}>
                      <button
                        onClick={() => setSelected(d)}
                        aria-pressed={active}
                        className={`flex h-14 w-[3.25rem] flex-col items-center justify-center rounded-full transition ${
                          active
                            ? "bg-[#d3e3fd] text-[#041e49]"
                            : "hover:bg-[#f0f4f9]"
                        }`}
                      >
                        <span className="text-[11px] font-medium tracking-wide">
                          {DAY_LABELS[d.getDay()]}
                        </span>
                        <span className="text-lg leading-tight text-[#1f1f1f]">
                          {d.getDate()}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={() => setSelected(addDays(selected, 7))}
                className="rounded-full p-1.5 hover:bg-[#f0f4f9]"
                aria-label="Next week"
              >
                <Chevron dir="right" />
              </button>
            </div>
          </div>

          {/* install banner */}
          <section className="mt-6 flex items-center justify-between rounded-2xl bg-[#f0f4f9] px-4 py-4">
            <div>
              <h2 className="text-base font-medium">
                Upgrade Your Meetings with the Google Meet App
              </h2>
              <p className="text-sm text-[#444746]">
                Get to your meetings faster with the Google Meet App
              </p>
            </div>
            <button className="h-11 rounded-full border border-[#747775] px-6 text-sm font-medium text-[#0b57d0] transition hover:bg-[#d3e3fd]/50">
              Install
            </button>
          </section>

          {/* empty state */}
          <section className="flex flex-col items-center pb-24 pt-20 text-center">
            <EmptyIllustration />
            <h2 className="mt-6 text-[32px] font-normal leading-tight">
              {isToday
                ? "No meetings scheduled for today"
                : "No meetings scheduled for this day"}
            </h2>
            <p className="mt-4 text-base text-[#444746]">
              Schedule a meeting or enjoy the free time
            </p>
            <button className="mt-4 flex h-12 items-center gap-2 rounded-full bg-[#c4eed0] px-6 text-sm font-medium text-[#072711] outline outline-[3px] outline-offset-2 outline-[#0b4a8f] transition hover:shadow-md">
              <NewMeetingIcon />
              New
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}