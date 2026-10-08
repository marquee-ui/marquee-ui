# Common names and API contracts

Marquee's component names describe families, not drop-in replacements for shadcn/ui.
This audit covers the 21 original families, checked against Marquee source and current
official documentation on **2026-10-09**. It documents the accumulated `next` candidate;
public release remains held. Use [getting started](./getting-started.md) for installation
and [supported stack](./supported-stack.md) for the published baseline and validated stack.
The newer composed families have separate [recipe contracts](./recipe-contracts.md).

The inventory below lists component exports. The
[entry point](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/index.ts)
also exports the associated types, class strings and variant helpers where provided.
Copied source, its props and its rendered elements are the contract: registry installation
does not translate another library's props or add its behavior.

## Choose the comparison before migrating

Current shadcn pages distinguish implementations with paths such as
[`/docs/components/radix/checkbox`](https://ui.shadcn.com/docs/components/radix/checkbox)
and [`/docs/components/base/checkbox`](https://ui.shadcn.com/docs/components/base/checkbox).
The comparisons below use the **Radix** pages unless stated otherwise. This choice does
not mean every Marquee family uses Radix: many are native HTML, and Form and Toast are
Marquee implementations.

Base UI is a separate API. For example, its primitive
[Checkbox](https://base-ui.com/react/components/checkbox) and
[Switch](https://base-ui.com/react/components/switch) document a `render` element/callback
and `data-checked` state attributes. Marquee's slots use `asChild` only where the source
declares it; its native choices draw from `:checked`, and its button switches/toggles
draw from ARIA attributes. Do not translate `render` into `asChild` globally or copy
state selectors between implementations. This audit makes no Base UI compatibility
claim and does not change Marquee's primitive platform.

## Inventory

Each family name links to its Marquee source. Native props belong on the element
that actually renders the control, rather than whichever part shares the familiar name.

| Family and component exports                                                                                                                                                                             | Host, ownership and migration contract                                                                                                                                                                                                                                                                         | Official comparison checked 2026-10-09                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Accordion](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/accordion.tsx); AccordionItem, AccordionTrigger, AccordionContent                                                         | Radix Root/Item/Trigger/Content; trigger has a Radix Header wrapper. Radix owns single/multiple disclosure, keyboard behavior and state attributes. Caller chooses `type`, values, content and any chevron; no icon is inserted.                                                                               | [shadcn Accordion](https://ui.shadcn.com/docs/components/radix/accordion), [Radix Accordion](https://www.radix-ui.com/primitives/docs/components/accordion)                                                           |
| [Alert](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/alert.tsx); AlertTitle, AlertDescription                                                                                      | Root `div` or `asChild`; title `div`, description `p`. `tone`: default/destructive/success/warning/info. No default role or live region; caller owns announcement strategy and composes any action as a child. shadcn's `variant` and `AlertAction` are not this API.                                          | [shadcn Alert](https://ui.shadcn.com/docs/components/radix/alert)                                                                                                                                                     |
| [Avatar](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/avatar.tsx); AvatarImage, AvatarBadge                                                                                        | Root `span` or `asChild`; native `img`; decorative `span` badge. Caller supplies root dimensions, image URL, alternative text and any error/loading handling. No AvatarFallback or group parts.                                                                                                                | [shadcn Avatar](https://ui.shadcn.com/docs/components/radix/avatar), [Radix Avatar](https://www.radix-ui.com/primitives/docs/components/avatar)                                                                       |
| [Badge](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/badge.tsx)                                                                                                                    | `span` or `asChild`; `tone`: default/primary/destructive/success, rather than shadcn's `variant` set. Caller owns content and any interactive host's name and 44px target.                                                                                                                                     | [shadcn Badge](https://ui.shadcn.com/docs/components/radix/badge)                                                                                                                                                     |
| [Breadcrumb](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/breadcrumb.tsx); BreadcrumbList, BreadcrumbItem, BreadcrumbPageItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator | `nav` named Breadcrumb, `ol`, `li`, link `a` or `asChild`, current-page `span`. Separator is a hidden `span` (default dot): put it inside a list item, not directly under the `ol`. PageItem permits current-page shrinking/truncation. No BreadcrumbEllipsis. Caller owns routes and collapse.                | [shadcn Breadcrumb](https://ui.shadcn.com/docs/components/radix/breadcrumb)                                                                                                                                           |
| [Button](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/button.tsx)                                                                                                                  | `button` defaults to `type="button"`, or `asChild` without forwarding the root `type`. `variant`: primary/primaryRounded/secondary/danger/ghost; `width`: full/auto, default full; `armed` changes danger paint only. No shadcn `size` prop or confirmation logic; set `type="submit"` explicitly when needed. | [shadcn Button](https://ui.shadcn.com/docs/components/radix/button)                                                                                                                                                   |
| [Card](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/card.tsx); CardHeader, CardTitle, CardDescription, CardContent, CardFooter                                                     | Root `div` or `asChild`; title `h3` or `asChild`; description `p`, remaining parts `div`. Root owns padding: `gutter` md/sm, `edge` default/primary, `radius` md/sharp. No CardAction or shadcn `size`/`--card-spacing` contract. Compose actions and choose heading level.                                    | [shadcn Card](https://ui.shadcn.com/docs/components/radix/card)                                                                                                                                                       |
| [Checkbox](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/checkbox.tsx); CheckboxInput, CheckboxBox, CheckboxIndicator                                                               | Root `label`; real `input[type=checkbox]` owns checkedness, disabled/required/name/value and native `onChange`; box `span`, indicator `svg`. No root `checked`/`onCheckedChange`, `asChild` or indeterminate drawing API.                                                                                      | [shadcn Checkbox](https://ui.shadcn.com/docs/components/radix/checkbox), [Radix Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox)                                                               |
| [DescriptionList](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/description-list.tsx); DescriptionItem, DescriptionTerm, DescriptionDetails                                         | `dl` → `div` groups → `dt` then `dd`; guarded part/context structure. Item `layout`: stack/inline; term `tone`: micro/plain. No `asChild`; term/detail refuse role overrides. Caller owns list layout and value content.                                                                                       | Marquee addition; no counterpart is claimed in the checked [shadcn catalog](https://ui.shadcn.com/docs/components).                                                                                                   |
| [Form](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/form.tsx): FormItem, FormLabel, FormControl, FormDescription, FormMessage                                                      | There is **no exported Form root**, FormField or useFormField. Item `div` owns generated IDs and caller-supplied `invalid`; label uses Radix Label; control is a Slot; description/message are `p`. Caller owns values, validation, controller, native `form`, reset and submission.                           | Current [shadcn Field](https://ui.shadcn.com/docs/components/radix/field) and [React Hook Form guide](https://ui.shadcn.com/docs/forms/react-hook-form)                                                               |
| [Input](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/input.tsx)                                                                                                                    | Native `input` with normal React input props; no state manager or `asChild`. Caller supplies type, label, value/defaultValue, events and validation. Shared `inputClass` is exported for the drawing.                                                                                                          | [shadcn Input](https://ui.shadcn.com/docs/components/radix/input)                                                                                                                                                     |
| [Label](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/label.tsx)                                                                                                                    | Radix Label Root, normally `label`; `tone`: default/micro. Inherits primitive `htmlFor` and `asChild`; an `asChild` span is text styling, not a label association. Caller supplies a matching control ID or valid wrapping label.                                                                              | [shadcn Label](https://ui.shadcn.com/docs/components/radix/label), [Radix Label](https://www.radix-ui.com/primitives/docs/components/label)                                                                           |
| [Pagination](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/pagination.tsx); PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis                                   | `nav` named Pages, `ul`, `li`, link `a` or `asChild`, hidden `span` dot. `isActive` drives current-page styling and `aria-current`; caller owns page calculation, accessible link names and navigation. No PaginationNext/Previous or link `size` prop.                                                        | [shadcn Pagination](https://ui.shadcn.com/docs/components/radix/pagination)                                                                                                                                           |
| [RadioGroup](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/radio-group.tsx); RadioGroupItem, RadioGroupInput, RadioGroupCircle, RadioGroupIndicator                                 | Root `div[role=radiogroup]` or `asChild` owns accessible-name check and shared input `name`; item `label`, input native radio, circle/indicator `span`. Caller sets each input's checked/defaultChecked/value/onChange. No root selection value/onValueChange or primitive roving-focus API.                   | [shadcn Radio Group](https://ui.shadcn.com/docs/components/radix/radio-group), [Radix Radio Group](https://www.radix-ui.com/primitives/docs/components/radio-group)                                                   |
| [Ribbon](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/ribbon.tsx)                                                                                                                  | Positioned `div` with internal band/track; required `items` string array and optional `separator`, no children slot. Empty items render nothing; duplicated scrolling text is aria-hidden. Caller owns positioning context and an accessible presentation of any meaningful text elsewhere.                    | Marquee addition; no counterpart is claimed in the checked [shadcn catalog](https://ui.shadcn.com/docs/components).                                                                                                   |
| [Separator](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/separator.tsx)                                                                                                            | Radix Separator Root, normally `div`; horizontal by default, with inherited `orientation`, `decorative` and `asChild`. Marquee does not set `decorative` for you. Caller chooses whether it carries separator semantics and gives a vertical separator a sized parent.                                         | [shadcn Separator](https://ui.shadcn.com/docs/components/radix/separator), [Radix Separator](https://www.radix-ui.com/primitives/docs/components/separator)                                                           |
| [Sheet](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/sheet.tsx); SheetPortal, SheetTrigger, SheetOverlay, SheetContent, SheetTitle, SheetDescription, SheetClose, SheetBody        | Radix Dialog Root and parts; Content automatically wraps its content in Portal + Overlay and adds a decorative handle. Mobile bottom, centered at `md`; Body is an optional scrolling `div`. No side/drag API, built-in close button, SheetHeader or SheetFooter.                                              | [shadcn Sheet](https://ui.shadcn.com/docs/components/radix/sheet), [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)                                                                         |
| [Switch](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/switch.tsx); SwitchInput, SwitchTrack, SwitchThumb                                                                           | Default `button[role=switch]` reads caller `aria-checked` (default false); click alone changes no state. Alternative `asChild` label host contains native checkbox SwitchInput with role switch. Track/thumb are `span`. No Radix checked/onCheckedChange API or automatic form mirror for the button.         | [shadcn Switch](https://ui.shadcn.com/docs/components/radix/switch), [Radix Switch](https://www.radix-ui.com/primitives/docs/components/switch)                                                                       |
| [Textarea](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/textarea.tsx)                                                                                                              | Native `textarea` with normal React textarea props; `textareaClass` builds on `inputClass` and adds vertical padding. Caller supplies rows, name, label, value/defaultValue and events. No autosize or controller.                                                                                             | [shadcn Textarea](https://ui.shadcn.com/docs/components/radix/textarea)                                                                                                                                               |
| [Toast](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/toast.tsx); ToastMessage, ToastAction                                                                                         | Caller-controlled `open`/`onDismiss`, optional duration (6000ms default), className/children. Body portal to shared stack; root `div[role=status]`, message `span`, action `button`. No manager, queue, promise API or Radix Toast parts.                                                                      | [shadcn Toast deprecation](https://ui.shadcn.com/docs/components/radix/toast), [Sonner](https://ui.shadcn.com/docs/components/radix/sonner), [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast) |
| [Toggle](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/src/toggle.tsx)                                                                                                                  | Native `button`, default type button and `aria-pressed=false`. Caller supplies state and click handler; `"mixed"` retains the attribute but draws unpressed. No asChild, pressed/defaultPressed/onPressedChange, variant/size or ToggleGroup.                                                                  | [shadcn Toggle](https://ui.shadcn.com/docs/components/radix/toggle), [Radix Toggle](https://www.radix-ui.com/primitives/docs/components/toggle)                                                                       |

## Form: wire one field, keep the controller

Marquee's Form family is accessibility wiring. It does not install React Hook Form,
run a schema, read controller errors or submit anything. Current shadcn's
[React Hook Form guide](https://ui.shadcn.com/docs/forms/react-hook-form) composes
`Controller` and `Field` parts. If migrating a
[legacy shadcn Form/FormField composition](https://v3.shadcn.com/docs/components/form),
retain the controller yourself and replace the field markup deliberately; these names
are not provider/controller aliases.

`FormItem` requires exactly one detectable `FormControl`, and permits at most one each
of FormLabel, FormDescription and FormMessage. Give distinct controls distinct items;
use native fieldset/legend markup for a group. The child walk recognizes these parts
through fragments/plain wrappers, not arbitrary component output. Compose the complete
field in one client component; parts created across a Server Component boundary can
arrive as lazy references that the walk cannot recognize. This is a source constraint,
not a claim that an SSR framework has been validated.

`FormControl` clones one child and writes its generated `id`, conditional `aria-invalid`
and `aria-describedby`. Do not supply `id` or `aria-invalid` to FormControl, or any of
`id`, `aria-invalid`, `aria-describedby` on its direct child: those uses throw. Additional
description IDs go on FormControl and precede the generated IDs. Your child must forward
the supplied props to its actual control. FormLabel owns `htmlFor` and refuses `asChild`.

With these parts imported from their copied files, this is the field shape:

```tsx
<form onSubmit={handleSubmit}>
  <FormItem invalid={Boolean(emailError)}>
    <FormLabel>Email</FormLabel>
    <FormControl aria-describedby="privacy-note">
      <Input
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
      />
    </FormControl>
    <FormDescription>Use an address you can receive mail at.</FormDescription>
    <FormMessage>{emailError}</FormMessage>
  </FormItem>
  <p id="privacy-note">Your address is private.</p>
  <Button type="submit">Save</Button>
</form>
```

The example assumes caller-owned `email`, `emailError`, `setEmail` and `handleSubmit`.
`invalid` changes wiring/rendering; it does not invalidate the browser's native form or
block submission. FormMessage renders only while invalid, with `role="alert"` by default.
DOM role/description assertions do not prove when a screen reader speaks; validate the
error flow with the assistive technology your application supports. Resetting controlled
values and errors, choosing focus after failure and composing a form-wide summary remain
the caller's responsibilities.

## Sheet: a responsive Dialog presentation

Marquee Sheet inherits Radix Dialog root props such as `open`, `defaultOpen`,
`onOpenChange` and `modal`; default modal behavior belongs to Radix. Content forwards
Dialog.Content props, including its focus/outside-interaction callbacks. Supply a
SheetTitle and an appropriate description, or explicitly omit description wiring with
`aria-describedby={undefined}` when there is no description.

`SheetContent` already creates its Portal and Overlay. Do not wrap it in another
SheetPortal just because a raw Radix Dialog example uses an explicit portal. The exported
Portal/Overlay parts are available, but SheetContent has no portal-container or overlay
configuration prop. Compose a SheetClose control yourself, commonly with `asChild` and
Button; no close icon is inserted. Use SheetBody for scrolling content, or leave it out
when a child owns its scrolling.

Current [shadcn Sheet](https://ui.shadcn.com/docs/components/radix/sheet) documents four
`side` values and `showCloseButton`. Those are not Marquee props. Marquee's mobile handle
is decorative; dragging it does not resize or dismiss the sheet. Its defaults place it
at the bottom below `md` and at the center from `md` upward. Caller classes may alter
presentation, but a four-edge or gesture implementation is not part of this contract.

Passing `role="alertdialog"` changes the exposed role, not the primitive's confirmation
behavior. The existing Sheet story asserts role and description only. For a confirmation,
use the separate Marquee AlertDialog family, whose primitive owns the action/cancel focus
and dismissal behavior; see [recipe contracts](./recipe-contracts.md).

## Toast: request dismissal, do not infer a manager

Current [shadcn Radix Toast](https://ui.shadcn.com/docs/components/radix/toast) is deprecated
in favor of [Sonner](https://ui.shadcn.com/docs/components/radix/sonner). Sonner's Toaster
and imperative `toast()` calls are not Marquee's Toast API. Nor is Marquee a wrapper for
the [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast) Provider,
Viewport, pause/resume and swipe behavior.

An open Marquee Toast renders into a shared body-level stack. Each owner supplies
`onDismiss` and must update `open` to close it. The timer calls that callback after
`duration`; it does not change open state itself. ToastAction runs its `onClick` callback
and then requests dismissal after that callback returns. There is no dedicated Close
part or preventDefault veto of that dismissal. Toast takes its declared props, not the
full set of native div props.

The shared stack provides placement, not queueing or replacement. Separate Toast owners
can render separate toasts there at once. If your application wants one toast, replacement,
deduplication, promise updates or a queue, it must manage that explicitly. The timer effect
depends on `open`, `duration` and `onDismiss`; changing message text alone does not restart
it. A changed React `key` remounts the toast for an intentional replacement. A changed
callback identity also restarts the effect, so use a stable callback when preserving its
elapsed time matters.

The rendered root has `role="status"`, but it is mounted together with its content and
removed while closed. There is no persistent empty live region or verified screen-reader
announcement flow. Do not describe it as automatically announcing every message. If the
app needs reliable announcements, design and test its
[live-region lifecycle](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
explicitly.
The same distinction applies to adding a role to Alert: that family supplies no default
live-region lifecycle. Existing role assertions establish DOM semantics, not audible output.

## Native choices: move props onto the input

For Checkbox, put state and form props on CheckboxInput, inside the Checkbox label:

```tsx
<Checkbox>
  <CheckboxInput
    name="updates"
    checked={updates}
    onChange={(event) => setUpdates(event.currentTarget.checked)}
  />
  <CheckboxBox>
    <CheckboxIndicator />
  </CheckboxBox>
  <span>Receive updates</span>
</Checkbox>
```

Use `defaultChecked` instead of checked/onChange for a native uncontrolled input.
`disabled` and `required` also belong on the input. The wrapping label gives it its name
and the drawing reads checkedness through `:checked`. Keep other controls outside the
label. CheckboxInput throws outside Checkbox; the label root refuses `asChild`.

[Radix Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) supports
`checked="indeterminate"`. Marquee has no equivalent prop or mixed-state drawing.
The native DOM [indeterminate property](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox)
exists, but setting it with a ref does not add a Marquee indicator style: its drawing
only reacts to `:checked`. Such a custom composition needs its own visual/semantic
validation. `aria-checked="mixed"` alone does not change native checkedness or the drawing.

RadioGroup supplies one shared `name`, generated if omitted. Pass an explicit name when
reading a known FormData field. Give the group a non-empty aria-label, aria-labelledby
pointing to a real label, or an `asChild` fieldset with a legend. The source rejects a
missing accessible name and role overrides; it checks the presence of aria-labelledby, not whether
its target actually names the group. The caller still owns that association.

```tsx
<RadioGroup name="density" aria-label="Density">
  {options.map((option) => (
    <RadioGroupItem key={option.value}>
      <RadioGroupInput
        value={option.value}
        checked={density === option.value}
        onChange={(event) => setDensity(event.currentTarget.value)}
      />
      <RadioGroupCircle>
        <RadioGroupIndicator />
      </RadioGroupCircle>
      <span>{option.label}</span>
    </RadioGroupItem>
  ))}
</RadioGroup>
```

This assumes caller-owned options, density and setDensity. Unlike
[Radix Radio Group](https://www.radix-ui.com/primitives/docs/components/radio-group),
selection is not a root `value`/`onValueChange` pair; uncontrolled initial selection uses
`defaultChecked` on each input. A radio input refuses its own `name` and requires the
group context. An item is a label and refuses `asChild`; compose the actual input inside
that label. Group-level disabled/required/loop/orientation behavior is not reimplemented;
use input props or appropriate native form grouping. Keyboard behavior comes from native
radios, not Radix's roving-focus implementation.

The native inputs participate in FormData according to their checked/name/value state;
the existing stories assert specific Checkbox/RadioGroup selections and values. Those
checks do not establish every validation or reset path. With controlled choices, the
caller must reconcile React state on form reset; a form controller adapter must map
native events rather than forwarding a shadcn onCheckedChange/onValueChange contract.

## Switch, Toggle and Avatar: supply what the part does not own

**Switch has two hosts.** Its default button has role switch, type button and an off
ARIA default; caller `aria-checked` plus `onClick` owns a change. Import SwitchTrack and
SwitchThumb and nest the thumb inside the track. There is no checked/defaultChecked or
onCheckedChange root API. The button host does not serialize its boolean state into
FormData; choose the native host or provide your own form integration.

For the native host, compose `Switch asChild` over a label containing SwitchInput,
SwitchTrack/SwitchThumb and label text. Put checked/defaultChecked, onChange, name,
required and disabled on SwitchInput. The asChild branch omits the root's default role
and type and strips its aria-checked prop; the input supplies semantics/state. Child
props still belong to the caller: do not put a conflicting role or aria-checked on the
label. The source does not validate every possible asChild element.

**Toggle is a caller-controlled button.** Keep its name stable and supply aria-pressed
and onClick. Native button activation supplies keyboard clicks; the component adds no
state transition. Radix's pressed/defaultPressed/onPressedChange and shadcn's variant/size
are not accepted APIs. Native form reset cannot reset caller state for this button, and
there is no hidden form input. The `"mixed"` ARIA value draws as unpressed; it is not a
supported three-state presentation.

**Avatar is a sized box and a native image.** Size the root with className, supply the
required image src and decide whether alt text should name it or be empty because an
adjacent label already does. AvatarImage defaults alt to empty; it does not infer a name.
Image `edge` is default/thin/none and `ground` is surface/raised. AvatarBadge supports
default/thin edge and is always aria-hidden, so meaningful status also needs accessible
text elsewhere. Its mark size can use `--avatar-mark-size`; it is not an image fallback.

Radix Avatar's image waits for loading and its Fallback handles loading/errors. Marquee
renders a native img immediately and has no load-status manager, fallback part, root
size prop or group/count API. Root asChild can make the face a link/control, but its name
and 44px target then belong to you. AvatarImage and AvatarBadge refuse asChild. The root
uses inline-size containment and carries no dimensions: an unsized box is a caller error,
not automatic intrinsic-image sizing.

## Smaller migrations and Marquee additions

Review visual axes instead of matching variant names. Button's default width is full;
choose width auto for an inline action. Its armed danger style expresses appearance,
not a pending confirmation state. Badge and Alert use tone, and Card places padding
on the root rather than giving each part independent inset padding. Use CardTitle
asChild when the surrounding document needs a different heading level. Avoid copying
shadcn literal-color classes when a Marquee token role expresses the same purpose.

BreadcrumbSeparator is a span, so move a shadcn sibling-separator composition inside
BreadcrumbItem. PaginationEllipsis likewise goes inside PaginationItem; supply your own
previous/next links and readable page names. Routes, page windows and overflow decisions
are caller logic. With asChild links, keep the child's current-page attributes consistent
with the outer isActive prop; Slot child precedence can otherwise disagree with styling.

DescriptionList and Ribbon are Marquee additions, not evidence of extra shadcn catalog
coverage. DescriptionItem requires its own recognized terms followed by recognized
details, with at least one of each; value links/content belong inside DescriptionDetails.
Compose the whole list inside one client component when using Server Component boundaries.
The guards do not execute arbitrary component output at list level, so they do not prove
every possible caller composition valid.

Ribbon's internal text is decorative and its CSS stops animation under reduced motion.
Keep meaningful statements available elsewhere and supply the placement/layout context.
It is a positioned decoration, not an interactive carousel, announcement channel or
generic children-based scrolling container.

## Evidence and validation limits

The inventory is **source-supported** at the candidate revision recorded in the
[audit slice](https://github.com/marquee-ui/marquee-ui/blob/next/docs/slices/COMMON-API-AUDIT-1.md).
The following are **specific existing assertions**, read during this audit; their scope
is narrower than complete API, browser or assistive-technology equivalence.

| Evidence pointer                                                                                                                                                                                                                                                                                                                                               | What its assertions cover                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Form wiring tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/form-wiring.test.tsx) and [Form stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/form.stories.tsx)                                                                                                                                      | Unique/resolving IDs, conditional description/message wiring, duplicate/missing part refusal, owned-prop refusal and lazy-boundary diagnostics. Not controller, validation engine, submission or audible announcements.                                       |
| [Choice structure tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/choice-structure.test.tsx), [Checkbox stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/checkbox.stories.tsx), [RadioGroup stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/radio-group.stories.tsx) | Native hosts, group naming/shared names, misuse refusal; story label clicks, disabled selections, selected FormData values and a native radio keyboard sequence. Not an indeterminate presentation or exhaustive reset/validation/browser equivalence.        |
| [Switch stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/switch.stories.tsx) and [Toggle stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/toggle.stories.tsx)                                                                                                                                    | Caller state transitions and disabled examples; Switch native FormData and non-submitting default button. Toggle [drawing tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/toggle-drawing.test.tsx) also retain mixed as unpressed. |
| [Avatar structure](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/avatar-structure.test.tsx) and [drawing tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/avatar-drawing.test.tsx)                                                                                                                             | Part host restrictions, hidden badge, caller/root sizing declarations and compiled image/badge geometry. Not a network-error/loading fallback lifecycle or every browser layout.                                                                              |
| [Sheet stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/sheet.stories.tsx)                                                                                                                                                                                                                                                      | Opening, title/hidden title, Escape closing, decorative handle, role/description and child-owned scrolling composition. Role assertions do not prove AlertDialog semantics.                                                                                   |
| [Toast stories](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/stories/toast.stories.tsx)                                                                                                                                                                                                                                                      | Body portal/status role, action dismissal callback, closed absence and one caller-owned auto-dismiss flow. Not concurrent-manager behavior, pause/swipe, promise API or audible announcements.                                                                |
| [Navigation tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/nav-consumption.test.tsx), [Card tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/card-structure.test.tsx), [DescriptionList tests](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/description-list-structure.test.tsx)  | Native landmarks/list order/current-page attributes and Slot precedence; Card hosts/heading levels; guarded description-list structure and its explicit composition limits.                                                                                   |
| [Family stories](https://github.com/marquee-ui/marquee-ui/tree/next/packages/ui/stories) and [story runner](https://github.com/marquee-ui/marquee-ui/blob/next/packages/ui/test/stories.test.tsx)                                                                                                                                                              | Declared examples and plays, including Accordion disclosures, Input/Label association, Separator semantics and Ribbon empty/decorative rendering. A story's existence or a green runner does not prove every advertised primitive behavior.                   |

This documentation audit changes no component or test behavior. It adds no fresh browser,
screen-reader, SSR, form-controller or migration-application proof. Inherited Radix
behavior is identified from the wrapper and official primitive docs; it is not claimed
to have been separately exercised in every composition here. Full catalog/API parity,
additional managers and deferred behavior require a new implementation scope.
