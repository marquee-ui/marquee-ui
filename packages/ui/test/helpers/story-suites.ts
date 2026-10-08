import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import * as accordion from "../../stories/accordion.stories.js";
import * as alert from "../../stories/alert.stories.js";
import * as avatar from "../../stories/avatar.stories.js";
import * as badge from "../../stories/badge.stories.js";
import * as breadcrumb from "../../stories/breadcrumb.stories.js";
import * as button from "../../stories/button.stories.js";
import * as card from "../../stories/card.stories.js";
import * as checkbox from "../../stories/checkbox.stories.js";
import * as descriptionList from "../../stories/description-list.stories.js";
import * as form from "../../stories/form.stories.js";
import * as input from "../../stories/input.stories.js";
import * as label from "../../stories/label.stories.js";
import * as pagination from "../../stories/pagination.stories.js";
import * as radioGroup from "../../stories/radio-group.stories.js";
import * as ribbon from "../../stories/ribbon.stories.js";
import * as separator from "../../stories/separator.stories.js";
import * as sheet from "../../stories/sheet.stories.js";
import * as switchPart from "../../stories/switch.stories.js";
import * as textarea from "../../stories/textarea.stories.js";
import * as toast from "../../stories/toast.stories.js";
import * as select from "../../stories/select.stories.js";
import * as tabs from "../../stories/tabs.stories.js";
import * as toggle from "../../stories/toggle.stories.js";

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
import * as dialog from "../../stories/dialog.stories.js";

import * as alertdialog from "../../stories/alert-dialog.stories.js";

import * as popover from "../../stories/popover.stories.js";

import * as tooltip from "../../stories/tooltip.stories.js";

export const STORY_SUITES = {
  tooltip: tooltip,
  popover: popover,
  "alert-dialog": alertdialog,
  dialog: dialog,
  accordion,
  alert,
  avatar,
  badge,
  breadcrumb,
  button,
  card,
  checkbox,
  "description-list": descriptionList,
  form,
  input,
  label,
  pagination,
  "radio-group": radioGroup,
  ribbon,
  separator,
  sheet,
  switch: switchPart,
  textarea,
  toast,
  select,
  tabs,
  toggle,
};

/** The part names on disk, from the story files themselves. */
export function storySuiteNames(): string[] {
  const dir = resolve(process.cwd(), "packages/ui/stories");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".stories.tsx"))
    .map((name) => name.slice(0, -".stories.tsx".length))
    .sort();
}
