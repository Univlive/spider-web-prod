import { motion } from "framer-motion";
import {
  Cloud,
  Video,
  FileText,
  Calendar,
  MessageSquare,
  Shield,
  CreditCard,
  BarChart,
} from "lucide-react";

const integrations = [
  { icon: Cloud, name: "Cloud Storage" },
  { icon: Video, name: "Video Calls" },
  { icon: FileText, name: "Documents" },
  { icon: Calendar, name: "Calendar" },
  { icon: MessageSquare, name: "Messaging" },
  { icon: Shield, name: "Security" },
  { icon: CreditCard, name: "Payments" },
  { icon: BarChart, name: "Analytics" },
];

export function IntegrationsSection() {
  return (
    <section className="section-padding overflow-hidden">
      <div className="container-main">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Powerful Integrations for Seamless Learning
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect LearnFlow with your favorite tools and services for a unified experience.
          </p>
        </motion.div>

        {/* Integration Diagram */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* SVG Lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1200 200"
            preserveAspectRatio="xMidYMid meet"
          >
            {integrations.map((_, index) => {
              const startX = 600;
              const startY = 100;
              const endX = 75 + index * 150;
              const endY = index % 2 === 0 ? 30 : 170;

              return (
                <motion.line
                  key={index}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.5 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}
          </svg>

          {/* Center Logo */}
          <div className="relative z-10 mb-8 flex justify-center">
            <motion.div
              className="shadow-elevated flex h-20 w-20 items-center justify-center rounded-2xl bg-primary"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </motion.div>
          </div>

          {/* Integration Icons */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4 lg:gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card lg:h-16 lg:w-16">
                  <integration.icon className="h-6 w-6 text-muted-foreground lg:h-7 lg:w-7" />
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {integration.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
