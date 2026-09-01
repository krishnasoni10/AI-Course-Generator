const UserModel = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "24h";

 
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists, please login",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();
    const authError = "Invalid email or password";

    const user = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: authError,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: authError,
      });
    }

    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      jwtToken,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ success: false, message: "No credential provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;
    const normalizedEmail = email.toLowerCase();
    
    let user = await UserModel.findOne({ email: normalizedEmail });
    
    if (!user) {
      user = await UserModel.create({
        name,
        email: normalizedEmail,
        googleId,
        picture,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.picture = picture || user.picture;
      await user.save();
    }
    
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      jwtToken,
      name: user.name,
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = { signup, login, googleAuth };
