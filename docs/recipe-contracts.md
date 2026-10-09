# Recipe contracts

The fourteen families added by the component-parity program are unreleased candidate
source. Matching a shadcn name does not promise a drop-in API, identical markup or
every upstream behavior. Start with [getting started](./getting-started.md) for
installation and [supported stack](./supported-stack.md) for the finite consumer proof.
The original families have their own [common-name API guide](./common-name-api.md).

This source audit was checked on **2026-10-09** against the official references linked
below. Radix wrappers expose the supported primitive props on their corresponding
parts, including host refs, `asChild` where the primitive supports it, controlled or
uncontrolled state and cancelable callbacks. State-only roots and Providers do not
supply DOM hosts; other roots expose the hosts named below. A custom slotted component
must forward props, events and refs to the appropriate accessible host. This describes source-supported API exposure; it does
not mean that every upstream prop combination has independent browser proof.
Caller composition still owns labels, responsive layout, focus order and the 44px
target when a custom host becomes interactive.

## Select

Parts: `Select`, `SelectPortal`, `SelectTrigger`, `SelectValue`, `SelectIcon`,
`SelectContent`, `SelectViewport`, `SelectGroup`, `SelectLabel`, `SelectItem`,
`SelectItemText`, `SelectItemIndicator`, `SelectSeparator`, `SelectScrollUpButton`,
`SelectScrollDownButton` and `SelectArrow`.

`Select` is Radix's single-choice root; Trigger is a button, Content/Viewport host
the list, and Item is an option. Radix owns selection, typeahead, roving focus and
native form participation. Supply a trigger label, nonempty item values and the
root's `name`, `required` or `disabled` form props as needed. Controlled callers
must accept value/open changes.

Compose Portal, Viewport, ItemText, indicators, icons and scroll controls explicitly.
Content inserts none of them; Item inserts neither text nor a checkmark. This differs
from the bundled shadcn wrappers and their trigger `size` API. Value and ItemText
stay unstyled for Radix's item positioning. Content retains `position="item-aligned"`;
choose `position="popper"` for edge alignment and an Arrow. Editable search and multiple
selection are outside this family.

Sources: [Marquee Select](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/select.tsx),
[shadcn Select](https://ui.shadcn.com/docs/components/radix/select),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/select.tsx),
[Radix Select](https://www.radix-ui.com/primitives/docs/components/select).

## Tabs

Parts: `Tabs`, `TabsList`, `TabsTrigger` and `TabsContent`. Their default hosts are
Radix's root `div`, tablist `div`, tab `button` and tabpanel `div`.

Radix owns state, roving focus and tab/panel association. Callers supply matching
values, a meaningful list name, trigger text and panel content. Orientation, direction,
automatic/manual activation, list looping, disabled triggers and Content `forceMount`
pass through. `TabsList` adds the visual `variant="default" | "line"` axis, also
present in current shadcn Tabs. It creates no panels, icons or animation. Forced
inactive content remains mounted; the caller owns its hiding or animation. Horizontal
lists stay in one row: compose a scroll host or choose vertical orientation for long
labels; there is no automatic responsive orientation switch.

Sources: [Marquee Tabs](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/tabs.tsx),
[shadcn Tabs](https://ui.shadcn.com/docs/components/radix/tabs),
[Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs).

## Dialog

Parts: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`,
`DialogTitle`, `DialogDescription`, `DialogClose`, `DialogHeader` and `DialogFooter`.
Content is a dialog panel, Trigger/Close are buttons, Title/Description use Radix's
`h2`/`p` hosts, and Header/Footer are optional `div` layout slots.

Compose Portal, Overlay, Content and Close yourself, with a title and description
inside the panel. When omitting a description, remove that part and set Content's
`aria-describedby={undefined}`. Radix owns modal focus trapping, dismissal and focus
return; `modal={false}` opts into nonmodal interaction. The panel stays centered and
owns viewport-bounded vertical scrolling. Header/Footer do not become sticky.

Marquee Content inserts no portal, overlay or close icon; it has no shadcn
`showCloseButton` prop on Content or Footer. Add a named Close part where needed.
Use controlled open state for saving or asynchronous completion; the caller owns
validation, submission and when completion should close the panel.

Sources: [Marquee Dialog](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/dialog.tsx),
[shadcn Dialog](https://ui.shadcn.com/docs/components/radix/dialog),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/dialog.tsx),
[Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog).

## AlertDialog

Parts: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`,
`AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`,
`AlertDialogDescription`, `AlertDialogAction` and `AlertDialogCancel`. Content is an
alertdialog panel; Trigger, Action and Cancel are buttons. Title/Description are
Radix `h2`/`p` hosts, and Header/Footer are optional `div` layout slots.

This is a confirmation modal: Cancel receives initial focus and outside interaction
cannot dismiss it. Compose Portal, Overlay, titles and both actions explicitly.
Radix supplies confirmation focus and dismissal semantics; setting an ordinary
Sheet's role to `alertdialog` does not supply them. Prevent Action's click default
and use controlled open state when closing must wait for an asynchronous operation.

Action has Marquee's `variant="primary" | "destructive"`; Cancel has its own quiet
paint. Neither forwards shadcn Button's full `variant`/`size` API. Content has no
shadcn `size="sm"` axis and there is no `AlertDialogMedia` export: compose media and
layout as children. Content is centered, bounded and scrollable without inserting
structural controls.

Sources: [Marquee AlertDialog](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/alert-dialog.tsx),
[shadcn Alert Dialog](https://ui.shadcn.com/docs/components/radix/alert-dialog),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/alert-dialog.tsx),
[Radix Alert Dialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog).

## Popover

Parts: `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverPortal`, `PopoverContent`,
`PopoverClose`, `PopoverArrow`, `PopoverHeader`, `PopoverTitle` and `PopoverDescription`.
Trigger/Close are buttons, Content is the Radix dialog panel, Anchor/Header default
to `div`, Title to `h3` and Description to `p`.

Radix owns positioning, collision handling, open state, focus and cancelable dismissal.
The default is nonmodal; `modal` opts into focus and pointer isolation. Compose Portal,
Content, Close and Arrow yourself. In particular, Content does not insert shadcn's
implicit portal. Header/Title/Description are presentation slots: give Content an
accessible name, and wire IDs with `aria-labelledby` / `aria-describedby` when those
slots supply it. They do not automatically associate themselves with Content.

Sources: [Marquee Popover](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/popover.tsx),
[shadcn Popover](https://ui.shadcn.com/docs/components/radix/popover),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/popover.tsx),
[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover).

## Tooltip

Parts: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipPortal`, `TooltipContent`
and `TooltipArrow`. Trigger defaults to a button; Content hosts the supplemental
tooltip description and Arrow is the primitive SVG.

Provider, Portal and Arrow are explicit. Provider retains Radix delay, skip-delay
and hoverable-content options; Marquee does not replace its delay with shadcn's
zero-delay default. Content inserts neither a portal nor an arrow. Radix owns hover,
focus, blur, Escape and positioning. Keep text short and noninteractive, supplement
an already named control, and make essential instructions available without a tooltip
to touch users. Compose Popover when the content contains actions.

Sources: [Marquee Tooltip](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/tooltip.tsx),
[shadcn Tooltip](https://ui.shadcn.com/docs/components/radix/tooltip),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/tooltip.tsx),
[Radix Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip).

## DropdownMenu

Parts: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuPortal`, `DropdownMenuContent`,
`DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`,
`DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuItemIndicator`,
`DropdownMenuSeparator`, `DropdownMenuArrow`, `DropdownMenuSub`, `DropdownMenuSubTrigger`
and `DropdownMenuSubContent`. Trigger is a button; Content/SubContent are menus;
items are Radix menuitem, menuitemcheckbox or menuitemradio hosts.

Compose portals, indicators, submenu content, arrows and chevrons. Marquee injects
none of them, exports no `DropdownMenuShortcut` and adds no shadcn `inset` or
destructive item `variant` props. Ordinary children and classes supply presentation.
Radix owns keyboard navigation, typeahead, disabled items, direction-aware submenus,
dismissal and focus return. It is modal by default; `modal={false}` is explicit.
Callers own checkbox/radio state and actions. Selection closes by default; prevent
`onSelect`'s default to keep a settings menu open. Use Select for a submitted form
choice; menu checked state supplies no form transport.

Sources: [Marquee DropdownMenu](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/dropdown-menu.tsx),
[shadcn Dropdown Menu](https://ui.shadcn.com/docs/components/radix/dropdown-menu),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/dropdown-menu.tsx),
[Radix Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu).

## Slider

Parts: `Slider`, `SliderTrack`, `SliderRange` and `SliderThumb`. Root/Track/Range are
Radix span hosts; each Thumb is the actual focusable slider target. Compose Track,
Range and every independently named Thumb yourself. Marquee does not generate
thumbs from an array as the shadcn Slider wrapper does.

Radix owns numeric values, min/max/step, minimum thumb separation, orientation,
direction, keyboard/pointer input, commit callbacks and form association. Supply
appropriate labels/value text and enough layout space, particularly for a vertical
track. Uncontrolled reset restores the initial mounted value; controlled reset asks
the caller to accept that value through `onValueChange`.

**Disabled Slider alone still submits named values in Radix 1.5.0.** Use a native
disabled fieldset to exclude them, as the verified recipe does, or omit their names.
This is a primitive submission limit; Marquee supplies no form controller. Each
thumb's 44px target contains a smaller noninteractive painted marker. The marker
center follows the value across the entire painted track, including both endpoints.
Root end margins reserve half a default target at either end; callers overriding
Root width/margins or enlarging a thumb must preserve that surrounding space.

Sources: [Marquee Slider](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/slider.tsx),
[shadcn Slider](https://ui.shadcn.com/docs/components/radix/slider),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/slider.tsx),
[Radix Slider](https://www.radix-ui.com/primitives/docs/components/slider).

## Combobox

Parts: `Combobox`, `ComboboxTrigger`, `ComboboxPortal`, `ComboboxContent`,
`ComboboxCommand`, `ComboboxInput`, `ComboboxList`, `ComboboxItem`, `ComboboxGroup`,
`ComboboxEmpty` and `ComboboxSeparator`. Root/Trigger/Portal/Content are Radix Popover
parts; Command/Input/List/Item/Group/Empty/Separator are cmdk parts. The trigger
is a button opening a labelled dialog, the search input has combobox semantics,
and cmdk owns active-descendant/listbox navigation.

This is a **single-select searchable popup**. The caller owns open state, committed
value, displayed label, indicators and hidden form values/reset. Commit a choice in
Item's `onSelect`, render it in Trigger and choose when to close. Command's
`value`/`onValueChange` track active navigation, not the committed form value.
Label search through Command's `label` and results through List's `label`; cmdk
owns those ARIA associations.

Popover parts and Input/Item/Empty/Separator retain supported `asChild` paths.
cmdk 1.1.1's native root/list/group `asChild` path is unsupported and omitted from
those wrapper types; their children remain composed. Current shadcn's default
Combobox is Base UI's editable `items` API with object collections and multiple
selection/chips. Those are not compatible Marquee props or exports. Editable inline
inputs, chips/multiselect, object collection APIs and virtualization remain deferred.

Sources: [Marquee Combobox](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/combobox.tsx),
[shadcn Base UI Combobox](https://ui.shadcn.com/docs/components/base/combobox),
[cmdk API](https://github.com/dip/cmdk),
[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover).

## Calendar

Parts: `Calendar`, `CalendarRoot`, `CalendarDayButton`, `CalendarNavigationButton`,
with `CalendarProps`, `CalendarRootProps` and `CalendarDayButtonProps`. Calendar
uses `@daypicker/react` 10; its props retain DayPicker's single/multiple/range union,
including required selection. Root is a replaceable `div`; day and navigation slots
are real buttons. Use DayPicker's `components` slots rather than a Calendar `asChild` API.

Callers own selection/month state, footer announcements, labels, locale, formatting
and reset. Navigation, matchers, keyboard grid movement and selection semantics come
from DayPicker. Replaceable slots must retain the supplied handlers, refs and focus
behavior. Marquee supplies role-based `classNames` and styled slots without importing
the upstream stylesheet. It has no shadcn `buttonVariant` convenience prop and does
not impose that wrapper's `showOutsideDays={true}` default.

The default Gregorian frame needs **at least 328px of inner host width**: seven 44px
columns plus its padding/borders. Week numbers and custom slots may need more. Keep
that space available; clipping the grid or shrinking day targets breaks the recipe.
At 390px, `DialogContent className="p-3"` gives 330px inside its frame;
`PopoverContent className="w-auto p-2"` sizes to the Calendar. Extra months wrap as
complete grids. Time selection, alternate calendars and exhaustive timezone/locale
validation remain outside the proof.

Sources: [Marquee Calendar](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/calendar.tsx),
[shadcn Calendar](https://ui.shadcn.com/docs/components/radix/calendar),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/calendar.tsx),
[DayPicker 10](https://daypicker.dev/upgrading),
[custom components](https://daypicker.dev/guides/custom-components).

## DatePicker

Parts: `DatePicker`, `DatePickerTrigger`, `DatePickerPortal`, `DatePickerAnchor`,
`DatePickerArrow`, `DatePickerClose`, `DatePickerHeader`, `DatePickerTitle`,
`DatePickerDescription`, `DatePickerCalendar`, `DatePickerContent` and
`DatePickerCalendarProps`.

These are namespaced Calendar/Popover conveniences, retaining their types, hosts,
supported slots and dismissal behavior. Compose Trigger, Portal, Content and Calendar
explicitly; nothing inserts them for you. Content grants the standard Calendar its
frame with auto width and 8px padding, default start alignment, 8px side offset and
16px collision padding. Week numbers, custom slots or extra months can need more.
Current shadcn supplies a Date Picker composition recipe, not a separate primitive root.

Callers own single/range selection, formatting, labels, close-on-selection policy,
hidden local-day form values, partial ranges and reset. In a parent modal, use the
[example's `onOpenAutoFocus` callback](https://github.com/marquee-ui/marquee-ui/blob/next/apps/docs/src/examples/date-picker.tsx)
to focus the Calendar's current roving day after the child Popover focus scope mounts.
With the example's selected state this chooses the selected day. The aliases alone
do not guarantee selected-day initial focus in every overlay. If no descendant can
take focus, Popover focuses Content. Short vertical space can scroll. Text entry,
date parsing, natural-language input and time selection remain deferred.

Sources: [Marquee DatePicker](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/date-picker.tsx),
[shadcn Date Picker](https://ui.shadcn.com/docs/components/radix/date-picker).
Calendar and Popover references above define its underlying contracts.

## Table

Parts and default hosts: `TableContainer` (`div`), `Table` (`table`), `TableHeader`
(`thead`), `TableBody` (`tbody`), `TableFooter` (`tfoot`), `TableRow` (`tr`),
`TableHead` (`th`), `TableCell` (`td`) and `TableCaption` (`caption`), plus
`TableContainerProps`. Native props, refs and `asChild` are supported; slotted
components must keep the corresponding native table hosts. Put controls inside
cells, never in place of rows or cells.

Table is bare. Compose TableContainer explicitly when scrolling is needed, with a
meaningful `aria-label` or `aria-labelledby`, required by its TypeScript props. Its
default region role and tab stop enable native arrow-key scrolling without a
JavaScript keyboard controller. This differs from shadcn Table's implicit wrapper.
Callers own captions, header scopes, spans, content and genuine cell controls.
`data-state="selected"` only paints a row; it creates no selection model,
focusability or `aria-selected`. Sorting, filtering, pagination and virtualization
belong to a caller engine or DataTable composition.

Sources: [Marquee Table](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/table.tsx),
[shadcn Table](https://ui.shadcn.com/docs/components/radix/table),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/table.tsx).

## DataTable

Parts: `DataTable`, `DataTableHeader`, `DataTableBody`, `DataTableEmpty`,
`DataTableSortButton`, with `DataTableHeaderProps`, `DataTableBodyProps` and
`DataTableSortButtonProps`. DataTable is the native Table presentation. Header/Body
are native `thead`/`tbody` parts taking a caller-created **TanStack React Table 9
instance**, not `columns`/`data` props that create an engine for you.

Keep `useTable`'s reactive selection or compose `table.Subscribe` around the
presentation so state changes render new rows. Callers own columns, data, feature
registration, state and updates, filtering/sorting/page controls and actions.
Compose a caption and named TableContainer. Header's `renderHeader` returns a native
`th`, preserving grouped `colSpan` and placeholders, header scopes and `aria-sort`.
Body's `renderRow` returns a native `tr` and cells; Header/Body omit `asChild` because
their row structure is generated from the supplied instance. Supply `empty` as an
explicit row containing DataTableEmpty with the visible leaf-column count.
SortButton takes a direction and caller click handler; its surrounding `th` owns
`aria-sort`. Its `asChild` form leaves visual children with the caller.

The demonstrated recipe covers client sorting, name filtering, pagination, empty
results and cell actions. Focused controls in a wide table need the
[example's caller reveal policy and scroll margin](https://github.com/marquee-ui/marquee-ui/blob/next/apps/docs/src/examples/data-table.tsx)
so their complete target and focus ring are visible. Current shadcn also provides
a TanStack 9 construction guide, but its reusable example/API is not this part API.
Server/virtualized grids, editing, selection managers, resizing/reordering,
aggregation and export remain deferred Marquee behaviors.

Sources: [Marquee DataTable](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/data-table.tsx),
[shadcn Data Table](https://ui.shadcn.com/docs/components/radix/data-table),
[TanStack React state](https://tanstack.com/table/latest/docs/framework/react/guide/table-state).

## Chart

Parts: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`,
`ChartLegendContent` and `ChartLegendItem`. Container/TooltipContent default to `div`;
LegendContent/LegendItem are native `ul`/`li` hosts and must retain those semantics
when slotted. Tooltip and Legend are direct Recharts aliases.

Compose **Recharts 3** ResponsiveContainer, chart primitives, axes, series, tooltip
and legend content explicitly. Keep a positive height or aspect when overriding
ChartContainer's default 256px height. Callers own data, accessible chart names,
token series colors, non-color distinctions, actual plot margins and every displayed
value. The bar/line example uses a solid/dashed distinction, a concise live tooltip
and a native table containing all values. Leave axis labels clear of the actual
SVG's inset focus ring. Marquee has no shadcn `ChartConfig`, generated theme CSS or
config-driven tooltip/legend inference, and does not insert ResponsiveContainer.

Left/Right suppress the browser's extra ancestor scroll **only when the actual
focused target is the accessible `svg.recharts-surface[role="application"]` belonging
to that ChartContainer**. Recharts still handles point navigation. Caller key
handlers run first and retain cancellation/propagation. Keys on the named
TableContainer still scroll it; unrelated descendant inputs are not claimed.

In a wide native table, **reveal the whole SVG through the named scroll region before
Tab enters the chart**. Natural Tab establishes focus but promises no complete box
reveal. Point arrows preserve that revealed boundary; Chart supplies no generic
focus/reveal manager. The
[native-scroll contract and observed clipping counterexample](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-7-contract-review.md)
record the finite proof.

Inside a modal, follow the
[InDialog composition](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/chart.stories.tsx):
set Line `activeDot={false}` and Tooltip `cursor={false}`, keep the custom
ChartTooltipContent host mounted, and update one nonempty Text child. Recharts hides
the inactive tooltip. These stable nodes allow native Tab/Shift+Tab to reach adjacent
controls; conditionally removing active chart nodes during blur can make the modal
focus scope choose its panel instead. These are caller recipe choices, not a Chart
modal focus manager. Additional chart types, brush/zoom, animation controls and
export remain outside this bounded recipe.

Sources: [Marquee Chart](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/chart.tsx),
[shadcn Chart](https://ui.shadcn.com/docs/components/radix/chart),
[shadcn wrapper source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/chart.tsx),
[Recharts sizing](https://recharts.github.io/en-US/api/ResponsiveContainer/),
[Recharts accessibility](https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx).
