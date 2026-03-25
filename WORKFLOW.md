# ProjectPair — Complete Workflow Documentation (v6)

Every user journey, data flow, API call, socket event, and state change documented end-to-end.

---

## 1. APP BOOTSTRAP

```
Browser opens http://localhost:5173
  → Vite serves index.html + main.jsx
  → React renders <App />
  → Provider tree mounts:
       ThemeProvider   → reads localStorage pp_theme, sets body.light class
       AuthProvider    → reads pp_token, calls GET /auth/me, restores session
       AppProvider     → fetches notifications, binds socket listener
  → AppContent: Cursor + Navbar + Toast + Routes (lazy loaded)
```

ThemeProvider: reads `pp_theme` (default: dark). Toggles `body.light`. CSS variables cascade.

AuthProvider: if `pp_token` → `GET /api/auth/me` → `setUser` + `connectSocket`. On 401 → silent refresh attempt via `POST /auth/refresh` (httpOnly cookie). On failure → clear storage + redirect to login.

AppProvider: `fetchNotifications()` if token present. `bindSocket()` interval (1s, 10s max) to attach `socket.on('notification')`.

---

## 2. USER REGISTRATION

```
/signup → Step 1: name + email + password (min 8)
        → Step 2: role + skills (multi-select)
        → POST /api/auth/register
        → backend: email unique check → bcrypt.hash(12) → User.create()
        → signAccess({ id, email }, 15min) → access token
        → signRefresh({ id, email }, 7d) → httpOnly cookie pp_refresh
        → response: { token, user }
        → localStorage: pp_token, pp_user
        → connectSocket(token)
        → onLogin() → fetchNotifications + bindSocket
        → navigate('/dashboard')
        → Toast: "Account created!"
```

---

## 3. USER LOGIN

```
/login → email + password
       → POST /api/auth/login
       → backend: User.findOne → bcrypt.compare → sign tokens
       → access token in response body
       → refresh token in httpOnly cookie (pp_refresh)
       → localStorage: pp_token, pp_user
       → connectSocket(token)
       → onLogin() → fetchNotifications + bindSocket
       → navigate to original destination or /dashboard
       → Toast: "Welcome back!"
```

---

## 4. SILENT TOKEN REFRESH (Axios Interceptor)

```
Any API call returns 401 (access token expired after 15 min):
  → Axios interceptor catches it
  → isRefreshing = true
  → All subsequent 401 requests queued in failedQueue
  → POST /api/auth/refresh (sends pp_refresh cookie automatically)
  → backend: jwt.verify(cookie, JWT_REFRESH_SECRET) → User.findByPk
  → returns new access token
  → localStorage.setItem('pp_token', newToken)
  → processQueue: all queued requests retried with new token
  → original failed request retried
  → User never sees a logout or error
```

If refresh also fails (cookie expired/invalid):
```
  → localStorage cleared
  → window.location.href = '/login'
```

---

## 5. LOGOUT

```
User clicks Logout
  → AuthContext.logout():
      → POST /api/auth/logout → res.clearCookie('pp_refresh')
      → disconnectSocket()
      → setUser(null)
      → localStorage.removeItem('pp_token', 'pp_user')
  → All protected routes redirect to /login
```

---

## 6. FORGOT PASSWORD

```
/forgot-password → enter email
  → POST /api/auth/forgot-password
  → backend: User.findOne({ email })
      → crypto.randomBytes(32) = token
      → user.reset_token = token, expiry = now + 1hr
      → sendPasswordResetEmail(email, token) via Nodemailer
          → HTML email with /reset-password?token=<token> link
          → skipped if SMTP_USER not set
      → always returns 200 (prevents enumeration)
      → dev mode: returns dev_token in response
```

---

## 7. RESET PASSWORD

```
/reset-password?token=<token>
  → useSearchParams reads token
  → POST /api/auth/reset-password { token, password }
  → backend: User.findOne({ reset_token: token })
      → checks expiry
      → bcrypt.hash(newPassword, 12)
      → user.update({ password, reset_token: null, reset_token_expiry: null })
  → success state → auto-redirect to /login after 3s
```

---

## 8. SESSION RESTORE ON REFRESH

```
Page refresh → AuthProvider useEffect
  → reads pp_token from localStorage
  → GET /api/auth/me with Bearer token
  → if 200: setUser(data), connectSocket(token)
  → if 401: Axios interceptor fires POST /auth/refresh
      → if cookie valid: new token issued, GET /auth/me retried
      → if cookie invalid: redirect to /login
```

---

## 9. THEME TOGGLE

```
Navbar Sun/Moon button → ThemeContext.toggle()
  → setIsDark(!isDark)
  → document.body.classList.toggle('light', !isDark)
  → localStorage.setItem('pp_theme', ...)
  → body { transition: background 0.3s, color 0.3s }
  → all CSS variables update instantly
```

---

## 10. BROWSE PROJECTS

```
/projects → GET /api/projects?page=1&limit=12
  → search: debounced 400ms → ?search=query
  → category filter → ?category=cat
  → results update in real-time
  → "Pair Up" → proposal modal (Flow 12)
  → "Post Project" → /projects/new
```

---

## 11. POST A PROJECT

```
/projects/new (protected)
  → form: title, description (min 20), category, tech stack, budget, duration
  → client + server validation
  → POST /api/projects
  → backend: Project.create({ ...body, owner_id: req.user.id })
  → Toast: "Project posted!"
  → navigate('/projects/' + id)
```

---

## 12. SEND PAIR PROPOSAL

```
"Pair Up" button → modal
  → message + skills + timeline
  → POST /api/proposals
  → backend:
      → duplicate check
      → PairRequest.create()
      → createNotification(owner) → socket emit
      → sendProposalReceivedEmail(owner) → Nodemailer HTML email
  → Toast: "Proposal sent!"
```

---

## 13. RESPOND TO PROPOSAL

```
Owner receives notification (real-time bell + email)
  → GET /api/proposals/received
  → Accept: PUT /api/proposals/:id { status: 'accepted' }
      → createNotification(sender) → socket emit
      → sendProposalResponseEmail(sender, 'accepted') → email
  → Reject: same flow with 'rejected'
```

---

## 14. KANBAN DASHBOARD

```
/dashboard → GET /api/projects (user's projects)
  → select project tab
  → GET /api/tasks/project/:id
  → tasks distributed to 4 columns by status
  → stats: total, done, progress % — all real

Drag task to new column:
  → optimistic UI move
  → PUT /api/tasks/:id { status }
  → revert on failure + Toast error

Create task: POST /api/tasks
Edit task: PUT /api/tasks/:id
Delete task: DELETE /api/tasks/:id (optimistic)
```

---

## 15. REAL-TIME CHAT

```
/chat → GET /api/messages/conversations
  → select conversation
  → GET /api/messages/:userId
  → socket.emit('mark_read', { sender_id })

Send message:
  → socket.emit('send_message', { receiver_id, content })
  → server: Message.create → emit to sender + receiver
  → auto-scroll to bottom

Typing: socket.emit('typing', { receiver_id, isTyping })
  → 1.5s timeout clears it

Read receipt: socket.emit('mark_read')
  → server: UPDATE is_read=true
  → server: emit 'messages_read' to sender
  → double checkmark appears
```

---

## 16. FILE UPLOAD

```
Avatar upload:
  → user selects image in profile edit
  → POST /api/upload/avatar (multipart/form-data)
  → if Cloudinary configured: CloudinaryStorage → CDN URL
  → if not: multer disk storage → /uploads/filename
  → User.update({ avatar_url: url })
  → updateUser() in AuthContext → instant UI update

Chat file upload:
  → POST /api/upload/file
  → returns { url, name, type }
  → URL can be sent as message content
```

---

## 17. NOTIFICATION SYSTEM

```
Triggers:
  sendProposal()          → owner: 'proposal_received' 📨 + email
  respondToProposal()     → sender: 'proposal_accepted/rejected' 🎉❌ + email
  createReview()          → reviewee: 'new_review' ⭐

createNotification({ user_id, type, title, body, link }):
  → Notification.create() in DB
  → global.io.to(socketId).emit('notification', notif)

Frontend:
  → AppContext socket.on('notification') → prepend to list
  → Navbar bell badge increments
  → Click notification → markOneRead + navigate(n.link)
  → Mark all read → PUT /notifications/read-all
```

---

## 18. ANALYTICS DASHBOARD

```
/analytics (protected)
  → GET /api/analytics
  → backend: Promise.all([
        User.count(), Project.count(), Message.count(),
        PairRequest.count(), Review.count(), Task.count(),
        Project.count({ status: 'open' }),
        Project.count({ status: 'completed' }),
        Project.findAll GROUP BY category,
        PairRequest.findAll GROUP BY status,
        recent users (5), recent projects (5)
      ])
  → frontend: stat cards + animated bar charts + recent tables
```

---

## 19. EDIT PROFILE

```
/profile → "Edit Profile" → modal
  → PUT /api/users/me { name, role, bio, skills_offered, skills_needed, github_url, portfolio_url }
  → AuthContext.updateUser(res.data) → instant UI, no reload
  → Toast: "Profile updated!"

Avatar upload (if wired):
  → POST /api/upload/avatar → url
  → PUT /api/users/me { avatar_url: url }
```

---

## 20. REVIEWS

```
/profile/:id → "Leave Review"
  → star picker (1-5) + project ID + comment
  → POST /api/reviews { reviewee_id, project_id, rating, comment }
  → backend:
      → checks reviewer !== reviewee
      → PairRequest accepted check
      → duplicate check
      → Review.create()
      → AVG(rating) recalculated → User.update({ rating, total_reviews })
      → createNotification(reviewee) → 'new_review' ⭐
  → review appears instantly
  → Toast: "Review submitted!"
```

---

## 21. PORTFOLIO

```
/portfolio → reads AuthContext.user (name, role, bio, skills_offered)
  → GET /api/projects?owner_id=userId
  → skeleton loaders while fetching
  → empty state with "Post a Project" CTA if no projects
  → project cards: title, desc, tags, status, budget, View link
  → skills bars: animated from user.skills_offered
  → stats: real project count, reviews, rating, joined year
```

---

## 22. PROTECTED ROUTE

```
<ProtectedRoute> checks AuthContext.loading
  → if loading: null (waits for session restore)
  → if !user: navigate('/login', { state: { from: location } })
  → after login: navigate(from.pathname)
```

---

## 23. SOCKET.IO LIFECYCLE

```
connectSocket(token):
  → io(url, { auth: { token }, withCredentials: true })
  → server: jwt.verify → socket.userId
  → global.onlineUsers.set(userId, socketId)
  → io.emit('user_online')

disconnectSocket():
  → socket.disconnect() → socket = null
  → server: onlineUsers.delete(userId)
  → io.emit('user_offline')

AppContext bindSocket():
  → ref-guarded (no duplicate listeners)
  → retries every 1s for 10s after login
```

---

## 24. WINSTON LOGGING

```
Every HTTP request:
  → requestLogger middleware fires on response finish
  → logs: METHOD /path STATUS Xms
  → level: error (5xx), warn (4xx), info (2xx/3xx)

Errors:
  → global error handler: logger.error(message, { stack, path })

Dev: colorized console output
Prod: JSON to logs/error.log + logs/combined.log
```

---

## DATA FLOW SUMMARY

```
User Action
    ↓
React Component (local state + UI)
    ↓
api.js (Axios + JWT Bearer header + withCredentials)
    ↓
Express route → rate limiter → validator → authenticate → controller
    ↓
Sequelize ORM → MySQL query
    ↓
Response JSON → React state update → UI re-renders
    ↓ (if real-time)
Socket.io emit → target user's React state → UI re-renders
    ↓ (if email)
Nodemailer → SMTP → user's inbox
```

---

## STATE MANAGEMENT

| State | Location | Contents |
|-------|----------|----------|
| user, loading | AuthContext | Logged-in user, auth loading flag |
| updateUser() | AuthContext | Merges profile updates without reload |
| logout() | AuthContext | Calls /auth/logout, clears cookie + storage |
| notifications | AppContext | Array of notification objects |
| toast | AppContext | Current toast { message, type } |
| onLogin() | AppContext | Triggers fetch + socket bind after auth |
| isDark | ThemeContext | Current theme preference |
| Local state | Each page | Loading, error, form data, modals |

---

## NEW IN v6

| Feature | What Changed |
|---------|-------------|
| Access tokens | 15 min expiry (was 7 days) |
| Refresh tokens | httpOnly cookie, 7 day expiry |
| Silent refresh | Axios interceptor queues + retries on 401 |
| Logout | Server-side cookie clear via POST /auth/logout |
| Email system | Nodemailer — reset password + proposal emails |
| File uploads | Cloudinary + local fallback via multer |
| Analytics | Full platform stats dashboard at /analytics |
| Winston logging | Structured request + error logging |
| XSS protection | xss-clean middleware on all inputs |
| cookie-parser | Required for httpOnly cookie reading |
| Upload endpoints | POST /upload/avatar + POST /upload/file |
