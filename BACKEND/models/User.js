const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    maxlength: [50, 'First name cannot be more than 50 characters'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    maxlength: [50, 'Last name cannot be more than 50 characters'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    index: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  country: {
    type: String,
    maxlength: [50, 'Country cannot be more than 50 characters']
  },
  institution: {
    type: String,
    maxlength: [100, 'Institution cannot be more than 100 characters']
  },
  
  // Enhanced Security Fields
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Account Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  lastLoginIP: String,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    contestsParticipated: { type: Number, default: 0 },
    rating: { type: Number, default: 1200 }
  },
  socialLinks: {
    github: String,
    linkedin: String,
    website: String
  },
  preferences: {
    preferredLanguage: {
      type: String,
      enum: ['cpp', 'java', 'python', 'javascript'],
      default: 'cpp'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1, username: 1 });
UserSchema.index({ 'stats.rating': -1 });

// Constants for account locking
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Handle login attempts and account locking
UserSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + LOCK_TIME
    };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts (successful login)
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      lastLogin: Date.now()
    }
  });
};

// Generate email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  
  return verificationToken;
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Static method to find by credentials with locking logic
UserSchema.statics.getAuthenticated = async function(identifier, password, ipAddress) {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() }
    ]
  }).select('+password');
  
  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }
  
  if (user.isLocked) {
    return { success: false, message: 'Account temporarily locked due to too many failed login attempts' };
  }
  
  if (!user.isActive) {
    return { success: false, message: 'Account has been deactivated' };
  }
  
  const isMatch = await user.matchPassword(password);
  
  if (isMatch) {
    if (!user.loginAttempts && !user.lockUntil) {
      await user.updateOne({
        $set: {
          lastLogin: Date.now(),
          lastLoginIP: ipAddress
        }
      });
      return { success: true, user };
    }
    
    await user.resetLoginAttempts();
    await user.updateOne({
      $set: {
        lastLoginIP: ipAddress
      }
    });
    return { success: true, user };
  }
  
  await user.incLoginAttempts();
  return { success: false, message: 'Invalid credentials' };
};

module.exports = mongoose.model('User', UserSchema);