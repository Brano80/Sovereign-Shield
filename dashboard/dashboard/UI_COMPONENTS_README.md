# UI Components with Class Variance Authority (CVA) & Clean Aliases

This dashboard now supports **Class Variance Authority (CVA)** for creating variant-based UI components with clean, maintainable code and **clean import aliases** using the `@/` path mapping.

## 🚀 What's Been Configured

### 1. **Dependencies Added**
```json
{
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.3.0",
  "lucide-react": "^0.468.0",
  "react-simple-maps": "^3.0.0"
}
```

### 2. **TypeScript Path Aliases**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 3. **Enhanced Utility Function**
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 🎨 How to Use CVA Components

### Creating a Component with Variants

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Using Clean Import Aliases

```typescript
// ✅ Clean imports with @/ alias
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { alertVariants } from "@/lib/ui-helpers"

// ❌ Avoid relative imports
// import { Button } from "../../../components/ui/button"
```

### Example Component Usage

```tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge variant="default">Active</Badge>
        <div className="flex gap-2">
          <Button variant="default">Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
          <Button variant="ghost" size="sm">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🛠️ Available UI Components

### Updated Components
- ✅ **Button** - Now uses CVA with variants (default, outline, link, ghost) and sizes (sm, md, lg)
- ✅ **Badge** - Already using CVA with variants (default, secondary, destructive, outline)
- ✅ **Card** - Uses clean cn utility with proper TypeScript forwarding

### Available Variants in `lib/ui-helpers.ts`
- `alertVariants` - For alert/status messages
- `statusVariants` - For status indicators
- `spinnerVariants` - For loading spinners
- `textVariants` - For typography consistency

## 🎯 Benefits of This Setup

1. **Type Safety** - Full TypeScript support for component variants
2. **Maintainability** - Centralized variant definitions
3. **Consistency** - Reusable design tokens across components
4. **Performance** - Optimized class merging with `tailwind-merge`
5. **Developer Experience** - Clean imports and IntelliSense support

## 🔧 Adding New Components

When creating new UI components, follow this pattern:

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva("base-classes", {
  variants: {
    variant: {
      // Define your variants
    },
    size: {
      // Define your sizes
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

export function Component({ className, variant, size, ...props }: ComponentProps) {
  return (
    <element
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

## 📦 Installing Dependencies

```bash
cd dashboard
npm install
# or
npm install --legacy-peer-deps  # if there are peer dependency conflicts
```

The setup is now ready for building variant-rich, maintainable UI components with clean import aliases! 🎉
