import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, BarChart3, Users, FileCheck, Brain, Shield, Zap, Smartphone } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Branded Subdomain",
    description:
      "Get your own yourcoaching.preparekaro.in subdomain with custom branding and design.",
    bgColor: "bg-pastel-mint",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track student performance, test results, and revenue with detailed insights.",
    bgColor: "bg-pastel-yellow",
  },
  {
    icon: FileCheck,
    title: "Test Management",
    description: "Import or create tests easily. Support for MCQ, subjective, and mixed formats.",
    bgColor: "bg-pastel-lavender",
  },
  {
    icon: Users,
    title: "Student Portal",
    description: "Dedicated portal for students to access courses, take tests, and track progress.",
    bgColor: "bg-pastel-peach",
  },
  {
    icon: Brain,
    title: "AI-Powered Review",
    description: "Intelligent answer analysis and personalized feedback for every student.",
    bgColor: "bg-pastel-pink",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security with encrypted data and access controls.",
    bgColor: "bg-pastel-mint",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "AI generates your complete website in just 6 hours. No coding required.",
    bgColor: "bg-pastel-yellow",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Responsive design that works perfectly on all devices and screen sizes.",
    bgColor: "bg-pastel-lavender",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-pastel-cream py-20 dark:bg-surface lg:py-32" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-pastel-lavender px-5 py-2 text-sm font-medium text-foreground dark:bg-secondary">
            Features
          </span>
          <h2 className="mb-6 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Everything You Need to <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive platform designed for modern coaching institutes and ambitious students.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <div
                className={`${feature.bgColor} h-full rounded-3xl border border-border/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:border-border/50 dark:bg-card`}
              >
                {/* Icon Container */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-soft transition-transform duration-300 group-hover:scale-105 dark:bg-secondary">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mb-2 font-display text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
