import LandingLayout from "@widgets/layout/LandingLayout";
import SEO from "@shared/components/SEO";
import { motion } from "framer-motion";
import { ScanLine, Brain, ListChecks, Eye, Clock, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: ScanLine,
    title: "Bulk Answer Sheet Scanning",
    description:
      "Snap photos or upload PDFs of handwritten answer sheets in bulk — page by page or all at once, no scanner required.",
  },
  {
    icon: Brain,
    title: "AI-Powered Grading",
    description:
      "AI evaluates every answer against your question paper and marking scheme — objective and subjective questions alike.",
  },
  {
    icon: ListChecks,
    title: "Step-by-Step Feedback",
    description:
      "Every graded answer gets a marks breakdown by step, so students see exactly where marks were gained or lost.",
  },
  {
    icon: Eye,
    title: "Teacher Moderation",
    description:
      "Review and override any AI-graded question before results go out — final say always stays with your faculty.",
  },
  {
    icon: Clock,
    title: "Rapid Turnaround",
    description:
      "Get graded, moderated results back to students in about 10 days instead of the usual weeks of manual checking.",
  },
  {
    icon: ShieldCheck,
    title: "Digitized & Secure",
    description:
      "Answer sheets are digitized and stored securely — no more lost papers, misplaced marks, or re-checking disputes.",
  },
];

const Features = () => {
  return (
    <LandingLayout>
      <SEO
        title="Features — AI-Powered Exam Evaluation | PrepareKaro"
        description="Explore PrepareKaro features: bulk answer sheet scanning, AI grading for objective & subjective answers, step-by-step feedback, teacher moderation, and rapid result turnaround."
        canonical="https://preparekaro.in/features"
      />
      <section className="section-padding section-1">
        <div className="container-main">
          <motion.div
            className="mx-auto mb-16 max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">Features</h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to digitize, AI-grade, and publish exam results faster.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="hover-lift rounded-3xl border border-border bg-card p-8 shadow-soft"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Features;
