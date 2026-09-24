import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "@/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/card";

const meta = { title: "Parts/Card", component: Card } satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Hollow Knight</CardTitle>
          <CardDescription>Finished, 41 hours</CardDescription>
        </CardHeader>
        <CardContent>A card is a surface, and every part of it is a slot.</CardContent>
        <CardFooter>
          <Button variant="secondary">Open</Button>
        </CardFooter>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The title is a heading, so a page of cards has an outline.
    await expect(canvas.getByRole("heading", { name: "Hollow Knight" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Open" })).toBeInTheDocument();
  },
};

/** Bare: header and footer are optional, the surface is not. */
export const ContentOnly: Story = {
  args: { children: <CardContent>Just content.</CardContent> },
};

/**
 * The caller's element as the card, through `asChild`: an `<article>` a reader can
 * select by tag, wearing the card's slot and drawing.
 */
export const AsAnArticle: Story = {
  render: () => (
    <Card asChild>
      <article aria-label="A review of Hollow Knight">
        <CardContent>The card is the article, not a div around it.</CardContent>
      </article>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("article", { name: "A review of Hollow Knight" });
    await expect(card.tagName).toBe("ARTICLE");
    await expect(card).toHaveAttribute("data-slot", "card");
    await expect(canvasElement.querySelectorAll('[data-slot="card"]')).toHaveLength(1);
  },
};

/** The title at the page's heading level, through `asChild`: an `<h2>` with the title's slot. */
export const TitleAtAnotherLevel: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle asChild>
          <h2>Hollow Knight</h2>
        </CardTitle>
      </CardHeader>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByRole("heading", { level: 2, name: "Hollow Knight" });
    await expect(title).toHaveAttribute("data-slot", "card-title");
  },
};
