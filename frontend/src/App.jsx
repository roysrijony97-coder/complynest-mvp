import { useMemo, useState } from 'react'
import { createComplianceTask } from './lib/backendApi'
import './App.css'

const properties = [
  {
    id: 'prop-1',
    name: 'Sunset Apartments',
    address: '12 King Street, Sydney NSW',
    manager: 'Ava Thompson',
  },
  {
    id: 'prop-2',
    name: 'Harbour View Residences',
    address: '44 Harbour Road, Sydney NSW',
    manager: 'Liam Chen',
  },
]

const initialEmails = [
  {
    id: 'email-1',
    sender: 'council@city.gov.au',
    subject: 'Annual fire inspection overdue',
    propertyId: 'prop-1',
    receivedAt: 'Today, 8:40 AM',
    priority: 'High',
    status: 'Unprocessed',
    summary:
      'Council has flagged the annual fire inspection certificate as overdue and requests immediate action.',
    suggestedTask: {
      title: 'Arrange annual fire inspection',
      dueDate: '2026-05-06',
      priority: 'High',
      assignee: 'Facilities team',
      notes: 'Book certified inspector and upload updated certificate after inspection.',
    },
  },
  {
    id: 'email-2',
    sender: 'safety@smokecheck.com',
    subject: 'Smoke alarm compliance due next week',
    propertyId: 'prop-1',
    receivedAt: 'Yesterday, 2:10 PM',
    priority: 'Medium',
    status: 'Unprocessed',
    summary:
      'Routine smoke alarm testing is due next week for all apartments in Sunset Apartments.',
    suggestedTask: {
      title: 'Schedule smoke alarm testing',
      dueDate: '2026-05-10',
      priority: 'Medium',
      assignee: 'Maintenance coordinator',
      notes: 'Notify tenants 48 hours before access is required.',
    },
  },
  {
    id: 'email-3',
    sender: 'poolcert@aquasafe.com',
    subject: 'Pool gate inspection reminder',
    propertyId: 'prop-2',
    receivedAt: 'Mon, 9:15 AM',
    priority: 'Medium',
    status: 'Processed',
    summary:
      'Quarterly pool gate compliance review should be completed before the end of the month.',
    suggestedTask: {
      title: 'Complete pool gate compliance review',
      dueDate: '2026-05-22',
      priority: 'Medium',
      assignee: 'Site manager',
      notes: 'Check self-closing latch and perimeter signage.',
    },
  },
  {
    id: 'email-4',
    sender: 'electrical@brightgrid.au',
    subject: 'Urgent switchboard follow-up required',
    propertyId: 'prop-2',
    receivedAt: 'Mon, 7:50 AM',
    priority: 'High',
    status: 'Unprocessed',
    summary:
      'Contractor recommends urgent follow-up on recent switchboard defects to avoid non-compliance.',
    suggestedTask: {
      title: 'Review switchboard defect report',
      dueDate: '2026-05-05',
      priority: 'High',
      assignee: 'Electrical contractor',
      notes: 'Confirm scope, quote approval, and remediation date.',
    },
  },
]

const initialTasks = [
  {
    id: 'task-1',
    title: 'Submit annual lift maintenance certificate',
    propertyId: 'prop-2',
    dueDate: '2026-05-01',
    priority: 'High',
    status: 'Overdue',
    assignee: 'Operations lead',
  },
  {
    id: 'task-2',
    title: 'Book emergency lighting inspection',
    propertyId: 'prop-1',
    dueDate: '2026-05-04',
    priority: 'High',
    status: 'Overdue',
    assignee: 'Facilities team',
  },
  {
    id: 'task-3',
    title: 'Review smoke alarm service report',
    propertyId: 'prop-1',
    dueDate: '2026-05-08',
    priority: 'Medium',
    status: 'Due',
    assignee: 'Maintenance coordinator',
  },
  {
    id: 'task-4',
    title: 'Prepare pool compliance documents',
    propertyId: 'prop-2',
    dueDate: '2026-05-12',
    priority: 'Medium',
    status: 'Due',
    assignee: 'Site manager',
  },
]

const screenTitles = {
  login: 'Connect your compliance inbox',
  dashboard: 'Property Dashboard',
  emails: 'Compliance Emails',
  createTask: 'Task Summary / Create Task',
  confirmation: 'Task created',
}

function getProperty(propertyId) {
  return properties.find((property) => property.id === propertyId)
}

function App() {
  const [screen, setScreen] = useState('login')
  const [userEmail, setUserEmail] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [emails, setEmails] = useState(initialEmails)
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedEmailId, setSelectedEmailId] = useState(null)
  const [lastCreatedTask, setLastCreatedTask] = useState(null)

  const selectedEmail = emails.find((email) => email.id === selectedEmailId) ?? null

  const dashboardMetrics = useMemo(() => {
    const overdueTasks = tasks.filter((task) => task.status === 'Overdue')
    const dueTasks = tasks.filter((task) => task.status === 'Due')
    const highPriorityEmails = emails.filter(
      (email) => email.priority === 'High' && email.status === 'Unprocessed',
    )

    return {
      overdueTasks,
      dueTasks,
      highPriorityEmails,
    }
  }, [emails, tasks])

  const filteredEmails = useMemo(() => {
    if (selectedFilter === 'All') return emails
    return emails.filter((email) => email.priority === selectedFilter)
  }, [emails, selectedFilter])

  const handleConnect = (emailInput) => {
    setUserEmail(emailInput)
    setIsConnected(true)
    setScreen('dashboard')
  }

  const handleOpenEmail = (emailId) => {
    setSelectedEmailId(emailId)
    setScreen('createTask')
  }

  const handleCreateTask = async (taskDraft) => {
    try {
      console.log('handleCreateTask invoked with draft:', taskDraft)
      const response = await createComplianceTask(taskDraft)
      const createdTask = {
        id: response.task?.id ?? `task-${tasks.length + 1}`,
        title: response.task?.title ?? taskDraft.title,
        propertyId: taskDraft.propertyId,
        dueDate: taskDraft.dueDate,
        priority: taskDraft.priority,
        status: taskDraft.status,
        assignee: taskDraft.assignee,
      }

      setTasks((currentTasks) => [createdTask, ...currentTasks])
      setEmails((currentEmails) =>
        currentEmails.map((email) =>
          email.id === selectedEmailId ? { ...email, status: 'Processed' } : email,
        ),
      )
      setLastCreatedTask(createdTask)
      setScreen('confirmation')
    } catch (error) {
      console.error('Failed to create compliance task via backend:', error)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ComplyNest MVP</p>
          <h1>{screenTitles[screen]}</h1>
        </div>
        <div className="topbar-status">
          <span className={`status-pill ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Demo inbox connected' : 'Inbox not connected'}
          </span>
          {isConnected && userEmail ? <p>{userEmail}</p> : null}
        </div>
      </header>

      <main className="page-frame">
        {screen === 'login' ? <LoginScreen onConnect={handleConnect} /> : null}

        {screen === 'dashboard' ? (
          <DashboardScreen
            userEmail={userEmail}
            metrics={dashboardMetrics}
            tasks={tasks}
            onReviewEmails={() => setScreen('emails')}
          />
        ) : null}

        {screen === 'emails' ? (
          <EmailsScreen
            emails={filteredEmails}
            selectedFilter={selectedFilter}
            onChangeFilter={setSelectedFilter}
            onBack={() => setScreen('dashboard')}
            onCreateTask={handleOpenEmail}
          />
        ) : null}

        {screen === 'createTask' && selectedEmail ? (
          <CreateTaskScreen
            email={selectedEmail}
            onBack={() => setScreen('emails')}
            onCreateTask={handleCreateTask}
          />
        ) : null}

        {screen === 'confirmation' && lastCreatedTask ? (
          <ConfirmationScreen
            task={lastCreatedTask}
            onGoDashboard={() => setScreen('dashboard')}
            onReviewEmails={() => setScreen('emails')}
          />
        ) : null}
      </main>
    </div>
  )
}

function LoginScreen({ onConnect }) {
  const [emailInput, setEmailInput] = useState('manager@complynest-demo.com')

  return (
    <section className="screen screen-login">
      <div className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Compliance workflow demo</p>
          <h2>Connect your email and triage compliance work in minutes</h2>
          <p className="lead">
            This MVP simulates a compliance inbox for property managers and turns urgent
            messages into clear action items.
          </p>
        </div>

        <div className="panel form-panel">
          <label className="field-label" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            className="text-input"
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            placeholder="name@company.com"
          />

          <button className="primary-button" onClick={() => onConnect(emailInput)}>
            Connect Email
          </button>

          <div className="notice-stack">
            <NoticeCard
              title="Simulated connection"
              text="This demo does not connect to a real inbox. Email connection is visually simulated for MVP testing only."
            />
            <NoticeCard
              title="Consent and control"
              text="Users should only connect accounts they are authorised to manage and should review internal consent policies first."
            />
            <NoticeCard
              title="No permanent storage"
              text="All data shown here is dummy data stored in memory only and is cleared when the page reloads."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardScreen({ userEmail, metrics, tasks, onReviewEmails }) {
  return (
    <section className="screen screen-dashboard">
      <div className="section-grid two-columns">
        <div className="panel property-overview">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Portfolio snapshot</p>
              <h2>Compliance health overview</h2>
            </div>
            <span className="subtle-chip">{userEmail}</span>
          </div>

          <div className="property-list">
            {properties.map((property) => (
              <div className="property-card" key={property.id}>
                <div>
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                </div>
                <span className="subtle-chip">Manager: {property.manager}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard label="Overdue tasks" value={metrics.overdueTasks.length} tone="overdue" />
          <MetricCard label="Due soon" value={metrics.dueTasks.length} tone="medium" />
          <MetricCard
            label="High priority emails"
            value={metrics.highPriorityEmails.length}
            tone="high"
          />
        </div>
      </div>

      <div className="section-grid two-columns align-start">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Action required</p>
              <h2>Due and overdue tasks</h2>
            </div>
          </div>

          <div className="task-list">
            {tasks.map((task) => {
              const property = getProperty(task.propertyId)

              return (
                <div className="list-card" key={task.id}>
                  <div>
                    <div className="list-card-header">
                      <h3>{task.title}</h3>
                      <Badge tone={task.status === 'Overdue' ? 'overdue' : task.priority.toLowerCase()}>
                        {task.status}
                      </Badge>
                    </div>
                    <p>{property?.name}</p>
                  </div>
                  <div className="meta-row">
                    <span>Due: {task.dueDate}</span>
                    <span>Assigned: {task.assignee}</span>
                    <Badge tone={task.priority.toLowerCase()}>{task.priority}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel callout-panel">
          <p className="eyebrow">Inbox triage</p>
          <h2>Review incoming compliance emails</h2>
          <p className="lead compact">
            Prioritise urgent compliance notices, convert them into tasks, and keep your
            property portfolio audit-ready.
          </p>

          <div className="risk-summary">
            <div className="risk-row">
              <Badge tone="high">High</Badge>
              <span>{metrics.highPriorityEmails.length} urgent inbox items awaiting review</span>
            </div>
            <div className="risk-row">
              <Badge tone="overdue">Overdue</Badge>
              <span>{metrics.overdueTasks.length} compliance tasks already overdue</span>
            </div>
          </div>

          <button className="primary-button" onClick={onReviewEmails}>
            Review Compliance Emails
          </button>
        </div>
      </div>
    </section>
  )
}

function EmailsScreen({ emails, selectedFilter, onChangeFilter, onBack, onCreateTask }) {
  const filters = ['All', 'High', 'Medium']

  return (
    <section className="screen">
      <div className="panel">
        <div className="panel-header panel-header-stack-mobile">
          <div>
            <p className="eyebrow">Message triage</p>
            <h2>Compliance Emails</h2>
          </div>

          <div className="actions-row">
            <button className="secondary-button" onClick={onBack}>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="filter-row">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-chip ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => onChangeFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="email-list">
          {emails.map((email) => {
            const property = getProperty(email.propertyId)
            const isProcessed = email.status === 'Processed'

            return (
              <div className="list-card email-card" key={email.id}>
                <div className="email-card-main">
                  <div className="list-card-header">
                    <h3>{email.subject}</h3>
                    <div className="badge-row">
                      <Badge tone={email.priority.toLowerCase()}>{email.priority}</Badge>
                      <Badge tone={isProcessed ? 'processed' : 'default'}>{email.status}</Badge>
                    </div>
                  </div>

                  <p className="email-sender">
                    {email.sender} · {property?.name} · {email.receivedAt}
                  </p>
                  <p>{email.summary}</p>
                </div>

                <button
                  className="primary-button small-button"
                  onClick={() => onCreateTask(email.id)}
                  disabled={isProcessed}
                >
                  {isProcessed ? 'Processed' : 'Create Task'}
                </button>
              </div>
            )
          })}
        </div>

        <p className="footnote">
          Ethical notice: these emails are simulated examples only. No real inbox content is
          fetched, stored, or processed in this MVP.
        </p>
      </div>
    </section>
  )
}

function CreateTaskScreen({ email, onBack, onCreateTask }) {
  const [taskDraft, setTaskDraft] = useState({
    title: email.suggestedTask.title,
    propertyId: email.propertyId,
    dueDate: email.suggestedTask.dueDate,
    priority: email.suggestedTask.priority,
    assignee: email.suggestedTask.assignee,
    notes: email.suggestedTask.notes,
    status: email.priority === 'High' ? 'Overdue' : 'Due',
  })

  const property = getProperty(email.propertyId)

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('CreateTaskScreen submit triggered:', taskDraft)
    await onCreateTask(taskDraft)
  }

  return (
    <section className="screen">
      <div className="section-grid two-columns align-start">
        <div className="panel">
          <p className="eyebrow">Source email</p>
          <h2>{email.subject}</h2>
          <div className="source-summary">
            <p>
              <strong>From:</strong> {email.sender}
            </p>
            <p>
              <strong>Property:</strong> {property?.name}
            </p>
            <p>
              <strong>Priority:</strong>{' '}
              <Badge tone={email.priority.toLowerCase()}>{email.priority}</Badge>
            </p>
          </div>
          <p className="lead compact">{email.summary}</p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Task drafting</p>
              <h2>Create compliance task</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField label="Task title">
                <input
                  className="text-input"
                  value={taskDraft.title}
                  onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })}
                />
              </FormField>

              <FormField label="Property">
                <select
                  className="text-input"
                  value={taskDraft.propertyId}
                  onChange={(event) =>
                    setTaskDraft({ ...taskDraft, propertyId: event.target.value })
                  }
                >
                  {properties.map((propertyOption) => (
                    <option key={propertyOption.id} value={propertyOption.id}>
                      {propertyOption.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Due date">
                <input
                  className="text-input"
                  type="date"
                  value={taskDraft.dueDate}
                  onChange={(event) => setTaskDraft({ ...taskDraft, dueDate: event.target.value })}
                />
              </FormField>

              <FormField label="Priority">
                <select
                  className="text-input"
                  value={taskDraft.priority}
                  onChange={(event) => setTaskDraft({ ...taskDraft, priority: event.target.value })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </FormField>

              <FormField label="Assigned to">
                <input
                  className="text-input"
                  value={taskDraft.assignee}
                  onChange={(event) => setTaskDraft({ ...taskDraft, assignee: event.target.value })}
                />
              </FormField>

              <FormField label="Task timing">
                <select
                  className="text-input"
                  value={taskDraft.status}
                  onChange={(event) => setTaskDraft({ ...taskDraft, status: event.target.value })}
                >
                  <option value="Overdue">Overdue</option>
                  <option value="Due">Due</option>
                </select>
              </FormField>

              <FormField label="Notes">
                <textarea
                  className="text-input text-area"
                  value={taskDraft.notes}
                  onChange={(event) => setTaskDraft({ ...taskDraft, notes: event.target.value })}
                />
              </FormField>
            </div>

            <div className="actions-row">
              <button type="button" className="secondary-button" onClick={onBack}>
                Back
              </button>
              <button type="submit" className="primary-button">
                Create Task
              </button>
            </div>
          </form>

          <p className="footnote">
            Ethical notice: suggested task details are mock examples only and should be reviewed
            by an authorised user before any real-world action is taken.
          </p>
        </div>
      </div>
    </section>
  )
}

function ConfirmationScreen({ task, onGoDashboard, onReviewEmails }) {
  const property = getProperty(task.propertyId)

  return (
    <section className="screen screen-confirmation">
      <div className="panel success-panel">
        <div className="success-icon">✓</div>
        <p className="eyebrow success-eyebrow">Workflow complete</p>
        <h2>Task created successfully</h2>
        <p className="success-copy">Email marked Processed ✓</p>

        <div className="confirmation-summary">
          <div className="summary-row">
            <span>Task</span>
            <strong>{task.title}</strong>
          </div>
          <div className="summary-row">
            <span>Property</span>
            <strong>{property?.name}</strong>
          </div>
          <div className="summary-row">
            <span>Due date</span>
            <strong>{task.dueDate}</strong>
          </div>
          <div className="summary-row">
            <span>Priority</span>
            <Badge tone={task.priority.toLowerCase()}>{task.priority}</Badge>
          </div>
        </div>

        <div className="actions-row centered">
          <button className="secondary-button" onClick={onReviewEmails}>
            Review More Emails
          </button>
          <button className="primary-button" onClick={onGoDashboard}>
            Back to Dashboard
          </button>
        </div>

        <p className="footnote">
          No permanent email content is stored in this MVP. All changes exist only in the current
          browser session.
        </p>
      </div>
    </section>
  )
}

function MetricCard({ label, value, tone }) {
  return (
    <div className={`metric-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function Badge({ children, tone = 'default' }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

function NoticeCard({ title, text }) {
  return (
    <div className="notice-card">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

export default App
