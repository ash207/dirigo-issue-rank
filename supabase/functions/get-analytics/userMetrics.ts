
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
    let dateFilter;
    
    if (startDate && endDate) {
      dateFilter = `created_at >= '${startDate}' AND created_at <= '${endDate}'`;
    } else {
      switch (dateRange) {
        case 'today':
          dateFilter = "created_at >= current_date";
          break;
        case 'week':
          dateFilter = "created_at >= current_date - interval '7 days'";
          break;
        case 'month':
          dateFilter = "created_at >= current_date - interval '30 days'";
          break;
        case 'year':
        default:
          dateFilter = "created_at >= current_date - interval '365 days'";
      }
    }
    
    const { data: newUsersData, error } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact' })
      .filter(dateFilter);
    
    if (error) {
      console.error("Error getting new users:", error);
      return 0;
    }
    
    return newUsersData?.length || 0;
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
