import { supabase } from "./supabaseClient";

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
export const practiceScheduleTableName = "practice_schedule_entries";
const practiceWeekdays = new Set([2, 4]);

export function buildPracticeDays() {
  const days: PracticeDay[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  const startDate = new Date();
  startDate.setHours(12, 0, 0, 0);
  const januaryYear = startDate.getMonth() === 0 ? startDate.getFullYear() : startDate.getFullYear() + 1;
  const endDate = new Date(januaryYear, 0, 31);
  endDate.setHours(12, 0, 0, 0);

  for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    date.setHours(12, 0, 0, 0);

    if (!practiceWeekdays.has(date.getDay())) continue;

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

type SupabasePracticeScheduleEntry = {
  id: string;
  parent_name: string;
  athlete_name: string;
  email: string;
  phone: string;
  visit_type: string;
  date_key: string;
  date_label: string;
  time: string;
  message: string;
  created_at: string;
};

function fromSupabaseEntry(entry: SupabasePracticeScheduleEntry): PracticeScheduleEntry {
  return {
    id: entry.id,
    parentName: entry.parent_name,
    athleteName: entry.athlete_name,
    email: entry.email,
    phone: entry.phone,
    visitType: entry.visit_type,
    dateKey: entry.date_key,
    dateLabel: entry.date_label,
    time: entry.time,
    message: entry.message,
    createdAt: entry.created_at,
  };
}

function toSupabaseEntry(entry: PracticeScheduleEntry): SupabasePracticeScheduleEntry {
  return {
    id: entry.id,
    parent_name: entry.parentName,
    athlete_name: entry.athleteName,
    email: entry.email,
    phone: entry.phone,
    visit_type: entry.visitType,
    date_key: entry.dateKey,
    date_label: entry.dateLabel,
    time: entry.time,
    message: entry.message,
    created_at: entry.createdAt,
  };
}

export async function loadSupabasePracticeScheduleEntries() {
  const { data, error } = await supabase
    .from(practiceScheduleTableName)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((entry) => fromSupabaseEntry(entry as SupabasePracticeScheduleEntry));
}

export async function saveSupabasePracticeScheduleEntry(entry: PracticeScheduleEntry) {
  const { error } = await supabase
    .from(practiceScheduleTableName)
    .upsert(toSupabaseEntry(entry));

  if (error) throw error;

  return loadSupabasePracticeScheduleEntries();
}

export async function saveSupabasePracticeScheduleEntries(entries: PracticeScheduleEntry[]) {
  const { error } = await supabase
    .from(practiceScheduleTableName)
    .upsert(entries.map(toSupabaseEntry));

  if (error) throw error;

  return loadSupabasePracticeScheduleEntries();
}

export async function replaceSupabasePracticeScheduleEntriesForAthlete(
  email: string,
  athleteName: string,
  visibleDateKeys: string[],
  entries: PracticeScheduleEntry[]
) {
  const selectedDateKeys = new Set(entries.map((entry) => entry.dateKey));
  const removedDateKeys = visibleDateKeys.filter((dateKey) => !selectedDateKeys.has(dateKey));

  if (removedDateKeys.length) {
    const { error } = await supabase
      .from(practiceScheduleTableName)
      .delete()
      .eq("email", email)
      .eq("athlete_name", athleteName)
      .in("date_key", removedDateKeys);

    if (error) throw error;
  }

  if (entries.length) {
    const { error } = await supabase
      .from(practiceScheduleTableName)
      .upsert(entries.map(toSupabaseEntry));

    if (error) throw error;
  }

  return loadSupabasePracticeScheduleEntries();
}
