import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function StatCard({ title, value, accent = 'blue' }) {
  const color = accent === 'green' ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-cyan-500'
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-semibold text-gray-800">{value}</div>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} opacity-90`} />
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold text-gray-800">{children}</h2>
}

function Topbar() {
  return (
    <div className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
          <span className="font-semibold text-gray-800">Task & CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <input className="h-9 px-3 rounded-md bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Search" />
          <button className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">New</button>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ title, items, accent }) {
  const ring = accent === 'green' ? 'ring-green-200' : 'ring-blue-200'
  const dot = accent === 'green' ? 'bg-green-500' : 'bg-blue-500'
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-3 ring-1 ${ring}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${dot}`}/>
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <span className="text-xs text-gray-400">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t._id || t.title} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-sm font-medium text-gray-800">{t.title}</div>
            {t.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</div>}
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'low' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{t.priority}</span>
              {t.due_date && <span className="text-[10px] text-gray-500">Due {new Date(t.due_date).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CRMList({ title, items }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle>{title}</SectionTitle>
        <button className="text-sm text-blue-600 hover:underline">Add</button>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((i) => (
          <div key={i._id || i.name || i.title} className="py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">{i.name || i.title}</div>
              {i.email && <div className="text-xs text-gray-500">{i.email}</div>}
            </div>
            {(i.value || i.stage) && (
              <div className="text-right">
                {i.value ? <div className="text-sm font-semibold text-emerald-600">${'{'}i.value.toLocaleString(){'}'}</div> : null}
                {i.stage ? <div className="text-xs text-gray-500">{i.stage}</div> : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] })
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, contactsRes, dealsRes] = await Promise.all([
          fetch(`${API_BASE}/api/tasks`).then(r => r.json()),
          fetch(`${API_BASE}/api/contacts`).then(r => r.json()),
          fetch(`${API_BASE}/api/deals`).then(r => r.json()),
        ])
        const grouped = { todo: [], in_progress: [], done: [] }
        ;(tasksRes || []).forEach(t => {
          grouped[t.status] ? grouped[t.status].push(t) : grouped.todo.push(t)
        })
        setTasks(grouped)
        setContacts(contactsRes || [])
        setDeals(dealsRes || [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Tasks" value={(tasks.todo.length + tasks.in_progress.length)} accent="blue" />
          <StatCard title="Completed" value={tasks.done.length} accent="green" />
          <StatCard title="Contacts" value={contacts.length} accent="blue" />
          <StatCard title="Deals" value={deals.length} accent="green" />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SectionTitle>Tasks</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KanbanColumn title="To do" items={tasks.todo} accent="blue" />
              <KanbanColumn title="In progress" items={tasks.in_progress} accent="blue" />
              <KanbanColumn title="Done" items={tasks.done} accent="green" />
            </div>
          </div>

          <div className="space-y-4">
            <CRMList title="Contacts" items={contacts.slice(0,6)} />
            <CRMList title="Deals" items={deals.slice(0,6)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
