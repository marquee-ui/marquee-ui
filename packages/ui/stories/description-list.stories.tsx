import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "@/description-list";

const meta = {
  title: "Parts/DescriptionList",
  component: DescriptionList,
} satisfies Meta<typeof DescriptionList>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The structure IS the deliverable, so every play reads it out of the DOM rather
 * than asserting a class.
 *
 * Three things, in one pass: the list's element children are ALL groups and
 * nothing else (an element between the `dl` and its groups is the invalid list
 * this family exists to stop); each group's element children are exactly a `dt`
 * then a `dd`, in that order, which is the whole of the association HTML gives a
 * description list; and the two carry the accessible roles a browser computes
 * from them (`term` / `definition`), which is the part a structural read alone
 * cannot see.
 */
function groupsOf(canvasElement: HTMLElement): { term: Element; details: Element }[] {
  const list = canvasElement.querySelector('dl[data-slot="description-list"]');
  if (list === null) throw new Error("no dl[data-slot=description-list] rendered");
  const groups: { term: Element; details: Element }[] = [];
  for (const child of [...list.children]) {
    if (child.tagName !== "DIV" || child.getAttribute("data-slot") !== "description-item") {
      throw new Error(
        `<dl> has a <${child.tagName.toLowerCase()}> child that is not a group: a dl's children are ` +
          `its groups, and anything else makes the list invalid`,
      );
    }
    const inner = [...child.children];
    const shape = inner.map((element) => element.tagName).join(",");
    if (shape !== "DT,DD") {
      throw new Error(`a group's element children are [${shape}], not exactly a DT then a DD`);
    }
    groups.push({ term: inner[0]!, details: inner[1]! });
  }
  if (groups.length === 0) throw new Error("the list rendered no groups");
  return groups;
}

/** Every term and detail also answers to the role a browser computes for it. */
async function expectRoles(canvasElement: HTMLElement, count: number): Promise<void> {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole("term")).toHaveLength(count);
  await expect(canvas.getAllByRole("definition")).toHaveLength(count);
}

/**
 * The bordered cell grid: the game page's Details treatment, which is the shape
 * the product's own comment says the member card copied (`MemberRow.tsx:90`).
 * The gridlines are the grid's own `gap-px` showing a `bg-border` backdrop
 * through, so the border and the rules are one colour by construction - and the
 * layout is entirely the caller's, which is the point.
 */
export const Default: Story = {
  render: () => (
    <DescriptionList className="grid grid-cols-2 gap-px overflow-hidden rounded-md border-2 border-border bg-border">
      <DescriptionItem className="bg-surface px-3 py-2.5">
        <DescriptionTerm>Developer</DescriptionTerm>
        <DescriptionDetails className="text-sm font-medium text-foreground">
          Studio Nine
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="bg-surface px-3 py-2.5">
        <DescriptionTerm>Released</DescriptionTerm>
        <DescriptionDetails className="text-sm font-medium text-foreground">
          14 Mar 2024
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="col-span-2 bg-surface px-3 py-2.5">
        <DescriptionTerm>Genre</DescriptionTerm>
        <DescriptionDetails className="text-sm font-medium text-foreground">
          Turn-based strategy
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const groups = groupsOf(canvasElement);
    await expect(groups).toHaveLength(3);
    await expectRoles(canvasElement, 3);
    // The term reaches ITS detail and not another group's: the pairing is
    // positional, so the check is that each dt's next sibling is its own dd.
    for (const { term, details } of groups) {
      await expect(term.nextElementSibling).toBe(details);
      await expect(term.parentElement).toBe(details.parentElement);
    }
    await expect(groups[0]!.term).toHaveTextContent("Developer");
    await expect(groups[0]!.details).toHaveTextContent("Studio Nine");
    // The list itself declares nothing: every class on it came from the caller.
    const list = canvasElement.querySelector("dl")!;
    await expect(list.className).toBe(
      "grid grid-cols-2 gap-px overflow-hidden rounded-md border-2 border-border bg-border",
    );
  },
};

/**
 * The term BESIDE its detail, baselines aligned, with the detail holding a figure
 * and a caption about it. The second of the two arrangements the product draws
 * (`ScoreBlock.tsx:227`), and the reason the detail carries no ink of its own:
 * what varies is what is inside it.
 */
export const Inline: Story = {
  render: () => (
    <DescriptionList className="flex flex-col gap-2">
      <DescriptionItem layout="inline">
        <DescriptionTerm>Median</DescriptionTerm>
        <DescriptionDetails className="flex flex-1 flex-wrap items-baseline gap-2">
          <span className="font-display text-xl leading-none text-foreground">4.3</span>
          <span className="text-xs leading-snug text-foreground-2">
            midpoint of every rating · half rated higher, half lower
          </span>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem layout="inline">
        <DescriptionTerm>Average</DescriptionTerm>
        <DescriptionDetails className="flex flex-1 flex-wrap items-baseline gap-2">
          <span className="text-base leading-none text-foreground">4.3</span>
          <span className="text-xs leading-snug text-foreground-2">plain mean of every rating</span>
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const groups = groupsOf(canvasElement);
    await expect(groups).toHaveLength(2);
    await expectRoles(canvasElement, 2);
    // The arrangement is the ITEM's, and it is the axis's second value: the two
    // stories' groups must not wear the same layout string.
    const item = groups[0]!.term.parentElement!;
    await expect(item.className).toContain("items-baseline");
    await expect(item.className).not.toContain("flex-col");
    // Two figures with the same text, each still reachable through its own term.
    await expect(groups[0]!.details).toHaveTextContent("4.3");
    await expect(groups[1]!.details).toHaveTextContent("4.3");
    await expect(groups[0]!.term).toHaveTextContent("Median");
    await expect(groups[1]!.term).toHaveTextContent("Average");
  },
};

/**
 * `tone="plain"`, for the two sites whose term is not a micro-caps label at all:
 * a prose title over a paragraph (`transparency/page.tsx:460`). The variant
 * declares nothing, so the caller's own single `text-*` has nothing to fight -
 * which matters because the consuming product's `cn` is a join, not a merge.
 */
export const Prose: Story = {
  render: () => (
    <DescriptionList className="flex flex-col gap-4">
      <DescriptionItem>
        <DescriptionTerm tone="plain" className="font-semibold text-foreground">
          A single headline number
        </DescriptionTerm>
        <DescriptionDetails className="leading-relaxed text-foreground-2">
          One figure invites an argument about the figure. Three invite an argument about which one
          to trust, which is the better argument to have.
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm tone="plain" className="font-semibold text-foreground">
          Deleting outlier ratings
        </DescriptionTerm>
        <DescriptionDetails className="leading-relaxed text-foreground-2">
          Removing a rating someone meant is worse than showing that it was unusual.
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const groups = groupsOf(canvasElement);
    await expect(groups).toHaveLength(2);
    await expectRoles(canvasElement, 2);
    // `plain` really is empty: the term wears the caller's two utilities and NONE
    // of the micro treatment's four. Stated as the whole class list rather than as
    // absences, so a variant that grew a fifth utility would redden too.
    for (const { term } of groups) {
      await expect(term.className).toBe("font-semibold text-foreground");
    }
  },
};

/**
 * The ledger's case: every number is a door, and the link lives INSIDE the `dd`.
 *
 * ⚠️ This is the composition the family refuses to let `asChild` take over. An
 * anchor as the group's third child - beside the `dt` and the `dd` rather than
 * inside one - is a real axe `definition-list` failure, and it is what the
 * profile ledger's docblock records hitting.
 *
 * The link carries `min-h-hit` because it is a control and the story is what gets
 * copied. The product's own version is an `absolute inset-0` overlay whose tap
 * band is the cell's height; a story cannot copy that without the cell, so this
 * draws the inline form with the floor stated on the link itself.
 */
export const LinkedFigure: Story = {
  render: () => (
    <DescriptionList className="grid grid-cols-2 gap-[2px] border-2 border-border bg-border">
      <DescriptionItem className="bg-background px-2 py-2">
        <DescriptionTerm>Followers</DescriptionTerm>
        <DescriptionDetails>
          <a
            href="#followers"
            className="inline-flex min-h-hit items-center font-display text-xl tabular-nums text-foreground"
          >
            128
          </a>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="bg-background px-2 py-2">
        <DescriptionTerm>Following</DescriptionTerm>
        <DescriptionDetails>
          <a
            href="#following"
            className="inline-flex min-h-hit items-center font-display text-xl tabular-nums text-foreground"
          >
            64
          </a>
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const groups = groupsOf(canvasElement);
    await expect(groups).toHaveLength(2);
    await expectRoles(canvasElement, 2);
    // The anchor is INSIDE the dd, which is the whole point of this story. Stated
    // both ways round, because "the link is in the group" is true of the invalid
    // composition too.
    const links = canvasElement.querySelectorAll("a[href]");
    await expect(links).toHaveLength(2);
    for (const link of links) {
      await expect(link.closest("dd")).not.toBeNull();
      await expect(link.parentElement!.tagName).toBe("DD");
    }
    // …and the group still holds exactly two elements, so nothing escaped to sit
    // beside the dt and the dd.
    for (const { term } of groups) {
      await expect(term.parentElement!.children).toHaveLength(2);
    }
  },
};

/**
 * The list as a live region: two numbers that are the answer to a control above
 * them, so a screen reader hears them change (`ImportPreview.tsx:212-227` and its
 * comment). `aria-live` is the caller's prop on the list and the family neither
 * writes nor removes it - the same posture `FormDescription` takes toward
 * `role="status"`.
 */
export const Live: Story = {
  render: () => (
    <DescriptionList aria-live="polite" className="grid grid-cols-2 gap-3">
      <DescriptionItem className="rounded-md border-2 border-border p-3">
        <DescriptionTerm className="text-2xs">Backlog</DescriptionTerm>
        <DescriptionDetails className="font-display text-xl tabular-nums text-foreground">
          312
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="rounded-md border-2 border-border p-3">
        <DescriptionTerm className="text-2xs">Played</DescriptionTerm>
        <DescriptionDetails className="font-display text-xl tabular-nums text-foreground">
          87
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const groups = groupsOf(canvasElement);
    await expect(groups).toHaveLength(2);
    await expectRoles(canvasElement, 2);
    const list = canvasElement.querySelector("dl")!;
    await expect(list).toHaveAttribute("aria-live", "polite");
    // The live region is the LIST, so both figures are inside it rather than
    // being two regions that announce separately.
    for (const { details } of groups) {
      await expect(list.contains(details)).toBe(true);
    }
  },
};

/**
 * Groups produced by a component rather than written out, which is what three of
 * the product's eight sites do (`Ledger`'s `Cell`, `ScoreBlock`'s `RawFigure`,
 * `reckoning`'s `Fact`).
 *
 * It is a story because it pins a DECISION: the list does not refuse an
 * unrecognised child type. A component is not an element, so a `<Fact/>` between
 * the `dl` and its group exists only in the source - and refusing it would reject
 * all three real sites while proving nothing. What the component renders is
 * checked inside `<DescriptionItem>`, where the check can actually see it.
 */
export const Composed: Story = {
  render: () => {
    const Fact = ({ label, value, note }: { label: string; value: string; note?: string }) => (
      <DescriptionItem className="border-2 border-border bg-surface p-3">
        <DescriptionTerm>{label}</DescriptionTerm>
        <DescriptionDetails className="flex flex-col gap-0.5">
          <span className="font-display text-xl tabular-nums text-foreground">{value}</span>
          {note !== undefined && <span className="text-2xs text-muted">{note}</span>}
        </DescriptionDetails>
      </DescriptionItem>
    );
    return (
      <DescriptionList className="grid grid-cols-2 gap-2">
        <Fact label="Hours" value="184" />
        <Fact label="Longest streak" value="12" note="days" />
        <Fact label="Top genre" value="Strategy" note="9 of 41" />
      </DescriptionList>
    );
  },
  play: async ({ canvasElement }) => {
    const groups = groupsOf(canvasElement);
    // Three groups, and the wrapper component left NO element of its own behind:
    // `groupsOf` throws on any non-group child of the list.
    await expect(groups).toHaveLength(3);
    await expectRoles(canvasElement, 3);
    // The conditional second span is content inside the dd, not a third child of
    // the group - which is the distinction the item's guard is drawn around.
    await expect(groups[0]!.details.children).toHaveLength(1);
    await expect(groups[1]!.details.children).toHaveLength(2);
    await expect(groups[1]!.details).toHaveTextContent("12");
    await expect(groups[1]!.details).toHaveTextContent("days");
  },
};
