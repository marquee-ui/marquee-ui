import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "@/components/ui/slider";

export default function SliderExample() {
  const [volume, setVolume] = useState([40]);
  const [window, setWindow] = useState([20, 80]);
  const [committed, setCommitted] = useState(40);
  const [saved, setSaved] = useState("");
  return (
    <form
      aria-label="Playback settings"
      className="flex w-full flex-col gap-4"
      onReset={() => {
        setVolume([40]);
        setWindow([20, 80]);
        setCommitted(40);
        setSaved("");
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaved(
          `Saved volume: ${data.get("volume")}; range: ${data.get("minimum")}–${data.get("maximum")}.`,
        );
      }}
    >
      <label htmlFor="playback-volume" className="text-sm font-semibold">
        Volume: {volume[0]}%
      </label>
      <Slider
        name="volume"
        value={volume}
        onValueChange={setVolume}
        onValueCommit={(value) => setCommitted(value[0]!)}
        step={5}
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb
          id="playback-volume"
          aria-label="Volume"
          aria-valuetext={`${volume[0]} percent`}
        />
      </Slider>
      <p role="status">Committed volume: {committed}%</p>

      <p id="playback-window" className="text-sm font-semibold">
        Playback window: {window[0]}–{window[1]} minutes
      </p>
      <Slider
        value={window}
        onValueChange={setWindow}
        step={5}
        minStepsBetweenThumbs={2}
        preserveThumbOrder
        aria-labelledby="playback-window"
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb
          name="minimum"
          aria-label="Start time"
          aria-valuetext={`${window[0]} minutes`}
        />
        <SliderThumb name="maximum" aria-label="End time" aria-valuetext={`${window[1]} minutes`} />
      </Slider>

      <div className="flex items-start gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Vertical level</p>
          <Slider name="level" orientation="vertical" defaultValue={[40]} step={5}>
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb aria-label="Vertical level" />
          </Slider>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-sm font-semibold">Right-to-left</p>
          <Slider dir="rtl" defaultValue={[40]} step={5}>
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb aria-label="Right-to-left balance" />
          </Slider>
          <p className="text-sm font-semibold">Inverted</p>
          <Slider inverted defaultValue={[40]} step={5}>
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb aria-label="Inverted balance" />
          </Slider>
          <p className="text-sm font-semibold">Unavailable</p>
          <fieldset disabled>
            <Slider disabled name="unavailable" defaultValue={[40]}>
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb aria-label="Unavailable balance" />
            </Slider>
          </fieldset>
        </div>
      </div>

      <p className="text-sm text-muted">
        Reset restores the initial values. Controlled sliders must accept the reset change; this
        form does. Radix still submits named disabled sliders on their own; a native disabled
        fieldset excludes the unavailable control's form value here.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" width="auto">
          Save playback
        </Button>
        <Button type="reset" variant="secondary" width="auto">
          Reset playback
        </Button>
      </div>
      <p role="status">{saved || "Adjust playback, then save."}</p>
    </form>
  );
}
