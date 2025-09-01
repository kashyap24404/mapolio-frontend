'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  Search, 
  FileText, 
  Settings, 
  User, 
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  className?: string
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
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard
  }
]

const DashboardSidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col w-64 bg-background border-r border-border", className)}>
      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors",
                isActive 
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Dashboard v1.0
        </div>
      </div>
    </div>
  )
}

export default DashboardSidebar