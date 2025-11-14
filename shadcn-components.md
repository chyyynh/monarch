# Shadcn UI Components Migration Analysis

> **Project:** Monarch DeFi Frontend
> **Current UI Library:** HeroUI (formerly NextUI)
> **Analysis Date:** 2025-11-15
> **Total React Components Analyzed:** 189+ .tsx files

---

## Executive Summary

This document provides a comprehensive analysis of the Monarch frontend codebase to identify opportunities for migrating from **HeroUI** to **shadcn/ui** components to improve code readability, maintainability, and flexibility.

### Key Findings

- **Current State:** The project exclusively uses HeroUI as its component library
- **No shadcn/ui:** Currently NOT using any shadcn components
- **Migration Potential:** High - Most HeroUI components have shadcn equivalents
- **Custom Components:** Well-designed custom wrappers that would need careful refactoring
- **Estimated Impact:** Medium-High effort, High reward for long-term maintainability

---

## Table of Contents

1. [Current Component Library Stack](#1-current-component-library-stack)
2. [Component-by-Component Migration Analysis](#2-component-by-component-migration-analysis)
3. [Benefits of Migrating to shadcn/ui](#3-benefits-of-migrating-to-shadcnui)
4. [Migration Complexity Assessment](#4-migration-complexity-assessment)
5. [Recommended Migration Strategy](#5-recommended-migration-strategy)
6. [Implementation Examples](#6-implementation-examples)
7. [Potential Challenges](#7-potential-challenges)
8. [Final Recommendations](#8-final-recommendations)

---

## 1. Current Component Library Stack

### 1.1 HeroUI Components in Use

**Installed HeroUI Packages:**
```json
"@heroui/react": "^2.4.2",
"@heroui/button": "^2.0.34",
"@heroui/checkbox": "^2.1.2",
"@heroui/input": "^2.2.2",
"@heroui/system": "^2.2.2",
"@heroui/table": "^2.0.36",
"@heroui/theme": "^2.2.6",
"@heroui/tooltip": "^2.0.36",
"@heroui/accordion": "^2.0.35"
```

**Components Actively Used Across Codebase:**

| Category | Components | Usage Count |
|----------|-----------|-------------|
| **Form** | Button, Input, Checkbox, Switch, Slider, Select | 50+ files |
| **Layout** | Card, CardHeader, CardBody, Divider, Modal | 40+ files |
| **Data Display** | Table, Badge, Tooltip, Progress | 30+ files |
| **Navigation** | Dropdown, Link | 15+ files |
| **Feedback** | Spinner, Modal | 20+ files |
| **Date** | DatePicker | 3 files |
| **Other** | Pagination, useDisclosure hook | 10+ files |

### 1.2 Supporting Libraries

```json
{
  "UI Primitives": "@radix-ui/react-icons, @radix-ui/react-dropdown-menu, @radix-ui/react-navigation-menu",
  "Styling": "tailwind-variants, tailwind-merge, clsx",
  "Icons": "react-icons, @heroicons/react",
  "Animations": "framer-motion, animejs, @react-spring/web",
  "Charts": "recharts",
  "Notifications": "sonner",
  "Forms": "downshift, zod",
  "State": "@tanstack/react-query"
}
```

### 1.3 Custom Component Organization

```
/src/components/
├── /common/
│   ├── Button.tsx              ⭐ Custom HeroUI variant extension
│   ├── Badge.tsx               ⭐ Pure Tailwind implementation
│   ├── /Modal/                 ⭐ Custom modal system
│   │   ├── Modal.tsx           (Wrapper with z-index management)
│   │   ├── ModalHeader.tsx     (Title, description, actions)
│   │   ├── ModalBody.tsx       (Content with variants)
│   │   └── ModalFooter.tsx     (Action buttons)
│   ├── DatePicker.tsx          (HeroUI DatePicker wrapper)
│   ├── AllocatorCard.tsx       ⭐ Pure Tailwind card
│   ├── FilterComponents.tsx    ⭐ Pure Tailwind
│   └── Spinner.tsx             ⭐ Custom CSS animation
├── /Input/
│   └── Input.tsx               ⭐ Crypto-specific input (BigInt handling)
├── /layout/
│   └── /header/                (Navigation components)
└── [feature-specific components...]
```

**Legend:**
- ⭐ = Prime candidate for shadcn migration
- (HeroUI) = Currently using HeroUI
- Pure Tailwind = Already custom implementation

---

## 2. Component-by-Component Migration Analysis

### 2.1 BUTTON Components

#### Current Implementation (HeroUI)

**File:** `src/components/common/Button.tsx`

```typescript
export const Button = extendVariants(NextUIButton, {
  variants: {
    variant: {
      default: 'bg-surface hover:bg-surface/80...',
      cta: 'bg-monarch-orange text-white...',
      secondary: 'bg-hovered text-foreground',
      interactive: 'bg-hovered hover:bg-primary hover:text-white...',
      ghost: 'bg-transparent hover:bg-surface/5...',
      subtle: 'bg-surface shadow-sm hover:shadow...',
    },
    size: { xs, sm, md, lg },
    radius: { none, base },
    fullWidth: { true },
    isLoading: { true },
  },
});
```

**Usage Examples:**
- Markets page: "Supply", "Borrow" buttons
- Modals: Action buttons (Confirm, Cancel)
- Tables: Action dropdowns
- Forms: Submit buttons
- Total files using Button: ~50+

#### shadcn/ui Equivalent

**Component:** `Button` (from shadcn/ui)

**Migration Approach:**
```typescript
// shadcn button with custom variants
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-surface hover:bg-surface/80",
        cta: "bg-monarch-orange text-white hover:bg-monarch-orange/80",
        secondary: "bg-hovered text-foreground",
        interactive: "bg-hovered text-foreground hover:bg-primary hover:text-white",
        ghost: "bg-transparent hover:bg-surface/5",
        subtle: "bg-surface shadow-sm hover:shadow text-foreground hover:bg-default-100",
      },
      size: {
        xs: "h-6 px-1.5 py-1 text-xs min-w-[40px]",
        sm: "h-8 px-1.5 py-1 text-xs min-w-[64px]",
        md: "h-10 px-4 py-2 min-w-[80px]",
        lg: "h-12 px-6 py-3 text-md min-w-[96px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
```

**Benefits of Migration:**
- ✅ More explicit variant definitions
- ✅ Better TypeScript intellisense
- ✅ No runtime dependency (copy-paste component)
- ✅ Easier to customize
- ✅ Smaller bundle size

**Migration Complexity:** 🟡 MEDIUM
- Need to update all Button imports
- Custom variant names already match well
- Loading state needs custom implementation

---

### 2.2 MODAL / DIALOG Components

#### Current Implementation (HeroUI Modal System)

**Files:**
- `src/components/common/Modal/Modal.tsx` - Base modal wrapper
- `src/components/common/Modal/ModalHeader.tsx` - Header with title/description/actions
- `src/components/common/Modal/ModalBody.tsx` - Content container
- `src/components/common/Modal/ModalFooter.tsx` - Footer with actions

**Key Features:**
```typescript
// Z-index management system
const Z_INDEX_MAP = {
  base: { wrapper: 'z-[2000]', backdrop: 'z-[1990]' },
  process: { wrapper: 'z-[2600]', backdrop: 'z-[2590]' },
  selection: { wrapper: 'z-[3000]', backdrop: 'z-[2990]' },
  settings: { wrapper: 'z-[3200]', backdrop: 'z-[3190]' },
};

// Backdrop variants
backdrop: 'transparent' | 'opaque' | 'blur'

// Content variants
variant: 'standard' | 'compact' | 'custom'
```

**Modal Types in Use:**
- DeploymentModal (vault deployment)
- DepositModal (deposit funds)
- WithdrawModal (withdraw funds)
- BorrowModal (borrow assets)
- VaultSettingsModal (settings)
- RiskWarningModal (risk disclaimers)
- ~15+ different modal implementations

#### shadcn/ui Equivalent

**Component:** `Dialog` + `Sheet` (for drawers)

**Migration Complexity:** 🔴 HIGH
- Modal system is extensively used (~20+ files)
- Custom z-index management needs preservation
- useDisclosure hook needs replacement (useState + callbacks)
- Multiple modal variants need porting

---

### 2.3 INPUT Components

#### Current Implementation

**File:** `src/components/Input/Input.tsx`

**Specialized Features:**
- BigInt/viem integration for blockchain values
- Decimal handling (parseUnits/formatBalance)
- Max button functionality
- Error state management
- Cryptocurrency-specific validation

```typescript
<Input
  decimals={18}
  setValue={(value: bigint) => {...}}
  max={maxBalance}
  setError={setError}
/>
```

#### shadcn/ui Equivalent

**Component:** `Input`

**Migration Complexity:** 🟢 LOW-MEDIUM
- Core logic stays the same
- Only need to swap base Input component
- Can preserve all BigInt handling

---

### 2.4 CARD Components

#### Current Implementation

**HeroUI Cards:**
```typescript
import { Card, CardHeader, CardBody } from "@heroui/react";

<Card className="bg-surface border border-white/10">
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

**Custom Pure Tailwind Card:**
```typescript
// AllocatorCard.tsx - Already custom implementation
<button className={`
  w-full rounded border p-4 text-left transition-all
  ${isSelected
    ? 'border-primary bg-primary/10'
    : 'border-gray-100 bg-gray-50/50 hover:border-gray-300'
  }
`}>
  <div className="flex flex-col gap-3">
    <h4>{name}</h4>
    <p>{description}</p>
  </div>
</button>
```

#### shadcn/ui Equivalent

**Component:** `Card`

**Migration Complexity:** 🟢 LOW
- Simple 1:1 replacement
- AllocatorCard already uses pure Tailwind (no change needed)
- ~15 files using Card components

---

### 2.5 TABLE Components

#### Current Implementation

**Usage:**
- Markets table (`app/markets/components/marketsTable.tsx`)
- Positions table
- Rewards table
- History table
- Transaction tables
- ~15+ table implementations

**Current Approach:**
```typescript
// Custom HTML table with Tailwind
<table className="responsive rounded-md font-zen">
  <thead className="table-header">
    <tr>
      <HTSortable label="Loan" {...sortProps} />
      <th>Collateral</th>
      <th>APY</th>
    </tr>
  </thead>
  <tbody>
    {markets.map(market => (
      <MarketTableBody market={market} key={market.id} />
    ))}
  </tbody>
</table>
```

#### shadcn/ui Equivalent

**Component:** `Table` + `DataTable` pattern (uses TanStack Table)

**Migration Complexity:** 🔴 HIGH
- 15+ table files to migrate
- Complex sorting/filtering logic
- Custom cell components (charts, badges)
- Worth it for long-term maintainability

**Note:** Project already has `@types/react-table` and `react-table` installed!

---

### 2.6 SELECT / DROPDOWN Components

#### Current Implementation

**HeroUI Select:**
```typescript
import { Select, SelectItem } from "@heroui/react";

<Select
  label="Select Network"
  selectedKeys={[selectedNetwork]}
  onSelectionChange={(keys) => setSelectedNetwork(Array.from(keys)[0])}
>
  {networks.map(network => (
    <SelectItem key={network.id} value={network.id}>
      {network.name}
    </SelectItem>
  ))}
</Select>
```

#### shadcn/ui Equivalent

**Components:** `Select` + `DropdownMenu` + `Combobox`

**Migration Complexity:** 🟡 MEDIUM
- ~10-15 files using Select/Dropdown
- Need to update selection handling logic

---

### 2.7 BADGE Component

#### Current Implementation

**File:** `src/components/common/Badge.tsx`

**Already Pure Tailwind + tailwind-variants!**

```typescript
import { tv, type VariantProps } from 'tailwind-variants';

const badge = tv({
  base: 'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      primary: 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400',
      success: 'bg-green-100 text-green-600 dark:bg-green-800/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800/30 dark:text-yellow-400',
      danger: 'bg-red-100 text-red-600 dark:bg-red-800/30 dark:text-red-400',
    },
  },
});
```

#### shadcn/ui Equivalent

**Assessment:**
✅ **ALREADY COMPATIBLE!** Your Badge component is essentially a shadcn-style implementation.

**Recommendation:** Keep as-is, or add to `components/ui/` folder to formalize it as part of your design system.

**Migration Complexity:** 🟢 NONE
- Already follows shadcn patterns
- Uses `tailwind-variants` (same as CVA)
- No changes needed

---

### 2.8 TOOLTIP Component

#### Current Implementation

```typescript
import { Tooltip } from "@heroui/react";

<Tooltip content="Helper text">
  <Button>Hover me</Button>
</Tooltip>
```

#### shadcn/ui Equivalent

**Component:** `Tooltip`

**Migration Complexity:** 🟡 MEDIUM
- ~30+ files using Tooltip
- Need to wrap app in TooltipProvider
- Need to refactor from content prop to nested structure

---

### 2.9 CHECKBOX & SWITCH Components

#### Current Implementation

```typescript
import { Checkbox, Switch } from "@heroui/react";

<Checkbox isSelected={checked} onValueChange={setChecked}>
  Accept terms
</Checkbox>

<Switch isSelected={enabled} onValueChange={setEnabled}>
  Enable feature
</Switch>
```

#### shadcn/ui Equivalent

**Components:** `Checkbox` + `Switch`

**Migration Complexity:** 🟢 LOW-MEDIUM
- ~10 files using Checkbox/Switch
- Simple API changes (isSelected → checked, onValueChange → onCheckedChange)

---

## 3. Benefits of Migrating to shadcn/ui

### 3.1 Code Ownership & Customization

| Aspect | HeroUI | shadcn/ui |
|--------|--------|-----------|
| **Installation** | npm package dependency | Copy-paste components into codebase |
| **Customization** | Limited to theme API + extendVariants | Full control - edit source directly |
| **Updates** | Package updates (potential breaking changes) | Manual updates (full control) |
| **Bundle Size** | Entire library shipped | Only components you use |
| **Lock-in** | Vendor lock-in | No lock-in |

**Winner:** shadcn/ui for flexibility and control

### 3.2 Developer Experience

| Aspect | HeroUI | shadcn/ui |
|--------|--------|-----------|
| **TypeScript** | Good | Excellent (more explicit types) |
| **Documentation** | Good | Excellent |
| **Intellisense** | Good | Better (variants in your codebase) |
| **Debugging** | Package code (harder) | Your code (easier) |
| **Learning Curve** | Moderate | Low (familiar React patterns) |

**Winner:** shadcn/ui for DX

### 3.3 Performance

| Aspect | HeroUI | shadcn/ui |
|--------|--------|-----------|
| **Bundle Size** | Larger (full library) | Smaller (tree-shaken) |
| **Runtime** | React Server Components support | Excellent RSC support |
| **CSS** | Tailwind + HeroUI theme | Pure Tailwind |
| **Load Time** | Slightly slower | Faster |

**Winner:** shadcn/ui for performance

---

## 4. Migration Complexity Assessment

### 4.1 Effort Matrix

| Component | Files Affected | Complexity | Time Est. | Priority |
|-----------|----------------|------------|-----------|----------|
| **Button** | ~50+ | 🟡 Medium | 4-6 hours | HIGH |
| **Modal/Dialog** | ~20+ | 🔴 High | 12-16 hours | HIGH |
| **Input** | ~15 | 🟡 Medium | 3-4 hours | MEDIUM |
| **Card** | ~15 | 🟢 Low | 2-3 hours | LOW |
| **Table** | ~15 | 🔴 High | 16-20 hours | HIGH |
| **Select/Dropdown** | ~15 | 🟡 Medium | 4-6 hours | MEDIUM |
| **Badge** | N/A | 🟢 None | 0 hours | N/A |
| **Tooltip** | ~30+ | 🟡 Medium | 4-5 hours | LOW |
| **Checkbox/Switch** | ~10 | 🟢 Low | 2-3 hours | LOW |

**Total Estimated Effort:** ~55-70 hours

---

## 5. Recommended Migration Strategy

### 5.1 Phased Approach

#### Phase 0: Preparation (Week 1)
```
[ ] Install shadcn/ui CLI
[ ] Initialize shadcn config (components.json)
[ ] Set up components/ui/ directory structure
[ ] Install base components (Button, Card, Input)
[ ] Create parallel implementation (don't remove HeroUI yet)
```

#### Phase 1: Low-Hanging Fruit (Week 2)
```
[ ] Badge (already compatible - move to ui/)
[ ] Card components (simple replacements)
[ ] Checkbox/Switch (few files)
```

#### Phase 2: Core Components (Week 3-4)
```
[ ] Button (critical, high usage)
[ ] Input (including crypto-specific wrapper)
[ ] Select/Dropdown
```

#### Phase 3: Complex Components (Week 5-7)
```
[ ] Modal/Dialog system
[ ] Tooltip
```

#### Phase 4: Data Components (Week 8-10)
```
[ ] Table/DataTable migration
```

---

## 6. Implementation Examples

### 6.1 Example: Badge Migration

**Your Badge is already shadcn-compatible!**

Just move `src/components/common/Badge.tsx` to `src/components/ui/badge.tsx`

```typescript
// Already using tailwind-variants (shadcn style)
import { tv } from 'tailwind-variants';

const badge = tv({
  base: 'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      // ... other variants
    },
  },
});

export function Badge({ children, variant, className }: BadgeProps) {
  return <span className={badge({ variant, className })}>{children}</span>;
}
```

**No changes needed!** ✅

---

## 7. Potential Challenges

### 7.1 Technical Challenges

**1. Button - 50+ files**
- High usage makes migration risky
- Solution: Create compatibility wrapper

**2. Modal Z-Index Management**
- Custom z-index system for stacked modals
- Solution: Extend shadcn Dialog with wrapper

**3. Table Complexity**
- Custom sorting implementations
- Solution: Migrate to TanStack Table (already installed!)

---

## 8. Final Recommendations

### 8.1 Should You Migrate?

**MIGRATE TO SHADCN/UI IF:**
- ✅ You want more control over component code
- ✅ You're concerned about bundle size
- ✅ You want best-in-class accessibility (Radix UI)
- ✅ You value flexibility over out-of-the-box solutions
- ✅ You have 2-3 months for gradual migration

**STAY WITH HEROUI IF:**
- ⚠️ You need to ship features quickly (no time for migration)
- ⚠️ You're happy with HeroUI's API
- ⚠️ Migration effort doesn't justify benefits

### 8.2 Our Recommendation

**🟡 CONSIDER SELECTIVE MIGRATION**

Instead of full migration, consider:
- ✅ **Badge** - Already compatible, just move it
- ✅ **New components** - Use shadcn for new features
- ✅ **Keep HeroUI** - For complex components that work well

**Hybrid Approach Benefits:**
- Lower risk
- Gradual adoption
- Best of both worlds

---

## Summary Table: Migration Priority

| Component | Priority | Complexity | Impact | Recommendation |
|-----------|----------|------------|--------|----------------|
| Badge | LOW | 🟢 None | Low | Already compatible! |
| Card | MEDIUM | 🟢 Low | Medium | Easy win |
| Checkbox/Switch | LOW | 🟢 Low | Low | Simple migration |
| Button | **HIGH** | 🟡 Medium | **High** | Complex (50+ files) |
| Input | MEDIUM | 🟡 Medium | Medium | Keep crypto logic |
| Select/Dropdown | MEDIUM | 🟡 Medium | Medium | Manageable |
| Tooltip | LOW | 🟡 Medium | Medium | Need provider |
| Modal/Dialog | **HIGH** | 🔴 High | **High** | Complex z-index system |
| Table/DataTable | **HIGH** | 🔴 High | **High** | Use TanStack Table |

---

## Key Takeaways

1. **Your Badge is already shadcn-compatible** - Just move it to `components/ui/`
2. **Button migration is complex** - 50+ files, needs compatibility layer
3. **Consider hybrid approach** - Use shadcn for new features, keep HeroUI for existing
4. **TanStack Table already installed** - Good foundation for table migration
5. **Estimated full migration: 55-70 hours** - Plan accordingly

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Analysis Complete
