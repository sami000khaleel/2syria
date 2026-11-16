// Mongo connection string, shared by the server and the tools:
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

// same URL with the password hidden, for logs
function safeMongoUrl(url) {
  return url.replace(/\/\/[^@]*@/, '//***@')
}

module.exports = { getMongoUrl, safeMongoUrl }
