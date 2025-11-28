import { Request, Response } from 'express';
import { User } from '../models';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error fetching users.', error: error.message });
    }
    res.status(500).json({ message: 'An unknown error occurred.' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const requesterUserId = req.user?.id;
  const requesterUserRole = req.user?.role;

  // Basic validation for role
  if (!role || !['user', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const userToUpdate = await User.findByPk(id);

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // A manager cannot promote someone to admin, and cannot change their own role or another admin's role
    if (requesterUserRole === 'manager') {
      if (role === 'admin' || userToUpdate.role === 'admin') {
        return res.status(403).json({ message: 'Managers cannot change admin roles.' });
      }
      if (userToUpdate.id === requesterUserId) {
          return res.status(403).json({ message: 'Managers cannot change their own role.' });
      }
    }
    // Only admin can promote to admin or change admin roles.
    if (requesterUserRole !== 'admin' && (role === 'admin' || userToUpdate.role === 'admin')) {
      return res.status(403).json({ message: 'Only admins can change admin roles.' });
    }
    // Admin cannot change their own role (as a safety measure)
    if (requesterUserRole === 'admin' && userToUpdate.id === requesterUserId) {
      return res.status(403).json({ message: 'Admins cannot change their own role.' });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.status(200).json({ message: 'User role updated successfully.', user: { id: userToUpdate.id, email: userToUpdate.email, role: userToUpdate.role } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error updating user role.', error: error.message });
    }
    res.status(500).json({ message: 'An unknown error occurred.' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requesterUserId = req.user?.id;
  const requesterUserRole = req.user?.role;

  try {
    const userToDelete = await User.findByPk(id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // A user cannot delete themselves
    if (userToDelete.id === requesterUserId) {
        return res.status(403).json({ message: 'Users cannot delete themselves.' });
    }
    // A manager cannot delete an admin
    if (requesterUserRole === 'manager' && userToDelete.role === 'admin') {
        return res.status(403).json({ message: 'Managers cannot delete admin users.' });
    }
    // Admins can delete anyone but themselves
    // Managers can delete users, but not admins or themselves

    await userToDelete.destroy();

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error deleting user.', error: error.message });
    }
    res.status(500).json({ message: 'An unknown error occurred.' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error fetching user details.', error: error.message });
    }
    res.status(500).json({ message: 'An unknown error occurred.' });
  }
};
