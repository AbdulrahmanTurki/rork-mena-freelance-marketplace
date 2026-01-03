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

export interface User { id: string; name: string; email: string; type: 'buyer' | 'seller'; status: 'active' | 'suspended' | 'banned' | 'pending'; verified: boolean; joinedDate: string; avatar?: string; rating?: number; totalOrders?: number; totalEarnings?: number; }
export interface Gig { id: string; title: string; sellerId: string; sellerName: string; category: string; price: number; status: 'active' | 'paused' | 'pending_approval' | 'rejected'; image?: string; rating?: number; orders: number; }
export interface Order { id: string; gigTitle: string; buyerId: string; buyerName: string; sellerId: string; sellerName: string; status: 'active' | 'pending' | 'completed' | 'cancelled' | 'disputed'; amount: number; date: string; deliveryDate?: string; }
export interface Dispute { id: string; orderId: string; reporterId: string; reporterName: string; reportedId: string; reportedName: string; reason: string; description: string; evidence: string[]; status: 'open' | 'investigating' | 'resolved' | 'closed'; createdAt: string; messages: DisputeMessage[]; }
export interface DisputeMessage { id: string; senderId: string; senderName: string; message: string; timestamp: string; }
export interface PayoutRequest { id: string; sellerId: string; sellerName: string; amount: number; status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'; requestDate: string; method: string; }
export interface SupportTicket { id: string; userId: string; userName: string; subject: string; description: string; status: 'open' | 'in_progress' | 'resolved' | 'closed'; priority: 'low' | 'medium' | 'high'; createdAt: string; messages: TicketMessage[]; }
export interface TicketMessage { id: string; senderId: string; senderName: string; message: string; timestamp: string; }
export interface ActivityLog { id: string; adminId: string; adminName: string; action: string; target: string; targetId: string; details: string; timestamp: string; }

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Helper to safely parse permissions
  const parsePermissions = (permissionsData: any) => {
    if (!permissionsData) return ['all'];
    if (typeof permissionsData === 'string') return [permissionsData];
    if (Array.isArray(permissionsData)) return permissionsData;
    // Handle JSON object format { "all": true }
    if (typeof permissionsData === 'object') {
       return Object.keys(permissionsData).filter(key => permissionsData[key] === true);
    }
    return ['all'];
  };

  const checkAdminSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setAdminUser(null);
        return;
      }

      // 1. UPDATED: Use RPC function instead of direct table query
      const { data: adminRole, error: roleError } = await supabase.rpc('get_my_admin_role');

      if (roleError) {
        console.error('RPC Error checking admin session:', roleError);
        setAdminUser(null);
        return;
      }

      if (!adminRole) {
        setAdminUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', session.user.id)
        .single();

      const admin: AdminUser = {
        id: session.user.id,
        name: profile?.full_name || session.user.email?.split('@')[0] || 'Admin',
        email: profile?.email || session.user.email || '',
        role: adminRole.role as AdminRole,
        permissions: parsePermissions(adminRole.permissions),
      };

      console.log('[AdminContext] Session restored for:', admin.email);
      setAdminUser(admin);
    } catch (error) {
      console.error('Error checking admin session:', error);
      setAdminUser(null);
    }
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error('Admin login auth error:', authError);
        return false;
      }

      // 2. UPDATED: Use RPC function here too
      const { data: adminRole, error: roleError } = await supabase.rpc('get_my_admin_role');

      if (roleError || !adminRole) {
        console.error('Login failed: User is not an admin (RPC returned null or error)', roleError);
        await supabase.auth.signOut();
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', authData.user.id)
        .single();

      const admin: AdminUser = {
        id: authData.user.id,
        name: profile?.full_name || email.split('@')[0],
        email: profile?.email || email,
        role: adminRole.role as AdminRole,
        permissions: parsePermissions(adminRole.permissions),
      };

      console.log('[AdminContext] Login success:', admin.email);
      setAdminUser(admin);
      await saveAdminData({ adminUser: admin });
      return true;
    } catch (error) {
      console.error('Admin login exception:', error);
      return false;
    }
  };

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
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
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
  
  // Placeholder actions to prevent TypeScript errors (Add logic back if needed)
  const addActivityLog = async (action: string, target: string, targetId: string, details: string) => {};
  const approveUser = async (userId: string) => {};
  const rejectUser = async (userId: string, reason: string) => {};
  const suspendUser = async (userId: string, reason: string) => {};
  const verifyUser = async (userId: string) => {};
  const approveGig = async (gigId: string) => {};
  const rejectGig = async (gigId: string, reason: string) => {};
  const pauseGig = async (gigId: string) => {};
  const resolveDispute = async (disputeId: string, outcome: string, refundAmount?: number) => {};
  const approvePayout = async (payoutId: string) => {};
  const rejectPayout = async (payoutId: string, reason: string) => {};

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
