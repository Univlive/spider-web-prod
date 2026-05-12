import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Link } from "react-router-dom";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-20 lg:py-32" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem]"
        >
          {/* Background Gradient */}
          <div className="gradient-bg absolute inset-0" />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Decorative Elements */}
          <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute left-1/4 top-1/2 h-16 w-16 rounded-full bg-white/5" />

          {/* Content */}
          <div className="relative px-8 py-16 text-center lg:px-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Start your 14-day free trial</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mb-6 max-w-3xl font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            >
              Ready to Transform Your Coaching Institute?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-white/80"
            >
              Join 500+ coaching institutes already using PREPAREKARO.IN. Get your AI-powered
              website in just 6 hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                size="xl"
                className="rounded-full bg-white px-8 text-foreground shadow-xl transition-all hover:scale-105 hover:bg-white/90"
                asChild
              >
                <Link to="/signup" className="group">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <a
                href="https://calendly.com/info-univlive"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="xl"
                  variant="ghost"
                  className="rounded-full text-white hover:bg-white/10"
                  asChild
                >
                  Book a Demo
                </Button>
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60"
            >
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
