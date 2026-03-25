import { Task, User, Project } from '../models/index.js'

const ASSIGNEE_ATTRS = ['id', 'name', 'email']

// GET /api/tasks/project/:projectId
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params
    const tasks = await Task.findAll({
      where: { project_id: projectId },
      include: [
        { model: User, as: 'assignee', attributes: ASSIGNEE_ATTRS },
        { model: User, as: 'creator', attributes: ASSIGNEE_ATTRS },
      ],
      order: [['createdAt', 'ASC']],
    })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, priority, assignee_id, due_date } = req.body
    const task = await Task.create({
      project_id,
      title,
      description,
      priority: priority || 'medium',
      assignee_id: assignee_id || null,
      due_date: due_date || null,
      created_by: req.user.id,
      status: 'todo',
    })
    // Re-fetch with associations
    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ASSIGNEE_ATTRS },
        { model: User, as: 'creator', attributes: ASSIGNEE_ATTRS },
      ],
    })
    res.status(201).json(full)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    // Only creator or assignee can update
    if (task.created_by !== req.user.id && task.assignee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' })
    }

    const allowed = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date']
    const updates = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    await task.update(updates)
    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ASSIGNEE_ATTRS },
        { model: User, as: 'creator', attributes: ASSIGNEE_ATTRS },
      ],
    })
    res.json(full)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    if (task.created_by !== req.user.id && task.assignee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this task' })
    }

    await task.destroy()
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
