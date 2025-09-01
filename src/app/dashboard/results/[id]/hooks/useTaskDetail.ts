'use client'

import { useState, useEffect } from 'react'
import { useTasksData } from '@/contexts/TasksDataContext'
import { Task } from '../types'

export function useTaskDetail(user: any, taskId: string | null) {
  const { tasks, loading: tasksLoading, error: tasksError, getTaskById } = useTasksData()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // When the taskId changes or tasks are updated, get the task from the global context
  useEffect(() => {
    if (!taskId) {
      setTask(null)
      setLoading(false)
      return
    }
    
    // If tasks are still loading, wait
    if (tasksLoading) {
      setLoading(true)
      return
    }
    
    // Get the task from the global context
    const foundTask = getTaskById(taskId)
    
    if (foundTask) {
      setTask(foundTask)
      setError(null)
    } else {
      setError('Task not found')
    }
    
    setLoading(false)
  }, [taskId, tasks, tasksLoading, getTaskById])

  // Pass through any error from the tasks context
  useEffect(() => {
    if (tasksError) {
      setError(tasksError)
    }
  }, [tasksError])

  return {
    task,
    loading: loading || tasksLoading,
    error
  }
}
