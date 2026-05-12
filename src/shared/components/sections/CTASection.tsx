import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ButtonWithIcon } from "@shared/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export const CTASection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="section-padding section-1">
      <div className="container-main">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-8 text-center lg:p-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-10 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl" />
            <div
              className="absolute bottom-10 right-10 h-60 w-60 animate-pulse rounded-full bg-white/10 blur-3xl"
              style={{ animationDelay: "1s" }}
            />
            <div className="absolute left-1/4 top-1/2 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

            {/* Floating icons */}
            <motion.div
              className="absolute right-20 top-8"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-8 w-8 text-white/30" />
            </motion.div>
            <motion.div
              className="absolute bottom-12 left-16"
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="h-10 w-10 text-white/20" />
            </motion.div>
            <motion.div
              className="absolute right-1/4 top-1/3"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-white/20" />
            </motion.div>
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">No Payment Required</span>
            </motion.div>

            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
              1 Free Computer Based Test per Subject
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90">
              Experience the real CUET CBT environment before you commit. Start your free trial
              today!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <ButtonWithIcon
                  variant="heroOutline"
                  size="xl"
                  className="group border-white bg-white text-primary shadow-lg hover:bg-white/90"
                >
                  Get Started For Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </ButtonWithIcon>
              </Link>
              <a
                href="https://calendly.com/info-univlive"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ButtonWithIcon
                  variant="heroOutline"
                  size="xl"
                  className="border-white/50 text-white backdrop-blur-sm hover:bg-white/10"
                >
                  Book a Demo
                </ButtonWithIcon>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";
