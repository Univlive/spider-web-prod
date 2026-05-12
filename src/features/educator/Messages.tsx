import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, PhoneCall, MessageCircle, LifeBuoy, ArrowRight, Clock } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@shared/lib/firebase";

export default function Messages() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Fetch educator details from Auth to include in the WhatsApp/Email message
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      setEmail(u?.email ?? null);
    });
    return () => unsub();
  }, []);

  const handleWhatsApp = () => {
    const educatorDetails = `Educator ID: ${uid || "Unknown"} ${email ? `\nEmail: ${email}` : ""}`;
    const text = encodeURIComponent(
      `Hello Preparekaro.in Support,\n\nI am an educator on your platform.\n${educatorDetails}\n\nI need assistance with an issue. Please get back in touch with me for a resolution.\n\nThank you.`
    );
    // Assuming Indian country code (+91) for the provided 10-digit number
    window.open(`https://wa.me/919630896410?text=${text}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header Section */}
      <motion.div
        className="flex flex-col items-center space-y-4 pb-4 pt-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <LifeBuoy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          How can we{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            help you?
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Our dedicated support team is here to assist you. Choose your preferred method of
          communication below and we'll get back to you as soon as possible.
        </p>
      </motion.div>

      {/* Contact Options Grid */}
      <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
        {/* WhatsApp Card (Primary Action) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="relative h-full overflow-hidden border-2 border-primary/50 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#25D366] to-[#128C7E]" />
            <CardContent className="flex h-full flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold">WhatsApp Support</h3>
              <p className="mb-6 flex-grow text-sm text-muted-foreground">
                Get the fastest response from our team directly on WhatsApp. Best for quick queries
                and real-time resolution.
              </p>
              <Button
                onClick={handleWhatsApp}
                className="group w-full rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E]"
                size="lg"
              >
                Chat on WhatsApp
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full border border-border shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex h-full flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <PhoneCall className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Call Us</h3>
              <p className="mb-6 flex-grow text-sm text-muted-foreground">
                Prefer speaking to someone directly? Give us a call. We are available during
                standard business hours.
              </p>
              <div className="mt-auto w-full rounded-xl border border-border bg-muted/50 p-4">
                <a
                  href="tel:+919630896410"
                  className="block text-lg font-bold text-foreground transition-colors hover:text-primary"
                >
                  +91 96308 96410
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="h-full border border-border shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex h-full flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Email Support</h3>
              <p className="mb-6 flex-grow text-sm text-muted-foreground">
                For detailed inquiries, technical issues, or attachment-heavy requests, drop us an
                email.
              </p>
              <div className="mt-auto w-full rounded-xl border border-border bg-muted/50 p-4">
                <a
                  href="mailto:univ.live@gmail.com"
                  className="block break-all text-sm font-bold text-foreground transition-colors hover:text-accent"
                >
                  univ.live@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Support Info Footer */}
      <motion.div
        className="mt-12 flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-muted/30 p-6 text-center sm:flex-row sm:text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Standard Response Times</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            WhatsApp messages are typically answered within 1-2 hours. Emails and general inquiries
            may take up to 24 hours.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
