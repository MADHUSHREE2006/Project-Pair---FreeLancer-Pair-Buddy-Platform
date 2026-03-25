import { User, Project, Message, PairRequest, Review, Task } from '../models/index.js'
import sequelize from '../config/database.js'

export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers, totalProjects, totalMessages, totalProposals,
      totalReviews, totalTasks,
      openProjects, completedProjects,
      recentUsers, recentProjects,
    ] = await Promise.all([
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
    ])

    // Projects by category
    const byCategory = await Project.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    })

    // Proposals by status
    const byProposalStatus = await PairRequest.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    })

    res.json({
      totals: { users: totalUsers, projects: totalProjects, messages: totalMessages, proposals: totalProposals, reviews: totalReviews, tasks: totalTasks },
      projects: { open: openProjects, completed: completedProjects, byCategory },
      proposals: { byStatus: byProposalStatus },
      recent: { users: recentUsers, projects: recentProjects },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
