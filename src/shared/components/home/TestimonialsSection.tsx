import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@shared/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    role: "Founder, Excel Academy",
    location: "Delhi",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content:
      "PREPAREKARO.IN transformed our coaching institute completely. Within 6 hours, we had a professional website that looks better than competitors who spent lakhs on development. Our enrollments increased by 40% in the first month!",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Director, IIT Path Coaching",
    location: "Kota",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content:
      "The CBT platform is exactly what our JEE aspirants needed. The AI-powered analysis helps identify weak areas instantly. Our students' performance improved significantly after using this platform.",
    rating: 5,
  },
  {
    id: 3,
    name: "Ananya Patel",
    role: "CUET Aspirant",
    location: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content:
      "As a student, the test interface is so intuitive. The detailed analytics after each test helped me understand exactly where I need to improve. Scored 98 percentile in CUET thanks to the practice here!",
    rating: 5,
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Owner, Career Point Classes",
    location: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content:
      "We were spending hours managing student data and tests manually. PREPAREKARO.IN automated everything. The dashboard gives us real-time insights, and the support team is incredibly responsive.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-pastel-peach px-5 py-2 text-sm font-medium text-foreground dark:bg-secondary">
            Testimonials
          </span>
          <h2 className="mb-6 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Loved by <span className="gradient-text">500+</span> Coaching Institutes
          </h2>
          <p className="text-lg text-muted-foreground">
            See what educators and students are saying about PREPAREKARO.IN
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative">
            {/* Main Card */}
            <div className="rounded-3xl border border-border/20 bg-pastel-mint p-8 dark:border-border/50 dark:bg-card lg:p-12">
              {/* Quote Icon */}
              <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-card dark:bg-secondary lg:right-12 lg:top-12">
                <Quote className="h-6 w-6 text-primary" />
              </div>

              {/* Rating */}
              <div className="mb-6 flex items-center gap-1">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 text-xl leading-relaxed text-foreground lg:text-2xl"
              >
                "{testimonials[activeIndex].content}"
              </motion.p>

              {/* Author */}
              <motion.div
                key={`author-${activeIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center gap-4"
              >
                <img
                  src={testimonials[activeIndex].image}
                  alt={testimonials[activeIndex].name}
                  className="h-14 w-14 rounded-full border-4 border-card object-cover shadow-sm"
                />
                <div>
                  <p className="font-display font-bold text-foreground">
                    {testimonials[activeIndex].name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "gradient-bg w-8"
                        : "w-2.5 bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
