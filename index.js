const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const cookieParser = require('cookie-parser');
const app = express();
const verifyToken = require('./middleware/verifyToken')
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const refreshRoutes = require('./routes/refreshRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


//Public Routes
app.use('/api', [
  authRoutes,
  refreshRoutes
]);



// JWT Middleware - protect all routes after this point
app.use(verifyToken)

//Private Routes
app.use('/api', userRoutes);
app.use('/api', appointmentRoutes);



app.get('/', (req, res) => {
  return res.json('Testing Backend');
});

// SERVER LISTEN
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
