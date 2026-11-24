import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  Clock3,
  Sparkles,
  Target,
  TrendingUp,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlannerForm } from "@/components/studymate/PlannerForm";
import { StudyPlanList } from "@/components/studymate/StudyPlanList";
import { StudyTools } from "@/components/studymate/StudyTools";
import {
  createStudyPlan,
  SAMPLE_SUBJECTS,
  SAMPLE_WEEKLY_HOURS,
  type SubjectDraft,
  type StudyPlanItem,
} from "@/components/studymate/study-data";

const samplePlans = createStudyPlan(
  SAMPLE_WEEKLY_HOURS,
  SAMPLE_SUBJECTS,
  new Date("2026-11-21T00:00:00.000Z"),
);

const features = [
  {
    icon: Target,
    color: "",
    title: "Clear priorities",
    description: "Give extra attention to the subjects that need it most.",
  },
  {
    icon: TrendingUp,
    color: "mint",
    title: "Progress you can see",
    description: "Keep your preparation level in view as exams get closer.",
  },
  {
    icon: CalendarDays,
    color: "amber",
    title: "A week that fits",
    description: "Shape a realistic plan around the hours you have available.",
  },
];

export function StudyMateDashboard() {
  const [plans, setPlans] = useState<StudyPlanItem[]>(samplePlans);
  const [totalHours, setTotalHours] = useState(SAMPLE_WEEKLY_HOURS);
  const [isGenerated, setIsGenerated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem("padhlo-theme") === "dark");
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (themeLoaded) localStorage.setItem("padhlo-theme", darkMode ? "dark" : "light");
  }, [darkMode, themeLoaded]);

  function generatePlan(availableHours: number, subjects: SubjectDraft[]) {
    setPlans(createStudyPlan(availableHours, subjects));
    setTotalHours(availableHours);
    setIsGenerated(true);
  }

  return (
    <div className={`study-shell ${darkMode ? "dark" : ""}`}>
      <header className="study-header study-container">
        <a className="study-brand" href="#overview" aria-label="StudyMate AI home">
          <span className="study-brand-mark" aria-hidden="true">
            <BookOpenCheck size={19} />
          </span>
          <span className="study-brand-name">
            StudyMate<span className="study-brand-ai">AI</span>
          </span>
        </a>
        <nav className="study-nav" aria-label="Main navigation">
          <a href="#overview">Overview</a>
          <a href="#features">Features</a>
          <a href="#planner">Study planner</a>
          <a href="#study-tools">Study tools</a>
        </nav>
        <div className="header-actions">
          <Button type="button" variant="outline" className="theme-toggle" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? "Light mode" : "Dark mode"}
          </Button>
          <Button asChild className="header-cta">
            <a href="#planner">
              Open planner <ArrowRight size={14} />
            </a>
          </Button>
        </div>
      </header>

      <main>
        <section className="hero-section study-container" id="overview">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-kicker-mark" aria-hidden="true">
                <Sparkles size={13} />
              </span>
              A little more focus, every week
            </div>
            <h1 className="hero-title">
              Make your next exam your <span>best one.</span>
            </h1>
            <p className="hero-description">
              Bring your subjects, exam dates, and study hours together in one clear plan that feels
              possible to follow.
            </p>
            <div className="hero-actions">
              <Button asChild className="hero-cta">
                <a href="#planner">
                  Plan my week <ArrowRight size={15} />
                </a>
              </Button>
              <span className="hero-footnote">
                <Check size={14} aria-hidden="true" /> Your plan stays in this browser
              </span>
            </div>
          </div>

          <div className="week-preview" aria-label="Sample weekly study plan preview">
            <div className="preview-heading">
              <div>
                <h2>This week, in focus</h2>
                <p>A balanced start for your exam season</p>
              </div>
              <span className="preview-date">
                <CalendarDays size={13} aria-hidden="true" /> Your study week
              </span>
            </div>
            <div className="preview-focus">
              <span className="preview-focus-icon" aria-hidden="true">
                <Target size={19} />
              </span>
              <span className="preview-focus-copy">
                <strong>Start with your toughest topic</strong>
                <span>Small, steady sessions add up</span>
              </span>
              <span className="preview-focus-hours">12 hrs</span>
            </div>
            <div className="preview-list">
              {samplePlans.map((plan) => (
                <div key={plan.id}>
                  <div className="preview-subject-top">
                    <span>{plan.name}</span>
                    <span>{plan.preparation}% ready</span>
                  </div>
                  <div className="preview-track" aria-hidden="true">
                    <span style={{ width: `${plan.preparation}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="preview-bottom">
              <span className="preview-metric">
                <Clock3 size={15} aria-hidden="true" /> <span>12 study hours</span>
              </span>
              <span className="preview-metric">
                <BookOpenCheck size={15} aria-hidden="true" /> <span>3 subjects</span>
              </span>
            </div>
          </div>
        </section>

        <section className="feature-strip study-container" id="features" aria-label="StudyMate benefits">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-item" key={feature.title}>
                <span className={`feature-icon-wrap ${feature.color}`} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="planner-section" id="planner">
          <div className="study-container">
            <div className="planner-heading">
              <div>
                <span className="section-kicker">
                  <Sparkles size={13} aria-hidden="true" /> Make it yours
                </span>
                <h2>Your study planner</h2>
                <p>Tell us what is coming up. Your plan adjusts to your time and priorities.</p>
              </div>
            </div>

            <div className="planner-layout">
              <PlannerForm
                initialHours={SAMPLE_WEEKLY_HOURS}
                initialSubjects={SAMPLE_SUBJECTS}
                onGenerate={generatePlan}
              />
              <StudyPlanList plans={plans} totalHours={totalHours} isGenerated={isGenerated} />
            </div>
          </div>
        </section>

        <StudyTools subjects={plans} />
      </main>

      <footer className="study-footer">
        <div className="study-footer-inner study-container">
          <span className="study-footer-brand">
            <BookOpenCheck size={14} aria-hidden="true" /> StudyMate AI
          </span>
          <span>Made for better study days.</span>
        </div>
      </footer>
    </div>
  );
}