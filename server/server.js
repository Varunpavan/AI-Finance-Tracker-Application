import dotenv from 'dotenv'
import app, { connectDB } from './app.js'

dotenv.config()

let PORT = process.env.PORT || 5055

let startServer = async () => {
  try {
    // Connect to MongoDB before starting to listen for requests
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
