import Previewchart from "./examples/chart";
import codechart from "./examples/chart?raw";
import Previewdatatable from "./examples/data-table";
import codedatatable from "./examples/data-table?raw";
import Previewtable from "./examples/table";
import codetable from "./examples/table?raw";
import Previewdatepicker from "./examples/date-picker";
import codedatepicker from "./examples/date-picker?raw";
import Previewcombobox from "./examples/combobox";
import codecombobox from "./examples/combobox?raw";
import Previewcalendar from "./examples/calendar";
import codecalendar from "./examples/calendar?raw";
import Previewdropdownmenu from "./examples/dropdown-menu";
import codedropdownmenu from "./examples/dropdown-menu?raw";
import Previewslider from "./examples/slider";
import codeslider from "./examples/slider?raw";
import Previewtooltip from "./examples/tooltip";
import codetooltip from "./examples/tooltip?raw";
import Previewpopover from "./examples/popover";
import codepopover from "./examples/popover?raw";
import Previewalertdialog from "./examples/alert-dialog";
import codealertdialog from "./examples/alert-dialog?raw";
import Previewdialog from "./examples/dialog";
import codedialog from "./examples/dialog?raw";
import Preview0 from "./examples/button";
import code0 from "./examples/button?raw";
import Preview1 from "./examples/accordion";
import code1 from "./examples/accordion?raw";
import Preview2 from "./examples/alert";
import code2 from "./examples/alert?raw";
import Preview3 from "./examples/avatar";
import code3 from "./examples/avatar?raw";
import Preview4 from "./examples/badge";
import code4 from "./examples/badge?raw";
import Preview5 from "./examples/breadcrumb";
import code5 from "./examples/breadcrumb?raw";
import Preview6 from "./examples/card";
import code6 from "./examples/card?raw";
import Preview7 from "./examples/checkbox";
import code7 from "./examples/checkbox?raw";
import Preview8 from "./examples/description-list";
import code8 from "./examples/description-list?raw";
import Preview9 from "./examples/form";
import code9 from "./examples/form?raw";
import Preview10 from "./examples/input";
import code10 from "./examples/input?raw";
import Preview11 from "./examples/label";
import code11 from "./examples/label?raw";
import Preview12 from "./examples/pagination";
import code12 from "./examples/pagination?raw";
import Preview13 from "./examples/radio-group";
import code13 from "./examples/radio-group?raw";
import Preview14 from "./examples/ribbon";
import code14 from "./examples/ribbon?raw";
import Preview15 from "./examples/separator";
import code15 from "./examples/separator?raw";
import Preview16 from "./examples/sheet";
import code16 from "./examples/sheet?raw";
import Preview17 from "./examples/switch";
import code17 from "./examples/switch?raw";
import Preview18 from "./examples/textarea";
import code18 from "./examples/textarea?raw";
import Preview19 from "./examples/toast";
import code19 from "./examples/toast?raw";
import Preview20 from "./examples/toggle";
import code20 from "./examples/toggle?raw";

import PreviewSelect from "./examples/select";
import codeSelect from "./examples/select?raw";

import PreviewTabs from "./examples/tabs";
import codeTabs from "./examples/tabs?raw";

export const catalog = [
  {
    id: "chart",
    name: "Chart",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Composed Recharts 3 presentation with explicit chart children, live tooltip and legend parts, keyboard bar/line data access and a native data-table alternative. Additional chart types and advanced controls are deferred.",
    story: "default",
    Preview: Previewchart,
    code: codechart,
  },
  {
    id: "data-table",
    name: "DataTable",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Composed TanStack Table 9 presentation with caller-owned data, columns and state, explicit header/row slots and client sorting/filter/page controls. Server grids and virtualization are deferred.",
    story: "default",
    Preview: Previewdatatable,
    code: codedatatable,
  },
  {
    id: "table",
    name: "Table",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Native table parts with explicit captions, header scopes and a named keyboard-scroll container.",
    story: "default",
    Preview: Previewtable,
    code: codetable,
  },
  {
    id: "date-picker",
    name: "DatePicker",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Explicit Calendar and Popover composition for single dates and ranges, with caller-owned state, formatting and form values.",
    story: "default",
    Preview: Previewdatepicker,
    code: codedatepicker,
  },
  {
    id: "combobox",
    name: "Combobox",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Caller-composed single-select searchable popup with keyboard navigation, filtering and explicit committed choice.",
    story: "default",
    Preview: Previewcombobox,
    code: codecombobox,
  },
  {
    id: "calendar",
    name: "Calendar",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Inline single, multiple-date and range selection with caller-owned state and replaceable calendar slots.",
    story: "default",
    Preview: Previewcalendar,
    code: codecalendar,
  },
  {
    id: "button",
    name: "Button",
    description: "A visual action. Use asChild when the action is a link.",
    story: "primary",
    Preview: Preview0,
    code: code0,
  },
  {
    id: "accordion",
    name: "Accordion",
    description: "Named disclosure parts, with keyboard navigation from Radix.",
    story: "single",
    Preview: Preview1,
    code: code1,
  },
  {
    id: "alert",
    name: "Alert",
    description: "A notice with a title and description. You choose its announcement semantics.",
    story: "default",
    Preview: Preview2,
    code: code2,
  },
  {
    id: "avatar",
    name: "Avatar",
    description: "A sized face with an optional decorative corner mark.",
    story: "default",
    Preview: Preview3,
    code: code3,
  },
  {
    id: "badge",
    name: "Badge",
    description: "A compact status label. A badge used as a control needs a full tap target.",
    story: "primary",
    Preview: Preview4,
    code: code4,
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    description: "Linked steps and a current page, composed as semantic navigation.",
    story: "trail",
    Preview: Preview5,
    code: code5,
  },
  {
    id: "card",
    name: "Card",
    description:
      "Header, content and footer slots. The caller picks the content and heading level.",
    story: "default",
    Preview: Preview6,
    code: code6,
  },
  {
    id: "checkbox",
    name: "Checkbox",
    description: "A native checkbox inside a full-size label row. The platform owns checked state.",
    story: "default",
    Preview: Preview7,
    code: code7,
  },
  {
    id: "description-list",
    name: "Description list",
    description: "Terms and details, grouped into valid definition-list items.",
    story: "default",
    Preview: Preview8,
    code: code8,
  },
  {
    id: "form",
    name: "Form",
    description: "Field parts share labels, descriptions and errors. Your app handles validation.",
    story: "default",
    Preview: Preview9,
    code: code9,
  },
  {
    id: "input",
    name: "Input",
    description: "A native text field with the token roles and a 44px minimum height.",
    story: "default",
    Preview: Preview10,
    code: code10,
  },
  {
    id: "label",
    name: "Label",
    description: "A label associated with a native field. Keep their IDs together.",
    story: "default",
    Preview: Preview11,
    code: code11,
  },
  {
    id: "pagination",
    name: "Pagination",
    description: "The caller owns the page window and routing. Links can receive your router.",
    story: "window",
    Preview: Preview12,
    code: code12,
  },
  {
    id: "radio-group",
    name: "Radio group",
    description: "Named native options with a shared group. Arrow keys work through the platform.",
    story: "default",
    Preview: Preview13,
    code: code13,
  },
  {
    id: "ribbon",
    name: "Ribbon",
    description: "A decorative repeating band. Keep an accessible equivalent in nearby text.",
    story: "default",
    Preview: Preview14,
    code: code14,
  },
  {
    id: "separator",
    name: "Separator",
    description: "A visual boundary, with semantic orientation when it conveys separation.",
    story: "horizontal",
    Preview: Preview15,
    code: code15,
  },
  {
    id: "sheet",
    name: "Sheet",
    description: "A mobile bottom sheet and desktop dialog. Radix handles focus and Escape.",
    story: "default",
    Preview: Preview16,
    code: code16,
  },
  {
    id: "switch",
    name: "Switch",
    description: "An on/off control. The caller owns state; the drawing follows aria-checked.",
    story: "off",
    Preview: Preview17,
    code: code17,
  },
  {
    id: "textarea",
    name: "Textarea",
    description: "A native multiline field that follows the same field roles as Input.",
    story: "default",
    Preview: Preview18,
    code: code18,
  },
  {
    id: "toast",
    name: "Toast",
    description: "A body-level transient message. The caller owns its open state and action.",
    story: "with-action",
    Preview: Preview19,
    code: code19,
  },
  {
    id: "toggle",
    name: "Toggle",
    description: "A pressed button. State is yours and the drawing follows aria-pressed.",
    story: "default",
    Preview: Preview20,
    code: code20,
  },
  {
    id: "select",
    name: "Select",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. A single-value choice with explicit portal, viewport, item text and indicator slots. Radix owns focus and native form behavior.",
    story: "default",
    Preview: PreviewSelect,
    code: codeSelect,
  },
  {
    id: "tabs",
    name: "Tabs",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Linked tabs and panels with automatic or manual activation, horizontal or vertical orientation, and default or line styling.",
    story: "default",
    Preview: PreviewTabs,
    code: codeTabs,
  },
  {
    id: "dialog",
    name: "Dialog",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. A centered, scrollable dialog with explicit portal, overlay and close parts. Radix owns modal focus and dismissal; the caller owns content and saving.",
    story: "default",
    Preview: Previewdialog,
    code: codedialog,
  },
  {
    id: "alert-dialog",
    name: "AlertDialog",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. A composed confirmation with Cancel initial focus, blocked outside dismissal, and caller-controlled closing. Portal, overlay and actions are explicit.",
    story: "default",
    Preview: Previewalertdialog,
    code: codealertdialog,
  },
  {
    id: "popover",
    name: "Popover",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. An anchored panel with explicit parts, caller-owned labels and optional modal focus.",
    story: "default",
    Preview: Previewpopover,
    code: codepopover,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Supplemental noninteractive text with explicit provider, portal and arrow. Radix owns focus, hover and collision placement; actions retain independent accessible names.",
    story: "default",
    Preview: Previewtooltip,
    code: codetooltip,
  },
  {
    id: "slider",
    name: "Slider",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Numeric values and ranges with explicit track, range and independently named thumbs. Radix owns keyboard, pointer, direction and form reset; controlled callers accept reset changes.",
    story: "default",
    Preview: Previewslider,
    code: codeslider,
  },
  {
    id: "dropdown-menu",
    name: "DropdownMenu",
    description:
      "Available in the source registry; not yet included in published UI 0.1.10. Explicit action menu parts with checkboxes, radio choices and directional submenus. Default modal; portals, indicators, arrows and chevrons belong to the caller.",
    story: "default",
    Preview: Previewdropdownmenu,
    code: codedropdownmenu,
  },
] as const;
