import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type AdminRole = 'super_admin' | 'support_agent' | 'finance_admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'buyer' | 'seller';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  verified: boolean;
  joinedDate: string;
  avatar?: string;
  rating?: number;
  totalOrders?: number;
  totalEarnings?: number;
}

export interface Gig {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  category: string;
  price: number;
  status: 'active' | 'paused' | 'pending_approval' | 'rejected';
  image?: string;
  rating?: number;
  orders: number;
}

export interface Order {
  id: string;
  gigTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'disputed';
  amount: number;
  date: string;
  deliveryDate?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reason: string;
  description: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
  messages: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestDate: string;
  method: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const checkAdminSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setAdminUser(null);
        return;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (roleError || !adminRole) {
        setAdminUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', session.user.id)
        .single();

      const permissionsObj = adminRole.permissions as Record<string, boolean> | null;
      const permissionsList = permissionsObj ? Object.keys(permissionsObj).filter(key => permissionsObj[key] === true) : ['all'];

      const admin: AdminUser = {
        id: session.user.id,
        name: profile?.full_name || session.user.email?.split('@')[0] || 'Admin',
        email: profile?.email || session.user.email || '',
        role: adminRole.role as AdminRole,
        permissions: permissionsList,
      };

      console.log('[AdminContext] Admin user set:', { role: admin.role, permissions: admin.permissions });
      setAdminUser(admin);
    } catch (error) {
      console.error('Error checking admin session:', error);
      setAdminUser(null);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
    checkAdminSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAdminUser(null);
        } else if (session) {
          await checkAdminSession();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAdminSession]);

  const loadAdminData = async () => {
    try {
      const stored = await AsyncStorage.getItem('adminData');
      if (stored) {
        const data = JSON.parse(stored);
        setAdminUser(data.adminUser);
        setUsers(data.users || []);
        setGigs(data.gigs || []);
        setOrders(data.orders || []);
        setDisputes(data.disputes || []);
        setPayoutRequests(data.payoutRequests || []);
        setSupportTickets(data.supportTickets || []);
        setActivityLogs(data.activityLogs || []);
      } else {
        initializeMockData();
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      initializeMockData();
    }
  };

  const initializeMockData = () => {
    const mockAdmin: AdminUser = {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@platform.com',
      role: 'super_admin',
      permissions: ['all'],
    };

    const mockUsers: User[] = [
      {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'buyer',
        status: 'active',
        verified: true,
        joinedDate: '2024-01-15',
        totalOrders: 5,
      },
      {
        id: 'u2',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        type: 'seller',
        status: 'pending',
        verified: false,
        joinedDate: '2024-03-01',
        rating: 0,
        totalEarnings: 0,
      },
    ];

    setAdminUser(mockAdmin);
    setUsers(mockUsers);
    saveAdminData({ adminUser: mockAdmin, users: mockUsers });
  };

  const saveAdminData = async (data: any) => {
    try {
      const existingData = await AsyncStorage.getItem('adminData');
      const parsed = existingData ? JSON.parse(existingData) : {};
      await AsyncStorage.setItem('adminData', JSON.stringify({ ...parsed, ...data }));
    } catch (error) {
      console.error('Error saving admin data:', error);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error('Admin login error:', authError);
        return false;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (roleError || !adminRole) {
        console.error('User is not an admin:', roleError);
        await supabase.auth.signOut();
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', authData.user.id)
        .single();

      const permissionsObj = adminRole.permissions as Record<string, boolean> | null;
      const permissionsList = permissionsObj ? Object.keys(permissionsObj).filter(key => permissionsObj[key] === true) : ['all'];

      const admin: AdminUser = {
        id: authData.user.id,
        name: profile?.full_name || email.split('@')[0],
        email: profile?.email || email,
        role: adminRole.role as AdminRole,
        permissions: permissionsList,
      };

      console.log('[AdminContext] Admin logged in:', { role: admin.role, permissions: admin.permissions });
      setAdminUser(admin);
      await saveAdminData({ adminUser: admin });
      return true;
    } catch (error) {
      console.error('Admin login exception:', error);
      return false;
    }
  };

  const logoutAdmin = async () => {
    try {
      await supabase.auth.signOut();
      setAdminUser(null);
      await AsyncStorage.removeItem('adminData');
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  const hasPermission = (permission: string) => {
    if (!adminUser) return false;
    return adminUser.permissions.includes('all') || adminUser.permissions.includes(permission);
  };

  const addActivityLog = async (action: string, target: string, targetId: string, details: string) => {
    if (!adminUser) return;
    
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      adminId: adminUser.id,
      adminName: adminUser.name,
      action,
      target,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    
    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);
    await saveAdminData({ activityLogs: updatedLogs });
  };

  const approveUser = async (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'active' as const } : u);
    setUsers(updatedUsers);
    await saveAdminData({ users: updatedUsers });
    await addActivityLog('approve_user', 'user', userId, 'User approved');
  };

  const rejectUser = async (userId: string, reason: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'banned' as const } : u);
    setUsers(updatedUsers);
    await saveAdminData({ users: updatedUsers });
    await addActivityLog('reject_user', 'user', userId, `User rejected: ${reason}`);
  };

  const suspendUser = async (userId: string, reason: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'suspended' as const } : u);
    setUsers(updatedUsers);
    await saveAdminData({ users: updatedUsers });
    await addActivityLog('suspend_user', 'user', userId, `User suspended: ${reason}`);
  };

  const verifyUser = async (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, verified: true } : u);
    setUsers(updatedUsers);
    await saveAdminData({ users: updatedUsers });
    await addActivityLog('verify_user', 'user', userId, 'User verified');
  };

  const approveGig = async (gigId: string) => {
    const updatedGigs = gigs.map(g => g.id === gigId ? { ...g, status: 'active' as const } : g);
    setGigs(updatedGigs);
    await saveAdminData({ gigs: updatedGigs });
    await addActivityLog('approve_gig', 'gig', gigId, 'Gig approved');
  };

  const rejectGig = async (gigId: string, reason: string) => {
    const updatedGigs = gigs.map(g => g.id === gigId ? { ...g, status: 'rejected' as const } : g);
    setGigs(updatedGigs);
    await saveAdminData({ gigs: updatedGigs });
    await addActivityLog('reject_gig', 'gig', gigId, `Gig rejected: ${reason}`);
  };

  const pauseGig = async (gigId: string) => {
    const updatedGigs = gigs.map(g => g.id === gigId ? { ...g, status: 'paused' as const } : g);
    setGigs(updatedGigs);
    await saveAdminData({ gigs: updatedGigs });
    await addActivityLog('pause_gig', 'gig', gigId, 'Gig paused');
  };

  const resolveDispute = async (disputeId: string, outcome: string, refundAmount?: number) => {
    const updatedDisputes = disputes.map(d => d.id === disputeId ? { ...d, status: 'resolved' as const } : d);
    setDisputes(updatedDisputes);
    await saveAdminData({ disputes: updatedDisputes });
    await addActivityLog('resolve_dispute', 'dispute', disputeId, `Dispute resolved: ${outcome}`);
  };

  const approvePayout = async (payoutId: string) => {
    const updatedPayouts = payoutRequests.map(p => p.id === payoutId ? { ...p, status: 'approved' as const } : p);
    setPayoutRequests(updatedPayouts);
    await saveAdminData({ payoutRequests: updatedPayouts });
    await addActivityLog('approve_payout', 'payout', payoutId, 'Payout approved');
  };

  const rejectPayout = async (payoutId: string, reason: string) => {
    const updatedPayouts = payoutRequests.map(p => p.id === payoutId ? { ...p, status: 'rejected' as const } : p);
    setPayoutRequests(updatedPayouts);
    await saveAdminData({ payoutRequests: updatedPayouts });
    await addActivityLog('reject_payout', 'payout', payoutId, `Payout rejected: ${reason}`);
  };

  return {
    adminUser,
    users,
    gigs,
    orders,
    disputes,
    payoutRequests,
    supportTickets,
    activityLogs,
    loginAdmin,
    logoutAdmin,
    hasPermission,
    approveUser,
    rejectUser,
    suspendUser,
    verifyUser,
    approveGig,
    rejectGig,
    pauseGig,
    resolveDispute,
    approvePayout,
    rejectPayout,
    setUsers,
    setGigs,
    setOrders,
    setDisputes,
    setPayoutRequests,
    setSupportTickets,
    addActivityLog,
  };
});
