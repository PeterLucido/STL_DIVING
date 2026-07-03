import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildPracticeDays,
  loadPracticeScheduleEntries,
  PracticeDay,
  PracticeScheduleEntry,
} from "../../lib/practiceSchedule";

const coachAccessCode = "STL2026";

export default function PracticeAdminContent() {
  const [coachName, setCoachName] = useState("Samantha");
  const [accessCode, setAccessCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [entries, setEntries] = useState<PracticeScheduleEntry[]>([]);
  const selectedDay = useMemo(
    () => practiceDays.find((day) => day.key === selectedDate),
    [practiceDays, selectedDate]
  );
  const selectedEntries = useMemo(
    () => entries.filter((entry) => entry.dateKey === selectedDate),
    [entries, selectedDate]
  );

  useEffect(() => {
    const days = buildPracticeDays();
    setPracticeDays(days);
    setSelectedDate(days[0]?.key ?? "");
    setIsAdmin(window.localStorage.getItem("stl-practice-admin") === "true");
    setEntries(loadPracticeScheduleEntries());
  }, []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (accessCode.trim() !== coachAccessCode) {
      setLoginError("That access code does not match.");
      return;
    }

    window.localStorage.setItem("stl-practice-admin", "true");
    setLoginError("");
    setIsAdmin(true);
    setEntries(loadPracticeScheduleEntries());
  };

  const handleLogout = () => {
    window.localStorage.removeItem("stl-practice-admin");
    setIsAdmin(false);
    setAccessCode("");
  };

  return (
    <main>
      <section className="planner-hero admin-hero">
        <div className="wrap planner-hero-grid">
          <div>
            <div className="eyebrow">Coach calendar</div>
            <h1>See who is scheduled for practice.</h1>
            <p className="lead">
              Samantha and Peter can use this coach view to check submitted practice
              plans and free intro session requests by date.
            </p>
            <div className="actions planner-admin-action">
              <a className="btn" href="/practice-planner">Parent calendar</a>
            </div>
          </div>
          <aside className="planner-login-card">
            <div className="planner-card-head">
              <span>{isAdmin ? `Admin: ${coachName}` : "Coach login"}</span>
              {isAdmin ? <button type="button" onClick={handleLogout}>Log out</button> : null}
            </div>
            {isAdmin ? (
              <div className="planner-profile-summary">
                <strong>{coachName}</strong>
                <span>STL Diving practice calendar access</span>
              </div>
            ) : (
              <form className="planner-login-form" onSubmit={handleLogin}>
                <label>Coach</label>
                <select value={coachName} onChange={(event) => setCoachName(event.target.value)}>
                  <option>Samantha</option>
                  <option>Peter</option>
                </select>
                <label>Access code</label>
                <input
                  required
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  placeholder="Coach access code"
                  type="password"
                />
                <button className="btn red" type="submit">Open Calendar</button>
                {loginError ? <p className="fine-print error-text">{loginError}</p> : null}
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
                <span className="tag">Admin calendar</span>
                <h2>Practice days.</h2>
                <p className="sub">
                  Select a day to see scheduled athletes, intro sessions, and drop-ins.
                </p>
              </div>
            </div>
            <div className="practice-day-grid" role="list">
              {practiceDays.map((day) => {
                const count = entries.filter((entry) => entry.dateKey === day.key).length;
                return (
                  <button
                    className={`practice-day${selectedDate === day.key ? " is-selected" : ""}`}
                    key={day.key}
                    onClick={() => setSelectedDate(day.key)}
                    type="button"
                  >
                    <span>{day.weekday}</span>
                    <strong>{day.monthDay}</strong>
                    <em>{count} scheduled</em>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="planner-submit-card admin-roster-card">
            <span className="tag">Roster</span>
            <h2>{selectedDay?.label ?? "Choose a day"}</h2>
            {!isAdmin ? (
              <p className="fine-print">Log in as Samantha or Peter to view the full roster.</p>
            ) : selectedEntries.length ? (
              <div className="admin-roster-list">
                {selectedEntries.map((entry) => (
                  <article className="admin-roster-entry" key={entry.id}>
                    <div>
                      <b>{entry.athleteName}</b>
                      <span>{entry.visitType} · {entry.time}</span>
                    </div>
                    <p>{entry.parentName} · {entry.email}{entry.phone ? ` · ${entry.phone}` : ""}</p>
                    {entry.message ? <p>{entry.message}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="fine-print">No athletes are listed for this practice day yet.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
