import { expect, type Locator } from "@playwright/test";

/** Focus can arrive before Radix finishes moving its document Escape listener. */
export async function modalOwnsEscape(content: Locator, background: Locator) {
  await expect(background).toHaveCSS("pointer-events", "none");
  await expect(content).toHaveCSS("pointer-events", "auto");
  await content.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}
