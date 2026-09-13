/**
 * The site's one focus treatment. A 2px ring rather than the registry Button's 1px, because
 * most of what it lands on here is bare text with no border for a thinner ring to sit
 * against. Change it here and every link, tab stop and control on the site moves together.
 */
const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** An inline link in running copy: signal colour, underline on hover only. */
const TEXT_LINK = `rounded-sm text-primary hover:underline ${FOCUS_RING}`;

export { FOCUS_RING, TEXT_LINK };
