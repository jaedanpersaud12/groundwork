import type { ReactNode } from "react";

export type ExampleEntry = {
  title: string;
  description?: string;
  /** Rendered as a component, so examples can hold their own state. */
  render: () => ReactNode;
  /** Let wide examples use the full panel instead of centring. */
  wide?: boolean;
};

export type ExampleSet = Record<string, ExampleEntry[]>;
