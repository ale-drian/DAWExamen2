import dotenv from 'dotenv'
dotenv.config()

const config = {
  dev: process.env.NODE_ENV !== 'production',
  port: process.env.PORT || 3000,
  // cors: process.env.CORS,
  // dbUser: process.env.DB_USER,
  // dbPassword: process.env.DB_PASSWORD,
  // dbHost: process.env.DB_HOST,
  // dbName: process.env.DB_NAME,
  mongo: {
    uri: process.env.MONGO_URI,
    db: process.env.MONGO_DB
  }
  // authJwtSecret: process.env.AUTH_JWT_SECRET
}

export default config
