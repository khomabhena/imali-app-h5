# Imali App — Build Plan & Priorities

Last updated: 2025-11-16

## Build Order (MVP)

### Phase 1: Foundation & Setup ⚡ (Start Here)

**Goal**: Get the basic infrastructure in place

1. **Supabase Setup**
   - Install `@supabase/supabase-js`
   - Create Supabase client configuration
   - Set up environment variables (`.env` file)
   - Create Supabase project and get API keys

2. **Project Structure**
   - Set up folder structure:
     ```
     src/
       components/     # Reusable UI components
       pages/          # Route pages
       hooks/          # Custom React hooks
       services/       # API/Supabase services
       utils/          # Helper functions
       contexts/       # React contexts (Auth, etc.)
       lib/            # Supabase client, configs
     ```

3. **Routing Setup**
   - Configure React Router
   - Set up protected routes
   - Create route structure:
     - `/` → Dashboard (protected)
     - `/login` → Login
     - `/signup` → Sign Up
     - `/income` → Add Income
     - `/purchase` → Record Purchase
     - `/expenses` → Expenses
     - `/transactions` → Transactions
     - `/analytics` → Analytics
     - `/settings` → Settings

4. **Basic Layout Components**
   - App shell with navigation
   - Bottom tab bar (mobile-first)
   - Header component
   - Loading states
   - Error boundaries

5. **Design System Setup**
   - Tailwind config with bucket colors
   - Typography scale
   - Component variants (buttons, cards, inputs)
   - Responsive utilities

**Estimated Time**: 2-3 hours

---

### Phase 2: Authentication 🔐 (Critical Path)

**Goal**: Users can sign up, log in, and access protected routes

1. **Auth Context**
   - Create `AuthContext` with Supabase auth
   - Provide auth state (user, session, loading)
   - Auth methods (signIn, signUp, signOut)

2. **Login Page**
   - Email/password form
   - Validation
   - Error handling
   - Redirect to dashboard on success

3. **Sign Up Page**
   - Email/password/confirm password
   - Password strength indicator
   - Email verification flow
   - Auto-create profile on signup

4. **Onboarding Flow** (First-time users)
   - Mode selection (Light/Intermediate/Strict)
   - Default currency selection
   - Initialize user settings in database

5. **Protected Route Wrapper**
   - Redirect to login if not authenticated
   - Show loading during auth check

**Estimated Time**: 3-4 hours

---

### Phase 3: Database Setup & Seed Data 🗄️

**Goal**: Set up Supabase tables and initial data

1. **Database Schema**
   - Create tables (profiles, buckets, balances, transactions, expenses, settings)
   - Set up Row-Level Security (RLS) policies
   - Create indexes for performance
   - Set up foreign key constraints

2. **Seed Buckets**
   - Create default buckets (Necessity, Investment, Learning, Emergency, Fun, Savings)
   - Set allocation percentages (10% each for main 5)
   - Set limiter values per mode per bucket

3. **Database Functions** (Optional but recommended)
   - Function to calculate bucket balance from transactions
   - Function to handle income allocation
   - Triggers for balance updates

**Estimated Time**: 2-3 hours

---

### Phase 4: Core Data Layer 📦

**Goal**: Build reusable hooks and services for data operations

1. **Supabase Service Layer**
   - `useAuth()` hook (wrap AuthContext)
   - `useBuckets()` hook (fetch buckets)
   - `useBalances()` hook (fetch balances by currency)
   - `useTransactions()` hook (fetch with filters)
   - `useExpenses()` hook (fetch active expenses)
   - `useSettings()` hook (fetch/update user settings)

2. **Business Logic Utilities**
   - `calculateAffordability()` function
   - `calculateMaxAffordable()` function
   - `calculateAllocation()` function (income allocation logic)
   - Currency formatting utilities
   - Date formatting utilities

3. **Transaction Service**
   - `recordIncome()` function
   - `recordPurchase()` function
   - `recordExpense()` function
   - Handle allocation logic on income

**Estimated Time**: 4-5 hours

---

### Phase 5: Dashboard 🏠 (First User-Facing Feature)

**Goal**: Users can see their buckets and balances

1. **Dashboard Page**
   - Fetch and display all bucket balances (default currency)
   - Bucket cards with colors
   - Total balance display
   - Empty state (no income yet)

2. **Bucket Card Component**
   - Balance display (positive/negative/zero states)
   - Bucket name and allocation %
   - Color-coded styling
   - Tap to view details (future)

3. **Quick Actions**
   - "Add Income" button → navigate to income page
   - "Record Purchase" button → navigate to purchase page

4. **Currency Switcher** (if multi-currency)
   - Dropdown in header
   - Switch currency and reload balances

5. **Mode Indicator**
   - Display current mode badge
   - Quick toggle (future: link to settings)

**Estimated Time**: 3-4 hours

---

### Phase 6: Add Income Flow 💰

**Goal**: Users can record income and see allocation preview

1. **Add Income Page**
   - Form: amount, currency, date, note
   - Currency selector
   - Date picker

2. **Allocation Preview Component**
   - Show gross income
   - Show active expenses total
   - Show net after expenses
   - Breakdown: 10% to each bucket
   - Remainder to Savings
   - Visual representation (bars or list)

3. **Income Recording Logic**
   - Calculate allocations
   - Reserve expenses
   - Create transaction records
   - Update balances
   - Handle negative net scenarios

4. **Success Flow**
   - Success message/toast
   - Redirect to dashboard
   - Refresh balances

**Estimated Time**: 4-5 hours

---

### Phase 7: Record Purchase Flow 🛒 (Core Feature)

**Goal**: Users can record purchases with affordability checks

1. **Record Purchase Page**
   - Form: amount, bucket, item name, category, date, note
   - Bucket selector (exclude Savings)
   - Numeric input with currency

2. **Live Affordability Check Component**
   - Real-time calculation as user types
   - Status indicator (Approved/Warning/Blocked)
   - Display: balance, amount, remaining, required minimum
   - Mode indicator

3. **Blocked State Alert** (Critical Feature)
   - Red alert banner when `amount × limiter > balance`
   - Clear error message
   - **Maximum affordable amount display**: `balance ÷ limiter`
   - Calculation breakdown
   - "Use Max Affordable" button (fills amount field)

4. **Alternative Buckets Display**
   - When blocked, show other buckets
   - Display max affordable for each
   - Allow switching bucket

5. **Purchase Recording**
   - Validate affordability before submit
   - Create expense transaction
   - Update bucket balance
   - Success feedback

**Estimated Time**: 5-6 hours (most complex feature)

---

### Phase 8: Expenses Management 📋

**Goal**: Users can manage one-time expenses

1. **Expenses List Page**
   - Fetch active expenses
   - Display expense cards (name, amount, due date, priority)
   - Summary card (total active expenses)
   - Empty state

2. **Add/Edit Expense Form**
   - Form fields: name, amount, currency, due date, priority, note
   - Active toggle
   - Save/cancel actions

3. **Expense Actions**
   - Toggle active/inactive
   - Edit expense
   - Delete expense (with confirmation)

4. **Integration with Income**
   - Expenses automatically reserved on income allocation
   - Show impact in income preview

**Estimated Time**: 3-4 hours

---

### Phase 9: Transactions History 📜

**Goal**: Users can view transaction history

1. **Transactions List Page**
   - Fetch transactions with filters
   - Group by date (Today, Yesterday, This Week, etc.)
   - Display: type, item, bucket, amount, date

2. **Filters**
   - Date range picker
   - Bucket filter (multi-select)
   - Currency filter
   - Transaction type filter
   - Clear filters

3. **Transaction Detail Modal**
   - Full transaction info
   - Edit/delete (if allowed)

4. **Empty States**
   - No transactions message
   - CTA to record first transaction

**Estimated Time**: 3-4 hours

---

### Phase 10: Settings ⚙️

**Goal**: Users can configure app preferences

1. **Settings Page**
   - Mode selection (Light/Intermediate/Strict)
   - Mode explanation and limiter table
   - Default currency selector
   - Profile info (email, created date)
   - Change password
   - Logout button

2. **Mode Change Logic**
   - Update user settings
   - Immediately affect affordability checks
   - Persist to database

**Estimated Time**: 2-3 hours

---

### Phase 11: Analytics 📊 (Nice to Have for MVP)

**Goal**: Users can view spending insights

1. **Analytics Page**
   - Time period selector
   - Currency filter

2. **Summary Cards**
   - Total income
   - Total expenses
   - Net balance
   - Top category

3. **Charts** (Use a library like Recharts or Chart.js)
   - Per-bucket balance over time
   - Income vs expenses trend
   - Top items by spend

4. **Per-Item Spend Table**
   - Sortable table
   - Filterable by date, bucket, currency

**Estimated Time**: 4-5 hours

---

## Recommended First Steps (Today)

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Set Up Supabase
1. Create Supabase project at https://supabase.com
2. Get API keys (anon key, service role key)
3. Create `.env` file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 3: Create Project Structure
- Set up folders (components, pages, hooks, services, etc.)
- Create basic layout components
- Set up routing

### Step 4: Build Authentication
- This unlocks everything else
- Can test with mock data initially

### Step 5: Build Dashboard
- First visual feature users will see
- Can use mock data to build UI
- Then connect to real data

---

## Development Tips

1. **Start with Mock Data**: Build UI components first, then connect to Supabase
2. **Test Incrementally**: Get each phase working before moving to next
3. **Mobile-First**: Always test on mobile viewport first
4. **Error Handling**: Add error states early
5. **Loading States**: Show loading indicators for all async operations

---

## Dependencies to Install

```bash
# Core
npm install @supabase/supabase-js

# Optional but recommended
npm install date-fns          # Date formatting
npm install recharts          # Charts for analytics
npm install react-hot-toast   # Toast notifications
npm install zod               # Form validation
npm install @hookform/resolvers  # React Hook Form integration
```

---

## Next Actions

1. ✅ Create this build plan
2. ⬜ Install Supabase client
3. ⬜ Set up project structure
4. ⬜ Configure routing
5. ⬜ Build authentication
6. ⬜ Set up database schema
7. ⬜ Build dashboard

---

## Notes

- **MVP Focus**: Get core flows working (income → allocation → purchase with affordability)
- **Polish Later**: Analytics, advanced filtering, optimizations
- **Test Early**: Test affordability calculations thoroughly
- **Mobile Testing**: Use browser dev tools mobile viewport

