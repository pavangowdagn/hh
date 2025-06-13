import { supabase } from '../supabaseClient';
import { User } from '../types';

export class AuthService {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return null;
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          username: data.user.email?.split('@')[0] || 'user',
          role: this.getUserRole(data.user.email || '')
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }

      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  private getUserRole(email: string): 'admin' | 'upload' | 'viewer' {
    // Admin users - full access to everything
    if (email === 'vr@gmail.com') return 'admin';
    
    // Upload users - can upload files, add readings and complaints
    if (email === 'uploader@vehiclefleet.com') return 'upload';
    
    // Viewer users - read-only access
    if (email === 'viewer@vehiclefleet.com') return 'viewer';
    
    // Default to viewer role for unknown users
    return 'viewer';
  }

  async checkAuthStatus(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const appUser: User = {
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          role: this.getUserRole(user.email || '')
        };
        
        localStorage.setItem('currentUser', JSON.stringify(appUser));
        return appUser;
      }
      
      return null;
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  }
}

export const authService = new AuthService();