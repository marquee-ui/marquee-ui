import type { Preview } from "@storybook/react-vite";
import "./preview.css";

/**
 * The light preset is LINKED at runtime rather than imported: only one preset can
 * be in Tailwind's `@theme` pass, and it does not need to be both - the two
 * presets declare the same names and differ only in values, so appending the
 * light sheet re-assigns the roles and every compiled utility follows. It is
 * served from `staticDirs` so its own `./fonts/*` urls stay correct.
 */
const lightHref = "/tokens/light.css";

const PRESETS = { arcade: "Arcade (dark)", light: "Light" } as const;

const LINK_ID = "marquee-light-preset";

function applyPreset(preset: string) {
  const existing = document.getElementById(LINK_ID);
  if (preset === "light" && !existing) {
    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = lightHref;
    document.head.append(link);
  }
  if (preset !== "light") existing?.remove();
}

const preview: Preview = {
  globalTypes: {
    preset: {
      description: "Which preset the roles are assigned by",
      toolbar: {
        title: "Preset",
        icon: "paintbrush",
        items: Object.entries(PRESETS).map(([value, title]) => ({ value, title })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { preset: "arcade" },
  decorators: [
    (Story, context) => {
      applyPreset(String(context.globals.preset ?? "arcade"));
      return Story();
    },
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
