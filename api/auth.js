const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await mongoose.connect(MONGO_URI);

    if (req.method === 'POST') {
      const { firstName, lastName, email, password } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email exists' });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const user = new User({ firstName, lastName, email, password: hash });
      await user.save();

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        ok: true,
        message: 'User created',
        token,
        user: { id: user._id, firstName, lastName, email }
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
