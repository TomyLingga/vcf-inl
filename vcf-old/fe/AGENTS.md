# VCF Frontend — Coding Agent Guide

## Project Overview

**VCF Frontend** — Vehicle Control Form system for PT. Industri Nabati Lestari.  
The frontend enables petugas (officers) and admin to track incoming/outgoing trucks through a **4-step multistep workflow**:
1. **Bagian 1** (Gate Masuk): Vehicle entry gate inspection
2. **Bagian 2** (Weighbridge Masuk): Incoming weight & cargo documentation
3. **Bagian 3** (Weighbridge Keluar): Outgoing weight & cargo documentation  
4. **Bagian 4** (Gate Keluar): Gate exit inspection & completion

The frontend provides dashboard views, form interfaces for each workflow step, master data management, and print capabilities with QR code generation.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Fetch API
- **QR Code**: qrcode.react, react-qr-code
- **Print**: jsPDF, docx, file-saver
- **Date Handling**: date-fns

---

## Architecture & Key Patterns

### Project Structure

```
fe/
├── app/
│   ├── (dashboard)/           # Dashboard route group
│   │   ├── vcf/               # VCF workflow pages
│   │   ├── master/            # Master data management
│   │   ├── settings/          # System settings
│   │   └── layout.tsx         # Dashboard layout
│   ├── login/                 # Authentication
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing/redirect
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── print/                 # Print components
├── lib/
│   ├── api.ts                 # API client functions
│   └── utils.ts               # Utility functions
├── types/
│   └── index.ts               # TypeScript types
└── public/                    # Static assets
```

### Routing

**App Router Pattern**: Next.js 14 App Router with file-based routing
- Route groups: `(dashboard)` for authenticated pages
- Dynamic routes: `[id]` for VCF detail/edit pages
- Layouts: Root layout + dashboard layout for nested structure

### Component Patterns

**Functional Components with Hooks**:
```typescript
'use client' // For client components (forms, interactivity)
import { useState, useEffect } from 'react';

export default function ComponentName() {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
}
```

**Server Components** (default): For static content, data fetching
- No `'use client'` directive
- Can use async/await for data fetching
- Better performance for initial render

### API Integration

**API Client Location**: `lib/api.ts`

**Pattern**: Centralized API functions using fetch
```typescript
export const vcfApi = {
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/vcf`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },
  // ... other methods
};
```

**Authentication**: Token stored in localStorage, sent in `Authorization: Bearer {token}` header

### Form Handling

**React Hook Form + Zod**:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  field: z.string().min(1, 'Required'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### State Management

**Local State**: `useState` for component-level state
**Global State**: Context API for theme, auth (if needed)
**Server State**: API calls with caching via React Query (if added)

---

## Design System

**VCF Design System** — Atmospheric Glass with vibrant gradient backdrop and frosted translucent interface layers.

### Design Philosophy
- **Atmospheric Glass**: Vibrant gradient backdrop (deep blue, purple, pink) with frosted glass layers
- **Industrial Precision**: Strong contrast ratios for factory environment readability
- **Dynamic Themes**: Admin-configurable themes (dark, light, custom) via settings API

### Theme Implementation

**Frontend Theme Context**:
```typescript
// Context for theme state
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

// Theme provider wraps app
<ThemeProvider>
  <App />
</ThemeProvider>
```

**Tailwind Configuration**:
- CSS variables for dynamic color tokens
- Dark mode via class strategy
- Custom utilities for glassmorphism effects
- Gradient background using `gradient-1`, `gradient-2`, `gradient-3` tokens

**Theme Storage**:
- Local storage for user preference
- API sync for system-wide settings
- Fallback to dark theme

### Color Tokens

**Dark Theme (Atmospheric - Default)**
- Background: `#0b1326` (Deep atmospheric canvas)
- Surface: `#171f33` (Contained panel background)
- Primary: `#ffffff` (Main foreground)
- Secondary: `#adc9eb` (Cool accent)
- Text: `#dae2fd` / `#c4c7c8` (Primary and secondary text)
- Gradient: `#1E3A8A` → `#7E22CE` → `#DB2777`

**Light Theme**
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Primary: `#0F172A` (Dark foreground for contrast)
- Text: `#0F172A` / `#475569`

**Glassmorphism Utilities**:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Component Guidelines

**Glass Card**:
- Radius: `rounded-lg` (1rem) for standard, `rounded-xl` (1.5rem) for elevated
- Padding: `p-5` (20px)
- Background: Translucent with backdrop blur
- Border: Subtle white border `rgba(255, 255, 255, 0.2)`

**Buttons**:
- Primary: `bg-white text-gray-800 rounded-xl h-12`
- Ghost: `bg-white/5 text-white rounded-xl`
- Radius: Always `rounded-xl` (1.5rem) for softer tactile feel

**Inputs**:
- Background: `bg-white/10`
- Border: `border border-white/10`
- Focus: `focus:border-white/30`
- Radius: `rounded-xl` (1.5rem)
- Height: 48px

**Typography**:
- All roles: `font-['Inter']` (Inter font family)
- Display: 84px, 700 weight for hero values
- Body: 16px, 400 weight for standard text
- Labels: 12px, 600 weight for metadata

**See**: [DESIGN.md](DESIGN.md) for complete design system documentation

---

## Common Development Tasks

### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL

# 3. Start dev server
npm run dev
# App runs at http://localhost:3000
```

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev -p 3001      # Use different port

# Build
npm run build            # Production build
npm start                # Start production server

# Linting
npm run lint             # Run ESLint

# Troubleshooting
rm -rf .next node_modules package-lock.json
npm install              # Clean reinstall
```

### Creating New Pages

**Dashboard Page**:
1. Create file in `app/(dashboard)/route/page.tsx`
2. Use `'use client'` if interactivity needed
3. Add navigation in sidebar if needed

**New Master Data Page**:
1. Create in `app/(dashboard)/master/resource/page.tsx`
2. Copy existing master page pattern (e.g., `driver/page.tsx`)
3. Update API calls in `lib/api.ts`
4. Add TypeScript types in `types/index.ts`

### Adding UI Components

**shadcn/ui Components**:
```bash
npx shadcn-ui@latest add [component-name]
# Example: npx shadcn-ui@latest add dialog
```

**Custom Components**:
1. Create in `components/` folder
2. Use TypeScript for props
3. Follow existing component patterns
4. Export from index file if needed

### Form Development

**New Form Pattern**:
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  // validation schema
});

export default function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    try {
      await api.create(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### API Integration

**Adding New API Function**:
```typescript
// In lib/api.ts
export const resourceApi = {
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/resource`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },
  
  create: async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  // ... update, delete, show
};
```

---

## VCF-Specific Patterns

### Workflow Forms

**Bagian Forms** (1-4):
- Each bagian has dedicated form component
- Partial updates via API
- Status tracking through workflow
- Print capability after completion

**Form Structure**:
```typescript
// app/(dashboard)/vcf/[id]/Bagian2Form.tsx
'use client';
import { useForm } from 'react-hook-form';

export default function Bagian2Form({ vcfId, initialData }) {
  // Form logic for Bagian 2
  // Weighbridge masuk data
  // Seal numbers
  // Cargo documentation
}
```

### Print Components

**PrintVCF**:
- Uses jsPDF for PDF generation
- Includes QR code for verification
- Multi-bagian layout support
- Professional formatting

**Print Pattern**:
```typescript
// app/(dashboard)/vcf/[id]/PrintVCF.tsx
'use client';
import { jsPDF } from 'jspdf';

export default function PrintVCF({ vcfData }) {
  const handlePrint = () => {
    const doc = new jsPDF();
    // Add content
    doc.save('vcf-document.pdf');
  };
  
  return <button onClick={handlePrint}>Print VCF</button>;
}
```

### Dashboard Components

**Stats Cards**: Glass cards with metrics
**Status Indicators**: Color-coded badges
**Quick Actions**: Shortcut buttons for common tasks
**Recent Activity**: List of recent VCF entries

---

## Common Conventions & Best Practices

### TypeScript

**Type Definitions**: Centralized in `types/index.ts`
```typescript
export interface VCF {
  id: number;
  no_polisi: string;
  driver_id: number;
  // ... other fields
}
```

**Props Typing**: Always type component props
```typescript
interface Props {
  data: VCF;
  onUpdate: (id: number) => void;
}

export default function Component({ data, onUpdate }: Props) {
  // ...
}
```

### Styling

**TailwindCSS**: Use utility classes
- Responsive: `md:`, `lg:` prefixes
- States: `hover:`, `focus:`, `active:`
- Dark mode: `dark:` prefix

**Custom Styles**: Use CSS modules or styled-components for complex cases
- Avoid inline styles
- Prefer Tailwind utilities
- Use shadcn/ui for complex components

### Error Handling

**API Errors**:
```typescript
try {
  const result = await api.create(data);
  // Success handling
} catch (error) {
  console.error('Error:', error);
  // Show error message to user
  toast.error('Failed to create record');
}
```

**Validation Errors**: Display field-level errors from React Hook Form

### Performance

**Code Splitting**: Next.js automatic for pages
**Lazy Loading**: For heavy components
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

**Optimization**: Use `next/image` for images, `next/link` for navigation

### Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios (4.5:1 minimum)
- Focus indicators

---

## Testing

**Manual Testing**:
- Test forms with valid/invalid data
- Test API integration with backend
- Test responsive design on mobile
- Test theme switching
- Test print functionality

**Browser Testing**:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Backend API URL
4. Deploy

### Environment Variables

**Required**:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint

**Build Settings**:
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`

---

## Useful Tips & Pitfalls

### ✅ Do's
- Use TypeScript for type safety
- Use shadcn/ui components for consistency
- Handle loading and error states
- Use React Hook Form for forms
- Follow the glassmorphism design system
- Test responsive design
- Use environment variables for configuration

### ❌ Don'ts
- Don't use inline styles (use Tailwind)
- Don't skip TypeScript types
- Don't hardcode API URLs (use env var)
- Don't ignore error handling
- Don't break the glassmorphism aesthetic
- Don't use pure black/white (use tinted variants)
- Don't add excessive animations (industrial context)

### 🔍 Debugging

**Console Logging**:
```typescript
console.log('Debug:', data);
console.error('Error:', error);
```

**Network Tab**: Check API requests in browser DevTools

**React DevTools**: Inspect component state and props

**Theme Issues**: Check CSS variables and Tailwind config

---

## Related Resources

- [README.md](README.md) — Installation & setup
- [DESIGN.md](DESIGN.md) — Design system documentation
- [lib/api.ts](lib/api.ts) — API client functions
- [types/index.ts](types/index.ts) — TypeScript types
- Next.js Docs: https://nextjs.org/docs
- TailwindCSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---

## Next Steps for Agents

When working on this codebase, prioritize these checks:
1. **Before creating pages**: Check existing page patterns in `app/(dashboard)/`
2. **Before API changes**: Update `lib/api.ts` and `types/index.ts`
3. **Before UI changes**: Consult DESIGN.md for glassmorphism guidelines
4. **Before deployment**: Test build locally with `npm run build`
5. **Design consistency**: Use shadcn/ui components and design tokens
6. **Theme support**: Ensure components work in both dark and light themes

---

*Last updated: May 2026 — VCF Frontend v1.0*
