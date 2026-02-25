// Test component to demonstrate CVA functionality
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { alertVariants, statusVariants, spinnerVariants } from "@/lib/ui-helpers"

// Test component using CVA
const testComponentVariants = cva(
  "rounded-lg border p-4 transition-all duration-200",
  {
    variants: {
      intent: {
        primary: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
        secondary: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100",
        success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
        danger: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
      },
      size: {
        sm: "text-sm p-3",
        md: "text-base p-4",
        lg: "text-lg p-6",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
)

export interface TestComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testComponentVariants> {
  title?: string
  children: React.ReactNode
}

export function TestComponent({
  className,
  intent,
  size,
  title,
  children,
  ...props
}: TestComponentProps) {
  return (
    <div
      className={cn(testComponentVariants({ intent, size }), className)}
      {...props}
    >
      {title && (
        <h3 className="font-semibold mb-2 text-lg">{title}</h3>
      )}
      {children}
    </div>
  )
}

// Demo component showing all variants
export function CVA_Demo() {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-6">CVA & Clean Aliases Demo</h2>

      {/* Test component variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TestComponent intent="primary" title="Primary">
          This is a primary component using CVA variants.
        </TestComponent>

        <TestComponent intent="success" size="lg" title="Success (Large)">
          Success variant with large size.
        </TestComponent>

        <TestComponent intent="warning" size="sm" title="Warning (Small)">
          Warning variant with small size.
        </TestComponent>

        <TestComponent intent="danger" title="Danger">
          Danger variant example.
        </TestComponent>

        <TestComponent intent="secondary" title="Secondary">
          Secondary variant for neutral content.
        </TestComponent>
      </div>

      {/* Status indicators */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Status Indicators</h3>
        <div className="flex flex-wrap gap-2">
          <span className={cn(statusVariants({ status: "active" }))}>
            Active
          </span>
          <span className={cn(statusVariants({ status: "inactive" }))}>
            Inactive
          </span>
          <span className={cn(statusVariants({ status: "pending" }))}>
            Pending
          </span>
          <span className={cn(statusVariants({ status: "error" }))}>
            Error
          </span>
          <span className={cn(statusVariants({ status: "warning" }))}>
            Warning
          </span>
        </div>
      </div>

      {/* Alert examples */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Alert Variants</h3>
        <div className={cn(alertVariants({ variant: "default" }))}>
          This is a default alert.
        </div>
        <div className={cn(alertVariants({ variant: "destructive" }))}>
          This is a destructive alert.
        </div>
        <div className={cn(alertVariants({ variant: "warning" }))}>
          This is a warning alert.
        </div>
        <div className={cn(alertVariants({ variant: "success" }))}>
          This is a success alert.
        </div>
      </div>

      {/* Spinner examples */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Loading Spinners</h3>
        <div className="flex gap-4 items-center">
          <div className={cn(spinnerVariants({ size: "sm" }))} />
          <div className={cn(spinnerVariants({ size: "md", color: "primary" }))} />
          <div className={cn(spinnerVariants({ size: "lg", color: "secondary" }))} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Clean Import Aliases Working! 🎉</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This component demonstrates that CVA, clsx, tailwind-merge, and clean @/ aliases
          are all properly configured and working together.
        </p>
      </div>
    </div>
  )
}
