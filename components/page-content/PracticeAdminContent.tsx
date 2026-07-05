import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildPracticeDays,
  loadSupabasePracticeScheduleEntries,
  PracticeDay,
  PracticeScheduleEntry,
} from "../../lib/practiceSchedule";

const coachAccessCode = "1016";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "A";
}

function getMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function getMonthLabel(dateKey: string) {
  const [year, month] = getMonthKey(dateKey).split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

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
  const selectedMonthKey = selectedDate ? getMonthKey(selectedDate) : "";
  const selectedMonthLabel = selectedDate ? getMonthLabel(selectedDate) : "Practice month";
  const availableMonthKeys = useMemo(
    () => Array.from(new Set(practiceDays.map((day) => getMonthKey(day.key)))),
    [practiceDays]
  );
  const monthPracticeDays = useMemo(
    () => practiceDays.filter((day) => getMonthKey(day.key) === selectedMonthKey),
    [practiceDays, selectedMonthKey]
  );
  const selectedEntries = useMemo(
    () => entries.filter((entry) => entry.dateKey === selectedDate),
    [entries, selectedDate]
  );
  const athletes = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.athleteName))).sort(),
    [entries]
  );
  const averageAttendance = useMemo(() => {
    if (!monthPracticeDays.length) return "0";
    const total = monthPracticeDays.reduce((sum, day) => (
      sum + entries.filter((entry) => entry.dateKey === day.key).length
    ), 0);
    return (total / monthPracticeDays.length).toFixed(1);
  }, [entries, monthPracticeDays]);
  const selectedNotes = useMemo(
    () => selectedEntries.filter((entry) => entry.message.trim()),
    [selectedEntries]
  );
  const selectedAttendancePercent = athletes.length
    ? Math.round((selectedEntries.length / athletes.length) * 100)
    : 0;
  const monthlyRoster = useMemo(
    () => athletes.map((athleteName) => ({
      athleteName,
      count: monthPracticeDays.filter((day) => (
        entries.some((entry) => entry.athleteName === athleteName && entry.dateKey === day.key)
      )).length,
    })),
    [athletes, entries, monthPracticeDays]
  );
  const selectedMonthIndex = availableMonthKeys.indexOf(selectedMonthKey);
  const canGoPreviousMonth = selectedMonthIndex > 0;
  const canGoNextMonth = selectedMonthIndex >= 0 && selectedMonthIndex < availableMonthKeys.length - 1;
  const compactMonthGridTemplateColumns = `116px repeat(${Math.max(monthPracticeDays.length, 1)}, 44px)`;

  useEffect(() => {
    const days = buildPracticeDays();
    setPracticeDays(days);
    setSelectedDate(days[0]?.key ?? "");
    setIsAdmin(window.localStorage.getItem("stl-practice-admin") === "true");
    loadSupabasePracticeScheduleEntries()
      .then(setEntries)
      .catch(() => setEntries([]));
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
    loadSupabasePracticeScheduleEntries()
      .then(setEntries)
      .catch(() => setEntries([]));
  };

  const handleLogout = () => {
    window.localStorage.removeItem("stl-practice-admin");
    setIsAdmin(false);
    setAccessCode("");
  };

  const handleMonthChange = (direction: -1 | 1) => {
    const nextMonthKey = availableMonthKeys[selectedMonthIndex + direction];
    const nextMonthFirstDay = practiceDays.find((day) => getMonthKey(day.key) === nextMonthKey);
    if (nextMonthFirstDay) setSelectedDate(nextMonthFirstDay.key);
  };

  return (
    <main>
      {!isAdmin ? (
        <section className="planner-hero admin-hero">
          <div className="wrap planner-hero-grid">
            <div>
              <div className="eyebrow">Coach dashboard</div>
              <h1>See practice attendance.</h1>
              <p className="lead">Log in to view the roster, selected practice days, and season overview.</p>
            </div>
            <aside className="planner-login-card">
              <div className="planner-card-head">
                <span>Coach login</span>
              </div>
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
                <button className="btn red" type="submit">Open Dashboard</button>
                {loginError ? <p className="fine-print error-text">{loginError}</p> : null}
              </form>
            </aside>
          </div>
        </section>
      ) : (
        <section className="coach-portal">
          <div className="coach-dashboard">
            <aside className="coach-day-sidebar">
              <div className="coach-stat-grid">
                <div><span>Avg / session</span><b>{averageAttendance}</b><em>athletes</em></div>
                <div><span>Roster</span><b>{athletes.length}</b><em>athletes</em></div>
              </div>
              <div className="coach-month-row">
                <button type="button" disabled={!canGoPreviousMonth} onClick={() => handleMonthChange(-1)}>‹</button>
                <b>{selectedMonthLabel}</b>
                <button type="button" disabled={!canGoNextMonth} onClick={() => handleMonthChange(1)}>›</button>
              </div>
              <div className="coach-day-list">
                {monthPracticeDays.map((day) => {
                  const dayEntries = entries.filter((entry) => entry.dateKey === day.key);
                  const count = dayEntries.length;
                  const rosterCount = Math.max(athletes.length, count, 1);
                  return (
                    <button
                      className={selectedDate === day.key ? "is-selected" : ""}
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDate(day.key)}
                    >
                      <span className="coach-date-box"><em>{day.weekday}</em><b>{day.monthDay.replace(" ", "\n")}</b></span>
                      <span className="coach-day-meta">
                        <strong>{day.label}</strong>
                        <i><span style={{ width: `${Math.min(100, (count / rosterCount) * 100)}%` }}></span></i>
                        <small>{count}/{rosterCount}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="coach-main-panel">
              <div className="coach-selected-head">
                <div>
                  <span>Selected practice</span>
                  <h1>{selectedDay?.label ?? "Choose a day"}</h1>
                </div>
                <div className="coach-counts">
                  <b><strong>{selectedEntries.length}</strong> coming</b>
                </div>
              </div>

              <div className="coach-attendance-columns">
                <section>
                  <h2>✓ Attending ({selectedEntries.length})</h2>
                  <div className="coach-card-list">
                    {selectedEntries.length ? selectedEntries.map((entry) => (
                      <article className="coach-athlete-card" key={entry.id}>
                        <b>{getInitials(entry.athleteName)}</b>
                        <span>
                          <strong>
                            {entry.athleteName}
                            {entry.message ? <mark>Note</mark> : null}
                          </strong>
                          <i><small style={{ width: `${Math.min(100, ((monthlyRoster.find((athlete) => athlete.athleteName === entry.athleteName)?.count ?? 0) / Math.max(monthPracticeDays.length, 1)) * 100)}%` }}></small></i>
                          <em>{entry.message || "Confirmed"}</em>
                        </span>
                        <small>{monthlyRoster.find((athlete) => athlete.athleteName === entry.athleteName)?.count ?? 0}/{monthPracticeDays.length} days</small>
                        <u>in</u>
                      </article>
                    )) : <p className="fine-print">No athletes are listed for this day yet.</p>}
                  </div>
                  {selectedEntries.length >= athletes.length && athletes.length ? (
                    <div className="coach-status-banner">✓ Full attendance — everyone is coming!</div>
                  ) : null}
                </section>
                <aside className="coach-day-summary">
                  <span>Day stats</span>
                  <div className="coach-day-stat-grid">
                    <div className="coach-summary-card">
                      <b>Coming</b>
                      <strong>{selectedEntries.length}</strong>
                      <p>of {athletes.length || 0} athletes</p>
                    </div>
                    <div className="coach-summary-card">
                      <b>Attendance</b>
                      <strong>{selectedAttendancePercent}%</strong>
                      <i><small style={{ width: `${selectedAttendancePercent}%` }}></small></i>
                    </div>
                  </div>
                  <div className="coach-summary-card coach-note-card">
                    <b>Coach notes</b>
                    {selectedNotes.length ? (
                      <div className="coach-note-list">
                        {selectedNotes.map((entry) => (
                          <p key={entry.id}><strong>{entry.athleteName}</strong>{entry.message}</p>
                        ))}
                      </div>
                    ) : (
                      <p>No private notes for this day.</p>
                    )}
                  </div>
                  <span>{selectedMonthLabel} overview</span>
                  <div className="coach-season-table coach-season-table-compact">
                    <div className="coach-season-head" style={{ gridTemplateColumns: compactMonthGridTemplateColumns }}>
                      <b>Athlete</b>
                      {monthPracticeDays.map((day) => (
                        <b key={day.key}>
                          <span>{day.weekday.slice(0, 3)}</span>
                          <small>{day.monthDay.split(" ")[1]}</small>
                        </b>
                      ))}
                    </div>
                    {athletes.map((athleteName) => (
                      <div className="coach-season-row" key={athleteName} style={{ gridTemplateColumns: compactMonthGridTemplateColumns }}>
                        <strong><em>{getInitials(athleteName).slice(0, 1)}</em>{athleteName}</strong>
                        {monthPracticeDays.map((day) => (
                          <i
                            className={entries.some((entry) => entry.athleteName === athleteName && entry.dateKey === day.key) ? "is-in" : ""}
                            key={day.key}
                          ></i>
                        ))}
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
