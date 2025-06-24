const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log('Cookies received:', cookies);
    const refreshToken = cookies?.refreshJwt;
    console.log('Refresh Token from cookie:', refreshToken);

    if (!refreshToken) {
        console.warn('No refresh token in cookie — skipping refresh');
        return res.status(204).end(); // 204 No Content: don't retry
    }

    try {
        console.log('Searching refresh token in DB...');
        const storedToken = await prisma.refreshToken.findFirst({
            where: { token: refreshToken },
        });
        console.log('Stored token from DB:', storedToken);

        if (!storedToken) {
            return res.status(403).json({ message: 'Refresh token not found' }); // Forbidden
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.error('JWT verify error:', err.message);
                return res.sendStatus(403);
            }

            console.log('Decoded payload:', decoded);
            console.log('storedToken.userId:', storedToken.userId);

            if (storedToken.userId !== decoded.userId) {
                console.warn('User ID mismatch between DB and token.');
                return res.sendStatus(403);
            }


            // Generate a new access token since the existing one is expired or not provided
            const newAccessToken = jwt.sign(
                { userId: decoded.userId },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            res.cookie('accessJwt', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000, // 15 minutes
                sameSite: 'None',
            });
            res.sendStatus(200);

        });
    } catch (error) {
        console.error('Error handling refresh token:', error);
        res.sendStatus(500); // Internal Server Error
    }
};

module.exports = { handleRefreshToken };
