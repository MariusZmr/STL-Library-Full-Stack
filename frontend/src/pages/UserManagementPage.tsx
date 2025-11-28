import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreHorizontal, User as UserIcon } from 'lucide-react'; 

import * as api from '../services/api'; 
import { useAuth } from '../contexts/AuthContext'; 

interface UserType { // This should match the UserType in api.ts and AuthContext
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  createdAt: string;
  updatedAt: string;
}

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // Get current logged-in user
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllUsers(); 
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load user list.');
      setError('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'manager' | 'admin') => {
    if (userId === currentUser?.id) {
        toast.error("You cannot change your own role.");
        return;
    }
    try {
      await api.updateUserRole(userId, newRole); 
      toast.success(`User role updated to ${newRole}.`);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Failed to update user role:', err);
      toast.error('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
        toast.error("You cannot delete yourself.");
        return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) {
        return;
    }
    try {
      await api.deleteUser(userId); 
      toast.success('User deleted successfully.');
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-destructive-foreground">
        <p>{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => navigate('/admin')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Panel
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <UserIcon className="h-6 w-6" /> User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and accounts within the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {user.id !== currentUser?.id && ( // Cannot change own role
                                <>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>
                                        Set to User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'manager')}>
                                        Set to Manager
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                        Set to Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive-foreground">
                                        Delete User
                                    </DropdownMenuItem>
                                </>
                            )}
                            {user.id === currentUser?.id && (
                                <DropdownMenuItem disabled>Cannot manage self</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;