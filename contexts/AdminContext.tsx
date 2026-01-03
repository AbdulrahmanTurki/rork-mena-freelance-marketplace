// Replace the checkAdminSession and loginAdmin functions inside your file with this:

// ... inside AdminProvider ...

  const checkAdminSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setAdminUser(null);
        return;
      }

      // USE RPC
      const { data: adminRole, error: roleError } = await supabase.rpc('get_my_admin_role');

      if (roleError || !adminRole) {
        setAdminUser(null);
        return;
      }

      // (Keep your profile fetch logic here)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

      const admin: AdminUser = {
        id: session.user.id,
        name: profile?.full_name || 'Admin',
        email: profile?.email || '',
        role: adminRole.role as AdminRole,
        permissions: ['all'], // Simplified
      };

      setAdminUser(admin);
    } catch (error) {
      console.error('Session check error:', error);
      setAdminUser(null);
    }
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) return false;

      // USE RPC
      const { data: adminRole, error: roleError } = await supabase.rpc('get_my_admin_role');

      if (roleError || !adminRole) {
        await supabase.auth.signOut();
        return false;
      }

      // (Keep your profile fetch logic here)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

      const admin: AdminUser = {
        id: data.user.id,
        name: profile?.full_name || 'Admin',
        email: profile?.email || '',
        role: adminRole.role as AdminRole,
        permissions: ['all'],
      };

      setAdminUser(admin);
      return true;
    } catch (error) {
      return false;
    }
  };
// ... rest of file
