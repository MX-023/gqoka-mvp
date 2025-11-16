import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await mongoose.connect(MONGO_URI);

    if (req.method === 'POST' && req.url.includes('/register')) {
      const { firstName, lastName, email, password } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email exists' });
      }

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

    if (req.method === 'POST' && req.url.includes('/login')) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: 'Wrong password' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        ok: true,
        token,
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email }
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
