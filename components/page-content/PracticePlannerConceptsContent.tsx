import { useState } from "react";

const athletes = ["Peter", "Samantha", "Mia"];
const practiceDays = [
  { weekday: "Tue", date: "Jul 7" },
  { weekday: "Thu", date: "Jul 9" },
  { weekday: "Tue", date: "Jul 14" },
  { weekday: "Thu", date: "Jul 16" },
  { weekday: "Tue", date: "Jul 21" },
  { weekday: "Thu", date: "Jul 23" },
  { weekday: "Tue", date: "Jul 28" },
  { weekday: "Thu", date: "Jul 30" },
  { weekday: "Tue", date: "Aug 4" },
  { weekday: "Thu", date: "Aug 6" },
  { weekday: "Tue", date: "Aug 11" },
  { weekday: "Thu", date: "Aug 13" },
];

const selectedDates = ["Jul 7", "Jul 14", "Jul 21", "Jul 30"];
const concepts = [
  "Clean Dashboard",
  "Athlete First",
  "Compact Table",
  "Calendar Board",
  "Coach Clipboard",
];

function DayButton({ day, compact = false }: { day: { weekday: string; date: string }; compact?: boolean }) {
  const isSelected = selectedDates.includes(day.date);

  return (
    <button className={`concept-day${isSelected ? " is-selected" : ""}${compact ? " is-compact" : ""}`} type="button">
      <span>{day.weekday}</span>
      <strong>{day.date}</strong>
    </button>
  );
}

function SelectedSummary() {
  return (
    <div className="concept-selected-list">
      {selectedDates.map((date) => <span key={date}>{date}</span>)}
    </div>
  );
}

function ConceptOne() {
  return (
    <section className="concept-screen concept-dashboard">
      <div className="concept-head-row">
        <div>
          <span className="tag">Option 1</span>
          <h1>Practice attendance</h1>
          <p>Select an athlete, then mark the Tuesday and Thursday practices they plan to attend.</p>
        </div>
        <button className="btn">Switch account</button>
      </div>
      <div className="concept-athlete-strip">
        {athletes.map((athlete) => <button className={athlete === "Peter" ? "is-selected" : ""} key={athlete}>{athlete}</button>)}
        <input placeholder="Add another athlete" />
      </div>
      <div className="concept-two-col">
        <div className="concept-panel">
          <h2>Choose days</h2>
          <div className="concept-day-grid">{practiceDays.map((day) => <DayButton day={day} key={day.date} />)}</div>
        </div>
        <aside className="concept-panel concept-summary-card">
          <span className="tag">Peter</span>
          <h2>Selected practices</h2>
          <SelectedSummary />
          <textarea placeholder="Optional note for coaches..." />
          <button className="btn red">Save Attendance</button>
        </aside>
      </div>
    </section>
  );
}

function ConceptTwo() {
  return (
    <section className="concept-screen concept-athlete-first">
      <div className="concept-sidebar">
        <span className="tag">Option 2</span>
        <h1>Peter</h1>
        <p>Pick the dates Peter plans to attend practice.</p>
        <div className="concept-vertical-tabs">
          {athletes.map((athlete) => <button className={athlete === "Peter" ? "is-selected" : ""} key={athlete}>{athlete}</button>)}
        </div>
        <input placeholder="Add athlete" />
      </div>
      <div className="concept-main-card">
        <div className="concept-head-row">
          <h2>Upcoming practices</h2>
          <button className="btn">Switch account</button>
        </div>
        <div className="concept-wide-days">{practiceDays.map((day) => <DayButton day={day} compact key={day.date} />)}</div>
        <div className="concept-bottom-bar">
          <SelectedSummary />
          <button className="btn red">Save Attendance</button>
        </div>
      </div>
    </section>
  );
}

function ConceptThree() {
  return (
    <section className="concept-screen concept-table">
      <div className="concept-head-row">
        <div>
          <span className="tag">Option 3</span>
          <h1>Practice check-in</h1>
          <p>A denser operations-style version for quick scanning.</p>
        </div>
        <div className="concept-mini-actions">
          {athletes.map((athlete) => <button className={athlete === "Peter" ? "is-selected" : ""} key={athlete}>{athlete}</button>)}
        </div>
      </div>
      <div className="concept-table-card">
        <div className="concept-table-row is-head"><b>Day</b><b>Date</b><b>Status</b></div>
        {practiceDays.map((day) => (
          <button className={`concept-table-row${selectedDates.includes(day.date) ? " is-selected" : ""}`} key={day.date} type="button">
            <span>{day.weekday}</span>
            <strong>{day.date}</strong>
            <em>{selectedDates.includes(day.date) ? "Attending" : "Not selected"}</em>
          </button>
        ))}
      </div>
      <div className="concept-inline-save">
        <textarea placeholder="Optional note for coaches..." />
        <button className="btn red">Save Attendance</button>
      </div>
    </section>
  );
}

function ConceptFour() {
  return (
    <section className="concept-screen concept-board">
      <div className="concept-board-head">
        <div>
          <span className="tag">Option 4</span>
          <h1>July and August</h1>
          <p>A calendar-board feel, still only showing Tuesday and Thursday.</p>
        </div>
        <div className="concept-pill-tabs">
          {athletes.map((athlete) => <button className={athlete === "Peter" ? "is-selected" : ""} key={athlete}>{athlete}</button>)}
        </div>
      </div>
      <div className="concept-month-board">
        {practiceDays.map((day) => <DayButton day={day} key={day.date} />)}
      </div>
      <div className="concept-board-footer">
        <SelectedSummary />
        <button className="btn red">Save Attendance</button>
      </div>
    </section>
  );
}

function ConceptFive() {
  return (
    <section className="concept-screen concept-clipboard">
      <div className="concept-clipboard-paper">
        <div className="concept-head-row">
          <div>
            <span className="tag">Option 5</span>
            <h1>Attendance sheet</h1>
            <p>Simple, parent-friendly, and a little more paper-like.</p>
          </div>
          <button className="btn">Switch account</button>
        </div>
        <div className="concept-clipboard-grid">
          <aside>
            <h2>Athletes</h2>
            {athletes.map((athlete) => <button className={athlete === "Peter" ? "is-selected" : ""} key={athlete}>{athlete}</button>)}
            <input placeholder="Add athlete" />
          </aside>
          <div>
            <h2>Practice dates</h2>
            <div className="concept-check-list">
              {practiceDays.map((day) => (
                <button className={selectedDates.includes(day.date) ? "is-selected" : ""} key={day.date} type="button">
                  <span>{day.weekday}</span>
                  <strong>{day.date}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="concept-note-save">
          <textarea placeholder="Optional note for coaches..." />
          <button className="btn red">Save Attendance</button>
        </div>
      </div>
    </section>
  );
}

export default function PracticePlannerConceptsContent() {
  const [activeConcept, setActiveConcept] = useState(0);
  const screens = [<ConceptOne key="one" />, <ConceptTwo key="two" />, <ConceptThree key="three" />, <ConceptFour key="four" />, <ConceptFive key="five" />];

  return (
    <main className="concept-page">
      <section className="section">
        <div className="wrap">
          <div className="concept-page-head">
            <div>
              <span className="tag">Planner concepts</span>
              <h1>Five practice planner directions.</h1>
              <p className="sub">Different layouts and visual styles for the logged-in attendance screen.</p>
            </div>
            <a className="btn" href="/practice-planner">Back to planner</a>
          </div>
          <div className="concept-switcher" role="tablist" aria-label="Practice planner concepts">
            {concepts.map((concept, index) => (
              <button
                className={activeConcept === index ? "is-selected" : ""}
                key={concept}
                type="button"
                onClick={() => setActiveConcept(index)}
              >
                <span>{index + 1}</span>
                {concept}
              </button>
            ))}
          </div>
          {screens[activeConcept]}
        </div>
      </section>
    </main>
  );
}
