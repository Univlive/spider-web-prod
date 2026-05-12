import { motion } from "framer-motion";
import { UserPlus, ClipboardList, Palette, Rocket, Clock, Zap, CheckCircle2 } from "lucide-react";
import { ButtonWithIcon } from "@shared/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Sign Up",
    subtitle: "Create your account instantly",
    description: "Register on Preparekaro.in and access your dashboard within seconds.",
    visual: "signup",
  },
  {
    icon: ClipboardList,
    number: "02",
    title: "Complete Basic Details",
    subtitle: "Takes less than 2 minutes",
    description: "Fill a short form to set up your coaching institute profile.",
    visual: "form",
  },
  {
    icon: Palette,
    number: "03",
    title: "Choose Your Theme",
    subtitle: "Match your institute's brand",
    description: "Select a theme that reflects your coaching center's identity.",
    visual: "theme",
  },
  {
    icon: Rocket,
    number: "04",
    title: "Go Live",
    subtitle: "Start testing immediately",
    description: "Your branded test platform is ready to use.",
    visual: "live",
  },
];

// Visual components for each step card
const StepVisual = ({ type }: { type: string }) => {
  switch (type) {
    case "signup":
      return (
        <div className="mt-4 rounded-2xl bg-muted/50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Welcome to</div>
              <div className="text-sm font-semibold text-foreground">Preparekaro.in</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex h-8 items-center rounded-lg border border-border bg-background px-3">
              <span className="text-xs text-muted-foreground">Enter your email...</span>
            </div>
            <div className="flex h-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-medium text-primary-foreground">Get Started</span>
            </div>
          </div>
        </div>
      );
    case "form":
      return (
        <div className="mt-4 rounded-2xl bg-muted/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-accent">~2 min</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-foreground">Institute Name</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-foreground">Contact Details</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">Location</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
        </div>
      );
    case "theme":
      return (
        <div className="mt-4 rounded-2xl bg-muted/50 p-4">
          <div className="mb-2 text-xs text-muted-foreground">Select Theme</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square rounded-lg bg-gradient-to-br from-primary to-accent ring-2 ring-primary ring-offset-2 ring-offset-muted/50" />
            <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" />
            <div className="aspect-square rounded-lg bg-gradient-to-br from-orange-500 to-red-500" />
            <div className="aspect-square rounded-lg bg-gradient-to-br from-green-500 to-emerald-500" />
            <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
            <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-700 to-gray-900" />
          </div>
        </div>
      );
    case "live":
      return (
        <div className="mt-4 rounded-2xl bg-muted/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-600">Live</span>
            </div>
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-1 text-xs text-muted-foreground">Your Platform</div>
            <div className="text-sm font-semibold text-foreground">yourcoaching.preparekaro.in</div>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex h-6 flex-1 items-center justify-center rounded bg-primary/10">
              <span className="text-[10px] font-medium text-primary">Share Link</span>
            </div>
            <div className="flex h-6 flex-1 items-center justify-center rounded bg-accent/10">
              <span className="text-[10px] font-medium text-accent">Dashboard</span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export function StepsSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-background to-muted/30">
      <div className="container-main">
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            How It Works
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Get Started in{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Launch your branded test platform in minutes, not weeks
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="hover:shadow-elevated group relative rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Step number */}
              <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white shadow-lg">
                {step.number}
              </div>

              {/* Title & Description */}
              <h3 className="mb-1 text-xl font-bold text-foreground">{step.title}</h3>
              <p className="mb-2 text-sm font-medium text-primary">{step.subtitle}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

              {/* Visual Element */}
              <StepVisual type={step.visual} />

              {/* Connection arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 transform lg:flex">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/signup">
            <ButtonWithIcon variant="hero" size="lg" className="group">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ButtonWithIcon>
          </Link>
          <a href="https://calendly.com/info-univlive" target="_blank" rel="noopener noreferrer">
            <ButtonWithIcon variant="heroOutline" size="lg">
              Book a Demo
            </ButtonWithIcon>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
