import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Switch,
  SwitchThumb,
  SwitchTrack,
} from "@marquee-ui/ui";
import { CopyCode } from "./copy-code";
import ProjectDetails from "./examples/composition";
import composition from "./examples/composition?raw";
import { ComponentExplorer } from "./explorer";
import { MarkdownGuide } from "./markdown-guide";
import gettingStarted from "../../../docs/getting-started.md?raw";
import supportedStack from "../../../docs/supported-stack.md?raw";
import commonNameApi from "../../../docs/common-name-api.md?raw";
import recipeContracts from "../../../docs/recipe-contracts.md?raw";
import { customizationRecipe, type ThemeSettings } from "./theme";

import { pageUrl } from "./routes";

const STORYBOOK = `${import.meta.env.BASE_URL}storybook/`;
export function StudioCard({
  expressive,
  onExpressiveChange,
}: {
  expressive: boolean;
  onExpressiveChange: (expressive: boolean) => void;
}) {
  return (
    <Card
      className={expressive ? "studio-card is-expressive" : "studio-card is-restrained"}
      radius="sharp"
    >
      <CardHeader>
        <div className="card-eyebrow">
          <Badge tone="primary">LIVE PREVIEW</Badge>
          <span>01 / YOUR NEXT THING</span>
        </div>
        <CardTitle asChild>
          <h2>
            Small parts.
            <br />
            Big personality.
          </h2>
        </CardTitle>
        <CardDescription>
          A card, a badge, a switch, a button.
          <br />
          Nothing hiding behind a configuration object.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="preview-setting">
          <div>
            <span>Make it expressive</span>
            <p className="expressive-description">
              {expressive
                ? "Display type, accent frame, hard shadow."
                : "Body type, quiet frame, soft shadow."}
            </p>
          </div>
          <Switch
            aria-label="Make it expressive"
            aria-checked={expressive}
            onClick={() => onExpressiveChange(!expressive)}
          >
            <SwitchTrack>
              <SwitchThumb />
            </SwitchTrack>
          </Switch>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <a href={pageUrl("components")}>
            Explore the parts <span aria-hidden="true">↗</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

type ThemePageProps = { settings: ThemeSettings; setSettings: (settings: ThemeSettings) => void };

export function HomePage({ settings, setSettings }: ThemePageProps) {
  return (
    <>
      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="signal-dot" /> REACT PARTS. ONE DESIGN LANGUAGE.
          </p>
          <h1 id="hero-title">
            Compose it
            <br />
            <span>your way.</span>
          </h1>
          <p className="hero-description">
            Opinionated about the details.
            <br />
            Open about what you build with them.
          </p>
          <p className="hero-detail">
            Expressive, accessible component parts. A coherent token system. Source you can make
            your own.
          </p>
          <div className="hero-actions">
            <Button width="auto" asChild>
              <a href={pageUrl("getting-started")}>
                Start building <span aria-hidden="true">↗</span>
              </a>
            </Button>
            <Button variant="ghost" width="auto" asChild>
              <a href={pageUrl("components")}>Meet the components</a>
            </Button>
          </div>
          <p className="hero-footnote">React 19 · Tailwind CSS 4 · shadcn registry · MIT</p>
        </div>
        <div className="hero-preview">
          <div className="preview-caption">
            <span>THE SYSTEM, IN ACTION</span>
            <span aria-hidden="true">↙</span>
          </div>
          <StudioCard
            expressive={settings.expressive}
            onExpressiveChange={(expressive) => setSettings({ ...settings, expressive })}
          />
          <p className="preview-note">
            Real parts. The switch changes this composition’s type, frame and depth.
          </p>
        </div>
      </section>
      <div className="principle-band">
        <span>COMPOSE, DON’T CONFIGURE</span>
        <span aria-hidden="true">✳</span>
        <span>ROLES, NOT RAW VALUES</span>
        <span aria-hidden="true">✳</span>
        <span>YOUR STRUCTURE. YOUR SOURCE.</span>
      </div>
      <section className="section-shell approach" aria-labelledby="approach-title">
        <div className="section-heading">
          <p className="eyebrow">01 / THE APPROACH</p>
          <h2 id="approach-title">
            Good foundations.
            <br />
            Room to play.
          </h2>
        </div>
        <div className="principles">
          <article>
            <span className="index-number">[01]</span>
            <h3>Parts over props</h3>
            <p>
              A header belongs inside a card. A card can sit inside an accordion. You arrange the
              pieces; the library handles their details.
            </p>
          </article>
          <article>
            <span className="index-number">[02]</span>
            <h3>A system that holds together</h3>
            <p>
              Ink, surface, action, type and depth have roles. Arcade gives them character. Your app
              gets one consistent language.
            </p>
          </article>
          <article>
            <span className="index-number">[03]</span>
            <h3>Source, in your hands</h3>
            <p>
              Install from a shadcn registry. Keep the component source in your project, with the
              tokens and dependencies it needs.
            </p>
          </article>
        </div>
      </section>
      <div className="section-shell home-next">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h2>Find your palette. Keep your personality.</h2>
        <a className="theme-jump" href={pageUrl("themes")}>
          Try the theme studio <span aria-hidden="true">↗</span>
        </a>
      </div>
    </>
  );
}

export function GettingStartedPage() {
  return (
    <section
      id="getting-started"
      className="section-shell docs-section"
      aria-labelledby="getting-started-title"
    >
      <div className="section-heading">
        <p className="eyebrow">GET STARTED</p>
        <h1 id="getting-started-title">From empty project to your first composition.</h1>
        <p>Start with the ready-to-run starter, or add Marquee to an existing React app.</p>
        <a className="theme-jump" href={pageUrl("themes") + "#theme-studio"}>
          Try the theme studio <span aria-hidden="true">↗</span>
        </a>
      </div>
      <MarkdownGuide source={gettingStarted} />
    </section>
  );
}

export function ComponentsPage() {
  return (
    <section
      id="components"
      className="section-shell docs-section"
      aria-labelledby="components-title"
    >
      <div className="section-heading">
        <p className="eyebrow">THE COMPONENTS</p>
        <h1 id="components-title">A kit of possibilities.</h1>
        <p>
          Thirty-five part families, including fourteen unreleased additions. Explore the variants
          and interactions in the full workbench.
        </p>
      </div>
      <ComponentExplorer />
      <div className="section-end">
        <p>Each family exposes named parts, with composition in the caller’s hands.</p>
        <Button variant="secondary" width="auto" asChild>
          <a href={STORYBOOK}>
            Open the full Storybook <span aria-hidden="true">↗</span>
          </a>
        </Button>
      </div>
    </section>
  );
}

export function CompositionPage() {
  return (
    <section
      id="composition"
      className="section-shell docs-section"
      aria-labelledby="composition-title"
    >
      <div className="section-heading">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h1 id="composition-title">Put the parts together.</h1>
        <p>A card inside an accordion is just that. No special card-accordion variant required.</p>
      </div>
      <div className="composition-layout">
        <div className="composition-preview">
          <p className="eyebrow">LIVE COMPOSITION</p>
          <ProjectDetails />
          <p className="preview-note">Click the disclosure, or focus it and press Enter.</p>
        </div>
        <CopyCode label="Card inside an accordion" code={composition} />
      </div>
    </section>
  );
}

export function ThemesPage({ settings, setSettings }: ThemePageProps) {
  return (
    <section id="tokens" className="section-shell docs-section" aria-labelledby="tokens-title">
      <div className="section-heading">
        <p className="eyebrow">THE DESIGN LANGUAGE</p>
        <h1 id="tokens-title">
          A role for <span>every detail.</span>
        </h1>
        <p>
          Choose a base palette for surfaces and identity, then an action accent for buttons, links
          and focus. Dark and Light work with every combination. Your choices repaint the page and
          every live preview.
        </p>
      </div>
      <div className="theme-preview-layout">
        <div>
          <StudioCard
            expressive={settings.expressive}
            onExpressiveChange={(expressive) => setSettings({ ...settings, expressive })}
          />
        </div>
        <div className="theme-preview-copy">
          <h2>Same parts. Your expression.</h2>
          <p>
            Use the theme picker to change the palette and action accent. Try the live card, then
            copy the CSS below.
          </p>
          <div className="hero-actions">
            <Button width="auto" asChild>
              <a href={pageUrl("getting-started")}>Start building</a>
            </Button>
            <a className="theme-jump" href="#theme-studio">
              Customize this theme
            </a>
          </div>
        </div>
      </div>
      <div className="token-swatches">
        {["background", "surface", "raised", "primary", "brand", "foreground"].map((role) => (
          <div key={role}>
            <span className="swatch" style={{ background: `var(--${role})` }} />
            <code>--{role}</code>
          </div>
        ))}
      </div>
      <p className="token-note">
        Use <code>bg-surface</code>, <code>text-foreground</code> and <code>shadow-lift</code>. The
        preset owns the palette, the font families and the shadows.
      </p>
      <div id="theme-recipe" className="theme-recipe">
        <h3>Your palette, as CSS.</h3>
        <p>
          This recipe matches your selected base palette, mode and action accent. These are local
          customizations, not preset exports in npm 0.1.0. The expressive switch changes this demo
          card’s composition; it does not change the library’s API.
        </p>
        <CopyCode
          label="Selected theme recipe"
          language="css"
          code={customizationRecipe(settings)}
        />
      </div>
    </section>
  );
}

export function SupportedStackPage() {
  return (
    <section
      id="supported-stack"
      className="section-shell docs-section support-section"
      aria-labelledby="support-title"
    >
      <div className="section-heading">
        <p className="eyebrow">BEFORE YOU BUILD</p>
        <h1 id="support-title">Know the contract.</h1>
      </div>
      <MarkdownGuide source={supportedStack} />
    </section>
  );
}

export function CommonNameApiPage() {
  return (
    <section
      id="common-name-api"
      className="section-shell docs-section"
      aria-labelledby="common-api-title"
    >
      <div className="section-heading">
        <p className="eyebrow">COMPONENT CONTRACTS</p>
        <h1 id="common-api-title">Familiar names. Explicit contracts.</h1>
      </div>
      <MarkdownGuide source={commonNameApi} tableLabel="Original family contracts" />
    </section>
  );
}

export function RecipeContractsPage() {
  return (
    <section
      id="recipe-contracts"
      className="section-shell docs-section"
      aria-labelledby="recipe-contracts-title"
    >
      <div className="section-heading">
        <p className="eyebrow">CANDIDATE CONTRACTS</p>
        <h1 id="recipe-contracts-title">Compose the newer families.</h1>
      </div>
      <MarkdownGuide source={recipeContracts} tableLabel="Candidate family contracts" />
    </section>
  );
}
