import { useState } from "react";
import { CalendarDays, Clock3, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIFFICULTIES,
  type Difficulty,
  type SubjectDraft,
} from "@/components/studymate/study-data";

interface PlannerFormProps {
  initialHours: number;
  initialSubjects: SubjectDraft[];
  onGenerate: (hours: number, subjects: SubjectDraft[]) => void;
}

function createEmptySubject(): SubjectDraft {
  return {
    id: `subject-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    difficulty: "Moderate",
    preparation: 0,
    examDate: "",
  };
}

export function PlannerForm({ initialHours, initialSubjects, onGenerate }: PlannerFormProps) {
  const [availableHours, setAvailableHours] = useState(initialHours);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [duplicateError, setDuplicateError] = useState("");

  function updateSubject(id: string, updates: Partial<SubjectDraft>) {
    setSubjects((current) =>
      current.map((subject) => (subject.id === id ? { ...subject, ...updates } : subject)),
    );
  }

  function submitPlanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const names = subjects.map((subject) => subject.name.trim().toLocaleLowerCase()).filter(Boolean);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length) {
      setDuplicateError(`Duplicate subject found: ${[...new Set(duplicates)].join(", ")}. Please keep each subject only once.`);
      return;
    }
    if (!subjects.length || subjects.some((subject) => !subject.name.trim())) {
      setDuplicateError("Please add at least one subject and enter its name.");
      return;
    }
    setDuplicateError("");
    onGenerate(availableHours, subjects.map((subject) => ({ ...subject, name: subject.name.trim() })));
  }

  return (
    <form className="planner-form" onSubmit={submitPlanner}>
      <div className="form-topline">
        <span className="form-topline-icon" aria-hidden="true">
          <CalendarDays size={17} />
        </span>
        <div>
          <h3>Your subjects</h3>
          <p>Set a few details for each exam</p>
        </div>
      </div>

      <div className="hours-field">
        <div className="hours-copy">
          <Clock3 size={17} aria-hidden="true" />
          <div>
            <strong>Study time available</strong>
            <span>Hours you can study each week</span>
          </div>
        </div>
        <div className="hours-input-wrap">
          <input
            id="weekly-hours"
            aria-label="Available study hours per week"
            type="number"
            min={1}
            max={60}
            step={1}
            required
            value={availableHours}
            onChange={(event) => setAvailableHours(Number(event.currentTarget.value))}
          />
          <span>hrs / week</span>
        </div>
      </div>

      {subjects.map((subject, index) => (
        <div className="subject-entry" key={subject.id}>
          <div className="subject-row-heading">
            <strong>Subject {index + 1}</strong>
            {subjects.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="subject-remove"
                aria-label={`Remove ${subject.name || `subject ${index + 1}`}`}
                title="Remove subject"
                onClick={() => setSubjects((current) => current.filter((item) => item.id !== subject.id))}
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
          <div className="subject-fields">
            <div className="form-field">
              <label htmlFor={`${subject.id}-name`}>Subject</label>
              <input
                id={`${subject.id}-name`}
                className="form-input"
                type="text"
                placeholder="e.g. Biology"
                required
                value={subject.name}
                onChange={(event) => { setDuplicateError(""); updateSubject(subject.id, { name: event.currentTarget.value }); }}
              />
            </div>
            <div className="form-field">
              <label id={`${subject.id}-difficulty-label`}>Difficulty</label>
              <Select
                value={subject.difficulty}
                onValueChange={(value) => {
                  const difficulty = DIFFICULTIES.find((item) => item === value);
                  if (difficulty) updateSubject(subject.id, { difficulty: difficulty as Difficulty });
                }}
              >
                <SelectTrigger
                  id={`${subject.id}-difficulty`}
                  className="form-select-trigger"
                  aria-labelledby={`${subject.id}-difficulty-label`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="form-select-content">
                  {DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <label htmlFor={`${subject.id}-preparation`}>Ready</label>
              <div className="preparation-input-wrap">
                <input
                  id={`${subject.id}-preparation`}
                  className="form-input"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  required
                  value={subject.preparation}
                  onChange={(event) =>
                    updateSubject(subject.id, { preparation: Number(event.currentTarget.value) })
                  }
                />
                <span>%</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor={`${subject.id}-exam`}>Exam date</label>
              <input
                id={`${subject.id}-exam`}
                className="form-input"
                type="date"
                required
                value={subject.examDate}
                onChange={(event) => updateSubject(subject.id, { examDate: event.currentTarget.value })}
              />
            </div>
          </div>
        </div>
      ))}

      {duplicateError && <p className="planner-error" role="alert">{duplicateError}</p>}

      <div className="planner-actions">
        <Button
          type="button"
          variant="outline"
          className="planner-add"
          onClick={() => setSubjects((current) => [...current, createEmptySubject()])}
        >
          <Plus size={15} />
          Add a subject
        </Button>
        <Button type="submit" className="planner-submit">
          Build my study plan
        </Button>
      </div>
    </form>
  );
}