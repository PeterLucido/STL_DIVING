import { FormEvent, useEffect, useMemo, useState } from "react";

type PlannerProfile = {
  parentName: string;
  athleteName: string;
  email: string;
  phone: string;
};

type PracticeDay = {
  key: string;
  label: string;
  weekday: string;
  monthDay: string;
};

const initialProfile: PlannerProfile = {
  parentName: "",
  athleteName: "",
  email: "",
  phone: "",
};

const timeOptions = ["5:30 PM", "6:30 PM", "7:30 PM"];

function buildPracticeDays() {
  const days: PracticeDay[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  for (let offset = 0; days.length < 12 && offset < 28; offset += 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);

    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    days.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      monthDay: formatter.format(date),
    });
  }

  return days;
}

export default function PracticePlannerContent() {
  const [profile, setProfile] = useState<PlannerProfile>(initialProfile);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);
  const [visitType, setVisitType] = useState("Free intro session");
  const selectedDay = useMemo(
    () => practiceDays.find((day) => day.key === selectedDate),
    [practiceDays, selectedDate]
  );

  useEffect(() => {
    const days = buildPracticeDays();
    setPracticeDays(days);
    setSelectedDate(days[0]?.key ?? "");

    const savedProfile = window.localStorage.getItem("stl-practice-planner-profile");
    if (!savedProfile) return;

    try {
      const parsedProfile = JSON.parse(savedProfile) as PlannerProfile;
      setProfile({ ...initialProfile, ...parsedProfile });
      setIsSignedIn(Boolean(parsedProfile.email));
    } catch {
      window.localStorage.removeItem("stl-practice-planner-profile");
    }
  }, []);

  const handleProfileChange = (field: keyof PlannerProfile, value: string) => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
  };

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("stl-practice-planner-profile", JSON.stringify(profile));
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    window.localStorage.removeItem("stl-practice-planner-profile");
    setProfile(initialProfile);
    setIsSignedIn(false);
  };

  return (
    <main>
      <section className="planner-hero">
        <div className="wrap planner-hero-grid">
          <div>
            <div className="eyebrow">Practice Planner</div>
            <h1>Tell us when you are coming to practice.</h1>
            <p className="lead">
              Parents and divers can sign in, choose a practice day, and send STL Diving
              a quick attendance plan. New families can use it to pick a free intro
              session day.
            </p>
            <div className="planner-name-list">
              <span>Other name ideas:</span>
              <b>Dive Calendar</b>
              <b>BoardTime</b>
              <b>Practice Check-In</b>
            </div>
          </div>
          <aside className="planner-login-card">
            <div className="planner-card-head">
              <span>{isSignedIn ? "Signed in" : "Parent / diver login"}</span>
              {isSignedIn ? <button type="button" onClick={handleSignOut}>Switch</button> : null}
            </div>
            {isSignedIn ? (
              <div className="planner-profile-summary">
                <strong>{profile.athleteName || "Athlete"}</strong>
                <span>{profile.parentName || "Parent / guardian"}</span>
                <span>{profile.email}</span>
              </div>
            ) : (
              <form className="planner-login-form" onSubmit={handleSignIn}>
                <label>Parent name</label>
                <input
                  required
                  value={profile.parentName}
                  onChange={(event) => handleProfileChange("parentName", event.target.value)}
                  placeholder="Parent or guardian"
                />
                <label>Athlete name</label>
                <input
                  required
                  value={profile.athleteName}
                  onChange={(event) => handleProfileChange("athleteName", event.target.value)}
                  placeholder="Diver name"
                />
                <label>Email</label>
                <input
                  required
                  type="email"
                  value={profile.email}
                  onChange={(event) => handleProfileChange("email", event.target.value)}
                  placeholder="Email address"
                />
                <label>Phone</label>
                <input
                  value={profile.phone}
                  onChange={(event) => handleProfileChange("phone", event.target.value)}
                  placeholder="Phone number"
                />
                <button className="btn red" type="submit">Continue</button>
              </form>
            )}
          </aside>
        </div>
      </section>

      <section className="section planner-section">
        <div className="wrap planner-grid">
          <div className="planner-calendar">
            <div className="section-head planner-section-head">
              <div>
                <span className="tag">Calendar</span>
                <h2>Choose a day.</h2>
                <p className="sub">
                  Pick the day the athlete plans to attend. This sends a schedule note to STL Diving.
                </p>
              </div>
            </div>
            <div className="practice-day-grid" role="list">
              {practiceDays.map((day) => (
                <button
                  className={`practice-day${selectedDate === day.key ? " is-selected" : ""}`}
                  key={day.key}
                  onClick={() => setSelectedDate(day.key)}
                  type="button"
                >
                  <span>{day.weekday}</span>
                  <strong>{day.monthDay}</strong>
                </button>
              ))}
            </div>
            <div className="planner-options">
              <label>
                Visit type
                <select value={visitType} onChange={(event) => setVisitType(event.target.value)}>
                  <option>Free intro session</option>
                  <option>Monthly practice attendance</option>
                  <option>Drop-in practice</option>
                  <option>Schedule question</option>
                </select>
              </label>
              <label>
                Preferred time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {timeOptions.map((time) => <option key={time}>{time}</option>)}
                </select>
              </label>
            </div>
          </div>

          <form className="form planner-submit-card" action="https://formsubmit.co/info@stldiving.com" method="POST">
            <input name="_subject" type="hidden" value="STL Diving Practice Planner" />
            <input name="_template" type="hidden" value="table" />
            <input name="_captcha" type="hidden" value="false" />
            <input name="parent_name" type="hidden" value={profile.parentName} />
            <input name="athlete_name" type="hidden" value={profile.athleteName} />
            <input name="email" type="hidden" value={profile.email} />
            <input name="phone" type="hidden" value={profile.phone} />
            <input name="visit_type" type="hidden" value={visitType} />
            <input name="practice_date" type="hidden" value={selectedDay?.label ?? selectedDate} />
            <input name="preferred_time" type="hidden" value={selectedTime} />

            <span className="tag">Schedule note</span>
            <h2>{visitType}</h2>
            <div className="planner-summary-list">
              <div><b>Athlete</b><span>{profile.athleteName || "Sign in first"}</span></div>
              <div><b>Date</b><span>{selectedDay?.label ?? "Choose a day"}</span></div>
              <div><b>Time</b><span>{selectedTime}</span></div>
            </div>
            <label>Anything coaches should know?</label>
            <textarea
              name="message"
              placeholder="Age, experience, goals, or any timing details..."
            ></textarea>
            <button className="btn red" disabled={!isSignedIn || !selectedDate} type="submit">
              Send Practice Plan
            </button>
            {!isSignedIn ? (
              <p className="fine-print">Sign in with parent and athlete details before sending.</p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}
