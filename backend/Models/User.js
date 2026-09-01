const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,     
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false, // Optional for Google OAuth users
    minlength: 4
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  picture: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
}); 
const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;