# Imali H5 App — UI/UX Specification

Last updated: 2025-11-16

## Design Principles

### Mobile-First Approach
- Primary target: Mobile devices (iOS/Android browsers)
- Touch-optimized interactions (minimum 44px touch targets)
- Responsive design that scales gracefully to tablet/desktop
- Progressive Web App (PWA) capabilities for app-like experience

### Visual Design
- Clean, minimalist interface focused on financial clarity
- High contrast for readability
- Color-coded buckets for quick visual recognition
- Clear typography hierarchy for financial data
- Consistent spacing and padding (8px grid system)

### User Experience
- Immediate feedback on affordability checks
- Clear visual indicators for blocked transactions
- Intuitive navigation with bottom tab bar (mobile)
- Contextual help and tooltips where needed
- Loading states and error handling throughout

---

## Navigation Structure

### Bottom Navigation Bar (Mobile)
Primary navigation tabs (always visible when authenticated):

1. **Dashboard** (Home icon)
   - Overview of all buckets and balances
   - Quick actions: Add Income, Record Purchase

2. **Transactions** (List icon)
   - Transaction history
   - Filters: date range, bucket, currency, type

3. **Expenses** (Calendar icon)
   - One-time expense management
   - Active expenses list

4. **Analytics** (Chart icon)
   - Spending insights
   - Per-item spend analysis
   - Trends and visualizations

5. **Settings** (Gear icon)
   - Mode selection (Light/Intermediate/Strict)
   - Currency preferences
   - Profile and account settings

### Header Components
- **Currency Selector**: Dropdown/switcher in top-right (when multi-currency active)
- **Mode Indicator**: Current mode badge (Light/Intermediate/Strict) with quick toggle
- **User Menu**: Profile icon → dropdown (Settings, Logout)

---

## Screen Specifications

### 1. Authentication Screens

#### Login Screen
- **Layout**: Centered card on mobile, side-by-side on desktop
- **Elements**:
  - App logo/branding at top
  - Email input field
  - Password input field (with show/hide toggle)
  - "Sign In" button (primary CTA)
  - "Forgot Password?" link
  - "Don't have an account? Sign Up" link at bottom
- **Validation**: Real-time field validation with error messages
- **Loading State**: Disable form and show spinner on submit

#### Sign Up Screen
- **Layout**: Similar to login
- **Elements**:
  - Email input
  - Password input (with strength indicator)
  - Confirm password input
  - "Create Account" button
  - Terms of service / Privacy policy links
  - "Already have an account? Sign In" link

#### Onboarding (First Launch)
- **Step 1**: Welcome screen with app value proposition
- **Step 2**: Mode selection (Light/Intermediate/Strict) with brief explanations
- **Step 3**: Default currency selection (USD, ZAR, ZWL, etc.)
- **Step 4**: Optional: Add first income entry
- **Navigation**: Skip option, Next/Back buttons, "Get Started" on final step

---

### 2. Dashboard Screen

#### Layout
- **Header**: 
  - Total balance across all buckets (primary currency)
  - Currency switcher (if multi-currency)
  - Mode indicator badge (tappable to change mode)
  
- **Quick Actions Bar**:
  - "Add Income" button (primary, prominent)
  - "Record Purchase" button (secondary)

- **Bucket Cards Grid**:
  - 6 cards in 2 columns (mobile) or 3 columns (tablet+)
  - Each card shows:
    - Bucket name (Necessity, Investment, Learning, Emergency, Fun, Savings)
    - Current balance (large, prominent)
    - Percentage allocation (for main 5 buckets: "10%")
    - Visual indicator: color-coded border/background
    - Tap to view bucket details/transactions

#### Bucket Card Design
- **Color Scheme** (Teal-based palette):
  - Necessity: Cyan-teal (#0891b2) - Essential, trustworthy
  - Investment: Primary teal (#14b8a6) - Growth, investment
  - Learning: Sky blue-teal (#0ea5e9) - Knowledge, learning
  - Emergency: Red (#ef4444) - Urgent, warning
  - Fun: Amber (#f59e0b) - Joy, fun
  - Savings: Slate gray (#64748b) - Neutral, savings
  - See `src/data/colors.js` for full color palette

- **Balance Display**:
  - Positive: Black/dark text
  - Negative: Red text with warning icon
  - Zero: Gray text

- **Visual States**:
  - Normal: Standard card
  - Low balance: Subtle warning background tint
  - Negative: Red border accent

#### Empty State
- If no income recorded yet:
  - Illustration or icon
  - "Get started by adding your first income"
  - "Add Income" CTA button

---

### 3. Add Income Screen

#### Layout
- **Form Fields**:
  - Amount input (numeric keyboard, currency symbol prefix)
  - Currency selector (dropdown/picker)
  - Date picker (defaults to today)
  - Source/description (optional text field)
  - Note (optional textarea)

- **Preview Section** (below form):
  - "Allocation Preview" card showing:
    - Gross income
    - Total expenses (if any active)
    - Net after expenses
    - Breakdown: 10% to each bucket (Necessity, Investment, Learning, Emergency, Fun)
    - Remainder to Savings
    - Visual bar chart or list

- **Action Buttons**:
  - "Cancel" (secondary, top-left or bottom)
  - "Record Income" (primary, bottom-right)

#### Validation
- Amount must be > 0
- Currency must be selected
- Show real-time preview as user types

---

### 4. Record Purchase Screen

#### Layout
- **Form Fields**:
  - Amount input (numeric keyboard, currency symbol)
  - Bucket selector (radio buttons or dropdown; excludes Savings)
  - Item name (required text field)
  - Category (optional, with suggestions/autocomplete)
  - Date picker (defaults to today)
  - Note (optional textarea)

- **Live Affordability Check** (prominent, updates as user types):
  - **Status Indicator**:
    - ✅ "Approved" (green) - if purchase is affordable
    - ⚠️ "Warning" (yellow) - if approaching limit
    - ❌ "Blocked" (red) - if violates affordability rule
  
  - **Details Display**:
    - Current bucket balance
    - Purchase amount
    - Remaining after purchase
    - Required minimum balance (amount × limiter)
    - Mode indicator (Light/Intermediate/Strict)
  
  - **Blocked State Alert** (when `amount × limiter > bucketBalance`):
    - **Alert Banner** (red background, prominent):
      - Alert icon and "Purchase Blocked" heading
      - Clear message: "This purchase exceeds your affordability limit for [Bucket Name]"
      - Explanation: "With [Mode] mode (×[limiter] limiter), you need a balance of [amount × limiter] but only have [bucketBalance]"
      - **Maximum Affordable Amount Display**:
        - "You can afford up to: [bucketBalance ÷ limiter]" (large, bold, highlighted)
        - Calculation breakdown: "[bucketBalance] ÷ [limiter] = [maxAffordable]"
        - Currency formatting applied
    - **Quick Action**: "Use Max Affordable" button (fills amount field with max affordable value)
  
  - **Blocked State Actions**:
    - "Reduce Amount" button (suggests max affordable amount, fills field)
    - "Use Different Bucket" button (shows other buckets with available balance and their max affordable amounts)
    - "Cancel" button

- **Action Buttons**:
  - "Cancel" (secondary)
  - "Record Purchase" (primary, disabled if blocked)

#### Visual Feedback
- Real-time calculation as amount changes
- Color-coded status (green/yellow/red)
- Clear messaging explaining why purchase is blocked
- Animated transitions for status changes
- **Alert Behavior**:
  - When user enters amount that violates affordability rule (`amount × limiter > bucketBalance`):
    - Immediate alert banner appears (red, prominent)
    - Alert cannot be dismissed until amount is adjusted or different bucket selected
    - Maximum affordable amount is prominently displayed
    - "Use Max Affordable" button allows one-click adjustment
    - Input field may show red border/glow to indicate error state

---

### 5. Transactions Screen

#### Layout
- **Filters Bar** (sticky top):
  - Date range picker (quick options: Today, This Week, This Month, Custom)
  - Bucket filter (multi-select chips)
  - Currency filter (if multi-currency)
  - Transaction type filter (Income, Expense, Sweep, Reserve)
  - Clear filters button

- **Transaction List**:
  - Grouped by date (sections: "Today", "Yesterday", "This Week", etc.)
  - Each transaction item shows:
    - Type icon (income/expense/sweep/reserve)
    - Item name or description
    - Bucket name (if applicable)
    - Amount (positive: green, negative: red)
    - Currency code
    - Date/time
    - Tap to view details

- **Empty State**:
  - "No transactions found" message
  - "Record your first transaction" CTA

#### Transaction Detail Modal
- Full transaction information
- Edit/Delete actions (if allowed)
- Related transactions (if applicable)

---

### 6. Expenses Screen

#### Layout
- **Header**:
  - "Active Expenses" title
  - "Add Expense" button (floating action button or top-right)

- **Expense List**:
  - Each expense card shows:
    - Expense name
    - Amount and currency
    - Due date (if set)
    - Priority indicator (if set)
    - Active/Inactive toggle
    - Total reserved amount (sum of active expenses)
  - Swipe actions: Edit, Delete, Toggle Active

- **Summary Card** (top):
  - Total active expenses
  - Next due date (if any)
  - Impact on next income allocation

#### Add/Edit Expense Screen
- **Form Fields**:
  - Name (required)
  - Amount (required, numeric)
  - Currency selector
  - Due date (optional date picker)
  - Priority (optional, 1-5 scale or dropdown)
  - Note (optional textarea)
  - Active toggle (default: true)

- **Action Buttons**:
  - "Cancel"
  - "Save Expense"

---

### 7. Analytics Screen

#### Layout
- **Time Period Selector** (top):
  - Quick options: This Month, Last Month, This Year, Custom Range
  - Currency filter (if multi-currency)

- **Summary Cards** (scrollable horizontal or grid):
  - Total Income
  - Total Expenses
  - Net Balance
  - Top Spending Category

- **Charts Section**:
  - **Per-Bucket Balance Over Time**:
    - Line chart or area chart
    - Toggleable bucket selection
    - X-axis: time, Y-axis: balance
  
  - **Income vs Expenses Trend**:
    - Dual-line chart
    - Monthly/weekly aggregation
  
  - **Top Items by Spend**:
    - Horizontal bar chart or list
    - Shows item_name and total amount
    - Filterable by bucket
  
  - **Per-Item Spend Analysis**:
    - Table or list view
    - Sortable columns: Item Name, Total Spend, Count, Avg per Transaction
    - Filterable by date range, bucket, currency

- **Export Options** (optional):
  - "Export to CSV" button
  - "Share Report" button

---

### 8. Settings Screen

#### Layout
- **Mode Selection Section**:
  - Title: "Discipline Mode"
  - Current mode badge
  - Three option cards (Light, Intermediate, Strict):
    - Mode name
    - Brief description
    - Limiter values table (per bucket)
    - Radio button or toggle
  - Info tooltip explaining how modes affect affordability checks

- **Currency Settings**:
  - Default currency selector
  - Supported currencies list (with balances)
  - "Add Currency" option (if multi-currency enabled)

- **Profile Section**:
  - Email display (read-only)
  - Account creation date
  - "Change Password" link
  - "Delete Account" option (with confirmation)

- **Preferences**:
  - Locale/date format selector
  - Notification preferences (if implemented)
  - Theme (if dark mode supported)

- **About Section**:
  - App version
  - Terms of Service link
  - Privacy Policy link
  - Support/Contact link

- **Logout Button** (bottom, red/destructive style)

---

## Component Specifications

### Buttons
- **Primary**: Solid background, high contrast, 44px min height
- **Secondary**: Outlined/border style
- **Destructive**: Red color scheme (for delete/logout)
- **Disabled**: Reduced opacity, no interaction
- **Loading**: Spinner icon, disabled state

### Input Fields
- **Text Inputs**: 
  - Clear label above or floating label
  - Error state: Red border + error message below
  - Success state: Green border (optional)
  - Helper text support
  
- **Numeric Inputs**:
  - Currency symbol prefix
  - Thousands separator
  - Decimal precision (2 places for currency)
  - Numeric keyboard on mobile

- **Selectors/Dropdowns**:
  - Native select on mobile, custom dropdown on desktop
  - Searchable for long lists
  - Clear selected value option

### Cards
- **Elevation**: Subtle shadow (mobile) or border (desktop)
- **Padding**: 16px standard, 24px for large cards
- **Border Radius**: 8-12px
- **Hover State**: Slight elevation increase (desktop)

### Modals/Dialogs
- **Backdrop**: Semi-transparent overlay
- **Content**: Centered card, max-width on desktop
- **Close**: X button (top-right) or tap outside (mobile)
- **Actions**: Buttons at bottom, right-aligned

### Status Indicators
- **Success**: Green checkmark icon
- **Warning**: Yellow/yellow-orange icon
- **Error**: Red X or alert icon
- **Info**: Blue info icon

### Loading States
- **Skeleton screens**: For content loading
- **Spinners**: For actions/operations
- **Progress bars**: For multi-step processes

---

## User Flows

### Flow 1: First-Time User Onboarding
1. Sign up → Email verification
2. Onboarding screens (mode, currency selection)
3. Dashboard (empty state)
4. Prompt to add first income
5. Add Income screen → Allocation preview
6. Return to Dashboard → Buckets populated

### Flow 2: Recording Income
1. Dashboard → "Add Income" button
2. Fill income form (amount, currency, date, note)
3. View allocation preview
4. Confirm → Success message
5. Return to Dashboard → Updated balances

### Flow 3: Making a Purchase
1. Dashboard → "Record Purchase" button
2. Select bucket (excludes Savings)
3. Enter amount → Live affordability check
4. **If blocked** (when `amount × limiter > bucketBalance`):
   - Alert banner appears immediately (red, prominent, cannot dismiss)
   - Alert shows: "Purchase Blocked" with explanation
   - Maximum affordable amount displayed: `bucketBalance ÷ limiter`
   - Calculation breakdown shown (balance, limiter, max affordable)
   - Options presented:
     - "Use Max Affordable" button (one-click to fill amount with max)
     - "Reduce Amount" button (manually adjust)
     - "Use Different Bucket" button (shows alternatives with their max affordable amounts)
   - Cannot proceed until amount is adjusted or different bucket selected
5. If approved:
   - Fill item name, category, note
   - Confirm purchase
   - Success message
   - Return to Dashboard → Updated balance

### Flow 4: Managing Expenses
1. Expenses tab → "Add Expense" button
2. Fill expense form (name, amount, currency, due date, priority)
3. Save → Expense appears in list
4. On next income allocation, expense is automatically reserved
5. Toggle expense active/inactive as needed

### Flow 5: Viewing Analytics
1. Analytics tab
2. Select time period and currency
3. View summary cards
4. Explore charts (tap to filter/interact)
5. View per-item spend table
6. Export or share (if implemented)

---

## Responsive Design

### Breakpoints
- **Mobile**: < 768px (primary)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Bottom navigation bar (always visible)
- Full-width cards and forms
- Stacked layouts
- Touch-optimized targets (44px minimum)
- Swipe gestures for actions

### Tablet Adaptations
- Side navigation or persistent bottom nav
- 2-3 column grids
- Larger touch targets
- More horizontal space utilization

### Desktop Adaptations
- Side navigation drawer
- Multi-column layouts
- Hover states
- Keyboard navigation support
- Larger modals and dialogs

---

## Accessibility

### Requirements
- **WCAG 2.1 AA compliance**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators visible
- Alt text for icons/images
- ARIA labels where needed
- Color not sole indicator (use icons/text)

### Text
- Minimum font size: 14px (body), 16px preferred
- Line height: 1.5 minimum
- Sufficient color contrast (4.5:1 for text)

---

## Visual Design Guidelines

### Typography
- **Headings**: Bold, 18-24px (mobile), larger on desktop
- **Body**: Regular, 14-16px
- **Numbers/Currency**: Monospace or tabular numbers for alignment
- **Labels**: Medium weight, 12-14px

### Spacing
- **Grid**: 8px base unit
- **Card padding**: 16px
- **Section spacing**: 24px
- **Element spacing**: 8-16px

### Colors
- **Primary Brand**: Teal (#14b8a6) - Primary brand color, used for Investment bucket and key CTAs
- **Primary Palette**: Teal scale (50-950) for gradients and variations
- **Success**: Green (#10b981) - Positive actions, approved states
- **Warning**: Amber (#f59e0b) - Caution states, Fun bucket
- **Error**: Red (#ef4444) - Errors, blocked states, Emergency bucket
- **Info**: Blue (#3b82f6) - Informational messages
- **Neutral**: Gray/slate scale for text and backgrounds
- **Bucket Colors** (Teal-based palette):
  - Necessity: Cyan-teal (#0891b2)
  - Investment: Primary teal (#14b8a6)
  - Learning: Sky blue-teal (#0ea5e9)
  - Emergency: Red (#ef4444)
  - Fun: Amber (#f59e0b)
  - Savings: Slate gray (#64748b)
- **Full color palette**: See `src/data/colors.js` for complete color system

### Icons
- Consistent icon set (e.g., Heroicons, Feather Icons)
- Size: 20-24px standard, 16px for small, 32px for large
- Stroke width: 1.5-2px

---

## Performance Considerations

### Loading
- Lazy load analytics charts
- Paginate transaction lists (infinite scroll or "Load More")
- Optimize images/icons (SVG preferred)
- Skeleton screens during data fetch

### Interactions
- Debounce input validation (affordability checks)
- Optimistic UI updates where appropriate
- Smooth animations (60fps target)
- Minimal re-renders

---

## Error States

### Network Errors
- Clear error message
- Retry button
- Offline indicator (if PWA)

### Validation Errors
- Inline field errors
- Summary at top of form (if multiple errors)
- Clear, actionable messages

### Empty States
- Friendly illustrations/icons
- Helpful copy
- Clear CTAs

### Error Boundaries
- Graceful fallback UI
- Error reporting (if implemented)
- Recovery options

---

## Future Enhancements (Post-MVP)

- Dark mode theme
- Recurring expenses
- Budget goals per bucket
- Push notifications
- Export to PDF
- Multi-account support
- Category icons/images
- Receipt photo upload
- Bank account integration
- Advanced analytics (forecasting, trends)

---

## Notes

- All monetary values should respect locale formatting (thousands separators, decimal symbols)
- Currency symbols should be displayed consistently (prefix or suffix based on locale)
- Dates should respect user locale and timezone
- Negative balances should be clearly indicated (red color, minus sign, warning icon)
- Mode changes should be immediately reflected in affordability checks
- All user actions should have clear feedback (success messages, error messages, loading states)

