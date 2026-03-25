import { Review, User, PairRequest } from '../models/index.js'
import { Op } from 'sequelize'
import sequelize from '../config/database.js'

// GET /api/reviews/:userId
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { reviewee_id: req.params.userId },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { reviewee_id, project_id, rating, comment } = req.body
    const reviewer_id = req.user.id

    if (reviewer_id === parseInt(reviewee_id)) {
      return res.status(400).json({ error: 'You cannot review yourself' })
    }

    // Check they worked together (accepted pair request on this project)
    const paired = await PairRequest.findOne({
      where: {
        project_id,
        status: 'accepted',
        [Op.or]: [
          { sender_id: reviewer_id, receiver_id: reviewee_id },
          { sender_id: reviewee_id, receiver_id: reviewer_id },
        ],
      },
    })
    if (!paired) {
      return res.status(403).json({ error: 'You can only review someone you have paired with' })
    }

    // Prevent duplicate
    const existing = await Review.findOne({ where: { reviewer_id, reviewee_id, project_id } })
    if (existing) return res.status(400).json({ error: 'You have already reviewed this person for this project' })

    const review = await Review.create({ reviewer_id, reviewee_id, project_id, rating, comment })

    // Recalculate average rating for reviewee
    const stats = await Review.findOne({
      where: { reviewee_id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      raw: true,
    })
    await User.update(
      { rating: parseFloat(stats.avg).toFixed(2), total_reviews: stats.count },
      { where: { id: reviewee_id } }
    )

    const full = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }],
    })
    res.status(201).json(full)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
