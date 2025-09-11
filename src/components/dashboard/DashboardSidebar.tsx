'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  Search, 
  FileText, 
  User, 
  CreditCard,
  Tag,
  Receipt,
  X
} from '@/lib/icons'

interface SidebarProps {
  className?: string
  onClose?: () => void
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Scrape',
    href: '/dashboard/scrape',
    icon: Search
  },
  {
    name: 'Results',
    href: '/dashboard/results',
    icon: FileText
  },
  {
    name: 'Pricing',
    href: '/dashboard/pricing',
    icon: Tag
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: Receipt
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User
  }
]

const DashboardSidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  const pathname = usePathname()

  // Improved active state detection to work with nested routes
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true
    }
    // For other routes, check if the pathname starts with the href (for nested routes)
    return href !== '/dashboard' && pathname?.startsWith(href)
  }

  return (
    <div className={cn("flex flex-col w-64 bg-background border-r border-border relative", className)}>
      {/* Mobile Close Button */}
      <div className="md:hidden absolute top-4 right-4">
        <button 
          className="p-2 rounded-md hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Navigation Items */}
      <nav className="px-4 py-6 space-y-2 pb-16 mt-8 md:mt-0">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={onClose}
            >
              <div className={cn(
                "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors",
                active 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="font-medium">{item.name}</div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer - using absolute positioning to stick to bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-background">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mapolio
        </div>
      </div>
    </div>
  )
}

export default DashboardSidebar