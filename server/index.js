const mongoose = require('mongoose');
// fail fast instead of hanging 10 s when the DB is down (must be set before the models load)
mongoose.set('bufferCommands', false)
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const userRouter=require('./routes/userRoutes')
const placeRouter=require('./routes/placeRoutes')
const express = require('express')
require('dotenv').config()
const { getMongoUrl, safeMongoUrl } = require('./utils/mongoUrl')
const app=express()

// Built React app (browser/dist). Override with CLIENT_DIST if it lives elsewhere.
const clientDist = process.env.CLIENT_DIST
  ? path.resolve(process.env.CLIENT_DIST)
  : path.join(__dirname, '..', 'browser', 'dist')

async function run(){
  const port=process.env.PORT||3000
  // ---- database: connect in the background and keep retrying ----
  const mongoUrl = getMongoUrl()
  let retryMs = 5000
  async function connectDb() {
    try {
      await mongoose.connect(mongoUrl, { family: 4, serverSelectionTimeoutMS: 15000 })
      console.log(`connected to database ${safeMongoUrl(mongoUrl)}`)
      retryMs = 5000
    } catch (err) {
      console.log(`database connection failed (${safeMongoUrl(mongoUrl)}): ${err.message}`)
      
    }
  }
  mongoose.connection.on('disconnected', () => console.log('database disconnected'))
  connectDb()

  app.set('trust proxy', 1) // behind Render's proxy
  app.use(cors({
    exposedHeaders:'token'
  }));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const dbReady = () => mongoose.connection.readyState === 1
app.get('/api/health', (req, res) =>
  res.status(dbReady() ? 200 : 503).json({ success: dbReady(), status: dbReady() ? 'ok' : 'database not connected' }))
// any API call while the database is down gets a quick, clear answer
app.use('/api', (req, res, next) => {
  if (dbReady()) return next()
  return res.status(503).json({ success: false, message: 'the service is starting up or the database is unavailable, please try again in a moment' })
})
app.use('/api/user',userRouter)
app.use('/api/place',placeRouter)
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
