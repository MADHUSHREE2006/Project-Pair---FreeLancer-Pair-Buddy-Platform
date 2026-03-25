import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(100) },
  bio: { type: DataTypes.TEXT },
  skills_offered: { type: DataTypes.JSON },
  skills_needed: { type: DataTypes.JSON },
  github_url: { type: DataTypes.STRING(255) },
  portfolio_url: { type: DataTypes.STRING(255) },
  avatar_url: { type: DataTypes.STRING(255) },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  total_reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
  reset_token: { type: DataTypes.STRING(255) },
  reset_token_expiry: { type: DataTypes.DATE },
})

export const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  tags: { type: DataTypes.JSON },
  budget: { type: DataTypes.STRING(50) },
  duration: { type: DataTypes.STRING(50) },
  category: { type: DataTypes.STRING(50) },
  status: { type: DataTypes.ENUM('open', 'paired', 'in_progress', 'completed'), defaultValue: 'open' },
})

export const PairRequest = sequelize.define('PairRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT },
  skills: { type: DataTypes.JSON },
  timeline: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
})

export const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  assignee_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('todo', 'inprogress', 'review', 'done'), defaultValue: 'todo' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  due_date: { type: DataTypes.DATEONLY },
})

export const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewer_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewee_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT },
})

export const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
})

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('proposal_received', 'proposal_accepted', 'proposal_rejected', 'new_message', 'new_review'), allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT },
  link: { type: DataTypes.STRING(255) },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
})

// Associations
User.hasMany(Project, { foreignKey: 'owner_id' })
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' })
Project.hasMany(PairRequest, { foreignKey: 'project_id' })
PairRequest.belongsTo(Project, { foreignKey: 'project_id' })
PairRequest.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' })
Project.hasMany(Task, { foreignKey: 'project_id' })
Task.belongsTo(Project, { foreignKey: 'project_id' })
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' })
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'reviews' })
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' })
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' })
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' })
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' })
Notification.belongsTo(User, { foreignKey: 'user_id' })

export default sequelize
