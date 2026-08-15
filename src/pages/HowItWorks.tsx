import { motion } from "framer-motion";
import LandingLayout from "@widgets/layout/LandingLayout";
import SEO from "@shared/components/SEO";
import { FileText, ScanLine, Brain, Eye, Send, ArrowRight } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; description: string; duration: string };

const steps: Step[] = [
  {
    icon: FileText,
    title: "Upload Question Paper & Answer Key",
    description:
      "Upload the question paper and marking scheme, or let AI extract the questions straight from photos of the paper.",
    duration: "5 min",
  },
  {
    icon: ScanLine,
    title: "Scan & Upload Answer Sheets",
    description:
      "Snap photos or upload PDFs of handwritten answer sheets in bulk — page by page, straight from your phone.",
    duration: "Per batch",
  },
  {
    icon: Brain,
    title: "AI Grades Every Answer",
    description:
      "AI evaluates each response against your rubric — objective and subjective — with a step-by-step marks breakdown.",
    duration: "Automatic",
  },
  {
    icon: Eye,
    title: "Teachers Review & Moderate",
    description:
      "Spot-check the AI's grading, override any question, add feedback, and approve each sheet before it's final.",
    duration: "~10 days",
  },
  {
    icon: Send,
    title: "Results Publish Instantly",
    description:
      "Once approved, students see their graded, annotated answer sheet with step-by-step feedback in their portal.",
    duration: "Instant",
  },
];

export default function HowItWorks() {
  return (
    <LandingLayout>
      <SEO
        title="How It Works — AI-Powered Exam Evaluation | PrepareKaro"
        description="See how PrepareKaro grades exams: upload the question paper, scan handwritten answer sheets, let AI grade every answer, moderate, and publish results — all in about 10 days."
        canonical="https://preparekaro.in/how-it-works"
      />
      <div className="pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-brand-start/10 px-4 py-1.5 text-sm font-medium text-brand-blue">
              How It Works
            </span>
            <h1 className="mb-6 font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              From Scan to <span className="gradient-text">Graded Result</span>
              <br />
              in About 10 Days
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              A simple, guided process to digitize and AI-grade your institute's answer sheets —
              objective and subjective alike.
            </p>
          </motion.div>
        </section>

        {/* Timeline */}
        <section className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pb-12 pl-12 last:pb-0 lg:pl-16"
              >
                {index < steps.length - 1 && (
                  <div className="absolute bottom-0 left-[18px] top-12 w-0.5 bg-gradient-to-b from-brand-start to-brand-end lg:left-[22px]" />
                )}
                <div className="gradient-bg absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl shadow-glow lg:h-12 lg:w-12">
                  <step.icon className="h-5 w-5 text-white lg:h-6 lg:w-6" />
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card transition-all hover:shadow-card-hover lg:p-8">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">{step.title}</h3>
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mb-6 font-display text-3xl font-bold">Ready to Get Started?</h2>
            <Button variant="hero" size="xl" asChild className="group">
              <Link to="/#interest-widget">
                Book a Demo
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </div>
    </LandingLayout>
  );
}
