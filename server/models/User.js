import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

let userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Automatically hash the user password before saving
userSchema.pre('save', async function preSave() {
  if (!this.isModified('password')) {
    return
  }

  this.updatedAt = Date.now()
  let salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

userSchema.index({ email: 1 }, { unique: true })

export default mongoose.model('User', userSchema)
