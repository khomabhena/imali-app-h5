# Wishlist Feature Proposal

## Overview
A wishlist feature that allows users to save items they want to buy, check affordability in real-time, and quickly purchase items when they become affordable.

---

## Core Features

### 1. **Wishlist Page** (`/wishlist`)
Main page showing all wishlist items with affordability status.

**Key Elements:**
- **Summary Card**: Total items, count of affordable vs blocked items
- **Filter Buttons**: 
  - Status: All / Affordable / Blocked
  - Bucket: All / Necessity / Investment / Learning / Emergency / Fun
- **Add Button**: Prominent "Add to Wishlist" button at top
- **Item Cards**: Each showing:
  - Item name and price
  - Priority badge (High/Medium/Low)
  - Affordability status (✅ Affordable / ❌ Blocked)
  - Bucket name and current balance
  - If blocked: shows required balance and max affordable amount
  - Category tag
  - Optional note
  - Actions: Buy Now / Edit / Delete

**Visual Design:**
- Affordable items: Green border, checkmark icon
- Blocked items: Red border, X icon
- Priority badges: High (red), Medium (amber), Low (gray)

---

### 2. **Add/Edit Wishlist Item** (`/wishlist/add` or `/wishlist/edit/:id`)
Form to add or edit wishlist items.

**Form Fields:**
- Item name (required)
- Estimated amount (required, numeric)
- Currency (defaults to user's default currency)
- Bucket selection (required, exclude Savings)
- Priority (High/Medium/Low) - dropdown or buttons
- Category (optional, text input or dropdown)
- Note (optional, textarea)

**Live Affordability Preview:**
- Shows affordability status as user fills form
- Displays: "You can afford this" or "You need $X more"
- Updates in real-time when amount or bucket changes

---

### 3. **Quick Actions**

**Buy Now Button:**
- Only enabled for affordable items
- Pre-fills the Purchase page with:
  - Amount
  - Bucket
  - Item name
  - Category
  - Note
- Navigates to `/purchase` with pre-filled data
- After purchase, optionally remove from wishlist or mark as "purchased"

**Edit Button:**
- Opens edit form with current values
- Same form as Add, but pre-filled

**Delete Button:**
- Confirmation dialog before deleting
- Removes item from wishlist

---

### 4. **Integration Points**

**Navigation:**
- Add to BottomNav (replace one item or add as 6th item)
- Icon: ShoppingBagIcon or HeartIcon
- Position: Between Expenses and Analytics, or replace Expenses

**Purchase Page Integration:**
- Accept pre-filled data via route state or URL params
- When coming from wishlist, show "Buying from Wishlist" indicator
- After successful purchase, offer to remove from wishlist

**Dashboard Integration (Optional):**
- Quick widget showing: "X items affordable" or "X items blocked"
- Click to go to wishlist

---

## User Flow Examples

### Flow 1: Adding an Item
1. User clicks "Add to Wishlist"
2. Fills form: "MacBook Pro", $2499, Investment bucket, High priority
3. Sees live affordability check (blocked if not enough balance)
4. Saves item
5. Item appears in wishlist with blocked status

### Flow 2: Buying When Affordable
1. User views wishlist
2. Sees item is now affordable (green checkmark)
3. Clicks "Buy Now"
4. Purchase page opens with pre-filled data
5. User confirms purchase
6. Item is removed from wishlist (or marked purchased)

### Flow 3: Filtering
1. User wants to see only affordable items
2. Clicks "Affordable" filter
3. Only shows items they can buy now
4. Can further filter by bucket (e.g., "Fun" bucket only)

---

## Data Structure

```javascript
{
  id: 'uuid',
  name: 'MacBook Pro 16"',
  amount: 2499,
  currency: 'USD',
  bucketId: '2', // Investment
  bucketName: 'Investment',
  priority: 1, // 1=High, 2=Medium, 3=Low
  category: 'Electronics',
  note: 'For work and development',
  createdAt: '2025-11-10T10:00:00Z',
  purchasedAt: null, // Optional: track if purchased
  userId: 'uuid' // Link to user
}
```

---

## UI/UX Considerations

### Mobile-First Design
- Card-based layout (similar to Expenses page)
- Touch-friendly buttons (44px minimum)
- Swipe actions (optional): Swipe left to delete, swipe right to buy

### Affordability Display
- **Affordable**: Green checkmark, "Buy Now" button enabled
- **Blocked**: Red X, shows breakdown:
  - "You need: $X"
  - "You have: $Y"
  - "Max affordable: $Z"
  - "Buy Now" button disabled

### Empty States
- No items: "Start adding items to your wishlist" with CTA
- No affordable items: "Save more to afford these items"
- Filtered empty: "No items match your filters"

### Priority System
- **High**: Items user really wants (red badge)
- **Medium**: Nice to have (amber badge)
- **Low**: Maybe someday (gray badge)
- Helps users prioritize when multiple items become affordable

---

## Technical Implementation

### Pages Needed
1. `Wishlist.jsx` - Main list page
2. `AddWishlistItem.jsx` - Add/edit form
3. Update `Purchase.jsx` - Handle pre-filled data
4. Update `BottomNav.jsx` - Add wishlist link
5. Update `App.jsx` - Add routes

### Components Needed
1. `WishlistItemCard.jsx` - Individual item card
2. `WishlistFilters.jsx` - Filter buttons (optional, can be inline)
3. `AffordabilityBadge.jsx` - Reusable affordability indicator

### Mock Data
- Add `mockWishlistItems` array to `mockData.js`
- Include affordability calculations using existing `checkAffordability` function

---

## Future Enhancements (Not in MVP)

1. **Wishlist Sharing**: Share wishlist with family/friends
2. **Price Tracking**: Track price changes over time
3. **Savings Goals**: "Save $X/month to afford this in Y months"
4. **Notifications**: "Item X is now affordable!"
5. **Wishlist Analytics**: Total wishlist value, average item price, etc.
6. **Categories**: Predefined categories with icons
7. **Images**: Add product images
8. **Links**: Add product links/URLs
9. **Purchase History**: Keep purchased items in history
10. **Multiple Currencies**: Better handling of multi-currency wishlists

---

## Questions for You

1. **Navigation**: Should wishlist replace "Expenses" in bottom nav, or be a 6th item? (5 items is standard, 6 might be crowded)

2. **After Purchase**: Should items be:
   - Automatically removed from wishlist?
   - Marked as "purchased" but kept in list?
   - User choice (checkbox: "Remove after purchase")?

3. **Priority System**: Do you want the 3-level priority system, or simpler (just "Priority" toggle)?

4. **Categories**: Should categories be:
   - Free text input?
   - Dropdown with common categories?
   - Optional feature (can skip for MVP)?

5. **Integration**: Should wishlist items show up anywhere else?
   - Dashboard widget?
   - Analytics page?
   - Purchase page suggestions?

---

## Recommendation

**MVP Scope:**
- ✅ Wishlist page with list, filters, and affordability status
- ✅ Add/Edit form with live affordability preview
- ✅ Buy Now action (pre-fills purchase page)
- ✅ Edit/Delete actions
- ✅ Priority system (High/Medium/Low)
- ✅ Basic category (text input)
- ✅ Add to bottom navigation

**Defer for Later:**
- Purchase history tracking
- Price tracking
- Savings goals
- Notifications
- Sharing features

This gives users a complete wishlist experience while keeping the initial implementation focused and manageable.

---

## Next Steps

Please review and let me know:
1. ✅ Approve this approach?
2. ❓ Answer the questions above
3. 🔧 Any changes or additions?
4. 🚀 Ready to implement?

