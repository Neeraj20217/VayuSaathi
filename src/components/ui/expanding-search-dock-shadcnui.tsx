"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { ChevronLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandingSearchDockProps {
  children: ReactNode;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  resultsOpen: boolean;
  canSubmit: boolean;
  searching: boolean;
}

export function ExpandingSearchDock({
  children, expanded, onExpandedChange, inputRef, triggerRef, disabled, resultsOpen, canSubmit, searching,
}: ExpandingSearchDockProps) {
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [expanded, inputRef, triggerRef]);

  function collapse() {
    restoreFocus.current = true;
    onExpandedChange(false);
  }

  return (
    <div
      className="city-search-dock"
      data-expanded={expanded}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded && !disabled && !resultsOpen) {
          event.preventDefault();
          collapse();
        }
      }}
    >
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        className="city-search-toggle absolute inset-y-0 left-0 z-10 size-11 rounded-full text-primary"
        aria-label="Expand city search"
        aria-controls="city-search-entry"
        aria-expanded={expanded}
        disabled={disabled}
        hidden={expanded}
        onClick={() => onExpandedChange(true)}
      >
        <Search aria-hidden="true" />
      </Button>
      <div id="city-search-entry" className="city-search-entry absolute inset-0" inert={!expanded}>
        <Button
          type="submit"
          variant="ghost"
          className="absolute left-1 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full text-primary"
          aria-label={searching ? "Searching for cities" : "Search"}
          title="Search city"
          disabled={!expanded || !canSubmit}
        >
          {searching ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Search aria-hidden="true" />}
        </Button>
        {children}
        <Button
          type="button"
          variant="ghost"
          className="absolute right-0.5 top-1/2 size-8 -translate-y-1/2 rounded-full text-muted-foreground"
          aria-label="Collapse city search"
          disabled={disabled || resultsOpen}
          onClick={collapse}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
