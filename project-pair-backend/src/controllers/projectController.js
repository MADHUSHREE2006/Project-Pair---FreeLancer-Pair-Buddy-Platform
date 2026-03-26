import { Project, User, PairRequest } from '../models/index.js'
import { Op } from 'sequelize'

export const getProjects = async (req, res) => {
  try {
    const { search, category, owner_id, page = 1, limit = 12 } = req.query
    const where = {}
    if (category && category !== 'All') where.category = category
    if (search) where.title = { [Op.like]: `%${search}%` }
    if (owner_id) where.owner_id = parseInt(owner_id)

    const { rows, count } = await Project.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'rating', 'avatar_url'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    })
    res.json({ projects: rows, total: count, page: parseInt(page) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'rating', 'role', 'avatar_url'] }],
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner_id: req.user.id })
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) return res.status(404).json({ error: 'Not found' })
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    await project.update(req.body)
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) return res.status(404).json({ error: 'Not found' })
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    await project.destroy()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
