import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import * as accordion from "../../stories/accordion.stories.js";
import * as alert from "../../stories/alert.stories.js";
import * as badge from "../../stories/badge.stories.js";
import * as breadcrumb from "../../stories/breadcrumb.stories.js";
import * as button from "../../stories/button.stories.js";
import * as card from "../../stories/card.stories.js";
import * as form from "../../stories/form.stories.js";
import * as input from "../../stories/input.stories.js";
import * as label from "../../stories/label.stories.js";
import * as pagination from "../../stories/pagination.stories.js";
import * as ribbon from "../../stories/ribbon.stories.js";
import * as separator from "../../stories/separator.stories.js";
import * as sheet from "../../stories/sheet.stories.js";
import * as switchPart from "../../stories/switch.stories.js";
import * as toast from "../../stories/toast.stories.js";

/**
 * Every part's stories, in ONE map.
 *
 * It was two hand-written maps - one in `stories.test.tsx`, one in
 * `tailwind-compile.test.tsx` - and deleting a part from both was GREEN in each
 * file: its stories stopped rendering, its classes stopped being compile-checked
 * and its controls stopped being measured against the 44px floor, silently (layer
 * 1 of the Switch, MED-2). One map cannot disagree with itself, and
 * `storySuiteNames()` reads the directory so the map cannot fall behind the files
 * either.
 */
export const STORY_SUITES = {
  accordion,
  alert,
  badge,
  breadcrumb,
  button,
  card,
  form,
  input,
  label,
  pagination,
  ribbon,
  separator,
  sheet,
  switch: switchPart,
  toast,
};

/** The part names on disk, from the story files themselves. */
export function storySuiteNames(): string[] {
  const dir = resolve(process.cwd(), "packages/ui/stories");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".stories.tsx"))
    .map((name) => name.slice(0, -".stories.tsx".length))
    .sort();
}
