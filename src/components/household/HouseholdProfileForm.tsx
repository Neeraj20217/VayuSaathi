"use client";

import type { FormEvent } from "react";
import { Baby, Briefcase, Car, Compass, GraduationCap, Loader2, Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { commutes, members, priorities, type Profile } from "@/lib/contracts";
import { cn } from "@/lib/utils";

const MEMBER_META: Record<
  (typeof members)[number],
  { icon: typeof Baby; hint: string }
> = {
  Children: { icon: Baby, hint: "Play spaces and outdoor activity timing" },
  "Older adults": { icon: User, hint: "Shared sitting rooms and daily breaks" },
  "Working adults": { icon: Briefcase, hint: "Work breaks and regular travel" },
  Students: { icon: GraduationCap, hint: "School commute and outdoor breaks" },
};

const PRIORITY_HINTS: Record<Profile["priority"], string> = {
  "Flexible errands": "Shift timing or combine routine trips",
  "Outdoor activity": "Plan discretionary outdoor time carefully",
  "Indoor air": "Prioritize indoor particulate source control",
  "Lower-emission travel": "Favor shared, transit, or consolidated trips",
};

interface HouseholdProfileFormProps {
  profile: Profile;
  validationError: string;
  disabled: boolean;
  generating: boolean;
  canGenerate: boolean;
  onToggleMember: (member: (typeof members)[number]) => void;
  onCommuteChange: (commute: Profile["commute"]) => void;
  onPriorityChange: (priority: Profile["priority"]) => void;
  onSubmit: (event: FormEvent) => void;
}

export function HouseholdProfileForm({
  profile,
  validationError,
  disabled,
  generating,
  canGenerate,
  onToggleMember,
  onCommuteChange,
  onPriorityChange,
  onSubmit,
}: HouseholdProfileFormProps) {
  const showMissingMembersError = Boolean(validationError && profile.members.length === 0);

  return (
    <GlassCard>
      <CardHeader className="border-b border-border/80 px-5 py-4">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Your household
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Tailor daily routine, indoor air, and travel actions to who is at home.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <FieldGroup className="gap-5">
            {/* Household member checkboxes */}
            <FieldSet data-invalid={showMissingMembersError || undefined}>
              <FieldLegend variant="label" className="mb-1 text-sm font-semibold text-foreground">
                Household members
              </FieldLegend>
              <FieldDescription className="text-xs text-muted-foreground">
                Select at least one group that applies to your home.
              </FieldDescription>

              <div
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                data-slot="checkbox-group"
                aria-describedby={showMissingMembersError ? "household-members-error" : undefined}
              >
                {members.map((member) => {
                  const id = `member-${member.toLowerCase().replace(/\s+/g, "-")}`;
                  const checked = profile.members.includes(member);
                  const { icon: Icon, hint } = MEMBER_META[member];

                  return (
                    <Field
                      key={member}
                      orientation="horizontal"
                      data-invalid={showMissingMembersError || undefined}
                      className={cn(
                        "relative min-h-12 items-start gap-2.5 rounded-lg border p-3 transition-colors",
                        checked
                          ? "border-primary bg-station-surface/85 text-foreground"
                          : "border-border/85 bg-(--glass-subcard-bg) text-foreground hover:bg-muted/65"
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => onToggleMember(member)}
                        aria-invalid={showMissingMembersError || undefined}
                        className="relative z-10 mt-0.5"
                      />
                      <FieldContent className="gap-0.5">
                        <FieldLabel
                          htmlFor={id}
                          className="cursor-pointer gap-1.5 text-sm font-medium leading-tight after:absolute after:inset-0"
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              checked ? "text-station" : "text-muted-foreground"
                            )}
                            aria-hidden="true"
                          />
                          <span>{member}</span>
                        </FieldLabel>
                        <span className="text-xs font-normal text-muted-foreground">{hint}</span>
                      </FieldContent>
                    </Field>
                  );
                })}
              </div>

              {showMissingMembersError && (
                <FieldError id="household-members-error">{validationError}</FieldError>
              )}
            </FieldSet>

            <Separator />

            {/* Typical commute Select */}
            <Field>
              <FieldLabel
                htmlFor="commute-select"
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
              >
                <Car className="size-4 text-muted-foreground" aria-hidden="true" />
                <span>Typical commute</span>
              </FieldLabel>
              <Select
                value={profile.commute}
                onValueChange={(value) => onCommuteChange(value as Profile["commute"])}
                disabled={disabled}
              >
                <SelectTrigger
                  id="commute-select"
                  className="h-11 w-full bg-card text-sm dark:bg-card dark:hover:bg-accent"
                >
                  <SelectValue placeholder="Choose your regular commute" />
                </SelectTrigger>
                <SelectContent>
                  {commutes.map((commute) => (
                    <SelectItem key={commute} value={commute} className="min-h-10">
                      {commute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription className="text-xs text-muted-foreground">
                Determines eligible travel and errand recommendations.
              </FieldDescription>
            </Field>

            {/* Daily priority RadioGroup */}
            <FieldSet>
              <FieldLegend
                variant="label"
                className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground"
              >
                <Compass className="size-4 text-muted-foreground" aria-hidden="true" />
                <span>What matters most today</span>
              </FieldLegend>

              <RadioGroup
                value={profile.priority}
                onValueChange={(value) => onPriorityChange(value as Profile["priority"])}
                disabled={disabled}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {priorities.map((priority) => {
                  const id = `priority-${priority.toLowerCase().replace(/\s+/g, "-")}`;
                  const selected = profile.priority === priority;

                  return (
                    <Field
                      key={priority}
                      orientation="horizontal"
                      className={cn(
                        "relative min-h-11 items-start gap-2.5 rounded-lg border p-2.5 transition-colors",
                        selected
                          ? "border-primary bg-station-surface/85 text-foreground"
                          : "border-border/85 bg-(--glass-subcard-bg) text-foreground hover:bg-muted/65"
                      )}
                    >
                      <RadioGroupItem id={id} value={priority} className="relative z-10 mt-0.5" />
                      <FieldContent className="gap-0.5">
                        <FieldLabel
                          htmlFor={id}
                          className="cursor-pointer text-sm font-medium leading-tight after:absolute after:inset-0"
                        >
                          {priority}
                        </FieldLabel>
                        <span className="text-xs font-normal text-muted-foreground">
                          {PRIORITY_HINTS[priority]}
                        </span>
                      </FieldContent>
                    </Field>
                  );
                })}
              </RadioGroup>
            </FieldSet>
          </FieldGroup>

          {/* Selected profile summary strip */}
          <div
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/85 bg-(--glass-cell-bg) px-3 py-2.5 text-xs"
            aria-label="Selected household profile summary"
          >
            <span className="font-medium text-muted-foreground">Selected profile:</span>
            {profile.members.length > 0 ? (
              profile.members.map((member) => (
                <Badge
                  key={member}
                  variant="outline"
                  className="rounded-md border-station-border bg-card text-station"
                >
                  {member}
                </Badge>
              ))
            ) : (
              <span className="font-medium text-destructive">Select at least one member</span>
            )}
            <Badge variant="outline" className="rounded-md bg-card text-muted-foreground">
              {profile.commute}
            </Badge>
            <Badge variant="outline" className="rounded-md bg-card text-muted-foreground">
              {profile.priority}
            </Badge>
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              size="lg"
              className="min-h-11 w-full text-sm font-semibold"
              disabled={!canGenerate || generating}
              aria-describedby="plan-privacy-note"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              <span>{generating ? "Generating action plan…" : "Generate action plan"}</span>
            </Button>
            <p id="plan-privacy-note" className="text-xs leading-relaxed text-muted-foreground">
              Household categories and available recent outdoor readings are sent to Google Gemini
              only when you click Generate action plan.
            </p>
          </div>
        </form>
      </CardContent>
    </GlassCard>
  );
}
