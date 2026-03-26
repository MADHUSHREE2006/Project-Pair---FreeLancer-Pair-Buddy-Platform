import { User, Project, Message, PairRequest, Review, Task } from '../models/index.js'
import sequelize from '../config/database.js'

// Simple 60s in-memory cache
let _cache = null
let _cacheTime = 0

export const getAnalytics = async (req, res) => {
  try {
    if (_cache && Date.now() - _cacheTime < 60000) return res.json(_cache)

    const results = await Promise.allSettled([
      User.count(),
      Project.count(),
      Message.count(),
      PairRequest.count(),
      Review.count(),
      Task.count(),
      Project.count({ where: { status: 'open' } }),
      Project.count({ where: { status: 'completed' } }),
      User.findAll({ order: [['createdAt', 'DESC']], limit: 5, attributes: ['id', 'name', 'email', 'createdAt'] }),
      Project.findAll({ order: [['createdAt', 'DESC']], limit: 5, attributes: ['id', 'title', 'category', 'status', 'createdAt'] }),
      Project.findAll({ attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']], group: ['category'], raw: true }),
      PairRequest.findAll({ attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']], group: ['status'], raw: true }),
    ])

    const val = (r, fallback = 0) => r.status === 'fulfilled' ? r.value : fallback
    const [
      totalUsers, totalProjects, totalMessages, totalProposals,
      totalReviews, totalTasks, openProjects, completedProjects,
      recentUsers, recentProjects, byCategory, byProposalStatus,
    ] = results

    _cache = {
      totals: {
        users: val(totalUsers), projects: val(totalProjects),
        messages: val(totalMessages), proposals: val(totalProposals),
        reviews: val(totalReviews), tasks: val(totalTasks),
      },
      projects: { open: val(openProjects), completed: val(completedProjects), byCategory: val(byCategory, []) },
      proposals: { byStatus: val(byProposalStatus, []) },
      recent: { users: val(recentUsers, []), projects: val(recentProjects, []) },
    }
    _cacheTime = Date.now()
    res.json(_cache)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
