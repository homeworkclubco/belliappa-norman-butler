---
name: new-block
description: Scaffold a new page-section block for the Pages CMS + Astro content system. Use when the user asks to "add a block", "create a new section type", "add a CMS block", or describes a new page-builder section (e.g. "add a testimonials block", "I need a stats counter section").
---

# New block scaffold

Blocks are page-builder sections rendered by `BlockRenderer.astro` and edited via Pages CMS. Adding one touches **exactly 2 files you edit by hand**:

1. `.pages.yml` — the CMS schema (source of truth)
2. `src/components/blocks/{PascalName}.astro` — the new component

Two other files update themselves and must **never be edited manually**:

- `src/content.config.ts` — **auto-generated** from `.pages.yml` by `astro-pagescms` (note the header comment in the file). Editing it does nothing — your changes will be overwritten on the next build. After you edit `.pages.yml`, this file regenerates automatically.
- `BlockRenderer.astro` — auto-discovers blocks via `import.meta.glob`.

## Flow

1. **Ask the user** (if not already given):
   - Block name in natural language (e.g. "testimonials carousel")
   - Fields it needs, in plain English — for each: name, purpose, required?, single vs list
2. **Derive**:
   - `camelCase` name with `Block` suffix → CMS `name` + Astro `section.type` (e.g. `testimonialsCarouselBlock`). This must match every other block in this repo — `imageHeroBlock`, `headingBlock`, etc. The `BlockRenderer.astro` auto-dispatcher lowercases the first letter of the filename, so `TestimonialsCarouselBlock.astro` → key `testimonialsCarouselBlock`.
   - `PascalCase` component filename (e.g. `TestimonialsCarouselBlock.astro`)
3. **Echo the derived spec back** as a tiny table (name → type → required?) and ask for confirmation before writing.
4. **Scaffold the 2 hand-edited files** (below). Build the layout with layout primitives (`Stack`, `Cluster`, `Sidebar`, `Switcher`, `Grid`, `Center`, `Cover`, `Frame`, `Reel`, `Imposter`) — do NOT hand-roll flex/grid in CSS. Only fall back to CSS for the things primitives genuinely can't express. Leave a `{/* TODO: refine styling */}` comment for fine polish.
5. **Do NOT run the dev server or typecheck** unless asked. Report the edits and stop.

## The touchpoints

### 1. `.pages.yml` (hand-edit)

Append under `content[0].fields` → the field with `name: sections` → `blocks:`. Match existing YAML style (inline `{ }` for short field defs, block style for nested).

### 2. `src/content.config.ts` (DO NOT EDIT — auto-generated)

This file is regenerated from `.pages.yml` on every build by `astro-pagescms`. **Never edit it manually.** The field-type mapping table below tells you what the generator will produce, so you can write `.pages.yml` correctly — but the only file you save is `.pages.yml`.

### 3. `src/components/blocks/{PascalName}.astro` (new file)

New file. Skeleton:

```astro
---
import Container from "@components/layout/Container.astro";
import Section from "@components/layout/Section.astro";
import Stack from "@components/layout/Stack.astro";
import Heading from "@components/display/Heading.astro";
import Prose from "@components/display/Prose.astro";

interface Props {
  // mirror the zod variant, minus `type`
}

const { /* destructure */ } = Astro.props;
---

<Section padding="xl">
  <Container>
    <Stack space="lg">
      {heading && <Heading as="h2" set:html={heading} />}
      {body && <Prose><Fragment set:html={body} /></Prose>}
      {/* TODO: final layout + styling — user will refine */}
    </Stack>
  </Container>
</Section>
```

Use `Heading` (never bare `<h1>`/`<h2>`/etc.) and prefer `set:html` for single-string content — see "Display primitives" and "Prefer `set:html`" sections below.

### `BlockRenderer.astro` is also automatic — do not edit

`BlockRenderer.astro` uses `import.meta.glob` to discover every `*.astro` in `src/components/blocks/` and dispatches by `section.type`. As long as the **PascalCase filename → camelCase key** matches the `type` literal in `content.config.ts` and the `name` in `.pages.yml`, the block renders. No edits needed there.

## Field-type mapping (`.pages.yml` → generated zod → TS prop)

Reference only — you write the `.pages.yml` entry, the generator produces the zod. Use this table to know what TS types your component's `Props` should mirror.


| Pages CMS `type`              | zod                                               | TS prop type                              | Notes |
|-------------------------------|---------------------------------------------------|-------------------------------------------|-------|
| `string`                      | `z.string()`                                      | `string`                                  | single-line text |
| `text`                        | `z.string()`                                      | `string`                                  | multi-line plain |
| `rich-text`                   | `z.string()`                                      | `string` (HTML)                           | render via `<Fragment set:html={body} />` inside `<Prose>` |
| `number`                      | `z.number()`                                      | `number`                                  | |
| `boolean`                     | `z.boolean()`                                     | `boolean`                                 | |
| `date`                        | `z.string()` or `z.coerce.date()`                 | `string \| Date`                          | stored as ISO string |
| `image`                       | `image().or(z.string())`                          | `ImageMetadata \| string`                 | use Astro `<Image>` for optimised output |
| `file`                        | `z.string()`                                      | `string` (path)                           | |
| `select` (single)             | `z.union([z.literal("a"), z.literal("b")])`       | `"a" \| "b"`                              | values from `options.values` |
| `select` (multiple)           | `z.array(z.union([z.literal(...), ...]))`         | `("a" \| "b")[]`                          | `options.multiple: true` |
| `reference` (single)          | `z.string()` (uuid or filename)                   | `string`                                  | lookup at render time via `getCollection()` |
| `reference` (list)            | `z.array(z.string()).default([])`                 | `string[]`                                | see `case_study_grid` pattern |
| `object`                      | `z.object({ ... })`                               | inline shape                              | |
| `object` + `list: true`       | `z.array(z.object({ ... }))`                      | `Array<{ ... }>`                          | see `tile_grid.items` |
| `uuid`                        | `z.string().optional()`                           | `string`                                  | |
| `code`                        | `z.string()`                                      | `string`                                  | |
| `component: image_with_alt`   | `z.object({ src: image(), alt: z.string().optional().default("") })` | `{ src; alt }` | reusable component defined in `.pages.yml` `components:` |

**Modifiers:**
- Field not `required: true` in YAML → `.optional()` on zod, `?` on TS prop
- `list: true` → wrap in `z.array(...)`; add `.default([])` if safe
- Defaults: `.default(value)` on zod when the YAML has a `default:`

## Conventions (this project)

- **Do NOT add `colorScheme` to new blocks.** Not used on this site.
- **Every new content collection gets a `uuid` field** (`type: uuid` in `.pages.yml`, `z.string().optional()` in zod). **All cross-collection relationships (`reference` fields) must key off `uuid`, not filename** — e.g. `options: { value: "{fields.uuid}" }`. Filenames change; UUIDs don't. See `case_studies` for the pattern. If a block references another collection, use UUIDs.
- Block `name` in `.pages.yml` and the `type` literal in `content.config.ts` **must match exactly** (camelCase, ending in `Block` — e.g. `enquiriesBlock`, `imageHeroBlock`).
- Always wrap in `<Section padding="...">` → `<Container>` → `<Stack>`. Never add padding to `Container`.
- Rich-text bodies: `{body && <Prose><Fragment set:html={body} /></Prose>}`.
- Images in a list inside a block: use `object` with `list: true`, fields `image` + a separate `imageAlt` string (see `tile_grid`).

### Layout primitives first

Reach for layout primitives from `@components/layout/*` **before** writing any flex/grid CSS. Most block layouts can be built entirely from composition — `Stack`, `Cluster`, `Sidebar`, `Switcher`, `Grid`, `Center`, `Cover`, `Frame`, `Reel`, `Imposter`. Only write custom CSS when no combination of primitives expresses the layout. If you find yourself writing `display: flex` or `display: grid` in a `<style>` block, stop and check whether a primitive already does it.

Don't write CSS values literally — use tokens (`var(--space-lg)`, `var(--color-accent)`, etc.).

### Display primitives: Heading, Prose

Headings: **always** use `@components/display/Heading.astro` — never bare `<h1>`/`<h2>`/etc. It exposes `as`, `size`, `weight`, `align`, `wrap`, `color`, `font`, `trim`, `truncate`, and `href` props that map to project design tokens. Bare `<h1>` skips the design system and forces ad-hoc CSS.

```astro
import Heading from "@components/display/Heading.astro";
<Heading as="h1" size="6" font="heading">{heading}</Heading>
```

Rich text: wrap in `Prose` (`@components/display/Prose.astro`) and render with `set:html`.

### Prefer `set:html` for static strings

When a value is a single plain string going into a single element, prefer the `set:html` (or `set:text` for plain text without escaping concerns) attribute over an explicit children expression — it keeps the markup tidier and renders the same HTML.

```astro
{/* ✅ preferred — tidy */}
<Heading as="h1" set:html={heading} />
<li set:html={`<a href="${href}">${text}</a>`} />

{/* also fine, but more verbose */}
<Heading as="h1">{heading}</Heading>
```

Use `set:html` especially for CMS-authored strings that may contain inline HTML, and to flatten short conditional/mapped list items into one line. Use children expressions when you genuinely need to compose multiple Astro components or apply complex conditionals.

### Media queries: desktop-first, use `breakpoints.css` tokens

This project is **desktop-first**. Write the desktop layout as the base, then narrow the layout for smaller screens using `max-width` queries.

**Always use the custom-media tokens from `src/styles/breakpoints.css`** — never hand-write `(min-width: ...)` or `(max-width: ...)` in pixels:

```css
/* ✅ correct: desktop-first, using tokens */
.thing {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (--md) {
  /* below 1024px */
  .thing { grid-template-columns: 1fr; }
}

/* ❌ wrong: mobile-first */
.thing { grid-template-columns: 1fr; }
@media (min-width: 1024px) { .thing { grid-template-columns: 1fr 1fr; } }

/* ❌ wrong: hardcoded pixels */
@media (max-width: 1023px) { ... }
```

Available tokens (see `src/styles/breakpoints.css`): `--2xs`/`--2xs-up` (420), `--xs`/`--xs-up` (520), `--sm`/`--sm-up` (768), `--md`/`--md-up` (1024), `--lg`/`--lg-up` (1280), `--xl`/`--xl-up` (1640), `--2xl`/`--2xl-up` (1920). The unsuffixed name is `max-width` (below the breakpoint); `-up` is `min-width` (at or above). Desktop-first means you'll mostly use the unsuffixed forms.

Leave final styling polish as a `{/* TODO */}` comment; the user refines.

## Worked example (condensed)

User: "Add a stats block with a heading and a list of stat items, each with a number and a label."

Derive:
- name: `statsBlock`, component: `StatsBlock.astro`
- fields: `heading` (string, optional), `items` (object list: `value` string, `label` string)

**`.pages.yml`** (append under `blocks:`):
```yaml
- name: statsBlock
  label: Stats Block
  fields:
    - { name: heading, label: Heading, type: string }
    - name: items
      label: Stats
      type: object
      list: true
      fields:
        - { name: value, label: Value, type: string }
        - { name: label, label: Label, type: string }
```

**`content.config.ts`** (add variant in discriminated union):
```ts
z.object({
  type: z.literal("statsBlock"),
  heading: z.string().optional(),
  items: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).default([]),
}),
```

**`StatsBlock.astro`** — skeleton using Section/Container/Stack + a Grid for items. No edits to `BlockRenderer.astro` needed.

## Checklist before finishing

- [ ] `.pages.yml` block entry added
- [ ] `src/content.config.ts` was NOT hand-edited (it regenerates from `.pages.yml`)
- [ ] Component created under `src/components/blocks/` (filename PascalCase, type literal camelCase)
- [ ] `name` in YAML and the component's `z.literal(...)` discriminator key are **byte-identical** (camelCase ending in `Block`)
- [ ] No `colorScheme` prop
- [ ] Layout built with primitives, not hand-rolled flex/grid
- [ ] All headings use `<Heading>` from `@components/display/Heading.astro` (no bare `<h1>`/`<h2>`/etc.)
- [ ] Single-string content uses `set:html` (or `set:text`) rather than verbose children expressions where it tidies the markup
- [ ] Any media queries are desktop-first and use `breakpoints.css` custom-media tokens
- [ ] Styling left as TODO for the user
