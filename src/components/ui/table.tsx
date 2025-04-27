import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <table// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn("w-full caption-bottom text-sm min-w-max", className)}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <thead// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn("[&_tr]:border-b", className)}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <tbody// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <tfoot// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <tr// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <th// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <td// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (// Ensure no whitespace before/after this tag or its children
  <caption// Ensure no whitespace before/after this tag or its children
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />// Ensure no whitespace before/after this tag or its children
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
