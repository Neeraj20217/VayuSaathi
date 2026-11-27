"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { POPULAR_METROS, type LocationOrigin } from "@/lib/air-quality-utils";
import type { City } from "@/lib/contracts";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
  query: string;
  onQueryChange: (value: string) => void;
  matches: City[] | null;
  onDismissMatches: () => void;
  city: City | null;
  searching: boolean;
  locating: boolean;
  searchError: string;
  locationNotice: string;
  onSearch: (term: string) => void;
  onChooseCity: (city: City, origin?: LocationOrigin) => void;
  onUseLocation: () => void;
  onClearSearch: () => void;
}

export function LocationSelector({
  query,
  onQueryChange,
  matches,
  onDismissMatches,
  city,
  searching,
  locating,
  searchError,
  locationNotice,
  onSearch,
  onChooseCity,
  onUseLocation,
  onClearSearch,
}: LocationSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const showResultsPopover =
    popoverOpen && matches !== null;
  const busy = searching || locating;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || query.trim().length < 2) return;
    setPopoverOpen(true);
    onSearch(query);
  }

  function handleSelectMatch(selected: City) {
    onChooseCity(selected, "selected");
    setPopoverOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <Popover
            open={showResultsPopover}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (!open) onDismissMatches();
            }}
          >
            <PopoverAnchor asChild>
              <div className="relative flex flex-1 items-center">
                <MapPin
                  className="pointer-events-none absolute left-3 size-4 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <label htmlFor="city-query" className="sr-only">
                  Search Indian city or town
                </label>
                <Input
                  id="city-query"
                  ref={inputRef}
                  type="search"
                  value={query}
                  placeholder="Search Indian city or town (e.g. Delhi, Mumbai, Chanderi)"
                  required
                  minLength={2}
                  maxLength={80}
                  readOnly={busy}
                  aria-describedby={searchError ? "city-search-error" : undefined}
                  className="h-11 bg-card pr-11 pl-9 text-sm shadow-2xs dark:bg-card sm:text-base"
                  onChange={(e) => {
                    onQueryChange(e.target.value);
                    setPopoverOpen(false);
                  }}
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 size-9 text-muted-foreground hover:text-foreground"
                    disabled={busy}
                    onClick={() => {
                      onClearSearch();
                      setPopoverOpen(false);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear city search query"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </PopoverAnchor>

            <PopoverContent
              align="start"
              sideOffset={6}
              aria-label="City search results"
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                resultsRef.current?.focus();
              }}
              onEscapeKeyDown={() => inputRef.current?.focus()}
              className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
            >
              <Command shouldFilter={false}>
                <CommandList ref={resultsRef} aria-label="Matching cities">
                  {matches && matches.length === 0 ? (
                    <CommandEmpty className="px-4 py-5 text-sm text-muted-foreground">
                      No matching Indian locations found. Check the spelling or try a nearby town.
                    </CommandEmpty>
                  ) : (
                    <CommandGroup
                      heading={`Matching Indian places (${matches?.length ?? 0})`}
                    >
                      {(matches ?? []).map((item) => {
                        const isSelected = item.id === city?.id;
                        const meta = [item.locality, item.region, "India"]
                          .filter(Boolean)
                          .join(" · ");
                        return (
                          <CommandItem
                            key={item.id}
                            value={`${item.id}-${item.name}-${meta}`}
                            onSelect={() => handleSelectMatch(item)}
                            className={cn(
                              "flex min-h-11 items-center justify-between gap-3 px-3 py-2",
                              isSelected && "bg-station-surface text-station"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-foreground">
                                {item.name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">{meta}</div>
                            </div>
                            {isSelected ? (
                              <Badge
                                variant="outline"
                                className="border-station-border bg-card text-station"
                              >
                                <Check className="size-3" aria-hidden="true" />
                                Selected
                              </Badge>
                            ) : (
                              <ArrowRight
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                              />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
            <Button
              type="submit"
              className="min-h-11 px-4 font-medium shadow-2xs disabled:border disabled:border-border disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
              disabled={busy || query.trim().length < 2}
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              <span>{searching ? "Searching…" : "Search"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-input bg-card px-3.5 font-medium text-foreground hover:bg-accent dark:bg-card dark:hover:bg-accent"
              onClick={() => {
                setPopoverOpen(true);
                onUseLocation();
              }}
              disabled={busy}
            >
              {locating ? (
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
              ) : (
                <LocateFixed className="size-4 text-primary" aria-hidden="true" />
              )}
              <span>{locating ? "Locating…" : "Use my location"}</span>
            </Button>
          </div>
        </form>

        {/* Popular metros quick-select */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Popular Indian metros"
        >
          <span className="mr-0.5 rounded-md border border-border/90 bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
            Quick cities
          </span>
          {POPULAR_METROS.map((metro) => {
            const isCurrent =
              city?.name === metro.name && city.region === metro.region && !city.locality;
            return (
              <Button
                key={metro.code}
                type="button"
                size="sm"
                variant={isCurrent ? "default" : "outline"}
                disabled={busy}
                onClick={() => {
                  setPopoverOpen(true);
                  onSearch(metro.query);
                }}
                aria-pressed={isCurrent}
                className={cn(
                  "min-h-11 gap-1.5 px-3 text-xs font-medium",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent dark:bg-card dark:hover:bg-accent"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {metro.code}
                </span>
                <span>{metro.name}</span>
              </Button>
            );
          })}
        </div>

        {matches && matches.length > 0 && !popoverOpen && (
          <div
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
            role="region"
            aria-label="Matching Indian places"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {matches.length} matching places found
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setPopoverOpen(true)}
            >
              Show choices
            </Button>
          </div>
        )}

        {matches && matches.length === 0 && !popoverOpen && (
          <p
            className="rounded-md border border-border/90 bg-card px-3 py-2 text-sm text-muted-foreground shadow-2xs"
            role="status"
          >
            No matching Indian locations found. Check the spelling or try a nearby town.
          </p>
        )}

        {locationNotice && (
          <Alert className="border-model-border bg-model-surface/55 text-foreground" role="status">
            <LocateFixed className="size-4 text-model" aria-hidden="true" />
            <AlertTitle className="text-sm font-medium">Location update</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              {locationNotice}
            </AlertDescription>
          </Alert>
        )}

        {searchError && (
          <Alert
            id="city-search-error"
            variant="destructive"
            className="border-danger-border bg-danger-surface text-destructive"
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle>City search problem</AlertTitle>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}
    </div>
  );
}
