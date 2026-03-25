import { User } from '../models/index.js'

// GET /api/users/:id — public profile
export const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/users/me — update own profile
export const updateMe = async (req, res) => {
  try {
    const { name, role, bio, skills_offered, skills_needed, github_url, portfolio_url } = req.body
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    await user.update({
      name: name?.trim() || user.name,
      role: role?.trim() ?? user.role,
      bio: bio?.trim() ?? user.bio,
      skills_offered: skills_offered ?? user.skills_offered,
      skills_needed: skills_needed ?? user.skills_needed,
      github_url: github_url?.trim() ?? user.github_url,
      portfolio_url: portfolio_url?.trim() ?? user.portfolio_url,
    })

    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
