# ProjectPair — Complete Workflow Documentation

Every user journey, data flow, API call, socket event, and state change documented end-to-end.

---

## 1. APP BOOTSTRAP

```
Browser opens http://localhost:5173
  → Vite serves index.html + main.jsx
  → React renders <App />
  → Provider tree mounts in order:
       ThemeProvider  → reads localStorage pp_theme, sets body.light class
       AuthProvider   → reads pp_token, calls GET /auth/me, restores session
       AppProvider    → fetches notifications, binds socket listener
  → AppContent renders: Cursor + Navbar + Toast + Routes
```

**ThemeProvider:** reads `pp_theme` from localStorage (default: dark). Toggles `body.light` class. All CSS variables update instantly via `:root` / `body.light` overrides.

**AuthProvider:** if `pp_token` exists → `GET /api/auth/me` → `setUser(data)` + `connectSocket(token)`. On 401 → clears storage. On network error → restores from `pp_user` localStorage fallback.

**AppProvider:** calls `fetchNotifications()` if token present. Starts `bindSocket()` interval (1s, stops after 10s) to attach `socket.on('notification')` once socket is ready.

---

## 2. USER REGISTRATION

```
User visits /signup
  Step 1: Name + Email + Password
    → client validates: name required, email format, password min 8
    → clicks Continue → Step 2
  Step 2: Role + Skills (multi-select chips)
    → clicks "Launch My Profile"
    → POST /api/auth/register { name, email, password, role, skills_offered }
    → backend: checks email unique → bcrypt.hash(password, 12) → User.create()
    → returns { token, user }
    → localStorage: pp_token = token, pp_user = user
    → AuthContext: setUser(user), connectSocket(token)
    → AppContext: onLogin() → fetchNotifications() + bindSocket()
    → navigate('/dashboard')
    → Toast: "Account created! Welcome to ProjectPair 🎉"
```

---

## 3. USER LOGIN

```
User visits /login
  → enters email + password
  → POST /api/auth/login { email, password }
  → backend: User.findOne({ email }) → bcrypt.compare() → JWT sign (7d)
  → returns { token, user }
  → localStorage: pp_token, pp_user saved
  → AuthContext: setUser(user), connectSocket(token)
  → AppContext: onLogin() → fetchNotifications() + bindSocket()
  → navigate to original destination (redirect-back) or /dashboard
  → Toast: "Welcome back!"
```

**Axios interceptor:** attaches `Authorization: Bearer <token>` to every request automatically.

---

## 4. FORGOT PASSWORD

```
User clicks "Forgot password?" on /login → /forgot-password
  → enters email
  → POST /api/auth/forgot-password { email }
  → backend: User.findOne({ email })
      → crypto.randomBytes(32).toString('hex') = token
      → user.reset_token = token
      → user.reset_token_expiry = now + 1 hour
      → always returns 200 (prevents email enumeration)
      → in dev mode: returns dev_token in response body
  → frontend: shows success state
  → dev mode: shows clickable link → /reset-password?token=<token>
```

---

## 5. RESET PASSWORD

```
User visits /reset-password?token=<token>
  → useSearchParams() reads token from URL
  → enters new password + confirm
  → POST /api/auth/reset-password { token, password }
  → backend: User.findOne({ reset_token: token })
      → checks reset_token_expiry > now
      → bcrypt.hash(newPassword, 12)
      → user.update({ password: hashed, reset_token: null, reset_token_expiry: null })
  → frontend: shows "Password updated!" success state
  → setTimeout 3s → navigate('/login')
```

---

## 6. LOGOUT

```
User clicks Logout in Navbar
  → AuthContext.logout():
      → disconnectSocket() → socket.disconnect(), socket = null
      → setUser(null)
      → localStorage.removeItem('pp_token')
      → localStorage.removeItem('pp_user')
  → All protected routes now redirect to /login
  → Navbar shows Sign In / Get Started
  → Notifications cleared from state
```

---

## 7. SESSION RESTORE ON REFRESH

```
User refreshes browser
  → AuthProvider useEffect runs
  → reads pp_token from localStorage
  → calls GET /api/auth/me with Bearer token
  → backend: jwt.verify(token) → User.findByPk(id)
  → returns full user object (no password)
  → setUser(res.data), connectSocket(token)
  → loading = false → app renders normally
  → AppProvider: fetchNotifications() runs
  → Socket reconnects, notifications reload
```

---

## 8. THEME TOGGLE

```
User clicks Sun/Moon button in Navbar
  → ThemeContext.toggle() → setIsDark(!isDark)
  → useEffect: document.body.classList.toggle('light', !isDark)
  → localStorage.setItem('pp_theme', isDark ? 'dark' : 'light')
  → CSS: body.light overrides all --bg-* and --text-* variables
  → body { transition: background 0.3s, color 0.3s } → smooth fade
  → All components re-render with new CSS variable values
  → Next page load: ThemeProvider reads saved preference
```

---

## 9. BROWSE PROJECTS

```
User visits /projects
  → Projects.jsx mounts
  → GET /api/projects?page=1&limit=12
  → backend: Project.findAndCountAll({ include: owner })
  → returns { projects: [], total, page }
  → renders project cards with title, category, tags, owner, status

Search:
  → user types in search box
  → 400ms debounce
  → GET /api/projects?search=<query>
  → backend: WHERE title LIKE '%query%'
  → results update

Category filter:
  → user clicks category chip
  → GET /api/projects?category=<cat>
  → backend: WHERE category = cat
  → results update

Pair Up button (logged in):
  → opens proposal modal
  → see Flow 12

Post Project button (logged in):
  → navigate('/projects/new')
```

---

## 10. POST A PROJECT

```
User visits /projects/new (protected)
  → PostProject.jsx renders form
  → fills: Title, Description (min 20 chars), Category, Tech Stack, Budget, Duration
  → client validation: title required, description required + min 20, category required
  → clicks "Post Project"
  → POST /api/projects { title, description, category, tags, budget, duration }
  → backend: authenticate middleware → Project.create({ ...body, owner_id: req.user.id })
  → returns created project
  → Toast: "Project posted successfully!"
  → navigate('/projects/' + res.data.id)
```

---

## 11. VIEW PROJECT DETAIL

```
User visits /projects/:id
  → ProjectDetail.jsx mounts
  → GET /api/projects/:id
  → backend: Project.findByPk(id, { include: owner })
  → renders: title, description, category, status, tags, budget, duration, owner card

If logged in + not owner + project is open:
  → "Send Pair Proposal" button visible
  → see Flow 12

If logged in + is owner:
  → proposal button hidden
  → can see incoming proposals
```

---

## 12. SEND PAIR PROPOSAL

```
User clicks "Pair Up" or "Send Pair Proposal"
  → proposal modal opens
  → fills: message (required), skills, timeline
  → POST /api/proposals { project_id, message, skills, timeline }
  → backend:
      → Project.findByPk(project_id) → checks exists
      → checks project.owner_id !== req.user.id (can't propose own)
      → PairRequest.findOne({ project_id, sender_id }) → duplicate check
      → PairRequest.create({ project_id, sender_id, receiver_id: owner_id, ... })
      → createNotification({ user_id: owner_id, type: 'proposal_received', ... })
      → socket emits 'notification' to owner if online
  → frontend: modal closes, Toast: "Proposal sent!"
```

---

## 13. RECEIVE & RESPOND TO PROPOSAL

```
Project owner receives real-time notification:
  → Bell badge increments in Navbar
  → Clicks notification → navigates to /projects/:id

Owner views received proposals:
  → GET /api/proposals/received
  → returns proposals with sender info + project info

Owner clicks Accept:
  → PUT /api/proposals/:id { status: 'accepted' }
  → backend:
      → proposal.update({ status: 'accepted' })
      → createNotification({ user_id: sender_id, type: 'proposal_accepted', ... })
      → socket emits 'notification' to sender if online
  → sender gets real-time "Proposal Accepted! 🎉" notification

Owner clicks Reject:
  → PUT /api/proposals/:id { status: 'rejected' }
  → same flow, type: 'proposal_rejected'
  → sender gets "Proposal Declined" notification
```

---

## 14. KANBAN DASHBOARD

```
User visits /dashboard (protected)
  → Dashboard.jsx mounts
  → GET /api/projects (filtered to user's projects)
  → renders project selector tabs
  → user selects a project tab
  → GET /api/tasks/project/:projectId
  → backend: Task.findAll({ where: { project_id }, include: [assignee, creator] })
  → tasks distributed into 4 columns by status:
      todo → "To Do"
      inprogress → "In Progress"
      review → "In Review"
      done → "Done"
  → Stats cards update: total tasks, done count, progress %
  → Animated progress bar fills to real %
```

---

## 15. CREATE TASK

```
User clicks "+" on column header or "Add Task" button
  → CreateTaskModal opens with status pre-filled from column
  → fills: title (required), description, priority, status, due_date
  → POST /api/tasks { title, description, priority, status, due_date, project_id }
  → backend: authenticate → Task.create({ ...body, created_by: req.user.id })
  → returns new task with creator + assignee
  → task added to correct column instantly
  → Toast: "Task created!"
```

---

## 16. EDIT TASK

```
User clicks "⋯" menu on task card → Edit
  → EditTaskModal opens with all fields pre-filled
  → user modifies any field
  → PUT /api/tasks/:id { title, description, priority, status, due_date }
  → backend: Task.findByPk → checks creator or assignee → task.update()
  → task card updates instantly in board
  → Toast: "Task updated!"
```

---

## 17. DELETE TASK

```
User clicks "⋯" menu → Delete
  → optimistic: task removed from UI immediately
  → DELETE /api/tasks/:id
  → backend: Task.findByPk → checks creator or assignee → task.destroy()
  → if API fails: task re-added to board (revert)
  → Toast: "Task deleted"
```

---

## 18. DRAG & DROP TASK

```
User drags task card to different column
  → HTML5 drag events fire
  → onDragStart: stores task id + current status
  → onDrop: column receives task
  → optimistic UI: task moves to new column instantly
  → PUT /api/tasks/:id { status: newColumnStatus }
  → backend: task.update({ status })
  → if API fails:
      → task moves back to original column
      → Toast: "Failed to move task"
  → Stats cards and progress bar recalculate
```

---

## 19. REAL-TIME CHAT

```
User visits /chat (protected)
  → Chat.jsx mounts
  → GET /api/messages/conversations
  → backend: finds all unique sender/receiver pairs involving user
  → renders conversation list with name, last message, unread count

User selects a conversation:
  → GET /api/messages/:userId
  → backend: Message.findAll({ where: sender/receiver pair, order: ASC })
  → messages render as bubbles (right = mine, left = theirs)
  → socket.emit('mark_read', { sender_id: activeUser.userId })
  → backend: UPDATE messages SET is_read=true WHERE sender=them, receiver=me
  → unread count clears in sidebar

User sends a message:
  → types in input box
  → clicks Send or presses Enter
  → socket.emit('send_message', { receiver_id, content })
  → backend socket handler:
      → Message.create({ sender_id, receiver_id, content })
      → Message.findByPk with sender + receiver includes
      → socket.emit('receive_message', payload) → back to sender (confirm)
      → io.to(receiverSocketId).emit('receive_message', payload) → to receiver
  → sender: message appears instantly in chat
  → receiver: message appears in real-time if chat is open
  → auto-scroll to bottom
```

---

## 20. TYPING INDICATOR

```
User starts typing in chat input:
  → handleInputChange fires
  → socket.emit('typing', { receiver_id, isTyping: true })
  → server: forwards to receiver's socket
  → receiver: typingUsers Set adds sender's userId
  → receiver UI: "typing..." shown under sender name, 3-dot animation

User stops typing (1.5s timeout):
  → clearTimeout + socket.emit('typing', { receiver_id, isTyping: false })
  → receiver: typingUsers Set removes sender's userId
  → "typing..." disappears
```

---

## 21. READ RECEIPT

```
User A opens conversation with User B:
  → socket.emit('mark_read', { sender_id: userB.id })
  → server: Message.update({ is_read: true }, { where: { sender_id: B, receiver_id: A } })
  → server: io.to(userB_socketId).emit('messages_read', { by: userA.id })
  → User B's sent messages: double checkmark (✓✓) turns orange
```

---

## 22. NOTIFICATION SYSTEM

```
Triggers that create notifications:
  sendProposal()        → owner gets 'proposal_received'   📨
  respondToProposal()   → sender gets 'proposal_accepted'  🎉 or 'proposal_rejected' ❌
  createReview()        → reviewee gets 'new_review'       ⭐

createNotification({ user_id, type, title, body, link }):
  → Notification.create() in DB
  → global.onlineUsers.get(user_id) → get socketId
  → global.io.to(socketId).emit('notification', notif.toJSON())

Frontend receives notification:
  → AppContext socket.on('notification') fires
  → setNotifications(prev => [notif, ...prev])
  → Navbar bell badge increments instantly

User clicks bell:
  → dropdown opens showing all notifications
  → each has emoji icon per type
  → unread ones have orange dot + orange background tint

User clicks a notification:
  → markOneRead(n.id) → optimistic update + PUT /notifications/:id/read
  → navigate(n.link) → goes to relevant page
  → dropdown closes

Mark all read:
  → optimistic: all is_read = true
  → PUT /api/notifications/read-all
  → badge disappears
```

---

## 23. EDIT PROFILE

```
User visits /profile (own profile)
  → clicks "Edit Profile"
  → EditProfileModal opens with all fields pre-filled from AuthContext.user
  → edits: name, role, bio, github_url, portfolio_url, skills_offered, skills_needed
  → clicks "Save Profile"
  → PUT /api/users/me { name, role, bio, skills_offered, skills_needed, github_url, portfolio_url }
  → backend: User.findByPk(req.user.id) → user.update() → returns updated user
  → AuthContext.updateUser(res.data):
      → merges new data into user state
      → updates localStorage pp_user
      → NO page reload needed
  → modal closes
  → profile page reflects new data instantly
  → Toast: "Profile updated!"
```

---

## 24. VIEW PUBLIC PROFILE

```
User visits /profile/:id
  → Profile.jsx reads useParams().id
  → isOwnProfile = (id === authUser.id) → false
  → GET /api/users/:id
  → backend: User.findByPk(id, { exclude: ['password'] })
  → renders: name, role, bio, rating, skills, stats
  → if logged in: "Leave Review" button visible
  → if github_url set: GitHub button visible
  → Reviews tab: GET /api/reviews/:id → shows all reviews received
```

---

## 25. LEAVE A REVIEW

```
User visits /profile/:id of someone they paired with
  → clicks "Leave Review"
  → LeaveReviewModal opens
  → selects star rating (1-5) with hover animation
  → enters project ID (from /projects/:id URL)
  → optional comment
  → POST /api/reviews { reviewee_id, project_id, rating, comment }
  → backend:
      → checks reviewer !== reviewee
      → PairRequest.findOne({ project_id, status: 'accepted', sender/receiver match })
      → if no accepted pair → 403 "You can only review someone you have paired with"
      → Review.findOne({ reviewer_id, reviewee_id, project_id }) → duplicate check
      → Review.create()
      → recalculates avg: SELECT AVG(rating), COUNT(id) FROM Reviews WHERE reviewee_id
      → User.update({ rating: avg, total_reviews: count })
      → createNotification({ user_id: reviewee_id, type: 'new_review', ... })
  → review appears at top of reviews list instantly
  → Toast: "Review submitted!"
```

---

## 26. PORTFOLIO

```
User visits /portfolio (protected)
  → Portfolio.jsx mounts
  → reads user from AuthContext (name, role, bio, skills_offered, github_url, portfolio_url)
  → GET /api/projects?owner_id=<userId>&limit=20
  → while loading: skeleton cards pulse
  → if no projects: empty state with "Post a Project" CTA
  → renders project cards: title, description, tags, status badge, budget, View link
  → skills section: user.skills_offered mapped to animated progress bars
  → stats: project count, total_reviews, rating, joined year — all real data
  → GitHub / Portfolio URL buttons shown only if set in profile
```

---

## 27. 404 NOT FOUND

```
User visits any unknown URL (e.g. /random-page)
  → React Router catch-all route: path="*"
  → NotFound.jsx renders
  → Animated 404 text with rotating Zap icon
  → "Go Home" button → navigate('/')
  → "Browse Projects" button → navigate('/projects')
  → Framer Motion: staggered fade-in of text + buttons
```

---

## 28. PROTECTED ROUTE

```
User tries to visit /dashboard without being logged in
  → ProtectedRoute.jsx checks AuthContext.loading
  → if loading: renders null (waits for session restore)
  → if !user: navigate('/login', { state: { from: location } })
  → after login: navigate(from.pathname) → returns to original destination

User is logged in:
  → ProtectedRoute renders children normally
```

---

## 29. TOAST NOTIFICATION

```
Any component calls showToast('message', 'success' | 'error' | 'info')
  → AppContext: setToast({ message, type })
  → Toast.jsx: AnimatePresence detects toast state
  → slides up from bottom with spring animation
  → color: green (success), red (error), blue (info)
  → auto-dismisses after 3.5s: setTimeout → setToast(null)
  → slides back down on exit
```

---

## 30. SOCKET.IO CONNECTION LIFECYCLE

```
connectSocket(token):
  → io('http://localhost:5000', { auth: { token } })
  → server io.use middleware: jwt.verify(token) → socket.userId = decoded.id
  → server: global.onlineUsers.set(userId, socket.id)
  → server: io.emit('user_online', { userId }) → all clients update online status

getSocket():
  → returns current socket instance (or null if not connected)
  → used by Chat.jsx and AppContext to attach listeners

disconnectSocket():
  → socket.disconnect()
  → socket = null
  → server: socket.on('disconnect') fires
  → server: global.onlineUsers.delete(userId)
  → server: io.emit('user_offline', { userId })

AppContext bindSocket():
  → called on mount + after login
  → checks if socket exists and not already bound (ref guard)
  → attaches socket.on('notification') handler once
  → interval retries for 10s to handle login timing gap

Socket events summary:
  Client → Server:   send_message, typing, mark_read
  Server → Client:   receive_message, typing, messages_read, notification,
                     user_online, user_offline, message_error
```

---

## DATA FLOW SUMMARY

```
User Action
    ↓
React Component (state + UI)
    ↓
API call (axios with JWT) or Socket.io emit
    ↓
Express route → middleware (authenticate) → controller
    ↓
Sequelize ORM → MySQL query
    ↓
Response JSON
    ↓
React state update → UI re-renders
    ↓ (if real-time)
Socket.io emit to target user
    ↓
Target user's React state updates → UI re-renders
```

---

## STATE MANAGEMENT SUMMARY

| State | Location | What it holds |
|-------|----------|---------------|
| user, loading | AuthContext | Logged-in user object, auth loading flag |
| updateUser() | AuthContext | Merges profile updates without reload |
| notifications | AppContext | Array of notification objects |
| toast | AppContext | Current toast { message, type } |
| onLogin() | AppContext | Triggers fetch + socket bind after auth |
| isDark | ThemeContext | Current theme preference |
| Local state | Each page | Loading, error, form data, modal open/close |

