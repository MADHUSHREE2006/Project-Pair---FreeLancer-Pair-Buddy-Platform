import { PairRequest, Project, User } from '../models/index.js'
import { createNotification } from './notificationsController.js'
import { sendProposalReceivedEmail, sendProposalResponseEmail } from '../services/email.js'

export const sendProposal = async (req, res) => {
  try {
    const { project_id, message, skills, timeline } = req.body
    const project = await Project.findByPk(project_id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (project.owner_id === req.user.id) return res.status(400).json({ error: 'Cannot pair with your own project' })

    const existing = await PairRequest.findOne({ where: { project_id, sender_id: req.user.id } })
    if (existing) return res.status(400).json({ error: 'Proposal already sent' })

    const proposal = await PairRequest.create({
      project_id, sender_id: req.user.id,
      receiver_id: project.owner_id,
      message, skills, timeline,
    })

    // Notify project owner
    const sender = await User.findByPk(req.user.id, { attributes: ['name'] })
    await createNotification({
      user_id: project.owner_id,
      type: 'proposal_received',
      title: 'New Pair Proposal',
      body: `${sender.name} wants to pair on "${project.title}"`,
      link: `/projects/${project_id}`,
    })
    // Send email to project owner
    const owner = await User.findByPk(project.owner_id, { attributes: ['email', 'name'] })
    await sendProposalReceivedEmail(owner.email, owner.name, sender.name, project.title, project_id)

    res.status(201).json(proposal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMyProposals = async (req, res) => {
  try {
    const proposals = await PairRequest.findAll({
      where: { sender_id: req.user.id },
      include: [{ model: Project }],
      order: [['createdAt', 'DESC']],
    })
    res.json(proposals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const respondToProposal = async (req, res) => {
  try {
    const { status } = req.body
    const proposal = await PairRequest.findByPk(req.params.id, {
      include: [{ model: Project }],
    })
    if (!proposal) return res.status(404).json({ error: 'Not found' })
    if (proposal.receiver_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    await proposal.update({ status })

    // Notify sender of decision
    const responder = await User.findByPk(req.user.id, { attributes: ['name'] })
    await createNotification({
      user_id: proposal.sender_id,
      type: status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected',
      title: status === 'accepted' ? 'Proposal Accepted! 🎉' : 'Proposal Declined',
      body: `${responder.name} ${status === 'accepted' ? 'accepted' : 'declined'} your proposal for "${proposal.Project?.title}"`,
      link: `/projects/${proposal.project_id}`,
    })
    // Send email to proposal sender
    const sender = await User.findByPk(proposal.sender_id, { attributes: ['email', 'name'] })
    await sendProposalResponseEmail(sender.email, sender.name, status, proposal.Project?.title)

    res.json(proposal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getReceivedProposals = async (req, res) => {
  try {
    const proposals = await PairRequest.findAll({
      where: { receiver_id: req.user.id },
      include: [
        { model: Project },
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'rating'] },
      ],
      order: [['createdAt', 'DESC']],
    })
    res.json(proposals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
