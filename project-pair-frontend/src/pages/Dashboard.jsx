import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Clock, CheckCircle2, AlertCircle, Zap, Users, Star, X, Calendar, Flag, Trash2, Edit3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { tasksAPI, projectsAPI } from '../services/api'
import Spinner from '../components/Spinner'

const COLUMNS = [
  { key: 'todo',       label: 'To Do',       icon: Clock,        color: '#6366f1' },
  { key: 'inprogress', label: 'In Progress',  icon: Zap,          color: 'var(--accent)' },
  { key: 'review',     label: 'In Review',    icon: AlertCircle,  color: '#f59e0b' },
  { key: 'done',       label: 'Done',         icon: CheckCircle2, color: '#22c55e' },
]
const PRIORITY_COLORS = { high: '#ef4444', medium: 'var(--accent)', low: '#22c55e' }
const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' }

// ── Helpers ───────────────────────────────────────────
function groupByStatus(tasks) {
  return {
    todo:       tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    review:     tasks.filter(t => t.status === 'review'),
    done:       tasks.filter(t => t.status === 'done'),
  }
}

// ── Main Dashboard ────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useApp()

  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [createModal, setCreateModal] = useState(null)   // column key or null
  const [editTask, setEditTask] = useState(null)         // task object or null
  const [menuTask, setMenuTask] = useState(null)         // task id or null

  // Fetch user's projects on mount
  useEffect(() => {
    projectsAPI.getAll({ limit: 50 })
      .then(res => {
        const list = res.data.projects || res.data || []
        setProjects(list)
        if (list.length > 0) setActiveProjectId(list[0].id)
      })
      .catch(() => {})
  }, [])

  // Fetch tasks when active project changes
  const fetchTasks = useCallback(async () => {
    if (!activeProjectId) return
    setLoadingTasks(true)
    try {
      const res = await tasksAPI.getByProject(activeProjectId)
      setTasks(res.data)
    } catch {
      showToast('Failed to load tasks', 'error')
    } finally {
      setLoadingTasks(false)
    }
  }, [activeProjectId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const grouped = groupByStatus(tasks)
  const totalTasks = tasks.length
  const doneTasks = grouped.done.length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // ── Drag & Drop ──────────────────────────────────────
  const handleDrop = async (toCol) => {
    if (!dragging || dragging.col === toCol) return
    const taskId = dragging.id
    const fromCol = dragging.col
    setDragging(null)

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: toCol } : t))

    try {
      await tasksAPI.update(taskId, { status: toCol })
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: fromCol } : t))
      showToast('Failed to move task', 'error')
    }
  }

  // ── Delete task ──────────────────────────────────────
  const handleDelete = async (taskId) => {
    setMenuTask(null)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try {
      await tasksAPI.delete(taskId)
      showToast('Task deleted', 'success')
    } catch {
      showToast('Failed to delete task', 'error')
      fetchTasks()
    }
  }

  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 32 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Good morning, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Here's what's happening with your projects today.</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Active Projects', value: projects.length || '—', icon: Zap, color: 'var(--accent)' },
            { label: 'Total Tasks', value: totalTasks || '—', icon: Users, color: '#6366f1' },
            { label: 'Tasks Done', value: totalTasks > 0 ? `${doneTasks}/${totalTasks}` : '—', icon: CheckCircle2, color: '#22c55e' },
            { label: 'Progress', value: totalTasks > 0 ? `${progress}%` : '—', icon: Star, color: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={16} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              key={progress}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #fb923c)', borderRadius: 3 }}
            />
          </div>
        </motion.div>

        {/* Project selector */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {projects.map(p => (
              <motion.button key={p.id} onClick={() => setActiveProjectId(p.id)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'none',
                  background: activeProjectId === p.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: activeProjectId === p.id ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${activeProjectId === p.id ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                }}
              >{p.title}</motion.button>
            ))}
          </div>
        )}

        {/* Kanban header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700 }}>
            Kanban Board {activeProject && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 15 }}>— {activeProject.title}</span>}
          </h2>
          {activeProjectId && (
            <motion.button onClick={() => setCreateModal('todo')}
              whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(249,115,22,0.3)' }} whileTap={{ scale: 0.97 }}
              style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add Task
            </motion.button>
          )}
        </div>

        {/* No projects state */}
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <Zap size={40} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--accent)', opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No projects yet</p>
            <p style={{ fontSize: 14 }}>Create a project first to start managing tasks</p>
          </div>
        )}

        {/* Kanban board */}
        {projects.length > 0 && (
          loadingTasks
            ? <Spinner text="Loading tasks..." />
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 60, overflowX: 'auto' }}>
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.key}
                    col={col}
                    tasks={grouped[col.key] || []}
                    dragging={dragging}
                    setDragging={setDragging}
                    onDrop={() => handleDrop(col.key)}
                    onAddTask={() => setCreateModal(col.key)}
                    onEditTask={setEditTask}
                    onDeleteTask={handleDelete}
                    menuTask={menuTask}
                    setMenuTask={setMenuTask}
                  />
                ))}
              </div>
            )
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {createModal && (
          <TaskModal
            mode="create"
            defaultStatus={createModal}
            projectId={activeProjectId}
            onClose={() => setCreateModal(null)}
            onSaved={(task) => {
              setTasks(prev => [...prev, task])
              setCreateModal(null)
              showToast('Task created!', 'success')
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editTask && (
          <TaskModal
            mode="edit"
            task={editTask}
            projectId={activeProjectId}
            onClose={() => setEditTask(null)}
            onSaved={(updated) => {
              setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
              setEditTask(null)
              showToast('Task updated!', 'success')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Kanban Column ─────────────────────────────────────
function KanbanColumn({ col, tasks, dragging, setDragging, onDrop, onAddTask, onEditTask, onDeleteTask, menuTask, setMenuTask }) {
  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDrop() }}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '16px', minWidth: 220,
        transition: 'border-color 0.2s',
        borderColor: dragging && dragging.col !== col.key ? 'rgba(249,115,22,0.15)' : 'var(--border)',
      }}
    >
      {/* Column header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <col.icon size={14} color={col.color} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{col.label}</span>
          <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', padding: '1px 7px', borderRadius: 100 }}>{tasks.length}</span>
        </div>
        <motion.button onClick={onAddTask} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex', padding: 2 }}>
          <Plus size={14} />
        </motion.button>
      </div>

      {/* Task cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 40 }}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            setDragging={setDragging}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
            menuOpen={menuTask === task.id}
            setMenuOpen={(open) => setMenuTask(open ? task.id : null)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────
function TaskCard({ task, setDragging, onEdit, onDelete, menuOpen, setMenuOpen }) {
  const assigneeName = task.assignee?.name || null
  const assigneeInitial = assigneeName?.[0]?.toUpperCase() || '?'

  return (
    <motion.div
      draggable
      onDragStart={() => setDragging({ id: task.id, col: task.status })}
      onDragEnd={() => setDragging(null)}
      whileHover={{ scale: 1.02, borderColor: 'rgba(249,115,22,0.25)' }}
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px', cursor: 'grab',
        transition: 'border-color 0.2s', position: 'relative',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8, color: 'var(--text-primary)' }}>{task.title}</p>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <motion.button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            whileHover={{ scale: 1.2 }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex', padding: 2 }}>
            <MoreHorizontal size={13} />
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4,
                  background: '#1a1a1a', border: '1px solid var(--border)',
                  borderRadius: 8, overflow: 'hidden', zIndex: 50, minWidth: 120,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <button onClick={() => { setMenuOpen(false); onEdit() }}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '9px 14px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={() => { setMenuOpen(false); onDelete() }}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '9px 14px', fontSize: 13, color: '#f87171', cursor: 'none', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Priority */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[task.priority] }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{PRIORITY_LABELS[task.priority]}</span>
          </div>
          {/* Due date */}
          {task.due_date && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Calendar size={9} />
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        {/* Assignee avatar */}
        {assigneeName && (
          <div title={assigneeName} style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000' }}>
            {assigneeInitial}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Task Modal (Create + Edit) ────────────────────────
function TaskModal({ mode, task, defaultStatus, projectId, onClose, onSaved }) {
  const { showToast } = useApp()
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || defaultStatus || 'todo',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }

    setLoading(true)
    try {
      let res
      if (mode === 'create') {
        res = await tasksAPI.create({
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: form.status,
          due_date: form.due_date || null,
          project_id: projectId,
        })
      } else {
        res = await tasksAPI.update(task.id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: form.status,
          due_date: form.due_date || null,
        })
      }
      onSaved(res.data)
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to ${mode} task`
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter',
  }
  const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }
  const focusIn = e => e.target.style.borderColor = 'var(--accent)'
  const focusOut = e => e.target.style.borderColor = 'var(--border)'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 500 }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 800 }}>
            {mode === 'create' ? 'Create Task' : 'Edit Task'}
          </h2>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex' }}>
            <X size={20} />
          </motion.button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?"
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Add more details..." rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
          </div>

          {/* Priority + Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}><Flag size={12} style={{ display: 'inline', marginRight: 4 }} />Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                style={{ ...inputStyle, cursor: 'none' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                style={{ ...inputStyle, cursor: 'none' }}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label style={labelStyle}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Due Date</label>
            <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={focusIn} onBlur={focusOut} />
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 24px rgba(249,115,22,0.3)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: loading ? 'var(--accent-dim)' : 'var(--accent)',
              color: '#000', border: 'none', borderRadius: 10,
              padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
            }}
          >
            {loading
              ? <><Loader /> {mode === 'create' ? 'Creating...' : 'Saving...'}</>
              : mode === 'create' ? 'Create Task' : 'Save Changes'
            }
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Loader() {
  return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', animation: 'spin 0.7s linear infinite' }} />
}
