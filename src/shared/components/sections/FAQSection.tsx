import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@shared/ui/accordion";

const faqs = [
  {
    question: "What is LearnFlow?",
    answer:
      "LearnFlow is an AI-powered Learning Management System (LMS) that offers interactive courses, video lessons, quizzes, and certifications to help students and professionals learn anytime, anywhere.",
  },
  {
    question: "Who can use LearnFlow?",
    answer:
      "LearnFlow is designed for everyone — students, professionals, educators, and businesses. Whether you want to learn new skills, upskill your team, or create courses, LearnFlow has you covered.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period, and you won't be charged again.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. Enterprise customers can also pay via invoice.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! We offer a 14-day free trial on all paid plans. You can explore all features without any commitment. No credit card required to start.",
  },
];

export function FAQSection() {
  return (
    <section className="section-padding">
      <div className="container-main">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Everything You Need to Know About LearnFlow
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? Visit our comprehensive FAQs for detailed info on LearnFlow's competitive
            pricing, diverse courses, and dedicated support!
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl border border-border bg-card px-6 shadow-soft transition-shadow data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="py-5 text-left font-semibold hover:no-underline [&[data-state=open]]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
