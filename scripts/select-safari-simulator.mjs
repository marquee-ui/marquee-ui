import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { devices } = JSON.parse(readFileSync(process.argv[2], "utf8"));
// Pin an installed iOS runtime; record the exact device rather than silently
// falling back to desktop Safari or a different unavailable simulator runtime.
const runtime = "com.apple.CoreSimulator.SimRuntime.iOS-26-2";
const device = devices[runtime]?.find((item) => item.isAvailable && item.name.startsWith("iPhone"));
assert.ok(device, `An available iPhone with runtime ${runtime} is required`);
console.log(process.argv.includes("--udid") ? device.udid : `SAFARI_DEVICE_UDID=${device.udid}`);
