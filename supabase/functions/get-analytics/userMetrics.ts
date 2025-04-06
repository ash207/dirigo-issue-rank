
// Get total users count
export async function getTotalUsers(supabaseAdmin) {
  const { count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  return count || 0;
}

// Get new users over time period
export async function getNewUsers(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let query;
    
    if (startDate && endDate) {
      query = supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    } else {
      switch (dateRange) {
        case 'today':
          query = supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date().toISOString().split('T')[0]);
          break;
        case 'week':
          // Get date from 7 days ago
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          // Get date from 30 days ago
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          query = supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthAgo.toISOString());
          break;
        case 'year':
        default:
          // Get date from 365 days ago
          const yearAgo = new Date();
          yearAgo.setDate(yearAgo.getDate() - 365);
          query = supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yearAgo.toISOString());
      }
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error("Error getting new users:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error getting new users:", error);
    return 0;
  }
}

// Get conversion rate (confirmed users / total users)
export async function getConversionRate(supabaseAdmin, totalUsers) {
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const confirmedCount = authUsers?.users.filter(user => user.email_confirmed_at !== null).length || 0;
  return totalUsers > 0 ? (confirmedCount / totalUsers * 100).toFixed(2) : 0;
}

// Get daily active users
export function getDailyActiveUsers(authUsers) {
  const today = new Date().toISOString().split('T')[0];
  return authUsers?.users.filter(user => {
    return user.last_sign_in_at && user.last_sign_in_at.startsWith(today);
  }).length || 0;
}
