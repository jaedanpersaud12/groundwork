"use client";

import * as React from "react";

import type { ExampleSet } from "./types";
import { PlusIcon } from "lucide-react";

import { Button } from "@/registry/groundwork/ui/button";
import { Calendar } from "@/registry/groundwork/ui/calendar";
import { Checkbox } from "@/registry/groundwork/ui/checkbox";
import { Input } from "@/registry/groundwork/ui/input";
import { Label } from "@/registry/groundwork/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/groundwork/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/groundwork/ui/table";
import { Textarea } from "@/registry/groundwork/ui/textarea";

function CalendarExample() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 13));
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 8, 1)}
      className="rounded-lg border border-border"
    />
  );
}

const SAMPLE_ROWS = [
  { company: "Linear", role: "Frontend Engineer", salary: "$160k" },
  { company: "Vercel", role: "Design Engineer", salary: "$175k" },
  { company: "Raycast", role: "Product Engineer", salary: "$150k" },
];

const nodes: Record<string, React.ReactNode> = {
  button: (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Save profile</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Learn more</Button>
      <Button size="sm">
        <PlusIcon data-icon="inline-start" />
        Add role
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  input: (
    <div className="grid w-full max-w-sm gap-3">
      <Input placeholder="Frontend Engineer" />
      <Input aria-invalid defaultValue="not-a-url" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
  textarea: <Textarea className="max-w-sm" placeholder="A short summary of your experience" />,
  label: (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="example-title">Job title</Label>
      <Input id="example-title" placeholder="Frontend Engineer" />
    </div>
  ),
  checkbox: (
    <Label className="text-sm font-normal">
      <Checkbox defaultChecked />
      I currently work here
    </Label>
  ),
  popover: (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Match score</PopoverTitle>
          <PopoverDescription>How closely this role fits your saved profile.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  table: (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Salary est.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SAMPLE_ROWS.map((row) => (
            <TableRow key={row.company}>
              <TableCell className="font-medium">{row.company}</TableCell>
              <TableCell className="text-muted-foreground">{row.role}</TableCell>
              <TableCell className="text-right tabular-nums">{row.salary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  calendar: <CalendarExample />,
};

export const primitiveExamples: ExampleSet = Object.fromEntries(
  Object.entries(nodes).map(([name, node]) => [name, [{ title: "Example", render: () => node }]]),
);
