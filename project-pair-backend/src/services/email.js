import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = `"ProjectPair" <${process.env.SMTP_USER}>`
const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Only send if SMTP is configured
const canSend = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS)

export const sendPasswordResetEmail = async (email, token) => {
  if (!canSend()) return
  const link = `${BASE_URL}/reset-password?token=${token}`
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Reset your ProjectPair password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#111;color:#f5f5f5;border-radius:16px">
        <h2 style="color:#f97316;margin-bottom:8px">Reset your password</h2>
        <p style="color:#a3a3a3;margin-bottom:24px">Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;background:#f97316;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none">Reset Password</a>
        <p style="color:#525252;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>`,
  })
}

export const sendProposalReceivedEmail = async (ownerEmail, ownerName, senderName, projectTitle, projectId) => {
  if (!canSend()) return
  await transporter.sendMail({
    from: FROM, to: ownerEmail,
    subject: `New pair proposal on "${projectTitle}"`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#111;color:#f5f5f5;border-radius:16px">
        <h2 style="color:#f97316">New Proposal 📨</h2>
        <p>Hi ${ownerName},</p>
        <p style="color:#a3a3a3"><strong style="color:#f5f5f5">${senderName}</strong> wants to pair with you on <strong style="color:#f5f5f5">"${projectTitle}"</strong>.</p>
        <a href="${BASE_URL}/projects/${projectId}" style="display:inline-block;background:#f97316;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;margin-top:16px">View Proposal</a>
      </div>`,
  })
}

export const sendProposalResponseEmail = async (senderEmail, senderName, status, projectTitle) => {
  if (!canSend()) return
  const accepted = status === 'accepted'
  await transporter.sendMail({
    from: FROM, to: senderEmail,
    subject: `Your proposal was ${accepted ? 'accepted 🎉' : 'declined'}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#111;color:#f5f5f5;border-radius:16px">
        <h2 style="color:${accepted ? '#22c55e' : '#f87171'}">${accepted ? 'Proposal Accepted! 🎉' : 'Proposal Declined'}</h2>
        <p>Hi ${senderName},</p>
        <p style="color:#a3a3a3">Your proposal for <strong style="color:#f5f5f5">"${projectTitle}"</strong> was <strong>${accepted ? 'accepted' : 'declined'}</strong>.</p>
        ${accepted ? `<a href="${BASE_URL}/dashboard" style="display:inline-block;background:#f97316;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;margin-top:16px">Go to Dashboard</a>` : ''}
      </div>`,
  })
}
