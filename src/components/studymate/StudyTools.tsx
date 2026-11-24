import { useEffect, useMemo, useState } from "react";
import { Bell, Bot, Clock3, Play, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubjectDraft } from "@/components/studymate/study-data";

type Reminder = { id: string; title: string; at: string; notified?: boolean };
type ChatMessage = { role: "user" | "assistant"; text: string };
type RevisionSession = { id: string; subjectId: string; day: string; seconds: number };

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
};

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}


interface StudyToolsProps {
  subjects: SubjectDraft[];
}

export function StudyTools({ subjects }: StudyToolsProps) {
  const [totals, setTotals] = useState<Record<string, number>>(() => readStorage("padhlo-revision-totals", {}));
  const [sessions, setSessions] = useState<RevisionSession[]>(() => readStorage("padhlo-revision-sessions", []));
  const [selected, setSelected] = useState(subjects[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>(() => readStorage("padhlo-reminders", []));
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: "Hi! I'm your study buddy. Ask me about revision, focus, exams, or planning your study time." }]);
  const [draft, setDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const selectedName = useMemo(() => subjects.find((s) => s.id === selected)?.name ?? "Study session", [subjects, selected]);

  useEffect(() => {
    if (!running) return;
    const tick = () => setElapsed(Math.floor((Date.now() - (sessionStart ?? Date.now())) / 1000));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [running, sessionStart]);

  useEffect(() => { localStorage.setItem("padhlo-revision-totals", JSON.stringify(totals)); }, [totals]);
  useEffect(() => { localStorage.setItem("padhlo-revision-sessions", JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem("padhlo-reminders", JSON.stringify(reminders)); }, [reminders]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      setReminders((items) => items.map((item) => {
        if (!item.notified && new Date(item.at).getTime() <= now) {
          if ("Notification" in window && Notification.permission === "granted") new Notification("Padhlo study reminder", { body: item.title });
          return { ...item, notified: true };
        }
        return item;
      }));
    };
    const id = window.setInterval(check, 15000);
    check();
    return () => window.clearInterval(id);
  }, []);

  function startTimer() {
    if (!selected || running) return;
    setElapsed(0);
    setSessionStart(Date.now());
    setRunning(true);
  }

  // Save the exact elapsed duration rather than relying on the last interval tick.
  function stopTimer() {
    if (running && selected && sessionStart !== null) {
      const completedSeconds = Math.max(0, Math.floor((Date.now() - sessionStart) / 1000));
      if (completedSeconds > 0) {
        const day = new Date().toLocaleDateString("en-CA");
        setTotals((current) => ({ ...current, [selected]: (current[selected] ?? 0) + completedSeconds }));
        setSessions((current) => [...current, { id: `${Date.now()}-${Math.random()}`, subjectId: selected, day, seconds: completedSeconds }]);
      }
    }
    setRunning(false);
    setSessionStart(null);
    setElapsed(0);
  }

  // Reset discards only the current session; previously saved subject totals remain intact.
  function resetTimer() {
    setRunning(false);
    setSessionStart(null);
    setElapsed(0);
  }
  function resetSubjectTotal(subjectId: string) {
    if (!window.confirm("Reset all saved revision time for this subject?")) return;
    setTotals((current) => ({ ...current, [subjectId]: 0 }));
    setSessions((current) => current.filter((session) => session.subjectId !== subjectId));
  }

  function resetDay(day: string, subjectId?: string) {
    const removed = sessions.filter((session) => session.day === day && (!subjectId || session.subjectId === subjectId));
    if (!removed.length) return;
    if (!window.confirm(`Reset revision time for ${subjectId ? subjects.find((s) => s.id === subjectId)?.name : "all subjects"} on ${day}?`)) return;
    const deductions = removed.reduce<Record<string, number>>((acc, session) => {
      acc[session.subjectId] = (acc[session.subjectId] ?? 0) + session.seconds;
      return acc;
    }, {});
    setTotals((current) => {
      const next = { ...current };
      Object.entries(deductions).forEach(([id, seconds]) => { next[id] = Math.max(0, (next[id] ?? 0) - seconds); });
      return next;
    });
    setSessions((current) => current.filter((session) => !(session.day === day && (!subjectId || session.subjectId === subjectId))));
  }

  async function addReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reminderTitle.trim() || !reminderAt) return;
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    setReminders((items) => [...items, { id: `${Date.now()}`, title: reminderTitle.trim(), at: new Date(reminderAt).toISOString() }].sort((a, b) => a.at.localeCompare(b.at)));
    setReminderTitle("");
    setReminderAt("");
  }
  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || chatLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setChatError("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
          subjects: subjects.map((subject) => ({
            name: subject.name,
            difficulty: subject.difficulty,
            preparation: subject.preparation,
          })),
        }),
      });
      const data = await response.json() as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "The AI assistant could not respond.");
      if (!data.reply) throw new Error("The AI returned an empty response.");
      setMessages((items) => [...items, { role: "assistant", text: data.reply! }]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Unable to reach the AI assistant.");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <section className="tools-section" id="study-tools">
      <div className="study-container">
        <div className="tools-heading">
          <div><span className="section-kicker">STAY CONSISTENT</span><h2>Your study tools</h2><p>Track revision, set reminders, and get study guidance.</p></div>

        </div>
        <div className="tools-grid">
          <article className="tool-card">
            <div className="tool-title"><Clock3 size={18} /><div><h3>Revision time tracker</h3><p>Record focused time by subject</p></div></div>
            <label className="tool-label" htmlFor="timer-subject">Subject</label>
            <select id="timer-subject" className="tool-input" value={selected} disabled={running} onChange={(e) => setSelected(e.target.value)}>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <div className="timer-display" aria-live="off">{formatDuration(elapsed)}</div>
            <div className="timer-actions">
              {!running ? (
                <Button type="button" onClick={startTimer} disabled={!subjects.length}><Play size={15} /> Start revision</Button>
              ) : (
                <Button type="button" variant="destructive" onClick={stopTimer}><Square size={14} /> Stop & save</Button>
              )}
              <Button type="button" variant="outline" onClick={resetTimer} disabled={!running && elapsed === 0}>
                Reset timer
              </Button>
              <span className="timer-hint">{running ? `Tracking ${selectedName}` : "Start a session when you're ready"}</span>
            </div>
            <div className="tracked-list">
              <strong>Total revision time</strong>
              {subjects.map((subject) => (
                <div className="tracked-row tracked-row-actions" key={subject.id}>
                  <span>{subject.name}</span><b>{formatDuration(totals[subject.id] ?? 0)}</b>
                  <button type="button" onClick={() => resetSubjectTotal(subject.id)} title={`Reset all time for ${subject.name}`}>Reset total</button>
                </div>
              ))}
              {!subjects.length && <p>Add a subject in your planner to start tracking.</p>}
              <div className="daily-revision">
                <strong>Daily revision history</strong>
                {[...new Set(sessions.map((session) => session.day))].sort((a, b) => b.localeCompare(a)).map((day) => {
                  const daySeconds = sessions.filter((session) => session.day === day).reduce((sum, session) => sum + session.seconds, 0);
                  return <div className="tracked-row tracked-row-actions" key={day}>
                    <span>{new Date(`${day}T00:00:00`).toLocaleDateString()}</span><b>{formatDuration(daySeconds)}</b>
                    <button type="button" onClick={() => resetDay(day)}>Reset day</button>
                  </div>;
                })}
                {!sessions.length && <p className="empty-hint">Completed sessions will appear here by day.</p>}
              </div>
            </div>
          </article>

          <article className="tool-card">
            <div className="tool-title"><Bell size={18} /><div><h3>Study reminders</h3><p>Schedule revision sessions and exam prep</p></div></div>
            <form className="reminder-form" onSubmit={addReminder}>
              <label className="tool-label" htmlFor="reminder-title">Reminder</label>
              <input id="reminder-title" className="tool-input" placeholder="e.g. Revise organic chemistry" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} required />
              <label className="tool-label" htmlFor="reminder-time">Date and time</label>
              <input id="reminder-time" className="tool-input" type="datetime-local" min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} required />
              <Button type="submit" className="reminder-submit"><Bell size={14} /> Add reminder</Button>
            </form>
            <div className="reminder-list">
              {reminders.length ? reminders.map((item) => <div className="reminder-row" key={item.id}><div><strong>{item.title}</strong><span>{new Date(item.at).toLocaleString()}</span></div><button type="button" aria-label={`Delete reminder ${item.title}`} onClick={() => setReminders((all) => all.filter((r) => r.id !== item.id))}>×</button></div>) : <p className="empty-hint">No reminders yet. Add one above.</p>}
            </div>
            <p className="tool-footnote">Keep this website open to receive scheduled browser notifications. Allow notifications when prompted.</p>
          </article>

          <article className="tool-card chat-card">
            <div className="tool-title"><Bot size={19} /><div><h3>Study buddy</h3><p>Instant help for common study questions</p></div><span className="local-badge">{chatLoading ? "THINKING" : "AI ASSISTANT"}</span></div>
            <div className="chat-messages" aria-live="polite">
              {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}><span>{message.role === "assistant" ? "Study buddy" : "You"}</span><p>{message.text}</p></div>)}
              {chatLoading && <div className="chat-message assistant"><span>Study buddy</span><p>Thinking…</p></div>}
            </div>
            {chatError && <p className="planner-error" role="alert">{chatError}</p>}
            <form className="chat-form" onSubmit={sendMessage}>
              <input className="tool-input" aria-label="Ask your study buddy" placeholder="Ask about revision, focus, exams..." value={draft} onChange={(e) => setDraft(e.target.value)} disabled={chatLoading} />
              <Button type="submit" aria-label="Send message" disabled={!draft.trim() || chatLoading}><Send size={15} /></Button>
            </form>
            <p className="tool-footnote"> AI-powered study help, powered by Groq. Your conversations are processed securely through our server. </p>
          </article>
        </div>
      </div>
    </section>
  );
}
