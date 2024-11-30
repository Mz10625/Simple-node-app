const express = require('express');
require('dotenv').config()
const path = require('path');
const app = express();
const PORT = process.env.PORT;
const mongoURI =  process.env.URI;
const mongoose = require("mongoose");

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());


mongoose.connect(mongoURI,{useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err)
);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);



app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail already exists' });
    }

    const newUser = new User({ email, password });
    await newUser.save().then(u => {
      console.log('User saved:', u);
    })
    .catch(error => {
      console.error('Error saving User', error);
    });

    res.redirect("/login");
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid e-mail or password' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
