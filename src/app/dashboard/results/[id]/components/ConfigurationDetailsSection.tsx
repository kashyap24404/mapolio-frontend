'use client'

import { Task } from '../../[id]/types'

interface ConfigurationDetailsSectionProps {
  task: Task
}

export function ConfigurationDetailsSection({ task }: ConfigurationDetailsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Configuration</h3>
      <div className="border rounded-md p-4 space-y-2">
        <div>
          <span className="text-muted-foreground text-sm">Data Fields:</span>
          <p>{task.config?.data_fields?.join(', ') || 'None'}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-sm">Rating Filter:</span>
          <p>{task.config?.rating_filter || 'None'}</p>
        </div>
        {task.config?.advanced_options && (
          <>
            {task.config.advanced_options.extract_single_image !== undefined && (
              <div>
                <span className="text-muted-foreground text-sm">Extract Single Image:</span>
                <p>{task.config.advanced_options.extract_single_image ? 'Yes' : 'No'}</p>
              </div>
            )}
            {task.config.advanced_options.max_reviews !== undefined && (
              <div>
                <span className="text-muted-foreground text-sm">Max Reviews:</span>
                <p>{task.config.advanced_options.max_reviews || 'Unlimited'}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}