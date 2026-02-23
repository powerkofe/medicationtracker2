import { useState, useEffect, useCallback, useRef } from "react";

const MEAL_TIMES = [
  { id: "morning", label: "Morning", icon: "🌅", color: "#E97820", bg: "#FFF7ED" },
  { id: "midday", label: "Midday", icon: "☀️", color: "#2563EB", bg: "#EFF6FF" },
  { id: "evening", label: "Evening", icon: "🌇", color: "#7C3AED", bg: "#F5F3FF" },
  { id: "bedtime", label: "Bedtime", icon: "🌙", color: "#4338CA", bg: "#EEF2FF" },
];

const TIMING_OPTIONS = [
  { id: "before_meal", label: "Before Meal", short: "Before", icon: "🍽️⬅️" },
  { id: "with_meal", label: "With Meal", short: "With", icon: "🍽️" },
  { id: "after_meal", label: "After Meal", short: "After", icon: "➡️🍽️" },
  { id: "empty_stomach", label: "Empty Stomach", short: "Empty", icon: "🚫🍽️" },
  { id: "anytime", label: "Any Time", short: "Any", icon: "🕐" },
];

const TAKEN_WITH = [
  { id: "water", label: "Water", icon: "💧" },
  { id: "food", label: "Food", icon: "🍞" },
  { id: "juice", label: "Juice", icon: "🧃" },
  { id: "milk", label: "Milk", icon: "🥛" },
  { id: "nothing", label: "Nothing", icon: "∅" },
];

const FEELINGS = [
  { id: "good", label: "Good", icon: "😊" },
  { id: "okay", label: "Okay", icon: "😐" },
  { id: "tired", label: "Tired", icon: "😴" },
  { id: "dizzy", label: "Dizzy", icon: "😵‍💫" },
  { id: "nauseous", label: "Nauseous", icon: "🤢" },
  { id: "pain", label: "Pain", icon: "😣" },
];

const APPT_TYPES = [
  { id: "doctor_visit", label: "Doctor Visit", icon: "👨‍⚕️", color: "#3B82F6" },
  { id: "blood_test", label: "Blood Test", icon: "🩸", color: "#EF4444" },
  { id: "lab_work", label: "Lab Work", icon: "🔬", color: "#8B5CF6" },
  { id: "specialist", label: "Specialist", icon: "🏥", color: "#06B6D4" },
  { id: "dental", label: "Dental", icon: "🦷", color: "#F59E0B" },
  { id: "eye_exam", label: "Eye Exam", icon: "👁️", color: "#10B981" },
  { id: "pharmacy", label: "Pharmacy Pickup", icon: "💊", color: "#EC4899" },
  { id: "other", label: "Other", icon: "📋", color: "#6B7280" },
];

const SPECIALTIES = [
  "Primary Care", "Cardiologist", "Endocrinologist", "Neurologist", "Dermatologist",
  "Ophthalmologist", "Dentist", "Orthopedist", "Gastroenterologist", "Pulmonologist",
  "Rheumatologist", "Urologist", "Psychiatrist", "Oncologist", "Pharmacist", "Other",
];

const DEFAULT_MEDICATIONS = [
  { id: 1, name: "Lisinopril", dose: "10mg", timing: "before_meal", mealTime: "morning", notes: "Blood pressure", color: "#EF4444" },
  { id: 2, name: "Metformin", dose: "500mg", timing: "with_meal", mealTime: "morning", notes: "Diabetes", color: "#3B82F6" },
  { id: 3, name: "Metformin", dose: "500mg", timing: "with_meal", mealTime: "evening", notes: "Diabetes", color: "#3B82F6" },
  { id: 4, name: "Atorvastatin", dose: "20mg", timing: "anytime", mealTime: "bedtime", notes: "Cholesterol", color: "#8B5CF6" },
  { id: 5, name: "Aspirin", dose: "81mg", timing: "after_meal", mealTime: "midday", notes: "Heart health", color: "#F59E0B" },
];

const MED_COLORS = ["#EF4444", "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#06B6D4", "#84CC16"];

const getDayKey = (date) => date.toISOString().split("T")[0];
const getWeekDates = (centerDate) => {
  const dates = [];
  const d = new Date(centerDate);
  d.setDate(d.getDate() - 3);
  for (let i = 0; i < 7; i++) { dates.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return dates;
};
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getNowTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};
const formatTime12 = (t24) => {
  if (!t24) return "";
  const [h, m] = t24.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const formatDateNice = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};
const daysUntil = (dateStr) => {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
};

const Chip = ({ selected, onClick, children, style: s = {} }) => (
  <button onClick={onClick} style={{
    padding: "10px 14px", borderRadius: 12, border: "2px solid",
    borderColor: selected ? "#3B82F6" : "#E5E7EB",
    background: selected ? "#DBEAFE" : "white",
    fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    color: selected ? "#1D4ED8" : "#4B5563",
    transition: "all 0.15s ease", whiteSpace: "nowrap", ...s,
  }}>{children}</button>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "white", borderRadius: 20, padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16, ...style,
  }}>{children}</div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 20, fontWeight: 700, color: "#1F2937", marginBottom: 16 }}>{children}</div>
);

const InputField = ({ label, required, ...props }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 5 }}>
      {label}{required && " *"}
    </span>
    <input {...props} style={{
      width: "100%", padding: "13px 16px", borderRadius: 12,
      border: "2px solid #E5E7EB", fontSize: 17, fontFamily: "inherit",
      boxSizing: "border-box", outline: "none", ...props.style,
    }} />
  </label>
);

export default function MedicationTracker() {
  const [medications, setMedications] = useState(DEFAULT_MEDICATIONS);
  const [takenLog, setTakenLog] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate] = useState(new Date());
  const [view, setView] = useState("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [logPanel, setLogPanel] = useState(null);
  const [logData, setLogData] = useState({});
  const [newMed, setNewMed] = useState({ name: "", dose: "", timing: "before_meal", mealTime: "morning", notes: "", color: "#3B82F6" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({ type: "doctor_visit", title: "", date: "", time: "", doctorId: null, location: "", notes: "" });
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "Primary Care", phone: "", clinic: "", address: "", notes: "" });
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [confirmDeleteAppt, setConfirmDeleteAppt] = useState(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);
  const panelRef = useRef(null);

  // Load
  useEffect(() => {
    try { const r = localStorage.getItem("mt3_meds"); if (r) setMedications(JSON.parse(r)); } catch (e) {}
    try { const r = localStorage.getItem("mt3_log"); if (r) setTakenLog(JSON.parse(r)); } catch (e) {}
    try { const r = localStorage.getItem("mt3_appts"); if (r) setAppointments(JSON.parse(r)); } catch (e) {}
    try { const r = localStorage.getItem("mt3_docs"); if (r) setDoctors(JSON.parse(r)); } catch (e) {}
  }, []);

  // Save
  useEffect(() => { try { localStorage.setItem("mt3_meds", JSON.stringify(medications)); } catch(e) {} }, [medications]);
  useEffect(() => { try { localStorage.setItem("mt3_log", JSON.stringify(takenLog)); } catch(e) {} }, [takenLog]);
  useEffect(() => { try { localStorage.setItem("mt3_appts", JSON.stringify(appointments)); } catch(e) {} }, [appointments]);
  useEffect(() => { try { localStorage.setItem("mt3_docs", JSON.stringify(doctors)); } catch(e) {} }, [doctors]);

  const todayKey = getDayKey(selectedDate);
  const isToday = getDayKey(selectedDate) === getDayKey(new Date());
  const dayLog = takenLog[todayKey] || {};
  const takenCount = medications.filter((m) => dayLog[m.id]?.taken).length;
  const totalCount = medications.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;
  const getMedsForMealTime = (mealTimeId) => medications.filter((m) => m.mealTime === mealTimeId);

  const openLogPanel = (med) => {
    const existing = dayLog[med.id];
    setLogPanel(med.id);
    setLogData(existing?.taken || existing?.skipped ? {
      time: existing.time || getNowTime(), actualTiming: existing.actualTiming || med.timing,
      takenWith: existing.takenWith || [], feeling: existing.feeling || null, note: existing.note || "", skipped: false,
    } : {
      time: getNowTime(), actualTiming: med.timing, takenWith: [], feeling: null, note: "", skipped: false,
    });
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const saveMedLog = (medId, skip = false) => {
    setTakenLog((prev) => {
      const updated = {
        ...prev, [todayKey]: {
          ...prev[todayKey], [medId]: {
            taken: !skip, skipped: skip, time: skip ? null : logData.time,
            actualTiming: logData.actualTiming, takenWith: logData.takenWith,
            feeling: logData.feeling, note: logData.note, loggedAt: new Date().toISOString(),
          },
        },
      };
      const allDone = medications.every((m) => updated[todayKey]?.[m.id]?.taken || updated[todayKey]?.[m.id]?.skipped);
      if (allDone && !skip) { setCelebration(true); setTimeout(() => setCelebration(false), 3000); }
      return updated;
    });
    setLogPanel(null);
  };

  const undoMedLog = (medId) => {
    setTakenLog((prev) => { const d = { ...(prev[todayKey] || {}) }; delete d[medId]; return { ...prev, [todayKey]: d }; });
    setLogPanel(null);
  };

  const getStreak = () => {
    let streak = 0; const d = new Date();
    if (!isToday || takenCount < totalCount) d.setDate(d.getDate() - 1); else streak = 1;
    for (let i = 0; i < 365; i++) {
      const key = getDayKey(d); const log = takenLog[key] || {};
      if (medications.every((m) => log[m.id]?.taken || log[m.id]?.skipped) && medications.length > 0) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const addMedication = () => {
    if (!newMed.name.trim()) return;
    setMedications((p) => [...p, { ...newMed, id: Date.now() }]);
    setNewMed({ name: "", dose: "", timing: "before_meal", mealTime: "morning", notes: "", color: MED_COLORS[Math.floor(Math.random() * MED_COLORS.length)] });
    setShowAddForm(false);
  };

  const addAppointment = () => {
    if (!newAppt.title.trim() || !newAppt.date) return;
    setAppointments((p) => [...p, { ...newAppt, id: Date.now() }].sort((a, b) => a.date.localeCompare(b.date)));
    setNewAppt({ type: "doctor_visit", title: "", date: "", time: "", doctorId: null, location: "", notes: "" });
    setShowAddAppt(false);
  };

  const addDoctor = () => {
    if (!newDoctor.name.trim()) return;
    if (editingDoctor) {
      setDoctors((p) => p.map((d) => d.id === editingDoctor ? { ...newDoctor, id: editingDoctor } : d));
      setEditingDoctor(null);
    } else {
      setDoctors((p) => [...p, { ...newDoctor, id: Date.now() }]);
    }
    setNewDoctor({ name: "", specialty: "Primary Care", phone: "", clinic: "", address: "", notes: "" });
    setShowAddDoctor(false);
  };

  const streak = getStreak();
  const weekDates = getWeekDates(new Date());

  // Calendar helpers
  const getCalendarDays = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getApptsForDate = (day) => {
    if (!day) return [];
    const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((a) => a.date === key);
  };

  const upcomingAppts = appointments.filter((a) => daysUntil(a.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const pastAppts = appointments.filter((a) => daysUntil(a.date) < 0).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const todayStr = getDayKey(new Date());

  const navTabs = [
    { id: "today", label: "📋 Meds" },
    { id: "week", label: "📊 Week" },
    { id: "calendar", label: "📅 Appts" },
    { id: "doctors", label: "👨‍⚕️ Docs" },
    { id: "manage", label: "⚙️" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #FFF7ED 0%, #FEF3C7 40%, #ECFDF5 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative",
    }}>
      {celebration && (
        <div style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.35)", zIndex: 1000, animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            background: "white", borderRadius: 28, padding: "48px 44px", textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.25)", animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#065F46", marginBottom: 8 }}>All Done for Today!</div>
            <div style={{ fontSize: 18, color: "#6B7280" }}>Great job staying on track!</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 14px 100px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#92400E", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>
            My Health Tracker
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1F2937" }}>
            {isToday ? "Today" : selectedDate.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <div style={{ fontSize: 14, color: "#6B7280", marginTop: 1 }}>
            {selectedDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Quick summary bar */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 14,
        }}>
          <div style={{
            flex: 1, background: "white", borderRadius: 14, padding: "12px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: progress === 100 ? "#059669" : "#3B82F6" }}>
              {takenCount}/{totalCount}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Meds Today</div>
          </div>
          {streak > 0 && (
            <div style={{
              flex: 1, background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", borderRadius: 14, padding: "12px 14px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#92400E" }}>🔥 {streak}</div>
              <div style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>Day Streak</div>
            </div>
          )}
          <div style={{
            flex: 1, background: "white", borderRadius: 14, padding: "12px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: upcomingAppts.length > 0 ? "#7C3AED" : "#D1D5DB" }}>
              {upcomingAppts.length > 0 ? (
                daysUntil(upcomingAppts[0].date) === 0 ? "Today" : `${daysUntil(upcomingAppts[0].date)}d`
              ) : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Next Appt</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          background: "white", borderRadius: 16, padding: "12px 18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 14,
        }}>
          <div style={{ height: 10, background: "#E5E7EB", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`, borderRadius: 8,
              background: progress === 100 ? "linear-gradient(90deg,#34D399,#10B981)" : "linear-gradient(90deg,#60A5FA,#3B82F6)",
              transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 18, background: "white",
          borderRadius: 14, padding: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          {navTabs.map((tab) => (
            <button key={tab.id} onClick={() => { setView(tab.id); setLogPanel(null); }} style={{
              flex: 1, padding: "12px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: "inherit",
              background: view === tab.id ? "#1F2937" : "transparent",
              color: view === tab.id ? "white" : "#6B7280",
              transition: "all 0.2s ease",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ============ TODAY VIEW ============ */}
        {view === "today" && (
          <div>
            {/* Upcoming appointment reminder */}
            {upcomingAppts.length > 0 && daysUntil(upcomingAppts[0].date) <= 3 && (
              <div style={{
                background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)", borderRadius: 16,
                padding: "14px 18px", marginBottom: 16, border: "2px solid #C4B5FD",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#5B21B6", marginBottom: 4 }}>
                  📅 Upcoming: {APPT_TYPES.find(t => t.id === upcomingAppts[0].type)?.icon} {upcomingAppts[0].title}
                </div>
                <div style={{ fontSize: 13, color: "#6D28D9" }}>
                  {formatDateNice(upcomingAppts[0].date)}
                  {upcomingAppts[0].time ? ` at ${formatTime12(upcomingAppts[0].time)}` : ""}
                  {daysUntil(upcomingAppts[0].date) === 0 ? " — TODAY!" : ` — in ${daysUntil(upcomingAppts[0].date)} day${daysUntil(upcomingAppts[0].date) > 1 ? "s" : ""}`}
                </div>
              </div>
            )}

            {MEAL_TIMES.map((mealTime) => {
              const meds = getMedsForMealTime(mealTime.id);
              if (meds.length === 0) return null;
              return (
                <div key={mealTime.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "0 4px" }}>
                    <span style={{ fontSize: 24 }}>{mealTime.icon}</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#1F2937" }}>{mealTime.label}</span>
                  </div>
                  {meds.map((med) => {
                    const entry = dayLog[med.id];
                    const isTaken = entry?.taken;
                    const isSkipped = entry?.skipped;
                    const timing = TIMING_OPTIONS.find((t) => t.id === med.timing);
                    const isOpen = logPanel === med.id;
                    return (
                      <div key={med.id} style={{ marginBottom: 10 }}>
                        <button onClick={() => isOpen ? setLogPanel(null) : openLogPanel(med)}
                          style={{
                            display: "flex", alignItems: "center", width: "100%",
                            background: isTaken ? "linear-gradient(135deg,#D1FAE5,#A7F3D0)" : isSkipped ? "#FEF3C7" : "white",
                            border: isTaken ? "2px solid #6EE7B7" : isSkipped ? "2px solid #FCD34D" : isOpen ? "2px solid #3B82F6" : "2px solid #E5E7EB",
                            borderRadius: isOpen ? "16px 16px 0 0" : 16,
                            padding: "14px 16px", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                            boxShadow: isOpen ? "0 4px 20px rgba(59,130,246,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                            transition: "all 0.2s ease",
                          }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 12, marginRight: 12, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: isTaken ? "#10B981" : isSkipped ? "#F59E0B" : med.color || "#D1D5DB",
                            fontSize: 20, color: "white", fontWeight: 800,
                          }}>
                            {isTaken ? "✓" : isSkipped ? "—" : ""}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 18, fontWeight: 700,
                              color: isTaken ? "#065F46" : isSkipped ? "#92400E" : "#1F2937",
                              textDecoration: isSkipped ? "line-through" : "none",
                            }}>
                              {med.name} — {med.dose}
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{
                                background: isTaken ? "rgba(255,255,255,0.6)" : "#FEF3C7",
                                padding: "2px 8px", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#92400E",
                              }}>
                                {timing?.icon} {timing?.label}
                              </span>
                              {med.notes && <span style={{ fontSize: 12, color: "#6B7280" }}>{med.notes}</span>}
                            </div>
                            {(isTaken || isSkipped) && entry && (
                              <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                                {isTaken && entry.time && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: 5, color: "#059669", fontWeight: 600 }}>🕐 {formatTime12(entry.time)}</span>}
                                {entry.actualTiming && entry.actualTiming !== med.timing && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: 5, color: "#B45309", fontWeight: 600 }}>{TIMING_OPTIONS.find(t => t.id === entry.actualTiming)?.short}</span>}
                                {entry.takenWith?.length > 0 && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: 5, color: "#6B7280" }}>{entry.takenWith.map(tw => TAKEN_WITH.find(t => t.id === tw)?.icon).join("")}</span>}
                                {entry.feeling && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: 5, color: "#6B7280" }}>{FEELINGS.find(f => f.id === entry.feeling)?.icon}</span>}
                                {isSkipped && <span style={{ fontSize: 11, color: "#B45309", fontWeight: 600 }}>Skipped</span>}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 16, color: isOpen ? "#3B82F6" : "#D1D5DB", marginLeft: 6, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</div>
                        </button>
                        {isOpen && (
                          <div ref={panelRef} style={{
                            background: "white", border: "2px solid #3B82F6", borderTop: "1px solid #E5E7EB",
                            borderRadius: "0 0 16px 16px", padding: "18px 16px",
                            boxShadow: "0 8px 24px rgba(59,130,246,0.1)", animation: "slideDown 0.2s ease",
                          }}>
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>🕐 What time?</div>
                              <input type="time" value={logData.time || ""} onChange={(e) => setLogData({ ...logData, time: e.target.value })}
                                style={{ padding: "11px 14px", borderRadius: 12, border: "2px solid #E5E7EB", fontSize: 18, fontFamily: "inherit", fontWeight: 600, width: "100%", boxSizing: "border-box", outline: "none", textAlign: "center" }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>🍽️ Relative to meal?</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {TIMING_OPTIONS.map((t) => <Chip key={t.id} selected={logData.actualTiming === t.id} onClick={() => setLogData({ ...logData, actualTiming: t.id })}>{t.icon} {t.short}</Chip>)}
                              </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>💧 Taken with?</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {TAKEN_WITH.map((tw) => <Chip key={tw.id} selected={logData.takenWith?.includes(tw.id)} onClick={() => { const a = logData.takenWith || []; setLogData({ ...logData, takenWith: a.includes(tw.id) ? a.filter(x => x !== tw.id) : [...a, tw.id] }); }}>{tw.icon} {tw.label}</Chip>)}
                              </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>How are you feeling? <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span></div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {FEELINGS.map((f) => <Chip key={f.id} selected={logData.feeling === f.id} onClick={() => setLogData({ ...logData, feeling: logData.feeling === f.id ? null : f.id })}>{f.icon} {f.label}</Chip>)}
                              </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>📝 Notes <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span></div>
                              <input value={logData.note || ""} onChange={(e) => setLogData({ ...logData, note: e.target.value })} placeholder="e.g. took half dose..."
                                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "2px solid #E5E7EB", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button onClick={() => saveMedLog(med.id, false)} style={{ flex: 2, padding: "14px 14px", borderRadius: 12, border: "none", background: "#10B981", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", minWidth: 100 }}>✓ Taken</button>
                              <button onClick={() => saveMedLog(med.id, true)} style={{ flex: 1, padding: "14px 10px", borderRadius: 12, border: "2px solid #FCD34D", background: "#FFFBEB", color: "#92400E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Skip</button>
                              {(isTaken || isSkipped) && <button onClick={() => undoMedLog(med.id)} style={{ flex: 1, padding: "14px 10px", borderRadius: 12, border: "2px solid #FEE2E2", background: "#FEF2F2", color: "#DC2626", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Undo</button>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {medications.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 17 }}>No medications added yet. Go to ⚙️ to add.</div>}
          </div>
        )}

        {/* ============ WEEK VIEW ============ */}
        {view === "week" && (
          <div>
            <Card>
              <SectionTitle>This Week</SectionTitle>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                {weekDates.map((date) => {
                  const key = getDayKey(date); const log = takenLog[key] || {};
                  const taken = medications.filter((m) => log[m.id]?.taken).length;
                  const pct = totalCount > 0 ? (taken / totalCount) * 100 : 0;
                  const isCur = getDayKey(date) === getDayKey(new Date());
                  return (
                    <div key={key} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isCur ? "#3B82F6" : "#9CA3AF", marginBottom: 4 }}>{dayNames[date.getDay()]}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: isCur ? "#3B82F6" : "#4B5563", marginBottom: 8 }}>{date.getDate()}</div>
                      <div style={{ height: 80, background: "#F3F4F6", borderRadius: 8, position: "relative", overflow: "hidden", border: isCur ? "2px solid #3B82F6" : "none" }}>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, background: pct === 100 ? "linear-gradient(0deg,#34D399,#6EE7B7)" : pct > 0 ? "linear-gradient(0deg,#60A5FA,#93C5FD)" : "transparent", borderRadius: 6, transition: "height 0.5s ease" }} />
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, color: pct === 100 ? "#059669" : taken > 0 ? "#3B82F6" : "#D1D5DB" }}>{pct === 100 ? "✓" : taken > 0 ? `${taken}/${totalCount}` : "—"}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <SectionTitle>Recent Details</SectionTitle>
              {weekDates.slice().reverse().map((date) => {
                const key = getDayKey(date); const log = takenLog[key] || {};
                const entries = medications.map((m) => ({ med: m, entry: log[m.id] })).filter((e) => e.entry);
                if (entries.length === 0) return null;
                const isExp = expandedHistory === key;
                return (
                  <div key={key} style={{ marginBottom: 6 }}>
                    <button onClick={() => setExpandedHistory(isExp ? null : key)} style={{ width: "100%", padding: "10px 0", border: "none", borderBottom: "1px solid #F3F4F6", background: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1F2937" }}>{date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>{entries.filter(e => e.entry?.taken).length}/{medications.length} {isExp ? "▲" : "▼"}</span>
                    </button>
                    {isExp && <div style={{ padding: "6px 0 10px" }}>
                      {entries.map(({ med, entry }) => (
                        <div key={med.id} style={{ padding: "7px 10px", marginBottom: 4, borderRadius: 10, background: entry.taken ? "#F0FDF4" : "#FEF3C7", fontSize: 13 }}>
                          <div style={{ fontWeight: 700, color: "#1F2937" }}>{entry.taken ? "✓" : "—"} {med.name} {med.dose}</div>
                          <div style={{ color: "#6B7280", marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {entry.time && <span>🕐 {formatTime12(entry.time)}</span>}
                            {entry.actualTiming && <span>🍽️ {TIMING_OPTIONS.find(t => t.id === entry.actualTiming)?.short}</span>}
                            {entry.takenWith?.length > 0 && <span>{entry.takenWith.map(tw => TAKEN_WITH.find(t => t.id === tw)?.icon).join(" ")}</span>}
                            {entry.feeling && <span>{FEELINGS.find(f => f.id === entry.feeling)?.icon}</span>}
                            {entry.note && <span style={{ fontStyle: "italic" }}>"{entry.note}"</span>}
                          </div>
                        </div>
                      ))}
                    </div>}
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* ============ CALENDAR / APPOINTMENTS VIEW ============ */}
        {view === "calendar" && (
          <div>
            {/* Calendar grid */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                  style={{ width: 40, height: 40, borderRadius: 10, border: "2px solid #E5E7EB", background: "white", fontSize: 18, cursor: "pointer", fontFamily: "inherit" }}>◀</button>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1F2937" }}>{monthNames[calMonth]} {calYear}</div>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                  style={{ width: 40, height: 40, borderRadius: 10, border: "2px solid #E5E7EB", background: "white", fontSize: 18, cursor: "pointer", fontFamily: "inherit" }}>▶</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#9CA3AF", padding: "4px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {getCalendarDays().map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const appts = getApptsForDate(day);
                  const isTodayCell = dateKey === todayStr;
                  return (
                    <div key={i} style={{
                      textAlign: "center", padding: "6px 2px", borderRadius: 10,
                      background: isTodayCell ? "#DBEAFE" : appts.length > 0 ? "#F5F3FF" : "transparent",
                      border: isTodayCell ? "2px solid #3B82F6" : "none",
                      minHeight: 38, position: "relative",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: isTodayCell ? 800 : 600, color: isTodayCell ? "#1D4ED8" : "#374151" }}>{day}</div>
                      {appts.length > 0 && (
                        <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 2 }}>
                          {appts.slice(0, 3).map((a, j) => (
                            <div key={j} style={{ width: 6, height: 6, borderRadius: 3, background: APPT_TYPES.find(t => t.id === a.type)?.color || "#6B7280" }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Upcoming appointments */}
            <Card>
              <SectionTitle>📅 Upcoming Appointments</SectionTitle>
              {upcomingAppts.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#9CA3AF", fontSize: 15 }}>No upcoming appointments</div>}
              {upcomingAppts.map((appt) => {
                const type = APPT_TYPES.find(t => t.id === appt.type);
                const doc = doctors.find(d => d.id === appt.doctorId);
                const d = daysUntil(appt.date);
                return (
                  <div key={appt.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
                    borderBottom: "1px solid #F3F4F6",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: type?.color + "18", fontSize: 22,
                    }}>{type?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#1F2937" }}>{appt.title}</div>
                      <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
                        {formatDateNice(appt.date)}{appt.time ? ` · ${formatTime12(appt.time)}` : ""}
                      </div>
                      {doc && <div style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>👨‍⚕️ Dr. {doc.name}</div>}
                      {appt.location && <div style={{ fontSize: 13, color: "#6B7280" }}>📍 {appt.location}</div>}
                      {appt.notes && <div style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic", marginTop: 2 }}>{appt.notes}</div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                        background: d === 0 ? "#FEE2E2" : d <= 3 ? "#FEF3C7" : "#F3F4F6",
                        color: d === 0 ? "#DC2626" : d <= 3 ? "#92400E" : "#6B7280",
                      }}>{d === 0 ? "Today!" : d === 1 ? "Tomorrow" : `${d} days`}</div>
                      {confirmDeleteAppt === appt.id ? (
                        <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                          <button onClick={() => { setAppointments(p => p.filter(a => a.id !== appt.id)); setConfirmDeleteAppt(null); }}
                            style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#EF4444", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Yes</button>
                          <button onClick={() => setConfirmDeleteAppt(null)}
                            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteAppt(appt.id)} style={{ marginTop: 6, fontSize: 11, color: "#DC2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>✕ Remove</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Past appointments */}
            {pastAppts.length > 0 && (
              <Card>
                <SectionTitle>Past Appointments</SectionTitle>
                {pastAppts.map((appt) => {
                  const type = APPT_TYPES.find(t => t.id === appt.type);
                  return (
                    <div key={appt.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #F3F4F6", opacity: 0.6 }}>
                      <span style={{ fontSize: 18 }}>{type?.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#4B5563" }}>{appt.title}</div>
                        <div style={{ fontSize: 13, color: "#9CA3AF" }}>{formatDateNice(appt.date)}</div>
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}

            {/* Add appointment */}
            {!showAddAppt ? (
              <button onClick={() => setShowAddAppt(true)} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "2px dashed #D1D5DB",
                background: "rgba(255,255,255,0.7)", fontSize: 17, fontWeight: 700, color: "#7C3AED",
                cursor: "pointer", fontFamily: "inherit",
              }}>+ Add Appointment</button>
            ) : (
              <Card style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <SectionTitle>New Appointment</SectionTitle>

                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>Type</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {APPT_TYPES.map((t) => (
                      <Chip key={t.id} selected={newAppt.type === t.id} onClick={() => setNewAppt({ ...newAppt, type: t.id })}>
                        {t.icon} {t.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <InputField label="Title" required value={newAppt.title} onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })} placeholder="e.g. Annual checkup" />

                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <label style={{ flex: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 5 }}>Date *</span>
                    <input type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                      style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "2px solid #E5E7EB", fontSize: 16, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                  </label>
                  <label style={{ flex: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 5 }}>Time</span>
                    <input type="time" value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                      style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "2px solid #E5E7EB", fontSize: 16, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                  </label>
                </div>

                {doctors.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>Doctor</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <Chip selected={!newAppt.doctorId} onClick={() => setNewAppt({ ...newAppt, doctorId: null })}>None</Chip>
                      {doctors.map((d) => (
                        <Chip key={d.id} selected={newAppt.doctorId === d.id} onClick={() => setNewAppt({ ...newAppt, doctorId: d.id })}>
                          👨‍⚕️ {d.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                <InputField label="Location" value={newAppt.location} onChange={(e) => setNewAppt({ ...newAppt, location: e.target.value })} placeholder="e.g. City Medical Center" />
                <InputField label="Notes" value={newAppt.notes} onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })} placeholder="e.g. Bring insurance card, fasting required" />

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button onClick={addAppointment} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#7C3AED", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add Appointment</button>
                  <button onClick={() => setShowAddAppt(false)} style={{ padding: "14px 20px", borderRadius: 12, border: "2px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ============ DOCTORS VIEW ============ */}
        {view === "doctors" && (
          <div>
            <Card>
              <SectionTitle>👨‍⚕️ My Doctors</SectionTitle>
              {doctors.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#9CA3AF", fontSize: 16 }}>No doctors added yet.<br />Add your care team below!</div>}
              {doctors.map((doc) => (
                <div key={doc.id} style={{
                  padding: "16px 0", borderBottom: "1px solid #F3F4F6",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#EFF6FF", fontSize: 24,
                      }}>👨‍⚕️</div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>Dr. {doc.name}</div>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: "#3B82F6",
                          background: "#EFF6FF", padding: "2px 8px", borderRadius: 6,
                          display: "inline-block", marginTop: 2,
                        }}>{doc.specialty}</div>
                        {doc.clinic && <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>🏥 {doc.clinic}</div>}
                        {doc.phone && <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>📞 {doc.phone}</div>}
                        {doc.address && <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>📍 {doc.address}</div>}
                        {doc.notes && <div style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", marginTop: 4 }}>{doc.notes}</div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => {
                        setEditingDoctor(doc.id);
                        setNewDoctor({ name: doc.name, specialty: doc.specialty, phone: doc.phone, clinic: doc.clinic, address: doc.address, notes: doc.notes });
                        setShowAddDoctor(true);
                      }} style={{ padding: "6px 12px", borderRadius: 8, border: "2px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                      {confirmDeleteDoc === doc.id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { setDoctors(p => p.filter(d => d.id !== doc.id)); setConfirmDeleteDoc(null); }}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#EF4444", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Yes</button>
                          <button onClick={() => setConfirmDeleteDoc(null)}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteDoc(doc.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "2px solid #FEE2E2", background: "#FEF2F2", color: "#DC2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {!showAddDoctor ? (
              <button onClick={() => { setShowAddDoctor(true); setEditingDoctor(null); setNewDoctor({ name: "", specialty: "Primary Care", phone: "", clinic: "", address: "", notes: "" }); }}
                style={{ width: "100%", padding: "16px", borderRadius: 16, border: "2px dashed #D1D5DB", background: "rgba(255,255,255,0.7)", fontSize: 17, fontWeight: 700, color: "#3B82F6", cursor: "pointer", fontFamily: "inherit" }}>
                + Add Doctor
              </button>
            ) : (
              <Card style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <SectionTitle>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</SectionTitle>

                <InputField label="Doctor's Name" required value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} placeholder="e.g. Smith" />

                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>Specialty</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {SPECIALTIES.map((s) => (
                      <Chip key={s} selected={newDoctor.specialty === s} onClick={() => setNewDoctor({ ...newDoctor, specialty: s })}
                        style={{ fontSize: 13, padding: "8px 12px" }}>{s}</Chip>
                    ))}
                  </div>
                </div>

                <InputField label="Phone Number" value={newDoctor.phone} onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })} placeholder="e.g. (555) 123-4567" />
                <InputField label="Clinic / Hospital" value={newDoctor.clinic} onChange={(e) => setNewDoctor({ ...newDoctor, clinic: e.target.value })} placeholder="e.g. City Medical Center" />
                <InputField label="Address" value={newDoctor.address} onChange={(e) => setNewDoctor({ ...newDoctor, address: e.target.value })} placeholder="e.g. 123 Health St, Suite 200" />
                <InputField label="Notes" value={newDoctor.notes} onChange={(e) => setNewDoctor({ ...newDoctor, notes: e.target.value })} placeholder="e.g. Referred by Dr. Jones" />

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button onClick={addDoctor} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#3B82F6", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {editingDoctor ? "Save Changes" : "Add Doctor"}
                  </button>
                  <button onClick={() => { setShowAddDoctor(false); setEditingDoctor(null); }}
                    style={{ padding: "14px 20px", borderRadius: 12, border: "2px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ============ MANAGE VIEW ============ */}
        {view === "manage" && (
          <div>
            <Card>
              <SectionTitle>Your Medications</SectionTitle>
              {medications.map((med) => {
                const meal = MEAL_TIMES.find((m) => m.id === med.mealTime);
                const timing = TIMING_OPTIONS.find((t) => t.id === med.timing);
                return (
                  <div key={med.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 32, borderRadius: 4, background: med.color || "#D1D5DB" }} />
                      <div>
                        <div style={{ fontWeight: 700, color: "#1F2937", fontSize: 16 }}>{med.name} — {med.dose}</div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>{meal?.icon} {timing?.label} · {meal?.label}{med.notes ? ` · ${med.notes}` : ""}</div>
                      </div>
                    </div>
                    {confirmDelete === med.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setMedications(p => p.filter(m => m.id !== med.id)); setConfirmDelete(null); }}
                          style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#EF4444", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                        <button onClick={() => setConfirmDelete(null)}
                          style={{ padding: "7px 12px", borderRadius: 8, border: "2px solid #E5E7EB", background: "white", color: "#6B7280", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(med.id)}
                        style={{ padding: "7px 12px", borderRadius: 8, border: "2px solid #FEE2E2", background: "#FEF2F2", color: "#DC2626", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                    )}
                  </div>
                );
              })}
            </Card>

            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "2px dashed #D1D5DB",
                background: "rgba(255,255,255,0.7)", fontSize: 17, fontWeight: 700, color: "#3B82F6",
                cursor: "pointer", fontFamily: "inherit",
              }}>+ Add Medication</button>
            ) : (
              <Card style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <SectionTitle>Add New Medication</SectionTitle>
                <InputField label="Medication Name" required value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} placeholder="e.g. Lisinopril" />
                <InputField label="Dose" value={newMed.dose} onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })} placeholder="e.g. 10mg" />
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>Color</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {MED_COLORS.map((c) => <button key={c} onClick={() => setNewMed({ ...newMed, color: c })} style={{ width: 32, height: 32, borderRadius: 8, border: newMed.color === c ? "3px solid #1F2937" : "2px solid #E5E7EB", background: c, cursor: "pointer" }} />)}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>Time of Day</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {MEAL_TIMES.map((mt) => <Chip key={mt.id} selected={newMed.mealTime === mt.id} onClick={() => setNewMed({ ...newMed, mealTime: mt.id })}>{mt.icon} {mt.label}</Chip>)}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>Meal Timing</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {TIMING_OPTIONS.map((t) => <Chip key={t.id} selected={newMed.timing === t.id} onClick={() => setNewMed({ ...newMed, timing: t.id })}>{t.icon} {t.short}</Chip>)}
                  </div>
                </div>
                <InputField label="Notes" value={newMed.notes} onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })} placeholder="e.g. Blood pressure" />
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button onClick={addMedication} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#3B82F6", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add Medication</button>
                  <button onClick={() => setShowAddForm(false)} style={{ padding: "14px 20px", borderRadius: 12, border: "2px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              </Card>
            )}

            <button onClick={() => {
              if (window.confirm("Clear ALL data (history, appointments, doctors)? Cannot be undone.")) {
                setTakenLog({}); setAppointments([]); setDoctors([]);
                try { localStorage.removeItem("mt3_log"); } catch(e) {}
                try { localStorage.removeItem("mt3_appts"); } catch(e) {}
                try { localStorage.removeItem("mt3_docs"); } catch(e) {}
              }
            }} style={{
              width: "100%", marginTop: 16, padding: "13px", borderRadius: 12,
              border: "2px solid #FEE2E2", background: "transparent",
              color: "#DC2626", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>Clear All Data</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes slideDown { from { opacity: 0; max-height: 0 } to { opacity: 1; max-height: 800px } }
        button:active { transform: scale(0.97) !important; }
        input:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      `}</style>
    </div>
  );
}
