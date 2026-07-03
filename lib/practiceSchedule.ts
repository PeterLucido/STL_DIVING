export type PracticeScheduleEntry = {
  id: string;
  parentName: string;
  athleteName: string;
  email: string;
  phone: string;
  visitType: string;
  dateKey: string;
  dateLabel: string;
  time: string;
  message: string;
  createdAt: string;
};

export type PracticeDay = {
  key: string;
  label: string;
  weekday: string;
  monthDay: string;
};

export const practiceScheduleStorageKey = "stl-practice-schedule-entries";

export function buildPracticeDays() {
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

export function loadPracticeScheduleEntries() {
  if (typeof window === "undefined") return [];

  const savedEntries = window.localStorage.getItem(practiceScheduleStorageKey);
  if (!savedEntries) return [];

  try {
    return JSON.parse(savedEntries) as PracticeScheduleEntry[];
  } catch {
    window.localStorage.removeItem(practiceScheduleStorageKey);
    return [];
  }
}

export function savePracticeScheduleEntry(entry: PracticeScheduleEntry) {
  const entries = loadPracticeScheduleEntries();
  const nextEntries = [entry, ...entries.filter((savedEntry) => savedEntry.id !== entry.id)];
  window.localStorage.setItem(practiceScheduleStorageKey, JSON.stringify(nextEntries));
  return nextEntries;
}
