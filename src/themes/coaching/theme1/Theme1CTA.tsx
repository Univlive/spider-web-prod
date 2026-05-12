import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@shared/ui/button";
import { useTenant } from "@app/providers/TenantProvider";

export default function Theme1CTA() {
  const { tenant, tenantSlug } = useTenant();

  if (!tenant) return null;

  const stats: { value: string; label: string }[] = tenant.websiteConfig?.stats || [];
  const phone = tenant.contact?.phone || "";

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-accent p-8 text-white md:p-12"
        >
          {/* Background Decorations */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Crack CUET 2025?</h2>
              <p className="mb-6 text-lg text-white/80">
                Join {stats[0]?.value || "50,000+"} students who are already preparing with{" "}
                {tenant.coachingName}. Start your journey to your dream college today!
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" className="rounded-full" asChild>
                  <Link to={`/courses`}>
                    Browse Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                  asChild
                >
                  <a href={`tel:${phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </a>
                </Button>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {stats.slice(0, 4).map((stat, i) => (
                  <div key={i} className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                    <div className="mb-1 text-3xl font-bold">{stat.value}</div>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
