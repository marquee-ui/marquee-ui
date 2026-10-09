import { useLayoutEffect, useState } from "react";
import { Button } from "@marquee-ui/ui";
import { ThemeStudio } from "./theme-studio";
import { applyTheme, readTheme, saveTheme, type ThemeSettings } from "./theme";
import { currentPage, pageUrl, pages } from "./routes";
import {
  HomePage,
  GettingStartedPage,
  ComponentsPage,
  CompositionPage,
  ThemesPage,
  SupportedStackPage,
  CommonNameApiPage,
  RecipeContractsPage,
} from "./pages";

const REPOSITORY = "https://github.com/marquee-ui/marquee-ui";
const guidePages = pages.filter((page) => page.path.startsWith("guides/"));

function Wordmark() {
  return (
    <a className="wordmark" href={pageUrl("home")} aria-label="Marquee UI home">
      <span className="logo-mark" aria-hidden="true">
        m.
      </span>
      marquee<span className="wordmark-ui">UI</span>
    </a>
  );
}

export function App({ initialTheme = readTheme() }: { initialTheme?: ThemeSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(initialTheme);
  const page = currentPage();
  const isGuide = page?.path.startsWith("guides/");
  useLayoutEffect(() => {
    applyTheme(settings);
    saveTheme(settings);
  }, [settings]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Wordmark />
        <Button
          className="menu-button"
          variant="ghost"
          width="auto"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </Button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={menuOpen ? "navigation is-open" : "navigation"}
        >
          {[
            ["getting-started", "Get started"],
            ["components", "Components"],
            ["themes", "Themes"],
            ["supported-stack", "Guides"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={pageUrl(id!)}
              onClick={() => setMenuOpen(false)}
              aria-current={
                page?.id === id || (id === "supported-stack" && isGuide) ? "page" : undefined
              }
            >
              {label}
            </a>
          ))}
          <a href={`${import.meta.env.BASE_URL}storybook/`}>
            Storybook <span aria-hidden="true">↗</span>
          </a>
          <a href={REPOSITORY}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <ThemeStudio settings={settings} onChange={setSettings} />
      <main id="main" tabIndex={-1}>
        {isGuide && (
          <nav className="guide-navigation" aria-label="Guide navigation">
            {guidePages.map((guide) => (
              <a
                key={guide.id}
                href={pageUrl(guide.id)}
                aria-current={guide.id === page?.id ? "page" : undefined}
              >
                {guide.label}
              </a>
            ))}
          </nav>
        )}
        {page?.id === "home" && <HomePage settings={settings} setSettings={setSettings} />}
        {page?.id === "getting-started" && <GettingStartedPage />}
        {page?.id === "components" && <ComponentsPage />}
        {page?.id === "themes" && <ThemesPage settings={settings} setSettings={setSettings} />}
        {page?.id === "composition" && <CompositionPage />}
        {page?.id === "supported-stack" && <SupportedStackPage />}
        {page?.id === "common-name-api" && <CommonNameApiPage />}
        {page?.id === "recipe-contracts" && <RecipeContractsPage />}
        {!page && (
          <section className="section-shell">
            <h1>Page not found.</h1>
            <p>Let’s get you back to the parts.</p>
            <a className="theme-jump" href={pageUrl("home")}>
              Go to the homepage
            </a>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <Wordmark />
        <p>Good parts. Your arrangement.</p>
        <a href={`${REPOSITORY}/blob/main/LICENSE`}>
          MIT license <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </>
  );
}
