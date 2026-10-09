import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";
import "./theme.css";
import { applyTheme, readTheme } from "./theme";
import { legacyDestination } from "./routes";

const initialTheme = readTheme();
// Paint stored roles before React commits the first visible composition.
applyTheme(initialTheme);
const destination = legacyDestination(window.location);
if (destination) window.location.replace(destination);
else createRoot(document.getElementById("root")!).render(<App initialTheme={initialTheme} />);
