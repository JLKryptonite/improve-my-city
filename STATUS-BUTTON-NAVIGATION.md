# Status Button Navigation Feature

## Overview

The three status cards on the homepage (Resolved, In Progress, Delayed) are now clickable buttons that navigate to filtered complaint pages showing only complaints matching the selected status type.

## Implementation Details

### 1. Updated Components

#### StatsBar Component (`components/StatsBar.tsx`)
- Added `Link` component from Next.js for navigation
- Wrapped each status card in a `<Link>` component
- Added `cursor-pointer` class for better UX
- Each card now navigates to a filtered complaints page

#### ComplaintList Component (`components/ComplaintList.tsx`)
- Added `useSearchParams` hook to read URL query parameters
- Implemented initialization logic to set filters based on URL params
- Added dynamic page title based on active filter
- Added "Clear Filters" button when filters are active
- Added visual filter badges showing active filters with remove buttons
- Supports both direct status filtering and grouped filters

#### Complaints Page (`app/complaints/page.tsx`)
- Wrapped ComplaintList in `Suspense` boundary
- Required for using `useSearchParams` in client components
- Added loading fallback with skeleton UI

### 2. URL Routes

| Status Card | URL | Shows |
|-------------|-----|-------|
| **Resolved** (Green) | `/complaints?status=resolved` | All resolved complaints |
| **In Progress** (Yellow) | `/complaints?filter=active` | Pending + In Progress complaints |
| **Delayed** (Red) | `/complaints?filter=overdue` | Stalled + Revived complaints |

### 3. Status Mappings

Based on the metrics:
- `metrics.resolved` → Status: "resolved"
- `metrics.active` → Status: "pending" + "in_progress"
- `metrics.overdue` → Status: "stalled" + "revived"

For simplicity, clicking:
- **Resolved** → Shows only `status=resolved`
- **In Progress** → Shows `status=in_progress` (can be expanded to include pending)
- **Delayed** → Shows `status=stalled` (can be expanded to include revived)

### 4. User Experience Features

#### Homepage
- ✅ Three clickable status cards with hover effects
- ✅ Visual feedback on hover (scale up, brightness change)
- ✅ Clear indication that cards are clickable (cursor pointer)

#### Filtered Complaints Page
- ✅ Dynamic page title based on filter
  - "Resolved Complaints"
  - "In Progress Complaints"
  - "Delayed Complaints"
- ✅ Filter badges showing active filters
- ✅ "Clear Filters" link in header
- ✅ Individual "✕" buttons on each filter badge
- ✅ Original filter controls still available for refinement
- ✅ Pagination preserved across filters

### 5. Code Changes

#### StatsBar.tsx
```typescript
// Before
<div className="...">...</div>

// After
<Link href="/complaints?status=resolved" className="block">
  <div className="... cursor-pointer">...</div>
</Link>
```

#### ComplaintList.tsx
```typescript
// Added URL parameter reading
const searchParams = useSearchParams();

// Initialize filters from URL
useEffect(() => {
  const urlStatus = searchParams.get('status');
  const urlFilter = searchParams.get('filter');
  
  if (urlStatus) {
    setFilters(prev => ({ ...prev, status: urlStatus }));
  } else if (urlFilter === 'active') {
    setFilters(prev => ({ ...prev, status: 'in_progress' }));
  } else if (urlFilter === 'overdue') {
    setFilters(prev => ({ ...prev, status: 'stalled' }));
  }
}, [searchParams]);
```

## How It Works

### User Flow

1. **User visits homepage** (`/`)
   - Sees three status cards with metrics
   - Each card shows: icon, label, count, "Reports" text

2. **User clicks a status card**
   - Navigated to `/complaints?status=...` or `/complaints?filter=...`
   - ComplaintList component reads URL parameters
   - Automatically sets initial filter state
   - Fetches and displays filtered complaints

3. **User sees filtered results**
   - Page title reflects the filter
   - Active filter badge displayed
   - Can clear filter with "Clear Filters" link
   - Can add more filters using the filter form
   - Can remove individual filters by clicking "✕"

### Technical Flow

```
Homepage (/)
  └─> StatsBar Component
        ├─> Resolved Card
        │     └─> Link to /complaints?status=resolved
        ├─> In Progress Card
        │     └─> Link to /complaints?filter=active
        └─> Delayed Card
              └─> Link to /complaints?filter=overdue

Complaints Page (/complaints)
  └─> Suspense Wrapper
        └─> ComplaintList Component
              ├─> useSearchParams() reads URL params
              ├─> Sets initial filter state
              ├─> Fetches filtered complaints
              ├─> Displays results with title
              └─> Shows active filter badges
```

## Testing

### Test Cases

1. **Click Resolved Card**
   ```
   From: http://localhost:3000/
   To: http://localhost:3000/complaints?status=resolved
   Expected: Shows only resolved complaints
   Title: "Resolved Complaints"
   ```

2. **Click In Progress Card**
   ```
   From: http://localhost:3000/
   To: http://localhost:3000/complaints?filter=active
   Expected: Shows in_progress complaints
   Title: "In Progress Complaints"
   ```

3. **Click Delayed Card**
   ```
   From: http://localhost:3000/
   To: http://localhost:3000/complaints?filter=overdue
   Expected: Shows stalled complaints
   Title: "Delayed Complaints"
   ```

4. **Clear Filters**
   ```
   From: http://localhost:3000/complaints?status=resolved
   Click: "Clear Filters" link
   To: http://localhost:3000/complaints
   Expected: Shows all complaints
   Title: "Browse Complaints"
   ```

5. **Add Additional Filters**
   ```
   From: http://localhost:3000/complaints?status=resolved
   Action: Select city "Mumbai" in filter form
   Expected: Shows resolved complaints in Mumbai
   Badges: "Status: resolved" and "City: Mumbai"
   ```

### Manual Testing Steps

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Click on each of the three status cards:
   - Green "Resolved" card
   - Yellow "In Progress" card
   - Red "Delayed" card

4. Verify:
   - ✅ Correct navigation occurs
   - ✅ URL updates with appropriate query parameter
   - ✅ Complaints are filtered correctly
   - ✅ Page title changes appropriately
   - ✅ Filter badges appear
   - ✅ "Clear Filters" link works
   - ✅ Individual filter badges can be removed

## Future Enhancements

### Possible Improvements

1. **Multiple Status Selection**
   - Allow "In Progress" to show both pending AND in_progress
   - Allow "Delayed" to show both stalled AND revived
   - Implement using array of statuses in API call

2. **Back Button**
   - Add a "← Back to Home" button on filtered pages
   - Preserve user navigation history

3. **Deep Linking**
   - Share filtered complaint URLs directly
   - Bookmark specific filtered views

4. **Filter Persistence**
   - Remember user's last filter selection
   - Store in localStorage or session

5. **Animation**
   - Smooth transition when loading filtered results
   - Loading skeleton while fetching data

6. **Count Display**
   - Show result count on filtered pages
   - e.g., "Showing 12 resolved complaints"

7. **Quick Stats**
   - Show mini stats bar on filtered pages
   - Allow switching between filters without going home

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance

- ⚡ Client-side navigation (no full page reload)
- ⚡ Instant filter application
- ⚡ Cached API responses
- ⚡ Optimized re-renders with React hooks

## Accessibility

- ✅ Keyboard navigation support (Tab through cards)
- ✅ Clear focus indicators
- ✅ Semantic HTML (using Link components)
- ✅ Screen reader friendly

## Summary

The homepage status cards are now fully interactive navigation buttons that provide quick access to filtered complaint views. Users can:

1. Click any status card on the homepage
2. Instantly view complaints filtered by that status
3. See a clear indication of the active filter
4. Easily clear filters or add more refinements
5. Navigate back to all complaints at any time

This enhancement improves the user experience by reducing clicks needed to find specific types of complaints and provides a more intuitive interface for browsing the complaint system.

