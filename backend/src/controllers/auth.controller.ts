import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file');
}

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Create new user (password is hashed by the model hook)
    const newUser = await User.create({ firstName, lastName, email, password });

    // Exclude password from the returned user object
    const userJson = newUser.toJSON();
    delete userJson.password;

    res.status(201).json({ message: 'User registered successfully.', user: userJson });
  } catch (error) {
    // Handle validation errors or other issues
    if (error instanceof Error) {
        return res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
    res.status(500).json({ message: 'An unknown error occurred.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1d', // Token expires in 1 day
    });
    
    // Exclude password from the returned user object
    const userJson = user.toJSON();
    delete userJson.password;

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: userJson,
    });
  } catch (error) {
    if (error instanceof Error) {
        return res.status(500).json({ message: 'Error logging in.', error: error.message });
    }
    res.status(500).json({ message: 'An unknown error occurred.' });
  }
};
