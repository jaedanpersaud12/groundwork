<!-- Generated from contract.json v1.0.0. Do not edit. -->
# Token contract

Components use only these names, as Tailwind utilities (`bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`).
Never hex values, arbitrary colours (`bg-[#fff]`) or palette classes (`text-gray-500`).

Opacity modifiers are allowed (`bg-primary/10`). Radius comes from `rounded-xs` … `rounded-xl`, scaled from `--radius`.

## surface

| Token | Required | Role |
| --- | --- | --- |
| `background` | yes | Page ground. |
| `foreground` | yes | Primary text on background. |
| `card` | yes | Card and panel ground. |
| `card-foreground` | yes | Text on card. |
| `popover` | yes | Floating surfaces: popovers, menus, listboxes. |
| `popover-foreground` | yes | Text on popover. |
| `muted` | yes | Quiet fill: table header, row hover, disabled field. |

## text

| Token | Required | Role |
| --- | --- | --- |
| `muted-foreground` | yes | Secondary text: labels, meta, table headers. |
| `subtle-foreground` | yes | Tertiary text: placeholders, captions, weekday labels. Lowest contrast that still reads. |

## action

| Token | Required | Role |
| --- | --- | --- |
| `primary` | yes | Brand action: primary button, selected state, links. |
| `primary-foreground` | yes | Text and icons on primary. |
| `secondary` | yes | Secondary button fill. |
| `secondary-foreground` | yes | Text on secondary. |
| `accent` | yes | Hover/highlight fill for menu items and ghost controls. Not the brand colour. |
| `accent-foreground` | yes | Text on accent. |

## line

| Token | Required | Role |
| --- | --- | --- |
| `border` | yes | Default hairline for cards, tables, dividers. |
| `input` | yes | Form control border. |
| `ring` | yes | Focus ring. |

## status

| Token | Required | Role |
| --- | --- | --- |
| `destructive` | yes | Errors and destructive actions. Must read as small text on background and on its own 10% tint. |
| `destructive-foreground` | yes | Text on a destructive fill. |
| `destructive-subtle` | yes | Tinted ground for error banners and tags; text on it uses destructive. |
| `success` | yes | Positive state. Must read as small text on background and on its own 10% tint. |
| `success-foreground` | yes | Text on a success fill. |
| `success-subtle` | yes | Tinted ground for success banners and badges; text on it uses success. |
| `warning` | yes | Needs-attention state. Must read as small text on background and on its own 10% tint. |
| `warning-foreground` | yes | Text on a warning fill. |
| `warning-subtle` | yes | Tinted ground for warning banners and badges. |
| `info` | yes | Neutral informational state. Must read as small text on background and on its own 10% tint. |
| `info-foreground` | yes | Text on an info fill. |
| `info-subtle` | yes | Tinted ground for info banners and badges. |

## chart

| Token | Required | Role |
| --- | --- | --- |
| `chart-1` | optional | Categorical series 1. |
| `chart-2` | optional | Categorical series 2. |
| `chart-3` | optional | Categorical series 3. |
| `chart-4` | optional | Categorical series 4. |
| `chart-5` | optional | Categorical series 5. |

## sidebar

| Token | Required | Role |
| --- | --- | --- |
| `sidebar` | optional | Sidebar ground. |
| `sidebar-foreground` | optional | Sidebar text. |
| `sidebar-primary` | optional | Active sidebar item. |
| `sidebar-primary-foreground` | optional | Text on active sidebar item. |
| `sidebar-accent` | optional | Sidebar hover fill. |
| `sidebar-accent-foreground` | optional | Text on sidebar hover fill. |
| `sidebar-border` | optional | Sidebar divider. |
| `sidebar-ring` | optional | Sidebar focus ring. |

## shadows

Themes define `--depth-<name>`; use as `shadow-<name>`.

| Utility | Required | Role |
| --- | --- | --- |
| `shadow-border` | yes | Raised surfaces (cards, table cards): a transparent hairline plus soft lift, so the card keeps its weight on any ground. Use `shadow-border` instead of a border. |
| `shadow-border-hover` | yes | The same surface under the pointer. |
| `shadow-popover` | yes | Floating surfaces: menus, popovers, date pickers. |

## typography

| Utility | Required | Role |
| --- | --- | --- |
| `font-heading` | optional | Card and section headings (`font-heading`). Themes set --typeface-heading; defaults to the sans font. |

## utilities

`scroll-slim` (from base.css): a hairline scrollbar in the foreground colour for scrolling panels and tables.
