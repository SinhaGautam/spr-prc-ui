/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#2d2924',
    tint: '#b87532',

    // Core surfaces
    background: '#fbf8f1',
    foreground: '#2d2924',

    // Cards / elevated surfaces
    card: '#fffdf8',
    cardForeground: '#2d2924',

    // Primary action color (buttons, links, active states)
    primary: '#b87532',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#f1e9dc',
    secondaryForeground: '#5a4632',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f4eee4',
    mutedForeground: '#82776b',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#ead5b7',
    accentForeground: '#7d4f24',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#eadfd1',
    input: '#eadfd1',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
