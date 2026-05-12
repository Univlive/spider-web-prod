import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Wand2, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Sign Up & Onboard",
    description:
      "Create your account in minutes. Fill in your coaching details, upload your logo, and choose your preferred theme.",
    bgColor: "bg-pastel-mint",
  },
  {
    step: "02",
    icon: Wand2,
    title: "AI Generates Your Site",
    description:
      "Our AI creates a fully branded website with your courses, content, and customized design in approximately 6 hours.",
    bgColor: "bg-pastel-yellow",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Go Live & Grow",
    description:
      "Your website is ready! Start enrolling students, manage tests, track performance, and scale your coaching business.",
    bgColor: "bg-pastel-lavender",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-20 lg:py-32" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block rounded-full bg-pastel-mint px-5 py-2 text-sm font-medium text-foreground dark:bg-secondary">
            How It Works
          </span>
          <h2 className="mb-6 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Three Steps to <span className="gradient-text">Transform</span> Your Coaching
          </h2>
          <p className="text-lg text-muted-foreground">
            Launch your professional coaching website with AI automation. No technical skills
            required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mb-16 grid gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div
                className={`${step.bgColor} h-full rounded-3xl p-8 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover dark:bg-secondary`}
              >
                {/* Step Number */}
                <div className="gradient-bg mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                  <span className="text-sm font-bold text-white">{step.step}</span>
                </div>

                {/* Icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-soft">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mb-3 font-display text-xl font-bold">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button variant="gradient" size="lg" asChild className="group rounded-full px-8">
            <Link to="/how-it-works">
              Learn More
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
