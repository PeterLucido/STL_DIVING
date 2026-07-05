import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildPracticeDays,
  loadSupabasePracticeScheduleEntries,
  PracticeDay,
  PracticeScheduleEntry,
  replaceSupabasePracticeScheduleEntriesForAthlete,
} from "../../lib/practiceSchedule";
import { hasSupabaseConfig, supabase } from "../../lib/supabaseClient";

type PlannerProfile = {
  parentName: string;
  athleteNames: string[];
  email: string;
  phone: string;
};

type AuthMode = "signin" | "create" | "check-email";
type CalendarView = "grid" | "list";

const initialProfile: PlannerProfile = {
  parentName: "",
  athleteNames: [],
  email: "",
  phone: "",
};

const practiceTime = "5:30 PM";
const practiceAttendanceType = "Practice attendance";
const authTimeoutMessage = "Account creation is taking too long. The SMTP email step is probably timing out. Check Supabase SMTP, then try again.";

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

function getPracticeDayParts(day?: PracticeDay) {
  if (!day) return { dayNumber: "", month: "" };

  const [month, dayNumber] = day.monthDay.split(" ");
  return {
    dayNumber: dayNumber ?? day.monthDay,
    month: month ?? "",
  };
}

function getProfileFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): PlannerProfile {
  const athleteNames = user.user_metadata?.athlete_names;
  const legacyAthleteName = user.user_metadata?.athlete_name;

  return {
    parentName: String(user.user_metadata?.parent_name ?? ""),
    athleteNames: Array.isArray(athleteNames)
      ? athleteNames.map((name) => String(name)).filter(Boolean)
      : legacyAthleteName
        ? [String(legacyAthleteName)]
        : [],
    email: user.email ?? "",
    phone: String(user.user_metadata?.phone ?? ""),
  };
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error && error !== "{}" && error !== "[object Object]" ? error : fallback;
  }

  if (typeof error === "object") {
    const authError = error as {
      code?: unknown;
      message?: unknown;
      name?: unknown;
      status?: unknown;
    };
    const message = String(authError.message ?? "");
    if (message && message !== "{}" && message !== "[object Object]") {
      const normalizedMessage = message.toLowerCase();
      if (normalizedMessage.includes("504") || normalizedMessage.includes("retryable") || normalizedMessage.includes("timeout")) {
        return authTimeoutMessage;
      }

      if (normalizedMessage.includes("already registered") || normalizedMessage.includes("already exists")) {
        return "That email already has an account. Sign in instead.";
      }

      if (normalizedMessage.includes("email") && normalizedMessage.includes("send")) {
        return "No user was created because Supabase could not send the confirmation email. Check the SMTP settings, then try again.";
      }

      return message;
    }

    const details = [authError.name, authError.code, authError.status].filter(Boolean).map(String).join(" ");
    if (details) return `${fallback} (${details})`;
  }

  return fallback;
}

function withTimeout<T>(promise: Promise<T>, message: string, timeoutMs = 12000) {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

function getAuthDebugDetails(error: unknown) {
  if (!error || typeof error !== "object") return error;

  const authError = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
    status?: unknown;
  };

  return {
    code: authError.code,
    message: authError.message,
    name: authError.name,
    status: authError.status,
  };
}

export default function PracticePlannerContent() {
  const [profile, setProfile] = useState<PlannerProfile>(initialProfile);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [savedSelectedDates, setSavedSelectedDates] = useState<string[]>([]);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>("grid");
  const [selectedAthleteName, setSelectedAthleteName] = useState("");
  const [newAthleteName, setNewAthleteName] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleEntries, setScheduleEntries] = useState<PracticeScheduleEntry[]>([]);
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
  const selectedMonthIndex = availableMonthKeys.indexOf(selectedMonthKey);
  const canGoPreviousMonth = selectedMonthIndex > 0;
  const canGoNextMonth = selectedMonthIndex >= 0 && selectedMonthIndex < availableMonthKeys.length - 1;
  const selectedDayEntries = useMemo(
    () => scheduleEntries.filter((entry) => entry.dateKey === selectedDate),
    [scheduleEntries, selectedDate]
  );
  const selectedDayAttendees = useMemo(() => {
    const visibleSavedEntries = selectedDayEntries.filter((entry) => !(
      isEditingAttendance &&
      entry.email === profile.email &&
      entry.athleteName === selectedAthleteName
    ));

    return Array.from(new Set([
      ...visibleSavedEntries.map((entry) => entry.athleteName),
      ...(selectedDates.includes(selectedDate) && selectedAthleteName ? [selectedAthleteName] : []),
    ]));
  }, [isEditingAttendance, profile.email, selectedAthleteName, selectedDate, selectedDates, selectedDayEntries]);
  const selectedMonthDateCount = useMemo(
    () => selectedDates.filter((dateKey) => getMonthKey(dateKey) === selectedMonthKey).length,
    [selectedDates, selectedMonthKey]
  );
  const existingCoachNote = useMemo(() => {
    if (!selectedAthleteName || !profile.email) return "";

    return scheduleEntries.find((entry) => (
      entry.email === profile.email &&
      entry.athleteName === selectedAthleteName &&
      savedSelectedDates.includes(entry.dateKey) &&
      entry.message.trim()
    ))?.message ?? "";
  }, [profile.email, savedSelectedDates, scheduleEntries, selectedAthleteName]);
  const selectedAthleteShortName = selectedAthleteName.split(" ")[0] || selectedAthleteName;

  useEffect(() => {
    if (!profile.athleteNames.length) {
      setSelectedAthleteName("");
      return;
    }

    if (!selectedAthleteName || !profile.athleteNames.includes(selectedAthleteName)) {
      setSelectedAthleteName(profile.athleteNames[0]);
    }
  }, [profile.athleteNames, selectedAthleteName]);

  useEffect(() => {
    if (!selectedAthleteName || !profile.email || !practiceDays.length) {
      setSavedSelectedDates([]);
      setSelectedDates([]);
      return;
    }

    const visiblePracticeDayKeys = new Set(practiceDays.map((day) => day.key));
    const savedDatesForAthlete = scheduleEntries
      .filter((entry) => (
        entry.email === profile.email &&
        entry.athleteName === selectedAthleteName &&
        visiblePracticeDayKeys.has(entry.dateKey)
      ))
      .map((entry) => entry.dateKey);

    const orderedSavedDates = practiceDays
      .map((day) => day.key)
      .filter((dateKey) => savedDatesForAthlete.includes(dateKey));

    setSavedSelectedDates(orderedSavedDates);
    if (!isEditingAttendance) {
      setSelectedDates(orderedSavedDates);
    }
  }, [isEditingAttendance, practiceDays, profile.email, scheduleEntries, selectedAthleteName]);

  useEffect(() => {
    const days = buildPracticeDays();
    setPracticeDays(days);
    setSelectedDate(days[0]?.key ?? "");

    if (!hasSupabaseConfig || !supabase) {
      setAuthError("Supabase is not configured yet.");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;

      const sessionProfile = getProfileFromUser(user);
      setProfile(sessionProfile);
      setLoginEmail(sessionProfile.email);
      setIsSignedIn(true);
    });

    loadSupabasePracticeScheduleEntries()
      .then((entries) => {
        setScheduleEntries(entries);
        setScheduleError("");
      })
      .catch(() => {
        setScheduleEntries([]);
        setScheduleError("Attendance database setup needed. I need to create the Supabase table once, then this will be ready.");
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setIsSignedIn(false);
        setProfile(initialProfile);
        return;
      }

      const sessionProfile = getProfileFromUser(user);
      setProfile(sessionProfile);
      setLoginEmail(sessionProfile.email);
      setIsSignedIn(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleProfileChange = (field: keyof PlannerProfile, value: string) => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
  };

  const handleMonthChange = (direction: -1 | 1) => {
    const nextMonthKey = availableMonthKeys[selectedMonthIndex + direction];
    const nextMonthFirstDay = practiceDays.find((day) => getMonthKey(day.key) === nextMonthKey);
    if (nextMonthFirstDay) setSelectedDate(nextMonthFirstDay.key);
  };

  const handlePracticeDayClick = (dateKey: string) => {
    setSelectedDate(dateKey);
    if (!isEditingAttendance) return;

    setSelectedDates((currentDates) => (
      currentDates.includes(dateKey)
        ? currentDates.filter((currentDateKey) => currentDateKey !== dateKey)
        : [...currentDates, dateKey]
    ));
  };

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthError("");

    if (!hasSupabaseConfig || !supabase) {
      setIsAuthLoading(false);
      setAuthError("Supabase is not configured yet.");
      return;
    }

    supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    }).then(({ data, error }) => {
      if (error || !data.user) {
        setIsAuthLoading(false);
        setAuthError(getAuthErrorMessage(error, "Could not log in. Please check your email and password."));
        return;
      }

      const accountProfile = getProfileFromUser(data.user);
      setProfile(accountProfile);
      setAuthError("");
      setIsAuthLoading(false);
      setIsSignedIn(true);
    }).catch(() => {
      setIsAuthLoading(false);
      setAuthError("Could not log in. Please try again.");
    });
  };

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthError("");
    const signupStartedAt = Date.now();
    const signupRedirectTo = `${window.location.origin}/practice-planner`;

    console.info("[PracticePlanner] Signup started", {
      athleteCount: profile.athleteNames.length,
      email: profile.email,
      hasParentName: Boolean(profile.parentName),
      hasPhone: Boolean(profile.phone),
      passwordLength: accountPassword.length,
      redirectTo: signupRedirectTo,
      supabaseConfigured: hasSupabaseConfig,
    });

    if (!hasSupabaseConfig || !supabase) {
      setIsAuthLoading(false);
      setAuthError("Supabase is not configured yet.");
      console.warn("[PracticePlanner] Signup stopped: Supabase is not configured");
      return;
    }

    withTimeout(
      supabase.auth.signUp({
        email: profile.email,
        password: accountPassword,
        options: {
          emailRedirectTo: signupRedirectTo,
          data: {
            parent_name: profile.parentName,
            athlete_names: profile.athleteNames,
            phone: profile.phone,
          },
        },
      }),
      authTimeoutMessage
    ).then(({ data, error }) => {
      const hasCreatedIdentity = Boolean(data.user?.identities?.length);
      console.info("[PracticePlanner] Signup response", {
        durationMs: Date.now() - signupStartedAt,
        email: profile.email,
        error: getAuthDebugDetails(error),
        hasCreatedIdentity,
        hasSession: Boolean(data.session),
        hasUser: Boolean(data.user),
        userId: data.user?.id,
      });

      if (error || !data.user) {
        setIsAuthLoading(false);
        setAuthError(getAuthErrorMessage(error, "Could not create account. Please check the details and try again."));
        return;
      }

      if (!hasCreatedIdentity && !data.session) {
        setIsAuthLoading(false);
        setLoginEmail(profile.email);
        setLoginPassword("");
        setAccountPassword("");
        setAuthError("That email may already have an account. Try signing in instead.");
        setAuthMode("signin");
        return;
      }

      setLoginEmail(profile.email);
      setLoginPassword(accountPassword);
      setIsAuthLoading(false);
      setAuthError("");
      setIsSignedIn(Boolean(data.session));
      if (!data.session) setAuthMode("check-email");
    }).catch((error) => {
      console.error("[PracticePlanner] Signup failed or timed out", {
        durationMs: Date.now() - signupStartedAt,
        email: profile.email,
        error: getAuthDebugDetails(error),
      });
      setIsAuthLoading(false);
      setAuthError(authTimeoutMessage);
    });
  };

  const handleAddAthlete = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const athleteName = newAthleteName.trim();
    if (!athleteName || profile.athleteNames.includes(athleteName)) return;

    const nextProfile = {
      ...profile,
      athleteNames: [...profile.athleteNames, athleteName],
    };

    setProfile(nextProfile);
    setSelectedAthleteName(athleteName);
    setIsEditingAttendance(false);
    setNewAthleteName("");

    if (supabase) {
      supabase.auth.updateUser({
        data: {
          parent_name: nextProfile.parentName,
          athlete_names: nextProfile.athleteNames,
          phone: nextProfile.phone,
        },
      });
    }
  };

  const handleScheduleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    if (submitter?.dataset.action !== "save-attendance") return;
    if (!isEditingAttendance || !isSignedIn || !selectedAthleteName) return;

    const entries = selectedDates.map((dateKey) => {
      const day = practiceDays.find((practiceDay) => practiceDay.key === dateKey);
      const attendanceId = `${profile.email}-${selectedAthleteName}-${dateKey}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-");

      return {
        id: attendanceId,
        parentName: profile.parentName,
        athleteName: selectedAthleteName,
        email: profile.email,
        phone: profile.phone,
        visitType: practiceAttendanceType,
        dateKey,
        dateLabel: day?.label ?? dateKey,
        time: practiceTime,
        message,
        createdAt: new Date().toISOString(),
      };
    });

    replaceSupabasePracticeScheduleEntriesForAthlete(
      profile.email,
      selectedAthleteName,
      practiceDays.map((practiceDay) => practiceDay.key),
      entries
    )
      .then((savedEntries) => {
        setScheduleEntries(savedEntries);
        setSavedSelectedDates(selectedDates);
        setIsEditingAttendance(false);
        setScheduleError("");
        setScheduleSuccess(`Attendance saved for ${selectedDates.length} practice day${selectedDates.length === 1 ? "" : "s"}.`);
        setMessage("");
      })
      .catch(() => {
        setScheduleSuccess("");
        setScheduleError("Could not save attendance yet. The scheduling database still needs setup.");
      });
  };

  const handleStartAttendanceEdit = () => {
    setScheduleSuccess("");
    setMessage(existingCoachNote);
    setIsEditingAttendance(true);
  };

  const handleCancelAttendanceEdit = () => {
    setSelectedDates(savedSelectedDates);
    setMessage("");
    setScheduleSuccess("");
    setIsEditingAttendance(false);
  };

  return (
    <main>
      {!isSignedIn ? (
      <section className="planner-hero planner-login-hero">
        <div className="wrap planner-hero-grid">
          <div>
            <div className="eyebrow">STL Diving Login</div>
            <h1>Log in to view the practice schedule.</h1>
            <p className="lead">
              Sign in to see available practice days and send STL Diving a quick attendance plan.
            </p>
          </div>
          <aside className="planner-login-card">
            <div className="planner-card-head">
              <span>{authMode === "signin" ? "Sign in" : authMode === "create" ? "Create account" : "Check email"}</span>
            </div>
            {authMode === "check-email" ? (
              <div className="planner-check-email">
                <span className="tag">Almost done</span>
                <h2>Check your email.</h2>
                <p>
                  We sent a verification link to <strong>{profile.email || loginEmail}</strong>.
                  Open that link to finish creating the account and return to the practice schedule.
                </p>
                <button
                  className="btn red planner-card-cta"
                  type="button"
                  onClick={() => setAuthMode("signin")}
                >
                  Back to log in
                </button>
              </div>
            ) : authMode === "signin" ? (
              <form className="planner-login-form" onSubmit={handleSignIn}>
                <label>Email</label>
                <input
                  required
                  disabled={isAuthLoading}
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="Email address"
                />
                <label>Password</label>
                <input
                  required
                  disabled={isAuthLoading}
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Password"
                />
                <button className="btn red" disabled={isAuthLoading} type="submit">
                  {isAuthLoading ? "Logging in..." : "Log in"}
                </button>
                {authError ? <p className="fine-print error-text">{authError}</p> : null}
                <button
                  className="planner-auth-switch"
                  type="button"
                  disabled={isAuthLoading}
                  onClick={() => {
                    setAuthError("");
                    setLoginPassword("");
                    setAuthMode("create");
                  }}
                >
                  Don't have an account? Create an account
                </button>
              </form>
            ) : (
              <form className="planner-login-form" onSubmit={handleCreateAccount}>
                <label>User name</label>
                <input
                  required
                  disabled={isAuthLoading}
                  value={profile.parentName}
                  onChange={(event) => handleProfileChange("parentName", event.target.value)}
                  placeholder="Parent, guardian, Samantha, or Peter"
                />
                <label>First athlete name</label>
                <input
                  required
                  disabled={isAuthLoading}
                  value={profile.athleteNames[0] ?? ""}
                  onChange={(event) => {
                    const athleteName = event.target.value;
                    setProfile((currentProfile) => ({
                      ...currentProfile,
                      athleteNames: athleteName ? [athleteName] : [],
                    }));
                  }}
                  placeholder="Diver name"
                />
                <label>Email</label>
                <input
                  required
                  disabled={isAuthLoading}
                  type="email"
                  value={profile.email}
                  onChange={(event) => handleProfileChange("email", event.target.value)}
                  placeholder="Email address"
                />
                <label>Phone</label>
                <input
                  disabled={isAuthLoading}
                  value={profile.phone}
                  onChange={(event) => handleProfileChange("phone", event.target.value)}
                  placeholder="Phone number"
                />
                <label>Password</label>
                <input
                  required
                  disabled={isAuthLoading}
                  type="password"
                  value={accountPassword}
                  onChange={(event) => setAccountPassword(event.target.value)}
                  placeholder="Password"
                />
                <button className="btn red" disabled={isAuthLoading} type="submit">
                  {isAuthLoading ? "Creating Account..." : "Create Account"}
                </button>
                {authError ? <p className="fine-print error-text">{authError}</p> : null}
                <button
                  className="planner-auth-switch"
                  type="button"
                  disabled={isAuthLoading}
                  onClick={() => {
                    setAuthError("");
                    setLoginPassword("");
                    setAuthMode("signin");
                  }}
                >
                  Already have an account? Sign in
                </button>
              </form>
            )}
          </aside>
        </div>
      </section>
      ) : null}

      {isSignedIn ? (
      <section className={`athlete-portal${isEditingAttendance ? " is-editing" : ""}`}>
        <aside className="athlete-portal-sidebar">
          <div className="athlete-portal-brand">
            <span className="tag">Practice attendance</span>
            <h1>Choose practice days.</h1>
            <p>Tuesday &amp; Thursday sessions.</p>
          </div>
          <div className="athlete-sidebar-section">
            <span>Athletes</span>
            <div className="athlete-list">
              {profile.athleteNames.map((athleteName) => (
                <button
                  className={selectedAthleteName === athleteName ? "is-selected" : ""}
                  key={athleteName}
                  type="button"
                  onClick={() => {
                    setSelectedAthleteName(athleteName);
                    setIsEditingAttendance(false);
                    setScheduleSuccess("");
                    setMessage("");
                  }}
                >
                  <b>{getInitials(athleteName)}</b>
                  <span>{athleteName}</span>
                  {selectedAthleteName === athleteName ? <em>✓</em> : null}
                </button>
              ))}
            </div>
            <form className="athlete-add-inline" onSubmit={handleAddAthlete}>
              <input
                value={newAthleteName}
                onChange={(event) => setNewAthleteName(event.target.value)}
                placeholder="Add athlete"
              />
              <button type="submit">+</button>
            </form>
          </div>
        </aside>

        <div className="athlete-portal-main">
          <header className="athlete-portal-topbar">
            <div>
              <h1>{selectedAthleteName ? `${selectedAthleteShortName}'s schedule` : "Practice schedule"}</h1>
              <p>Tue &amp; Thu practice days</p>
            </div>
            <div className="athlete-topbar-actions">
              <span className="portal-kicker">{monthPracticeDays.length} practice days</span>
              <div className="athlete-view-toggle" aria-label="Calendar view">
                <button
                  className={calendarView === "grid" ? "is-selected" : ""}
                  type="button"
                  onClick={() => setCalendarView("grid")}
                >
                  Grid
                </button>
                <button
                  className={calendarView === "list" ? "is-selected" : ""}
                  type="button"
                  onClick={() => setCalendarView("list")}
                >
                  List
                </button>
              </div>
              <div className="athlete-month-nav">
                <button type="button" disabled={!canGoPreviousMonth} onClick={() => handleMonthChange(-1)}>‹</button>
                <b>{selectedMonthLabel}</b>
                <button type="button" disabled={!canGoNextMonth} onClick={() => handleMonthChange(1)}>›</button>
              </div>
            </div>
          </header>

          <div className="athlete-portal-content">
            <section className="athlete-schedule-list">
              <aside className="athlete-day-attendance">
                <div className="athlete-day-attendance-date">
                  <span>{selectedDay?.weekday ?? ""}</span>
                  <strong>{getPracticeDayParts(selectedDay).dayNumber}</strong>
                  <em>{selectedDay ? `${getPracticeDayParts(selectedDay).month} ${selectedMonthLabel.split(" ")[1]}` : ""}</em>
                </div>
                <div className="athlete-day-attendance-list">
                  <b>Coming ({selectedDayAttendees.length})</b>
                  {selectedDayAttendees.length ? selectedDayAttendees.map((athleteName) => (
                    <span className="athlete-day-attendee" key={athleteName}>
                      <i>{getInitials(athleteName).slice(0, 1)}</i>
                      {athleteName}
                      <em>✓</em>
                    </span>
                  )) : (
                    <p>No athletes listed yet for this practice day.</p>
                  )}
                </div>
              </aside>

              <div className="athlete-calendar-scroll">
                {calendarView === "grid" ? (
                  <div className="athlete-calendar-grid">
                    {monthPracticeDays.map((day) => {
                      const isAttending = selectedDates.includes(day.key);
                      const isSavedAttending = savedSelectedDates.includes(day.key);
                      const isCurrent = selectedDate === day.key;
                      const rowEntries = scheduleEntries.filter((entry) => (
                        entry.dateKey === day.key &&
                        !(
                          isEditingAttendance &&
                          entry.email === profile.email &&
                          entry.athleteName === selectedAthleteName
                        )
                      ));
                      const attendees = Array.from(new Set([
                        ...rowEntries.map((entry) => entry.athleteName),
                        ...(isAttending && selectedAthleteName ? [selectedAthleteName] : []),
                      ]));
                      const { dayNumber, month } = getPracticeDayParts(day);
                      const rosterCount = Math.max(profile.athleteNames.length, attendees.length, 1);

                      return (
                        <button
                          className={`athlete-calendar-card${isCurrent ? " is-active" : ""}${isAttending ? " is-attending" : ""}${isEditingAttendance && isAttending !== isSavedAttending ? " is-draft" : ""}`}
                          key={day.key}
                          aria-disabled={!isEditingAttendance}
                          aria-pressed={isAttending}
                          onClick={() => handlePracticeDayClick(day.key)}
                          type="button"
                        >
                          <span>{day.weekday}</span>
                          <strong>{dayNumber}</strong>
                          <em>{month}</em>
                          <i>
                            {attendees.length ? attendees.slice(0, 4).map((athleteName) => (
                              <b key={athleteName}>{getInitials(athleteName).slice(0, 1)}</b>
                            )) : null}
                          </i>
                          <small>{attendees.length}/{rosterCount}</small>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="athlete-timeline">
                    {monthPracticeDays.map((day) => {
                      const isAttending = selectedDates.includes(day.key);
                      const isSavedAttending = savedSelectedDates.includes(day.key);
                      const isCurrent = selectedDate === day.key;
                      const rowEntries = scheduleEntries.filter((entry) => (
                        entry.dateKey === day.key &&
                        !(
                          isEditingAttendance &&
                          entry.email === profile.email &&
                          entry.athleteName === selectedAthleteName
                        )
                      ));
                      const attendees = Array.from(new Set([
                        ...rowEntries.map((entry) => entry.athleteName),
                        ...(isAttending && selectedAthleteName ? [selectedAthleteName] : []),
                      ]));

                      return (
                        <button
                          className={`athlete-practice-row${isCurrent ? " is-active" : ""}${isAttending ? " is-attending" : ""}${isEditingAttendance && isAttending !== isSavedAttending ? " is-draft" : ""}`}
                          key={day.key}
                          aria-disabled={!isEditingAttendance}
                          aria-pressed={isAttending}
                          onClick={() => handlePracticeDayClick(day.key)}
                          type="button"
                        >
                          <span className="timeline-node" aria-hidden="true"></span>
                          <span className="practice-row-date">
                            <em>{day.weekday}</em>
                            <strong>{day.monthDay}</strong>
                          </span>
                          <span className="practice-row-attendees">
                            {attendees.length ? attendees.map((athleteName) => (
                              <span key={athleteName}>
                                <b>{getInitials(athleteName)}</b>
                                {athleteName}
                              </span>
                            )) : <i>No athletes yet</i>}
                          </span>
                          {isAttending ? <span className="practice-row-check">✓</span> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <form className="athlete-schedule-note" onSubmit={handleScheduleSubmit}>
              <span className="tag">Schedule note</span>
              <div className="athlete-note-summary">
                <div><b>Athlete</b><span>{selectedAthleteName || "Add an athlete"}</span></div>
                <div><b>{selectedMonthLabel}</b><span>{selectedMonthDateCount ? `${selectedMonthDateCount} days` : "No days"}</span></div>
              </div>
              {scheduleError ? <p className="planner-setup-note">{scheduleError}</p> : null}
              {scheduleSuccess ? <p className="planner-success-note">{scheduleSuccess}</p> : null}
              <label>Private note for coaches</label>
              <textarea
                disabled={!isEditingAttendance}
                name="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={isEditingAttendance ? "Optional note for coaches..." : "Notes are only shown to coaches."}
              ></textarea>
              <div className="planner-edit-actions">
                {isEditingAttendance ? (
                  <>
                    <button className="btn red" data-action="save-attendance" disabled={!isSignedIn || !selectedAthleteName || Boolean(scheduleError)} type="submit">
                      {scheduleError ? "Database Setup Needed" : "Save Attendance"}
                    </button>
                    <button className="btn" type="button" onClick={handleCancelAttendanceEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn red"
                    disabled={!selectedAthleteName || Boolean(scheduleError)}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleStartAttendanceEdit();
                    }}
                  >
                    Edit Attendance
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
      ) : null}
    </main>
  );
}
