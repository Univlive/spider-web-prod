import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Toggle this to show/hide the announcement bar
export const SHOW_ANNOUNCEMENT = false;

// Announcement content - easy to update
const ANNOUNCEMENT = {
  text: "🎉 Launch Offer: Get 30% off on all plans",
  ctaText: "Claim Now",
  ctaLink: "/pricing",
};

export function AnnouncementBar() {
  if (!SHOW_ANNOUNCEMENT) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 right-0 top-0 z-[60] animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
    >
      <div className="container-main">
        <div className="flex items-center justify-center gap-3 py-2 text-sm">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Sparkles className="hidden h-3.5 w-3.5 sm:block" />
            <span className="font-medium">{ANNOUNCEMENT.text}</span>
          </div>
          <Link
            to={ANNOUNCEMENT.ctaLink}
            className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:gap-2 hover:bg-primary-foreground/30"
          >
            {ANNOUNCEMENT.ctaText}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
