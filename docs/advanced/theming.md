# Custom Themes Guide

Customize 4Diary's appearance with custom themes.

## Default Theme: Leather

4Diary uses a "leather journal" inspired theme with warm, rich colors.

**Color Palette**:
```css
:root {
  --leather-50: #fdf8f3;
  --leather-100: #f7e6d6;
  --leather-200: #ecc9a8;
  --leather-300: #dfa574;
  --leather-400: #d18446;
  --leather-500: #b86a30;
  --leather-600: #9e5324;
  --leather-700: #7d4021;
  --leather-800: #633520;
  --leather-900: #4d2b1c;
}
```

## Creating Custom Themes

### Step 1: Modify globals.css

Edit `app/globals.css`:

```css
:root {
  /* Your custom theme colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-900: #0c4a6e;
  
  /* Override leather variables */
  --leather-50: var(--primary-50);
  --leather-500: var(--primary-500);
  --leather-900: var(--primary-900);
}
```

### Step 2: Update Tailwind Config

Modify `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... your colors
          900: '#0c4a6e'
        }
      }
    }
  }
};
```

### Step 3: Update Components

Replace `leather-*` classes with your theme:

```tsx
// Before
<button className="bg-leather-600 hover:bg-leather-700">

// After
<button className="bg-primary-600 hover:bg-primary-700">
```

## Pre-Made Theme Examples

### Dark Mode

```css
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
}
```

### Ocean Theme

```css
:root {
  --ocean-50: #f0f9ff;
  --ocean-500: #0ea5e9;
  --ocean-900: #0c4a6e;
}
```

### Forest Theme

```css
:root {
  --forest-50: #f0fdf4;
  --forest-500: #22c55e;
  --forest-900: #14532d;
}
```

## Dynamic Theme Switching

```typescript
// lib/theme.ts
export function setTheme(theme: 'leather' | 'dark' | 'ocean') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Usage in component
setTheme('dark');
```

## Logo Customization

Replace files in `public/`:
- `logo.svg` - Main logo
- `favicon.ico` - Browser icon  
- `og-image.png` - Social preview

## Typography

Modify fonts in `app/layout.tsx`:

```tsx
import { Inter, Merriweather } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const serif = Merriweather({ weight: ['300', '400', '700'], subsets: ['latin'] });
```

## Best Practices

1. **Maintain Contrast**: Ensure text is readable (WCAG AA)
2. **Test Accessibility**: Use browser DevTools
3. **Consistent Spacing**: Keep existing spacing system
4. **Mobile Testing**: Verify on multiple devices
5. **Performance**: Avoid heavy background images

## Next Steps

- Review [Architecture Overview](../architecture/architecture.md)
- Check [Self-Hosting Guide](./self-hosting.md)
- See [Contributing Guide](../../CONTRIBUTING.md)

---

**Last Updated**: November 2025  
**Default Theme**: Leather
