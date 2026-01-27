import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserType } from '../types';

export interface IUser extends Document {
  userId: string;
  phone: string;
  name: string;
  email?: string;
  password?: string;
  userType: UserType;
  isVerified: boolean;
  isActive: boolean;
  language: 'en' | 'te' | 'hi';
  profilePhoto?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  rating: number;
  totalReviews: number;
  totalTrips: number;
  totalEarnings: number;
  totalSpent: number;
  inflowAmount: number; // Money to be transferred to driver (from online payments)
  outflowAmount: number; // Money driver owes to Yariyatra (from offline payments)
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      // Will be set manually during registration to use LKU format
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't return password by default
    },
    userType: {
      type: String,
      enum: ['individual', 'company'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      enum: ['en', 'te', 'hi'],
      default: 'en',
    },
    profilePhoto: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    inflowAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    outflowAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 }, { sparse: true, unique: true });
userSchema.index({ userId: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ userType: 1, isActive: 1 });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
