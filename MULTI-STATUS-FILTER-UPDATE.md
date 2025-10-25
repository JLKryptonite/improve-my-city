# Multi-Status Filter Update

## Overview

Updated the filtering system to show multiple complaint statuses when clicking the homepage status buttons.

## Changes Made

### 1. Yellow "In Progress" Button
**Before:** Only showed complaints with status = "in_progress"  
**After:** Shows complaints with status = "pending" OR "in_progress"

### 2. Red "Delayed" Button
**Before:** Only showed complaints with status = "stalled"  
**After:** Shows complaints with status = "stalled" OR "revived"

## Technical Implementation

### API Changes

#### File: `app/api/complaints/route.ts`
Updated the `getComplaintsWithFilters` function to support comma-separated status values:

```typescript
if (status) {
  // Support comma-separated status values for multiple statuses
  const statusArray = status.split(',').map(s => s.trim());
  if (statusArray.length > 1) {
    query.status = { $in: statusArray };  // MongoDB $in operator
  } else {
    query.status = status;
  }
}
```

#### File: `app/api/authority/complaints/route.ts`
Applied the same logic to the authority complaints endpoint for consistency.

### Frontend Changes

#### File: `components/ComplaintList.tsx`

**1. Updated Status Initialization:**
```typescript
// Before
else if (urlFilter === 'active') {
  initialStatus = 'in_progress';
} else if (urlFilter === 'overdue') {
  initialStatus = 'stalled';
}

// After
else if (urlFilter === 'active') {
  initialStatus = 'pending,in_progress';  // Multiple statuses
} else if (urlFilter === 'overdue') {
  initialStatus = 'stalled,revived';      // Multiple statuses
}
```

**2. Updated Page Title Display:**
```typescript
if (urlFilter === 'active') return 'Active Complaints (Pending & In Progress)';
if (urlFilter === 'overdue') return 'Delayed Complaints (Stalled & Revived)';
```

**3. Updated Filter Badge Display:**
```typescript
Status: {filters.status.includes(',') 
  ? filters.status.split(',').map(s => s.trim().replace('_', ' ')).join(' & ')
  : filters.status.replace('_', ' ')
}
```

## How It Works

### Request Flow

1. **User clicks yellow "In Progress" card on homepage**
   ```
   Navigate to: /complaints?filter=active
   ```

2. **ComplaintList reads URL parameter**
   ```javascript
   urlFilter === 'active'
   → Set status = 'pending,in_progress'
   ```

3. **API receives comma-separated status**
   ```javascript
   GET /api/complaints?status=pending,in_progress
   ```

4. **API parses and queries MongoDB**
   ```javascript
   statusArray = ['pending', 'in_progress']
   query.status = { $in: ['pending', 'in_progress'] }
   ```

5. **MongoDB returns all matching complaints**
   ```javascript
   db.complaints.find({ 
     status: { $in: ['pending', 'in_progress'] } 
   })
   ```

6. **Results displayed with appropriate title and badge**
   ```
   Title: "Active Complaints (Pending & In Progress)"
   Badge: "Status: pending & in progress"
   ```

## User Experience

### Homepage Buttons

| Button | Label | Border | Shows Statuses |
|--------|-------|--------|----------------|
| 🟢 Green | Resolved | Green | resolved |
| 🟡 Yellow | In Progress | Yellow | pending, in_progress |
| 🔴 Red | Delayed | Red | stalled, revived |

### Filtered Page Display

#### Yellow Button (Active)
- **Page Title:** "Active Complaints (Pending & In Progress)"
- **Filter Badge:** "Status: pending & in progress"
- **Shows:** All complaints that are either pending or in_progress
- **Count:** Sum of both statuses

#### Red Button (Delayed)
- **Page Title:** "Delayed Complaints (Stalled & Revived)"
- **Filter Badge:** "Status: stalled & revived"
- **Shows:** All complaints that are either stalled or revived
- **Count:** Sum of both statuses

## Database Query

### MongoDB Query Example

**Single Status (Resolved):**
```javascript
db.complaints.find({ status: "resolved" })
```

**Multiple Statuses (Active):**
```javascript
db.complaints.find({ 
  status: { $in: ["pending", "in_progress"] } 
})
```

**Multiple Statuses (Delayed):**
```javascript
db.complaints.find({ 
  status: { $in: ["stalled", "revived"] } 
})
```

## Testing

### Test Cases

1. **Test Active Filter**
   ```
   1. Go to homepage
   2. Click yellow "In Progress" card
   3. Verify URL: /complaints?filter=active
   4. Verify title: "Active Complaints (Pending & In Progress)"
   5. Verify shows both pending AND in_progress complaints
   ```

2. **Test Delayed Filter**
   ```
   1. Go to homepage
   2. Click red "Delayed" card
   3. Verify URL: /complaints?filter=overdue
   4. Verify title: "Delayed Complaints (Stalled & Revived)"
   5. Verify shows both stalled AND revived complaints
   ```

3. **Test Resolved Filter**
   ```
   1. Go to homepage
   2. Click green "Resolved" card
   3. Verify URL: /complaints?status=resolved
   4. Verify title: "Resolved Complaints"
   5. Verify shows only resolved complaints
   ```

### Manual Verification

```bash
# Start server
npm run dev

# Visit homepage
http://localhost:3003

# Test each status button and verify:
✓ Correct complaints shown
✓ Correct page title
✓ Correct filter badge
✓ Can clear filter
✓ Can add more filters
```

## Current Data Counts

Based on seeded data:
- **Resolved:** 1 complaint
- **Active (Pending + In Progress):** 3 complaints (2 pending + 1 in_progress)
- **Delayed (Stalled + Revived):** 2 complaints (1 stalled + 1 revived)

## Backward Compatibility

✅ **Direct status URLs still work:**
- `/complaints?status=pending` → Shows only pending
- `/complaints?status=in_progress` → Shows only in_progress
- `/complaints?status=resolved` → Shows only resolved
- `/complaints?status=stalled` → Shows only stalled
- `/complaints?status=revived` → Shows only revived

✅ **Multiple status URLs work:**
- `/complaints?status=pending,in_progress` → Shows both
- `/complaints?status=stalled,revived` → Shows both

✅ **Filter parameter URLs work:**
- `/complaints?filter=active` → Shows pending & in_progress
- `/complaints?filter=overdue` → Shows stalled & revived

## Benefits

1. ✅ **More Accurate Metrics** - Yellow button shows all active work (pending + in progress)
2. ✅ **Better Organization** - Red button shows all delayed work (stalled + revived)
3. ✅ **Flexible API** - Supports both single and multiple status filtering
4. ✅ **Clear UX** - Page titles and badges clearly show what's being filtered
5. ✅ **Backward Compatible** - Existing URLs and filters still work

## Summary

The filtering system now properly handles grouped statuses:
- **"Active" = Pending + In Progress** (all work that needs attention)
- **"Delayed" = Stalled + Revived** (all work that's behind schedule)
- **"Resolved" = Resolved** (completed work)

This provides a more accurate and useful view of complaints when users click the homepage status cards.

