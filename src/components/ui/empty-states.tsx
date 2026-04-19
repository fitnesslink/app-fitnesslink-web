"use client";

import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import {
  FoodLogEmptyArt,
  GoalsEmptyArt,
  HabitsEmptyArt,
  NotificationsEmptyArt,
  PhotosEmptyArt,
  ProgramsEmptyArt,
  ScheduleEmptyArt,
  WorkoutsEmptyArt,
} from "./illustrations/EmptyArt";

// Pre-configured empty states for each major list. Each accepts an optional
// action slot so the caller decides where to route (creation flow, browse,
// etc.) without forking the illustration.
interface Props {
  action?: ReactNode;
  className?: string;
}

const WRAPPER = "text-primary";

export function WorkoutsEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="No workouts yet"
      description="Browse the catalog or build one from scratch."
      icon={
        <div className={WRAPPER}>
          <WorkoutsEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function ProgramsEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="No programs yet"
      description="A program stacks workouts into a multi-week plan."
      icon={
        <div className={WRAPPER}>
          <ProgramsEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function FoodLogEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="Nothing logged yet"
      description="Log a meal to start tracking calories + macros."
      icon={
        <div className={WRAPPER}>
          <FoodLogEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function HabitsEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="No habits yet"
      description="Habits compound. Start with one — the smaller the better."
      icon={
        <div className={WRAPPER}>
          <HabitsEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function PhotosEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="No photos yet"
      description="Snap today's photo — future-you will thank you."
      icon={
        <div className={WRAPPER}>
          <PhotosEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function NotificationsEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="All caught up"
      description="New notifications will show up here."
      icon={
        <div className={WRAPPER}>
          <NotificationsEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function ScheduleEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="Nothing scheduled"
      description="Plan a workout and show up for it."
      icon={
        <div className={WRAPPER}>
          <ScheduleEmptyArt />
        </div>
      }
      action={action}
    />
  );
}

export function GoalsEmpty({ action, className }: Props) {
  return (
    <EmptyState
      className={className}
      title="No goals yet"
      description="Pick something to move toward. It's the compass for every other decision."
      icon={
        <div className={WRAPPER}>
          <GoalsEmptyArt />
        </div>
      }
      action={action}
    />
  );
}
