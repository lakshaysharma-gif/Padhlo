import { CalendarDays, Check, Clock3, Lightbulb } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { StudyPlanItem } from "@/components/studymate/study-data";

interface StudyPlanListProps {
  plans: StudyPlanItem[];
  totalHours: number;
  isGenerated: boolean;
}

function formatExamDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function StudyPlanList({ plans, totalHours, isGenerated }: StudyPlanListProps) {
  return (
    <aside className="plan-panel" aria-labelledby="plan-title">
      <div className="plan-header">
        <div>
          <h3 id="plan-title">Your weekly plan</h3>
          <p>Time is balanced across your subjects</p>
        </div>
        <span className="plan-state">
          <Check size={11} /> {isGenerated ? "Updated" : "Sample plan"}
        </span>
      </div>

      <div className="plan-summary">
        <div className="plan-summary-main">
          <Clock3 size={18} aria-hidden="true" />
          <div>
            <strong>Weekly study time</strong>
            <span>Priorities based on readiness & exam dates</span>
          </div>
        </div>
        <div className="plan-total">{totalHours} hrs</div>
      </div>

      <div className="plan-list">
        {plans.map((plan) => (
          <div className="plan-item" key={plan.id}>
            <div className="plan-topline">
              <span className="plan-subject-name">{plan.name}</span>
              <span className="plan-hours">{plan.hoursPerWeek} hrs / week</span>
            </div>
            <div className="plan-focus-line">
              <span>{plan.focus}</span>
              <span className="plan-deadline">
                <CalendarDays size={12} aria-hidden="true" /> {formatExamDate(plan.examDate)}
              </span>
            </div>
            <Progress
              value={plan.preparation}
              className="plan-progress"
              aria-label={`${plan.name} preparation: ${plan.preparation}%`}
            />
          </div>
        ))}
      </div>

      <div className="plan-note">
        <Lightbulb size={14} aria-hidden="true" />
        <span>Less-prepared subjects and closer exam dates receive more of your study time.</span>
      </div>
    </aside>
  );
}