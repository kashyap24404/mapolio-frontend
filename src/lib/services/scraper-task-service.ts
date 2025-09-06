import { supabase } from '../supabase/client'
import { withTimeoutAndRetry } from './base-service'

// Scraper Task Services
export const scraperTaskService = {
  // Get completed scraper tasks for a user
  async getCompletedTasks(userId: string, limit = 10) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_task')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(limit);
          return result;
        },
        10000, // 10 second timeout
        2, // 2 retries
        `get-completed-tasks-${userId}` // unique key
      );

      return { tasks: data || [], error };
    } catch (error) {
      return { tasks: [], error };
    }
  },

  // Get task statistics for the current month
  async getThisMonthTaskStats(userId: string) {
    try {
      // Calculate the start of the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthString = startOfMonth.toISOString();

      // Get all tasks for the current month
      const { data: tasks, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_task')
            .select('id, status, created_at, total_results, credits_used')
            .eq('user_id', userId)
            .gte('created_at', startOfMonthString)
            .order('created_at', { ascending: false });
          return result;
        },
        10000, // 10 second timeout
        2, // 2 retries
        `get-month-task-stats-${userId}` // unique key
      );

      if (error) {
        return { stats: null, error };
      }

      // Calculate statistics
      const stats = {
        searches: tasks.length,
        results: tasks.reduce((sum, task) => sum + (task.total_results || 0), 0),
        creditsUsed: tasks.reduce((sum, task) => sum + (task.credits_used || 0), 0),
        pendingTasks: tasks.filter(task => task.status === 'pending' || task.status === 'running').length
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }
}