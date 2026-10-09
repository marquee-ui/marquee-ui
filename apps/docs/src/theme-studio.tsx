import type { CSSProperties } from "react";
import {
  Button,
  RadioGroup,
  RadioGroupItem,
  RadioGroupInput,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetClose,
} from "@marquee-ui/ui";
import { ACCENTS, PALETTES, themePreset, type ThemeSettings } from "./theme";
import { resolveColors } from "../../../packages/tokens/src/resolve";
import { pageUrl } from "./routes";

function ModeIcon({ mode }: { mode: ThemeSettings["mode"] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {mode === "dark" ? (
        <path d="M20 15.1A8.5 8.5 0 0 1 8.9 4a8.5 8.5 0 1 0 11.1 11.1Z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      )}
    </svg>
  );
}

function choiceColors(settings: ThemeSettings): CSSProperties {
  const colors = resolveColors(themePreset(settings));
  return {
    "--choice-ground": colors.background,
    "--choice-brand": colors.brand,
    "--choice-action": colors.primary,
  } as CSSProperties;
}

export function ThemeStudio({
  settings,
  onChange,
}: {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
}) {
  const palette = PALETTES.find((entry) => entry.value === settings.palette)!;
  const accent = ACCENTS.find((entry) => entry.value === settings.accent)!;
  return (
    <section id="theme-studio" className="theme-studio" aria-labelledby="theme-studio-title">
      <div className="theme-toolbar">
        <h2 id="theme-studio-title">
          Theme <br />
          studio
        </h2>
        <div className="theme-mode" role="group" aria-label="Color mode">
          {(["dark", "light"] as const).map((mode) => (
            <Button
              key={mode}
              variant="ghost"
              width="auto"
              aria-pressed={settings.mode === mode}
              onClick={() => onChange({ ...settings, mode })}
            >
              <ModeIcon mode={mode} />
              {mode === "dark" ? "Dark" : "Light"}
            </Button>
          ))}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="theme-picker"
              variant="secondary"
              width="auto"
              aria-label={`Customize theme: ${palette.label}, ${accent.label} accent`}
            >
              <span
                className="theme-trigger-swatch"
                style={choiceColors(settings)}
                aria-hidden="true"
              />
              <span className="theme-picker-label">
                <strong>{palette.label}</strong>
                <span>{accent.label}</span>
              </span>
              <span className="theme-picker-arrow" aria-hidden="true">
                ⌄
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent className="theme-panel">
            <div className="theme-panel-header">
              <SheetTitle>Make it yours.</SheetTitle>
              <SheetClose asChild>
                <Button
                  className="theme-panel-close"
                  variant="ghost"
                  width="auto"
                  aria-label="Close theme settings"
                >
                  ×
                </Button>
              </SheetClose>
            </div>
            <SheetDescription>
              Start with a base. Give the actions their own accent.
            </SheetDescription>
            <SheetBody className="theme-panel-body">
              <div className="theme-choice-section">
                <h3 id="base-palette-label">Base palette</h3>
                <p>Surfaces, headings and identity.</p>
                <RadioGroup className="theme-palette-grid" aria-labelledby="base-palette-label">
                  {PALETTES.map(({ value, label }) => (
                    <RadioGroupItem
                      key={value}
                      className="theme-choice theme-base-choice"
                      style={choiceColors({ ...settings, palette: value, accent: "auto" })}
                    >
                      <RadioGroupInput
                        value={value}
                        checked={settings.palette === value}
                        onChange={() => onChange({ ...settings, palette: value })}
                      />
                      <span className="theme-base-swatches" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="theme-choice-label">{label}</span>
                      <span className="theme-choice-check" aria-hidden="true">
                        ✓
                      </span>
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
              <div className="theme-choice-section">
                <h3 id="action-accent-label">Action accent</h3>
                <p>Buttons, links, focus and code highlights. Automatic follows your base.</p>
                <RadioGroup className="theme-accent-grid" aria-labelledby="action-accent-label">
                  {ACCENTS.map(({ value, label, description }) => (
                    <RadioGroupItem
                      key={value}
                      className="theme-choice theme-accent-choice"
                      style={choiceColors({ ...settings, accent: value })}
                    >
                      <RadioGroupInput
                        value={value}
                        checked={settings.accent === value}
                        onChange={() => onChange({ ...settings, accent: value })}
                      />
                      <span className="theme-accent-swatch" aria-hidden="true">
                        {value === "auto" ? "↗" : ""}
                      </span>
                      <span className="theme-choice-label">
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>
                      <span className="theme-choice-check" aria-hidden="true">
                        ✓
                      </span>
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            </SheetBody>
            <SheetClose asChild>
              <Button className="theme-panel-done">Done</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
        <a className="theme-recipe-link" href={`${pageUrl("themes")}#theme-recipe`}>
          Get the CSS <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
