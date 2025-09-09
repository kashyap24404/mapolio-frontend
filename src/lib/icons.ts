// Optimized icon imports - centralized icon management for better tree shaking
// Import icons from the main package for proper TypeScript support

// Dashboard & Navigation icons
import { LayoutDashboard } from 'lucide-react'
import { Search } from 'lucide-react'
import { FileText } from 'lucide-react'
import { Settings } from 'lucide-react'
import { User } from 'lucide-react'
import { CreditCard } from 'lucide-react'
import { Tag } from 'lucide-react'
import { Receipt } from 'lucide-react'

// Action icons
import { Plus } from 'lucide-react'
import { Download } from 'lucide-react'
import { Upload } from 'lucide-react'
import { RefreshCw } from 'lucide-react'
import { Play } from 'lucide-react'
import { Pause } from 'lucide-react'
import { Square } from 'lucide-react' // Using Square instead of Stop

// Chevron icons
import { ChevronDown } from 'lucide-react'
import { ChevronUp } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

// Status icons
import { CheckCircle } from 'lucide-react'
import { XCircle } from 'lucide-react'
import { AlertCircle } from 'lucide-react'
import { Clock } from 'lucide-react'
import { Loader2 } from 'lucide-react'

// Form & UI icons
import { Check } from 'lucide-react'
import { X } from 'lucide-react'
import { Eye } from 'lucide-react'
import { EyeOff } from 'lucide-react'
import { Lock } from 'lucide-react'
import { Mail } from 'lucide-react'
import { MapPin } from 'lucide-react'

// Arrow icons
import { ArrowLeft } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { ArrowUp } from 'lucide-react'
import { ArrowDown } from 'lucide-react'
import { Home } from 'lucide-react'

// Business & Data icons
import { Building } from 'lucide-react'
import { Map } from 'lucide-react'
import { Target } from 'lucide-react'
import { TrendingUp } from 'lucide-react'
import { Calculator } from 'lucide-react'

// Theme icons
import { Sun } from 'lucide-react'
import { Moon } from 'lucide-react'

// File icons
import { FileJson } from 'lucide-react'
import { FileSpreadsheet } from 'lucide-react'
import { Circle } from 'lucide-react'

// Alert & Other icons
import { TriangleAlert } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { Save } from 'lucide-react'
import { Zap } from 'lucide-react'
import { RotateCcw } from 'lucide-react'
import { SquareCheckBig } from 'lucide-react'

// Export all icons
export {
  // Dashboard & Navigation icons
  LayoutDashboard,
  Search,
  FileText,
  Settings,
  User,
  CreditCard,
  Tag,
  Receipt,
  
  // Action icons
  Plus,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  
  // Chevron icons
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  
  // Status icons
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  
  // Form & UI icons
  Check,
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  
  // Arrow icons
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  
  // Business & Data icons
  Building,
  Map,
  Target,
  TrendingUp,
  Calculator,
  
  // Theme icons
  Sun,
  Moon,
  
  // File icons
  FileJson,
  FileSpreadsheet,
  Circle as CircleIcon,
  
  // Alert & Other icons
  TriangleAlert as AlertTriangle,
  LogOut,
  Save,
  Zap,
  RotateCcw,
  SquareCheckBig as CheckSquare,
}

// Type exports for component props
export type { LucideIcon } from 'lucide-react'

// Re-export the CheckIcon, ChevronDownIcon, ChevronUpIcon aliases used in UI components
export { Check as CheckIcon }
export { ChevronDown as ChevronDownIcon }
export { ChevronUp as ChevronUpIcon }
export { ChevronRight as ChevronRightIcon }