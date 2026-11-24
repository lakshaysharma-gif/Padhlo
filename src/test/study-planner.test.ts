import { describe, expect, it } from "vitest";

import { createStudyPlan, type SubjectDraft } from "@/components/studymate/study-data";

describe("createStudyPlan", () => {
  it("allocates all available weekly hours across the subjects", () => {
    const subjects: SubjectDraft[] = [
      { id: "a", name: "Physics", difficulty: "Hard", preparation: 42, examDate: "2026-12-08" },
      { id: "b", name: "Biology", difficulty: "Easy", preparation: 80, examDate: "2026-12-20" },
    ];

    const plan = createStudyPlan(12, subjects, new Date("2026-11-21T00:00:00.000Z"));

    expect(plan.reduce((sum, subject) => sum + subject.hoursPerWeek, 0)).toBe(12);
  });

  it("gives more weekly time to the harder, less-prepared, earlier exam", () => {
    const subjects: SubjectDraft[] = [
      { id: "a", name: "Physics", difficulty: "Hard", preparation: 25, examDate: "2026-11-27" },
      { id: "b", name: "Art", difficulty: "Easy", preparation: 85, examDate: "2026-12-25" },
    ];

    const plan = createStudyPlan(10, subjects, new Date("2026-11-21T00:00:00.000Z"));

    const physics = plan.find((subject) => subject.id === "a");
    const art = plan.find((subject) => subject.id === "b");

    expect(physics).toBeDefined();
    expect(art).toBeDefined();
    if (!physics || !art) throw new Error("Expected both subjects in the study plan");
    expect(physics.hoursPerWeek).toBeGreaterThan(art.hoursPerWeek);
  });
});