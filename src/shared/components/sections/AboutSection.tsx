import { motion } from "framer-motion";
import { Target, Heart, Lightbulb, Users, ArrowRight } from "lucide-react";
import { ButtonWithIcon } from "@shared/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Target,
    title: "Real CBT exam simulation",
    gradient: "from-blue-500/20 to-primary/20",
    iconColor: "text-blue-600",
  },
  {
    icon: Lightbulb,
    title: "High-quality test content curated by expert academic teams",
    gradient: "from-primary/20 to-accent/20",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Actionable analytics for teachers and students",
    gradient: "from-accent/20 to-purple-500/20",
    iconColor: "text-accent",
  },
  {
    icon: Heart,
    title: "Pay-per-student pricing with zero upfront cost",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-600",
  },
];

export function AboutSection() {
  return (
    <section className="section-padding section-4" id="about">
      <div className="container-main">
        {/* Header */}
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            About Us
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Preparekaro.in
            </span>
          </h2>
          <p className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent">
            Tayari Exam Jaisi.
          </p>
          <p className="text-lg text-muted-foreground">
            Preparekaro.in is a technology platform built to help coaching centers deliver{" "}
            <strong className="text-foreground">real CUET CBT exam preparation</strong>—exactly the
            way the exam is conducted.
          </p>
        </motion.div>

        {/* Problem Card */}
        <motion.div
          className="mx-auto mb-16 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-card lg:p-12">
            {/* Decorative element */}
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />

            <p className="relative z-10 mb-6 text-lg leading-relaxed text-muted-foreground">
              We exist to solve one simple but critical problem: most mock tests are still conducted
              on <strong className="text-foreground">OMR sheets</strong>, while the actual CUET exam
              is <strong className="text-foreground">computer-based (CBT)</strong>. This gap often
              leads to poor time management, confusion, and unnecessary panic on exam day.
            </p>
            <p className="relative z-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-semibold text-transparent">
              Preparekaro.in bridges this gap by enabling coaching centers to offer exam-realistic
              CBT practice to their students.
            </p>
          </div>
        </motion.div>

        {/* Why Preparekaro.in */}
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="mb-4 text-2xl font-bold lg:text-3xl">Why Preparekaro.in</h3>
          <p className="text-lg text-muted-foreground">
            We believe preparation should feel exactly like the real exam.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              className="hover-lift group rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.gradient} mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
              >
                <item.icon className={`h-7 w-7 ${item.iconColor}`} />
              </div>
              <p className="text-sm font-medium">{item.title}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mb-12 flex flex-wrap justify-center gap-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {["No installations.", "No fixed fees.", "No technical barriers."].map((text, i) => (
            <span key={text} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent" />
              {text}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/about">
            <ButtonWithIcon variant="heroOutline" size="lg" className="group">
              Learn More About Us
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ButtonWithIcon>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
