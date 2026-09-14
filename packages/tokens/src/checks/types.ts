/** One reason a preset does not publish. `detail` names both sides of the failing pair. */
export interface CheckFailure {
  check: "contrast" | "distinctness" | "round-trip";
  detail: string;
}
