import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Avatar, AvatarBadge, AvatarImage } from "@/avatar";

const meta = { title: "Parts/Avatar", component: Avatar } satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A data URI, not a file and not a network face: the story is the test, and a
 * test that fetches is a test that can fail for the weather. It is a 1x1
 * transparent gif, so what the stories below show is the part's chrome - which is
 * everything the part actually draws.
 */
const FACE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const Default: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src={FACE} />
      <AvatarBadge className="font-mono font-bold uppercase text-primary-ink">n</AvatarBadge>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    // The element IS an image. The part could have drawn a `background-image` on
    // a span and looked identical; it does not, because an `<img>` is what a
    // consumer's `alt`, a crawler and a broken-URL indicator all need.
    const img = canvasElement.querySelector('[data-slot="avatar-image"]')!;
    await expect(img.tagName).toBe("IMG");
    // Decorative by DEFAULT, which is a present-and-empty `alt` rather than no
    // `alt`: a missing one makes a screen reader read the file name aloud.
    await expect(img).toHaveAttribute("alt", "");
    await expect(within(canvasElement).queryAllByRole("img")).toHaveLength(0);

    // The mark is hidden from the tree and sits INSIDE the root, which is the
    // element that establishes its positioning context.
    const root = canvasElement.querySelector('[data-slot="avatar"]')!;
    const mark = canvasElement.querySelector('[data-slot="avatar-badge"]')!;
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect(root).toContainElement(mark as HTMLElement);
    await expect(root).toContainElement(img as HTMLElement);
    // The box is the CALLER's, on the root, and the image carries none of its own.
    await expect(root.getAttribute("class")).toContain("h-16 w-16");
    await expect(img.getAttribute("class")!.split(/\s+/)).not.toContain("h-16");
  },
};

/** A face somebody chose: no mark, and the shape is otherwise identical. */
export const NoBadge: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src={FACE} />
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="avatar-badge"]')).toBeNull();
    // The root is unchanged by the mark's absence: one shape, not two.
    const root = canvasElement.querySelector('[data-slot="avatar"]')!;
    await expect(root.getAttribute("class")).toContain("relative");
    await expect(root.children).toHaveLength(1);
  },
};

/**
 * `alt` is the caller's, for the one composition where the face is the only
 * thing there is: no handle beside it, so the image has to say who.
 */
export const Named: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src={FACE} alt="Nova" />
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Named, so it IS in the accessibility tree - the empty default is not a
    // fixed value.
    await expect(canvas.getByRole("img", { name: "Nova" })).toBeInTheDocument();
  },
};

/** The edge axis, all three values beside each other. */
export const Edges: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={FACE} />
      </Avatar>
      <Avatar className="h-[26px] w-[26px]">
        <AvatarImage src={FACE} edge="thin" />
      </Avatar>
      <Avatar className="h-9 w-9 overflow-hidden rounded-full bg-primary">
        <AvatarImage src={FACE} edge="none" />
      </Avatar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [thick, thin, none] = [
      ...canvasElement.querySelectorAll('[data-slot="avatar-image"]'),
    ].map((element) => element.getAttribute("class")!.split(/\s+/));
    // Read off the DOM rather than typed twice: what matters is that the three
    // are DIFFERENT and that only one of them declares nothing.
    await expect(thick).toContain("border-2");
    await expect(thin).toContain("border");
    await expect(thin).not.toContain("border-2");
    await expect(none).not.toContain("border");
    await expect(none).not.toContain("border-2");
  },
};

/**
 * The ground axis, on the composition that needs it: a drawn face with no
 * background of its own, on a card that is already `surface`.
 *
 * Left takes the default and disappears into the card - the ring between the head
 * and the rim is the same colour as the page behind it. Right names `raised` and
 * the face reads as a face. This is the story a consumer copies, so it shows the
 * two side by side rather than the good one alone.
 */
export const Ground: Story = {
  render: () => (
    <div className="flex items-center gap-4 rounded-md bg-surface p-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={FACE} />
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage src={FACE} ground="raised" />
      </Avatar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Class tokens, not resolved colours: this package proves the DECLARATIONS a
    // utility produces in `avatar-drawing.test.tsx` against the compiled sheet
    // (which is where both grounds are read back), and jsdom has no cascade to
    // ask. What a story can say is that the two faces do not wear the same one.
    const [fallback, raised] = [
      ...canvasElement.querySelectorAll('[data-slot="avatar-image"]'),
    ].map((element) => element.getAttribute("class")!.split(/\s+/));
    await expect(fallback).toContain("bg-surface");
    await expect(raised).toContain("bg-raised");
    await expect(raised).not.toContain("bg-surface");
  },
};

/**
 * The MARK's edge axis: the house's 2px, and the 1.5px the two smallest faces
 * draw because at 2px the ring eats the letter out of an ~11px circle.
 *
 * The boxes are the reference product's own 64 and 28, with its own mark sizes
 * on the seam, so the pair reads at the size the decision was taken at.
 */
export const MarkEdge: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar className="h-16 w-16 [--avatar-mark-size:0.68rem]">
        <AvatarImage src={FACE} />
        <AvatarBadge className="font-mono font-bold uppercase text-primary-ink">n</AvatarBadge>
      </Avatar>
      <Avatar className="h-7 w-7 [--avatar-mark-size:0.36rem]">
        <AvatarImage src={FACE} />
        <AvatarBadge edge="thin" className="font-mono font-bold uppercase text-primary-ink">
          n
        </AvatarBadge>
      </Avatar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [thick, thin] = [...canvasElement.querySelectorAll('[data-slot="avatar-badge"]')].map(
      (element) => element.getAttribute("class")!.split(/\s+/),
    );
    await expect(thick).toContain("border-2");
    await expect(thin).toContain("border-[1.5px]");
    await expect(thin).not.toContain("border-2");
    // Both marks keep the part's own ink and its seam: the axis moves the WIDTH
    // and nothing else, which is what makes it a width axis.
    await expect(thin).toContain("border-border-strong");
    await expect(thin).toContain("text-[length:var(--avatar-mark-size,17cqw)]");
  },
};

/**
 * The mark's type, resized by ONE declaration on the root.
 *
 * `--avatar-mark-size` is the seam, and it exists because a consumer's `cn` may
 * be a plain join: a second `text-*` on the mark would not replace the part's, it
 * would sit beside it and let the stylesheet decide.
 */
export const MarkSize: Story = {
  render: () => (
    <Avatar className="h-24 w-24 [--avatar-mark-size:0.95rem]">
      <AvatarImage src={FACE} />
      <AvatarBadge className="font-mono font-bold uppercase text-primary-ink">q</AvatarBadge>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector('[data-slot="avatar-badge"]')!;
    // The part still declares the var, not a size: the caller moved the VALUE,
    // so there is exactly one font-size declaration on the element.
    await expect(mark.getAttribute("class")).toContain("var(--avatar-mark-size,17cqw)");
    await expect(
      canvasElement.querySelector('[data-slot="avatar"]')!.getAttribute("class"),
    ).toContain("[--avatar-mark-size:0.95rem]");
  },
};

/**
 * A face that IS a link. `min-h-hit` is the CALLER's, and this story is what gets
 * copied: the package's floor guard resolves every `a[href]` a story renders
 * against the compiled stylesheet and demands 44px, so a 26px avatar-as-link
 * would redden the suite here rather than ship as a 26px tap target.
 */
export const AsChildLink: Story = {
  render: () => (
    <Avatar asChild className="h-11 w-11">
      <a href="#profile" aria-label="Nova's profile">
        <AvatarImage src={FACE} />
      </a>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Nova's profile" });
    // `asChild` puts the part's box and its positioning context on the CALLER's
    // element - there is no span left over wearing them.
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("data-slot", "avatar");
    await expect(link.getAttribute("class")).toContain("relative");
    await expect(canvasElement.querySelectorAll('[data-slot="avatar"]')).toHaveLength(1);
  },
};

/**
 * The overlapping stack two real strips draw independently: a ring in the PAGE's
 * ground cuts each circle out of the one behind it. It is the caller's, on the
 * root, and needs nothing from the part - which is the point of the root
 * declaring no box.
 */
export const Stack: Story = {
  render: () => (
    <div className="flex items-center">
      {["a", "b", "c"].map((key) => (
        <Avatar key={key} className="-mr-2 h-[34px] w-[34px] ring-2 ring-background">
          <AvatarImage src={FACE} />
        </Avatar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll('[data-slot="avatar"]');
    await expect(roots).toHaveLength(3);
    // The caller's ring and overlap land on the root beside the part's own
    // classes rather than replacing them.
    await expect(roots[0]!.getAttribute("class")).toContain("ring-2");
    await expect(roots[0]!.getAttribute("class")).toContain("shrink-0");
  },
};
