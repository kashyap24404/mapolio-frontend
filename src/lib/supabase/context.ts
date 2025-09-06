'use client'

import { createContext } from 'react'
import { SupabaseContextType } from './types'

export const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)