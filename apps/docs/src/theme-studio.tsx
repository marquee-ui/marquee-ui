import { Button } from "@marquee-ui/ui";
import { PALETTES, type ThemeSettings } from "./theme";

export function ThemeStudio({
  settings,
  onChange,
}: {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
}) {
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
              variant={settings.mode === mode ? "secondary" : "ghost"}
              width="auto"
              aria-pressed={settings.mode === mode}
              onClick={() => onChange({ ...settings, mode })}
            >
              {mode === "dark" ? "Dark" : "Light"}
            </Button>
          ))}
        </div>
        <label className="theme-palette">
          <span>Palette</span>
          <select
            value={settings.palette}
            onChange={(event) => {
              const palette = PALETTES.find((entry) => entry.value === event.target.value)!.value;
              onChange({ ...settings, palette });
            }}
          >
            {PALETTES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <a className="theme-recipe-link" href="#theme-recipe">
          Get the CSS <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
