// Mongo connection string, shared by the server and the tools.
// Checked in this order:
// 1. DATABASE_URL  - a full connection string (optional)
// 2. MONGO_CLUSTER - MongoDB Atlas (online), built from separate variables
// 3. MONGO_HOST    - local / Docker MongoDB
function getMongoUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  // ---- online: MongoDB Atlas ----
  if (process.env.MONGO_CLUSTER) {
    const user = encodeURIComponent(process.env.MONGO_INITDB_ROOT_USERNAME || '')
    const pass = encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD || '')
    const cluster = process.env.MONGO_CLUSTER.replace(/^mongodb(\+srv)?:\/\//, '').replace(/\/+$/, '')
    const db = process.env.MONGO_DB || '2syria'
    return `mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`
  }

  // ---- local: Docker MongoDB ----
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

// same URL with the password hidden, for logs
function safeMongoUrl(url) {
  return url.replace(/\/\/[^@]*@/, '//***@')
}

module.exports = { getMongoUrl, safeMongoUrl }