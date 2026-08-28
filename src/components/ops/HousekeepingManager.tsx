"use client";

import { useMemo, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { HousekeepingAssignModal } from "@/components/ops/HousekeepingAssignModal";
import { HousekeepingStaffModal } from "@/components/ops/HousekeepingStaffModal";
import {
  housekeepingStaff as seedStaff,
  type HousekeepingStaffMember,
} from "@/lib/housekeeping-data";
import { housekeepingTasks as seedTasks, type HousekeepingTask } from "@/lib/ops-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  Queued: "bg-accent-soft text-[#8a6a2f]",
  "In progress": "bg-[#e7f0f5] text-info",
  Done: "bg-[#e8f3ec] text-success",
};

const priorityStyles = {
  High: "bg-[#f8e9e6] text-danger",
  Medium: "bg-accent-soft text-[#8a6a2f]",
  Low: "bg-surface-muted text-muted",
};

const staffStatusStyles = {
  "On duty": "bg-[#e8f3ec] text-success",
  "Off duty": "bg-surface-muted text-muted",
};

export function HousekeepingManager() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>(seedTasks);
  const [staff, setStaff] = useState<HousekeepingStaffMember[]>(seedStaff);
  const [filter, setFilter] = useState<"All" | "Queued" | "In progress" | "Done">(
    "All",
  );
  const [assignTask, setAssignTask] = useState<HousekeepingTask | null>(null);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const { showToast, toast } = useFloatingToast();

  const filtered = useMemo(
    () =>
      tasks.filter((task) => (filter === "All" ? true : task.status === filter)),
    [filter, tasks],
  );

  function assignStaff(taskId: string, staffName: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignee: staffName,
              status: task.status === "Queued" ? "In progress" : task.status,
            }
          : task,
      ),
    );
    showToast(`${staffName} assigned to task.`);
  }

  function markDone(taskId: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "Done" as const } : task,
      ),
    );
    showToast("Task marked as done.");
  }

  function addStaffMember(member: HousekeepingStaffMember) {
    setStaff((prev) => [...prev, member]);
    showToast(`${member.name} added to housekeeping team.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping"
        description="Cleaning queues, room readiness, and staff assignments."
        action={
          <PermissionGate action="housekeeping.assign">
            <button
              type="button"
              onClick={() => setStaffModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              Add member
            </button>
          </PermissionGate>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatPill label="Total tasks" value={tasks.length} />
        <StatPill
          label="Queued"
          value={tasks.filter((t) => t.status === "Queued").length}
          tone="warning"
        />
        <StatPill
          label="In progress"
          value={tasks.filter((t) => t.status === "In progress").length}
          tone="info"
        />
        <StatPill
          label="Done"
          value={tasks.filter((t) => t.status === "Done").length}
          tone="success"
        />
      </div>

      <SectionCard
        title="Housekeeping team"
        description={`${staff.length} staff members · ${staff.filter((member) => member.status === "On duty").length} on duty`}
      >
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-border-subtle bg-surface-muted/30 px-4 py-3"
            >
              <p className="font-medium text-foreground">{member.name}</p>
              <p className="mt-1 text-xs text-muted">{member.email}</p>
              <Badge className={`mt-2 ${staffStatusStyles[member.status]}`}>
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {(["All", "Queued", "In progress", "Done"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              filter === item
                ? "bg-brand text-white"
                : "border border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <SectionCard title="Cleaning board" description={`${filtered.length} tasks`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Assignee</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{task.room}</div>
                    <div className="text-xs text-muted">{task.id}</div>
                  </td>
                  <td className="px-5 py-3.5">{task.type}</td>
                  <td className="px-5 py-3.5">{task.assignee}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={priorityStyles[task.priority]}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{task.due}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyles[task.status]}>{task.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <PermissionGate action="housekeeping.assign">
                        <button
                          type="button"
                          onClick={() => setAssignTask(task)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-muted"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Assign
                        </button>
                      </PermissionGate>
                      <PermissionGate action="housekeeping.update">
                        {task.status !== "Done" ? (
                          <button
                            type="button"
                            onClick={() => markDone(task.id)}
                            className="rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-hover"
                          >
                            Mark done
                          </button>
                        ) : null}
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} label="No housekeeping tasks." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <HousekeepingAssignModal
        open={assignTask !== null}
        task={assignTask}
        staff={staff}
        onClose={() => setAssignTask(null)}
        onAssign={assignStaff}
        onAddMember={() => setStaffModalOpen(true)}
      />

      <HousekeepingStaffModal
        open={staffModalOpen}
        existingStaff={staff}
        onClose={() => setStaffModalOpen(false)}
        onSave={addStaffMember}
      />

      {toast}
    </div>
  );
}
