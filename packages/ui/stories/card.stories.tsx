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
