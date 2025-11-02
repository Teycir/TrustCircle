# TrustCircle Frontend - Next.js + Tailwind CSS

## Setup Complete ✅

### Technology Stack
- **Next.js 14** - App Router with React Server Components
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

## Project Structure

```
TrustCircle/
├── app/
│   ├── globals.css          # Tailwind directives
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── create/
│   │   └── page.tsx         # Create capsule
│   ├── unlock/
│   │   └── page.tsx         # Unlock capsule
│   ├── dashboard/
│   │   └── page.tsx         # View capsules
│   └── identity/
│       └── page.tsx         # Key management
├── components/              # Reusable components (empty for now)
├── lib/                     # Backend modules
├── next.config.cjs
├── tailwind.config.cjs
└── postcss.config.cjs
```

## Pages Implemented

### 1. Home Page (`/`)
- Hero section with app description
- Navigation cards to main features
- "How It Works" section
- Responsive design

### 2. Create Capsule (`/create`)
- File upload
- Title and notes fields
- Approver public key input
- Date/time picker for unlock condition
- Location toggle
- Form validation
- Success state with capsule ID

### 3. Unlock Capsule (`/unlock`)
- Capsule ID input
- Unlock button
- File list display after unlock
- Download functionality (placeholder)

### 4. Dashboard (`/dashboard`)
- Tabbed interface (Created/Received)
- Capsule list with status badges
- Quick view links
- Empty state handling

### 5. Identity Management (`/identity`)
- Generate new identity
- Display public key
- Copy/Export functionality
- Security status indicators
- Delete identity option

## Running the Application

### Development
```bash
npm run dev
```
Visit http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

## Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_PINATA_API_KEY=your-pinata-api-key
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

## Next Steps - Integration

### 1. Connect Backend to Frontend

Create `lib/client.ts`:
```typescript
import { CapsuleManager } from './capsule'
import { PinataClient } from './pinata'
import { TrustCircleDB } from './supabase'

export function initializeClient() {
  const pinata = new PinataClient(
    process.env.NEXT_PUBLIC_PINATA_API_KEY!,
    process.env.NEXT_PUBLIC_PINATA_GATEWAY
  )
  
  const db = new TrustCircleDB(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return new CapsuleManager(pinata, db)
}
```

### 2. Integrate Identity Management

Update `app/identity/page.tsx`:
```typescript
import { generateIdentity, saveIdentity, loadIdentity } from '@/lib/keystore'
```

### 3. Implement Create Flow

Update `app/create/page.tsx`:
```typescript
import { initializeClient } from '@/lib/client'
import { loadIdentity } from '@/lib/keystore'
import { getCurrentLocation } from '@/lib/geolocation'
```

### 4. Implement Unlock Flow

Update `app/unlock/page.tsx`:
```typescript
import { initializeClient } from '@/lib/client'
import { loadIdentity } from '@/lib/keystore'
```

### 5. Add Components

Create reusable components:
- `components/Button.tsx`
- `components/Input.tsx`
- `components/Card.tsx`
- `components/Loading.tsx`
- `components/ErrorMessage.tsx`

## Design System

### Colors
- Primary: Indigo (600, 700)
- Success: Green (600, 700)
- Warning: Yellow (100, 800)
- Error: Red (600, 800)
- Gray scale for text and backgrounds

### Typography
- Headings: Bold, various sizes
- Body: System font stack
- Code: Monospace for keys/IDs

### Components
- Rounded corners (lg = 0.5rem)
- Shadow for elevation
- Hover states on interactive elements
- Focus rings for accessibility

## Features to Add

### High Priority
1. **Real Backend Integration**
   - Connect forms to CapsuleManager
   - Handle file reading and conversion
   - Display real capsule data

2. **Error Handling**
   - Toast notifications
   - Form validation feedback
   - Network error recovery

3. **Loading States**
   - Skeleton screens
   - Progress indicators
   - Optimistic updates

### Medium Priority
4. **QR Code Sharing**
   - Generate QR for capsule links
   - Scan QR to unlock

5. **File Preview**
   - Show file type icons
   - Preview images/PDFs

6. **Search & Filter**
   - Search capsules by title
   - Filter by status/date

### Low Priority
7. **Dark Mode**
8. **Animations**
9. **PWA Support**
10. **Mobile Optimization**

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Color contrast compliance

## Performance

- Server Components by default
- Client Components only where needed
- Image optimization with next/image
- Code splitting automatic
- CSS purging via Tailwind

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Notes

- All pages are client components ('use client') for interactivity
- Backend integration is placeholder - needs real implementation
- Forms have basic validation, needs enhancement
- No authentication yet - relies on key possession
- IndexedDB for key storage (browser-based)
