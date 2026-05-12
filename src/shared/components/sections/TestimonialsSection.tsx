import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ankit Jain",
    role: "CUET Aspirant",
    avatar: "AJ",
    rating: 5,
    quote:
      "I gave multiple CUET mocks through Preparekaro.in. The analytics clearly showed where I was losing marks, especially in time management.",
  },
  {
    name: "Amit Sharma",
    role: "SEA Classes, Indore",
    avatar: "AS",
    rating: 5,
    quote:
      "Preparekaro.in is very teacher-friendly. At SEA Classes, Indore, we use it mainly for mock tests and student analysis, and it saves us a lot of manual work.",
  },
  {
    name: "Rajesh Verma",
    role: "Apex Commerce Academy, Jaipur",
    avatar: "RV",
    rating: 5,
    quote:
      "We started using Preparekaro.in for our CUET mock tests at Apex Commerce Academy, Jaipur, and the transition was smooth. Our students adapted quickly, and the test experience feels very close to the real exam.",
  },
  {
    name: "Neha Sharma",
    role: "CUET Faculty, Bright Future Classes",
    avatar: "NS",
    rating: 5,
    quote:
      "The performance reports on Preparekaro.in helped us identify weak areas much faster. At Bright Future Classes, Shivpuri, this has improved how we plan our revision sessions.",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="section-padding section-4 overflow-hidden">
      <div className="container-main">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            What Coaching Centers Say About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Preparekaro.in
            </span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl border-2 border-border bg-card p-8 shadow-card lg:p-12"
            >
              {/* Large quote icon */}
              <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/10" />

              {/* Header */}
              <div className="mb-6 flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
                  <span className="text-xl font-bold text-primary-foreground">
                    {testimonials[currentIndex].avatar}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-bold">{testimonials[currentIndex].name}</div>
                  <div className="text-muted-foreground">{testimonials[currentIndex].role}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6 flex gap-1">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg leading-relaxed text-foreground lg:text-xl">
                "{testimonials[currentIndex].quote}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-gradient-to-r from-primary to-accent"
                    : "bg-muted hover:bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prevSlide}
              className="hover:shadow-elevated flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="hover:shadow-elevated flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
