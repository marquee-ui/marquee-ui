import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";
import "./theme.css";
import { applyTheme, readTheme } from "./theme";

const initialTheme = readTheme();
// Paint stored roles before React commits the first visible composition.
applyTheme(initialTheme);
createRoot(document.getElementById("root")!).render(<App initialTheme={initialTheme} />);
