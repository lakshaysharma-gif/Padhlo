export type Difficulty = "Easy" | "Moderate" | "Hard";

export interface SubjectDraft {
  id: string;
  name: string;
  difficulty: Difficulty;
  preparation: number;
  examDate: string;
}

export interface StudyPlanItem extends SubjectDraft {
  hoursPerWeek: number;
  focus: string;
}

export const DIFFICULTIES: Difficulty[] = ["Easy", "Moderate", "Hard"];

export const SAMPLE_WEEKLY_HOURS = 12;

export const SAMPLE_SUBJECTS: SubjectDraft[] = [
  {
    id: "sample-physics",
    name: "Physics",
    difficulty: "Hard",
    preparation: 42,
    examDate: "2026-12-08",
  },
  {
    id: "sample-calculus",
    name: "Calculus",
    difficulty: "Moderate",
    preparation: 67,
    examDate: "2026-12-12",
  },
  {
    id: "sample-psychology",
    name: "Psychology",
    difficulty: "Easy",
    preparation: 81,
    examDate: "2026-12-17",
  },
];

function focusForPreparation(preparation: number) {
  if (preparation < 50) return "Build core concepts";
  if (preparation < 75) return "Practice weak areas";
  return "Review & timed practice";
}

function priorityWeight(subject: SubjectDraft, today: Date) {
  const examTime = Date.parse(`${subject.examDate}T00:00:00.000Z`);
  const todayTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const daysUntilExam = Math.ceil((examTime - todayTime) / 86_400_000);
  const urgency = daysUntilExam <= 7 ? 1.5 : daysUntilExam <= 21 ? 1.2 : 1;
  const difficulty = subject.difficulty === "Hard" ? 1.2 : subject.difficulty === "Moderate" ? 0.7 : 0.35;
  return (0.8 + (100 - subject.preparation) / 100 + difficulty) * urgency;
}

export function createStudyPlan(
  availableHours: number,
  subjects: SubjectDraft[],
  today = new Date(),
): StudyPlanItem[] {
  if (subjects.length === 0) return [];

  const weights = subjects.map((subject) => priorityWeight(subject, today));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let assignedHours = 0;

  return subjects.map((subject, index) => {
    const weight = weights[index] ?? 0;
    const isLast = index === subjects.length - 1;
    const hoursPerWeek = isLast
      ? Math.round((availableHours - assignedHours) * 10) / 10
      : Math.round((availableHours * (weight / totalWeight)) * 10) / 10;

    assignedHours += hoursPerWeek;

    return {
      ...subject,
      hoursPerWeek,
      focus: focusForPreparation(subject.preparation),
    };
  });
}