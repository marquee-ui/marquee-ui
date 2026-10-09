import { useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "@/button";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "@/slider";

const meta = { title: "Parts/Slider", component: Slider } satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EndpointAlignment: Story = {
  render: () => (
    <DirectionProvider dir="rtl">
      <div className="flex w-full flex-col gap-6">
        <Slider min={10} max={90} defaultValue={[50]}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb asChild aria-label="Inherited RTL">
            <span />
          </SliderThumb>
        </Slider>
        <Slider inverted min={10} max={90} defaultValue={[50]}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb aria-label="Inverted RTL" />
        </Slider>
        <Slider orientation="vertical" inverted min={10} max={90} defaultValue={[50]}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb aria-label="Inverted vertical" />
        </Slider>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    for (const thumb of within(canvasElement).getAllByRole("slider")) {
      thumb.focus();
      await userEvent.keyboard("{End}");
      await expect(thumb).toHaveAttribute("aria-valuenow", "90");
      await userEvent.keyboard("{Home}");
      await expect(thumb).toHaveAttribute("aria-valuenow", "10");
    }
  },
};

function SingleParts() {
  return (
    <>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb aria-label="Volume" />
    </>
  );
}

function RangeParts() {
  return (
    <>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb aria-label="Minimum" />
      <SliderThumb aria-label="Maximum" />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Slider defaultValue={[40]} step={5}>
      <SingleParts />
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole("slider", { name: "Volume" });
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "45");
    await userEvent.keyboard("{End}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{Home}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "0");
  },
};

export const Controlled: Story = {
  render: function ControlledSlider() {
    const [value, setValue] = useState([40]);
    const [committed, setCommitted] = useState([40]);
    return (
      <div className="w-full">
        <Slider value={value} onValueChange={setValue} onValueCommit={setCommitted}>
          <SingleParts />
        </Slider>
        <p role="status">Committed: {committed[0]}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("slider", { name: "Volume" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("slider", { name: "Volume" })).toHaveAttribute(
      "aria-valuenow",
      "41",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Committed: 41");
  },
};

export const Range: Story = {
  render: () => (
    <Slider defaultValue={[20, 80]} step={5} minStepsBetweenThumbs={2}>
      <RangeParts />
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const low = canvas.getByRole("slider", { name: "Minimum" });
    low.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(low).toHaveAttribute("aria-valuenow", "25");
    await expect(canvas.getByRole("slider", { name: "Maximum" })).toHaveAttribute(
      "aria-valuenow",
      "80",
    );
  },
};

export const ControlledRange: Story = {
  render: function ControlledRangeSlider() {
    const [value, setValue] = useState([20, 80]);
    return (
      <Slider
        value={value}
        onValueChange={setValue}
        step={5}
        preserveThumbOrder
        minStepsBetweenThumbs={2}
      >
        <RangeParts />
      </Slider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("slider", { name: "Maximum" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("slider", { name: "Minimum" })).toHaveAttribute(
      "aria-valuenow",
      "20",
    );
    await expect(canvas.getByRole("slider", { name: "Maximum" })).toHaveAttribute(
      "aria-valuenow",
      "75",
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Slider disabled defaultValue={[40]}>
      <SingleParts />
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole("slider", { name: "Volume" });
    await expect(thumb).toHaveAttribute("data-disabled");
    await expect(thumb).not.toHaveAttribute("tabindex");
    await userEvent.click(thumb);
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
  },
};

export const Vertical: Story = {
  render: () => (
    <Slider orientation="vertical" defaultValue={[40]}>
      <SingleParts />
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole("slider", { name: "Volume" });
    await expect(thumb).toHaveAttribute("aria-orientation", "vertical");
    thumb.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "41");
  },
};

export const RightToLeft: Story = {
  render: () => (
    <Slider dir="rtl" defaultValue={[40]}>
      <SingleParts />
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "39");
  },
};

export const Inverted: Story = {
  render: () => (
    <Slider inverted defaultValue={[40]}>
      <SingleParts />
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "39");
  },
};

export const InAForm: Story = {
  render: () => (
    <form aria-label="Volume settings" className="w-full">
      <Slider name="volume" defaultValue={[40]} step={5}>
        <SingleParts />
      </Slider>
      <Button type="reset" width="auto">
        Reset volume
      </Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Volume settings" }) as HTMLFormElement;
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await expect(new FormData(form).get("volume")).toBe("40");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(new FormData(form).get("volume")).toBe("45");
    await userEvent.click(canvas.getByRole("button", { name: "Reset volume" }));
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    await expect(new FormData(form).get("volume")).toBe("40");
  },
};

export const AsChild: Story = {
  render: () => (
    <Slider asChild defaultValue={[40]}>
      <section aria-label="Audio">
        <SliderTrack asChild>
          <div>
            <SliderRange asChild>
              <i />
            </SliderRange>
          </div>
        </SliderTrack>
        <SliderThumb asChild aria-label="Volume">
          <span />
        </SliderThumb>
      </section>
    </Slider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Audio" }).tagName).toBe("SECTION");
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "41");
  },
};
