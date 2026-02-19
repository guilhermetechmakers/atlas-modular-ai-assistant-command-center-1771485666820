# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

**
- Use Tailwind CSS for styling
- Use Shadcn UI components for consistency
- Apply Radix UI for accessible primitives
- Implement responsive design (mobile-first approach)

**Component Structure:**
- Main page container with proper layout
- Header section with title and actions
- Content area with data display/forms
- Loading states with skeleton loaders
- Error states with user-friendly messages
- Empty states with helpful guidance

**Visual States:**
- Initial/Empty: Clear placeholder content
- Loading: Skeleton loaders or spinners
- Success: Data display with proper formatting
- Error: User-friendly error messages with retry options

**Interactions:**
- Hover effects on interactive elements
- Click feedback with visual indicators
- Form validation with inline error messages
- Toast notifications for actions (use Shadcn toast)

## CRUD UI Requirements

**List view:** Table or list with pagination, sorting, and filters. Use Shadcn Table component.

**Create:** Use modal or drawer for quick create. For complex forms, use dedicated page at `/resource/new`.

**Edit:** Use modal/drawer for inline edit, or detail page with edit mode at `/resource/:id/edit`.

**Detail:** Include detail page for viewing single item at `/resource/:id`.

**Delete:** Confirm dialog before delete. Use Shadcn AlertDialog.

## Execution Context

**Server-side only.** Implement as Supabase Edge Function. No client-side business logic. Use `supabase/functions/<name>/index.ts`.

- All request handling, validation, and data access must run in the Edge Function
- Client calls the function via `supabase.functions.invoke()`
- Do NOT put sensitive logic or third-party API calls in client code

## Components and Pages to Build

**Main Page:**
- `src/pages/Dashboard/CommandCenter.tsx` - Main page component
- Export default page component
- Implement data fetching with React Query or SWR
- Handle loading and error states

**Related Components:**
- `src/components/dashboard-/-command-center/GlobalSearchBar:omniboxwithfuzzysearchacrossrepos,notes,events,transactions.tsx`
- `src/components/dashboard-/-command-center/TodayPanel:calendarevents,focusblocks,quicktasks.tsx`
- `src/components/dashboard-/-command-center/GitHubSummaryCard:recentcommits,PRs,issues(reposelectionfilter).tsx`
- `src/components/dashboard-/-command-center/ContentPipelineCard:duedrafts,scheduledposts,quick-createidea.tsx`
- `src/components/dashboard-/-command-center/FinanceSnapshotCard:recenttransactions,runwayalert.tsx`
- `src/components/dashboard-/-command-center/AgentActivityFeed:recentagentoutputs,pendingapprovals.tsx`
- `src/components/dashboard-/-command-center/QuickActionsToolbar:createissue,newnote,createagent,importCSV.tsx`
- `src/components/dashboard-/-command-center/Notifications&AuditLogQuickLink.tsx`

## Navigation Between Components and Pages

**Routing Setup:**
- Add route: `/dashboard-/-command-center` in your routing configuration
- Update navigation menu to include this page
- Ensure proper route guards if authentication is required

**Navigation Flow:**
- **View Command Center Dashboard:**
- **Ask Agent: 'What Should I Do Today?':**
  - Trigger: User action
  - Result: Navigate to next step
- **Review and Approve/Reject Skills:**
  - Trigger: User action
  - Result: Navigate to next step
- **Create Task/Event from Agent Suggestion:**
- **Manage Profile & Workspace Settings:**
  - Trigger: User action
  - Result: Navigate to next step
- **Daily Workflow Complete:**

**Integration Points:**
- Update navigation components to include new routes
- Implement breadcrumbs if part of a multi-step flow

## Feature Dependencies

**This feature depends on:**
- Projects (GitHub) (User opens Projects from dashboard card)
- Content Pipeline (User opens Content Pipeline from dashboard card)
- Research & Knowledge Base (User opens Research card)
- Personal / Calendar & Travel (User opens Today/Calendar from dashboard)
- Finance Cockpit (User opens Finance alert from dashboard)
- AI LLM API (OpenAI / compatible) (agent suggestions call LLM API)

**Features that depend on this:**
- Login / Signup (Successful login redirects to Dashboard)
- Email Verification (Verified account directs to onboarding/dashboard)
- Global Search & Filters (search implemented on dashboard)
- Agent Runtime & Execution (agent outputs appear in dashboard feed)
- Notifications & Alerts (notifications surfaced on dashboard)
- GitHub Integration (implements)
- Calendar Integration (Google Calendar) (implements)
- Research Notes & KB (implements)
- Tasks & Routines (implements)
- Finance Ledger & Reports (implements)
- Audit Logs & Approvals (implements)

## Userflow

**Complete User Journey:**

1. **View Command Center Dashboard** (step_page)
   - User lands on the main dashboard showing unified summaries: GitHub activity, calendar, content tasks, finance alerts, and agent suggestions.
   - Page type: Standard page

2. **Ask Agent: 'What Should I Do Today?'** (action)
   - User interacts with the agent chat input to request a daily agenda, triggering AI agent workflow.
   - Action: User performs action
   - Expected result: Action completes successfully

3. **Review and Approve/Reject Skills** (action)
   - Admin reviews pending skill installation/updates for agent access and approves or rejects with reason.
   - Action: User performs action
   - Expected result: Action completes successfully

4. **Create Task/Event from Agent Suggestion** (decision)
   - User chooses to accept or modify an agent-suggested agenda item, triggering task/event creation.

5. **Manage Profile & Workspace Settings** (action)
   - User accesses and updates profile details, notification settings, integrations, or exports workspace data.
   - Action: User performs action
   - Expected result: Action completes successfully

6. **Daily Workflow Complete** (end_point)
   - User has reviewed their dashboard, executed agent-driven actions, and updated settings, achieving their daily productivity goals.
   - Goal achieved: User completes flow

## Data Schema to be Implemented

**Database Tables:**

```sql
-- dashboard_/_command_center table
CREATE TABLE dashboard_/_command_center (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security (RLS):**

```sql
-- Enable RLS
ALTER TABLE dashboard_/_command_center ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "dashboard_/_command_center_read_own" ON dashboard_/_command_center
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "dashboard_/_command_center_insert_own" ON dashboard_/_command_center
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "dashboard_/_command_center_update_own" ON dashboard_/_command_center
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "dashboard_/_command_center_delete_own" ON dashboard_/_command_center
  FOR DELETE USING (auth.uid() = user_id);
```

**TypeScript Types:**

```typescript
interface Dashboard/CommandCenter {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
```

## Acceptance Criteria

**Functional:**
- [ ] Dashboard / Command Center implemented per scope
- [ ] All elements present and functional
- [ ] User flows complete: View Command Center Dashboard, Ask Agent: 'What Should I Do Today?', Review and Approve/Reject Skills, Create Task/Event from Agent Suggestion, Manage Profile & Workspace Settings, Daily Workflow Complete
- [ ] Error handling, loading, empty states

**Technical:**
- [ ] Project conventions, TypeScript types, no console errors
- [ ] Responsive, accessible (WCAG 2.1 AA)
- [ ] Route, nav link, SEO meta
- [ ] Schema, RLS, CRUD working

**Integration:** No breaking changes; flows intact

**Testing:** Feature works; edge cases and errors handled

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
