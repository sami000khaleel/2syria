const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const userRouter = require('./routes/userRoutes')
const placeRouter = require('./routes/placeRoutes')
const express = require('express')
require('dotenv').config()
const app = express()

// Built React app (browser/dist). Override with CLIENT_DIST if it lives elsewhere.
const clientDist = process.env.CLIENT_DIST
  ? path.resolve(process.env.CLIENT_DIST)
  : path.join(__dirname, '..', 'browser', 'dist')

// Mongo connection string:
// 1. DATABASE_URL if set (e.g. MongoDB Atlas on Render)
// 2. otherwise built from the MONGO_* variables (local / Docker MongoDB)
function getMongoUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const user = process.env.MONGO_INITDB_ROOT_USERNAME
  const pass = process.env.MONGO_INITDB_ROOT_PASSWORD
  const db = process.env.MONGO_INITDB_DATABASE || '2syria'
  const host = process.env.MONGO_HOST || 'localhost'
  const port = process.env.MONGO_HOST_PORT || '27017'

  const auth = user && pass
    ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
    : ''
  // the root user is created in the "admin" database, so authenticate there
  const options = auth ? '?authSource=admin' : ''
  return `mongodb://${auth}${host}:${port}/${db}${options}`
}

async function run() {
  const port = process.env.PORT || 3000

  const mongoUrl = getMongoUrl()
  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    family: 4,
    useUnifiedTopology: true,
  }).then(() => {
    // log without the password
    console.log(`connected to database ${mongoUrl.replace(/\/\/[^@]*@/, '//***@')}`)
  }).catch((err) => console.log('database connection failed:', err.message))

  app.set('trust proxy', 1) // behind Render's proxy
  app.use(cors({
    exposedHeaders: 'token'
  }));
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }))
  app.use('/api/user', userRouter)
  app.use('/api/place', placeRouter)
  // unknown API routes -> JSON 404 (never the React page)
  app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'not found' }))

  // ---- frontend ----
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    // hashed build assets can be cached for a long time
    app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }))
    app.use(express.static(clientDist, { index: false }))
    // every other GET (e.g. /map, /login) -> the React app, so client-side routing works on refresh
    app.get('*', (req, res) => {
      res.set('Cache-Control', 'no-cache')
      res.sendFile(path.join(clientDist, 'index.html'))
    })
    console.log(`serving frontend from ${clientDist}`)
  } else {
    console.log(`no frontend build found at ${clientDist} — run "npm run build" in /browser (API only mode)`)
  }

  app.listen(port, () => console.log(`server is running on port ${port}`))
}
run()