import jwt from 'jsonwebtoken'

let protect = (req, res, next) => {
  let token = null

  // 1. Check for token inside secure httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  // 2. Also support standard Authorization: Bearer <token> header for flexibility
  if (!token && req.headers.authorization) {
    let authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }
}

export { protect }
