const BACKEND_BASE_URL = '/_/backend'

type ComplianceTaskDraft = {
  title: string
  propertyId: string
  dueDate: string
  priority: string
  assignee: string
  notes: string
  status: string
}

type CreateComplianceTaskResponse = {
  message: string
  task: {
    id?: string | number
    title?: string
    status?: string
    created_at?: string
    user_id?: string | null
    [key: string]: unknown
  }
}

export async function createComplianceTask(
  taskDraft: ComplianceTaskDraft,
): Promise<CreateComplianceTaskResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskDraft),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const errorMessage =
      data && typeof data.detail === 'string'
        ? data.detail
        : 'Failed to create compliance task'

    throw new Error(errorMessage)
  }

  return data as CreateComplianceTaskResponse
}