const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email, password'
      });
    }

    // Check if the email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword
      },
      select: { id: true, firstName: true, lastName: true, email: true } // Only return safe fields
    });

    return res.status(201).json({
      message: 'Registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create new user' });
  } finally {
    await prisma.$disconnect();
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Find user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    const expirationDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day

    try {
      // Check if a refresh token already exists for the user
      const existingToken = await prisma.refreshToken.findUnique({
        where: { userId: user.id },
      });

      if (existingToken) {
        // Update the existing refresh token
        await prisma.refreshToken.update({
          where: { id: existingToken.id },
          data: {
            token: refreshToken,
            expirationDate: expirationDate,
          },
        });
      } else {
        // Create a new refresh token entry
        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            expirationDate: expirationDate,
          },
        });
      }

      // Set httpOnly cookies for access and refresh tokens
      res.cookie('accessJwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'None',
        maxAge: 30 * 1000, // 30 seconds
        path: '/',
      });

      res.cookie('refreshJwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Error during refresh token storage:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  const refreshToken = cookies?.refreshJwt;

  if (!refreshToken) {
    return res.sendStatus(204); // No Content – no cookie to clear, but request is OK
  }

  try {
    // Delete the refresh token from the database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    // Clear the cookie on the client side
    res.clearCookie('accessJwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'None',
      path: "/",
    });

    res.clearCookie('refreshJwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'None',
      path: "/",
    });

    return res.sendStatus(204); // No Content – logout successful
  } catch (error) {
    console.error('Logout error:', error);
    return res.sendStatus(500); // Internal Server Error
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser
}

