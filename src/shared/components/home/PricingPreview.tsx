import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small coaching centers",
    price: "₹2,999",
    period: "/month",
    features: [
      "Branded subdomain",
      "Up to 100 students",
      "10 test imports/month",
      "Basic analytics",
      "Email support",
    ],
    highlighted: false,
    bgColor: "bg-card",
  },
  {
    name: "Growth",
    description: "Best for growing institutes",
    price: "₹7,999",
    period: "/month",
    features: [
      "Everything in Starter",
      "Up to 500 students",
      "Unlimited test imports",
      "AI-powered analytics",
      "Custom domain support",
      "Priority support",
      "Student app access",
    ],
    highlighted: true,
    bgColor: "bg-pastel-mint",
  },
  {
    name: "Enterprise",
    description: "For large institutions",
    price: "Custom",
    period: "",
    features: [
      "Everything in Growth",
      "Unlimited students",
      "White-label solution",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    highlighted: false,
    bgColor: "bg-card",
  },
];

export default function PricingPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-pastel-lavender py-20 dark:bg-surface lg:py-32" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-card px-5 py-2 text-sm font-medium text-foreground">
            Our Pricing
          </span>
          <h2 className="mb-6 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            We Prepare A Very Reasonable <span className="gradient-text">Pricing Pack</span> For You
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your coaching institute. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto mb-12 grid max-w-6xl gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 ${plan.bgColor} border border-border/20 dark:border-border/50 dark:bg-card ${
                plan.highlighted ? "shadow-card-hover ring-2 ring-primary/20" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="gradient-bg absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Info */}
              <div className="mb-6">
                <h3 className="mb-2 font-display text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.highlighted ? "gradient" : "outline"}
                className="w-full rounded-full"
                asChild
              >
                <Link to="/pricing">{plan.price === "Custom" ? "Contact Sales" : "Purchase"}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button variant="link" asChild className="group">
            <Link to="/pricing">
              View full pricing comparison
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
