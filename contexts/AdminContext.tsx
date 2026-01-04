import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type AdminRole = "super_admin" | "admin" | "moderator";

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
  type: "buyer" | "seller";
  status: "active" | "pending" | "suspended";
  joinedDate: string;
  avatar?: string;
  verified?: boolean;
  totalOrders?: number;
}

export interface Gig {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  status: "active" | "pending_approval" | "rejected" | "paused";
  price: number;
  category: string;
  createdAt: string;
  image?: string;
  rating?: number;
  orders?: number;
}

export interface Order {
  id: string;
  gigTitle: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  status: "active" | "completed" | "cancelled" | "disputed";
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string;
  reporterName: string;
  reportedName: string;
  reason: string;
  description: string;
  status: "open" | "investigating" | "resolved" | "closed";
  createdAt: string;
  messages?: {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
  }[];
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    type: "buyer",
    status: "active",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    type: "seller",
    status: "active",
    joinedDate: "2024-01-20",
  },
];

const mockGigs: Gig[] = [
  {
    id: "1",
    title: "Logo Design",
    sellerId: "2",
    sellerName: "Jane Smith",
    status: "active",
    price: 50,
    category: "Graphic Design",
    createdAt: "2024-01-25",
  },
];

const mockOrders: Order[] = [
  {
    id: "1",
    gigTitle: "Logo Design",
    buyerName: "John Doe",
    sellerName: "Jane Smith",
    amount: 50,
    status: "completed",
    createdAt: "2024-02-01",
  },
];

const mockDisputes: Dispute[] = [];

const mockPayoutRequests: PayoutRequest[] = [];

const mockActivityLogs: ActivityLog[] = [];

const mockSupportTickets: SupportTicket[] = [];

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const authContext = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [gigs, setGigs] = useState<Gig[]>(mockGigs);
  const [orders] = useState<Order[]>(mockOrders);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(mockPayoutRequests);
  const [activityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [supportTickets] = useState<SupportTicket[]>(mockSupportTickets);

  const checkAdminSession = useCallback(async () => {
    try {
      console.log('[AdminContext] Checking admin session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('[AdminContext] No session found');
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      console.log('[AdminContext] Session found, checking admin role...');
      const { data: adminRole, error: roleError } = await supabase.rpc('get_my_admin_role');

      if (roleError || !adminRole) {
        console.log('[AdminContext] Not an admin user or RPC error:', roleError);
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      console.log('[AdminContext] Admin role confirmed:', adminRole.role);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const admin: AdminUser = {
        id: session.user.id,
        name: profile?.full_name || 'Admin',
        email: profile?.email || session.user.email || '',
        role: adminRole.role as AdminRole,
        permissions: ['all'],
      };

      console.log('[AdminContext] Admin user loaded:', admin.email);
      setAdminUser(admin);
    } catch (error) {
      console.error('[AdminContext] Session check error:', error);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[AdminContext] Initial mount, checking admin session');
    checkAdminSession();
  }, [checkAdminSession]);

  useEffect(() => {
    if (authContext.user && authContext.user.type === 'admin' && !adminUser && !isLoading) {
      console.log('[AdminContext] AuthContext detected admin user, reloading admin session');
      setIsLoading(true);
      checkAdminSession();
    }
  }, [authContext.user, adminUser, isLoading, checkAdminSession]);

  const loginAdmin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AdminContext: Attempting login...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error('AdminContext: Login failed:', error);
        return false;
      }

      console.log('AdminContext: Auth successful, checking admin role...');
      const { data: adminRole, error: roleError } = await supabase.rpc('get_my_admin_role');

      if (roleError || !adminRole) {
        console.error('AdminContext: Not an admin or RPC error:', roleError);
        await supabase.auth.signOut();
        return false;
      }

      console.log('AdminContext: Admin role confirmed:', adminRole.role);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const admin: AdminUser = {
        id: data.user.id,
        name: profile?.full_name || 'Admin',
        email: profile?.email || data.user.email || '',
        role: adminRole.role as AdminRole,
        permissions: ['all'],
      };

      setAdminUser(admin);
      console.log('AdminContext: Admin user set successfully');
      return true;
    } catch (error) {
      console.error('AdminContext: Login exception:', error);
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAdminUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!adminUser) return false;
    return adminUser.permissions.includes('all') || adminUser.permissions.includes(permission);
  }, [adminUser]);

  const approveUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' as const } : u));
  }, []);

  const rejectUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended' as const } : u));
  }, []);

  const suspendUser = useCallback((userId: string, reason?: string) => {
    console.log('Suspending user:', userId, 'Reason:', reason);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended' as const } : u));
  }, []);

  const verifyUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' as const } : u));
  }, []);

  const approveGig = useCallback((gigId: string) => {
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, status: 'active' as const } : g));
  }, []);

  const rejectGig = useCallback((gigId: string, reason: string) => {
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, status: 'rejected' as const } : g));
  }, []);

  const pauseGig = useCallback((gigId: string) => {
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, status: 'paused' as const } : g));
  }, []);

  const resolveDispute = useCallback((disputeId: string) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' as const } : d));
  }, []);

  const approvePayout = useCallback((payoutId: string) => {
    setPayoutRequests(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'approved' as const } : p));
  }, []);

  const rejectPayout = useCallback((payoutId: string) => {
    setPayoutRequests(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'rejected' as const } : p));
  }, []);

  return useMemo(() => ({
    adminUser,
    isLoading,
    loginAdmin,
    logoutAdmin,
    checkAdminSession,
    hasPermission,
    users,
    gigs,
    orders,
    disputes,
    payoutRequests,
    activityLogs,
    supportTickets,
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
  }), [
    adminUser,
    isLoading,
    loginAdmin,
    logoutAdmin,
    checkAdminSession,
    hasPermission,
    users,
    gigs,
    orders,
    disputes,
    payoutRequests,
    activityLogs,
    supportTickets,
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
  ]);
});
