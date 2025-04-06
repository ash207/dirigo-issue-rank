
// Get issues and positions counts
export async function getContentCounts(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let issuesQuery, positionsQuery;
    
    if (startDate && endDate) {
      issuesQuery = supabaseAdmin
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
        
      positionsQuery = supabaseAdmin
        .from('positions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    } else {
      switch (dateRange) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          
          issuesQuery = supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
            
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          issuesQuery = supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());
            
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          
          issuesQuery = supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthAgo.toISOString());
            
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthAgo.toISOString());
          break;
        case 'year':
        default:
          const yearAgo = new Date();
          yearAgo.setDate(yearAgo.getDate() - 365);
          
          issuesQuery = supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yearAgo.toISOString());
            
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yearAgo.toISOString());
      }
    }

    const [issuesResult, positionsResult] = await Promise.all([
      issuesQuery,
      positionsQuery
    ]);
    
    const issuesCount = issuesResult.count || 0;
    const positionsCount = positionsResult.count || 0;
    
    return { issuesCount, positionsCount };
  } catch (error) {
    console.error("Error getting content counts:", error);
    return { issuesCount: 0, positionsCount: 0 };
  }
}

// Get user activity over time (for charts)
export async function getUserActivity(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let startDateObj;
    let numDays;
    
    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      numDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      numDays = Math.min(numDays, 90); // Cap at 90 days to prevent performance issues
    } else {
      const today = new Date();
      
      switch (dateRange) {
        case 'today':
          startDateObj = new Date(today);
          numDays = 1;
          break;
        case 'week':
          startDateObj = new Date(today);
          startDateObj.setDate(today.getDate() - 6);
          numDays = 7;
          break;
        case 'month':
          startDateObj = new Date(today);
          startDateObj.setDate(today.getDate() - 29);
          numDays = 30;
          break;
        case 'year':
        default:
          startDateObj = new Date(today);
          startDateObj.setDate(today.getDate() - 364);
          numDays = 365;
      }
    }
    
    // Get all profiles
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('created_at');
      
    if (error) {
      console.error("Error fetching profiles for user activity:", error);
      return [];
    }
    
    const userActivity = [];
    
    for (let day = 0; day < numDays; day++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(startDateObj.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Count signups for this date
      const signupsOnDay = profiles?.filter(profile => {
        return profile.created_at && profile.created_at.startsWith(dateStr);
      }).length || 0;
      
      userActivity.push({
        date: dateStr,
        count: signupsOnDay
      });
    }
    
    return userActivity;
  } catch (error) {
    console.error("Error getting user activity:", error);
    return [];
  }
}

// Get top issues by engagement
export async function getTopIssues(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let positionsQuery;
    
    if (startDate && endDate) {
      positionsQuery = supabaseAdmin
        .from('positions')
        .select('issue_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    } else {
      switch (dateRange) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('issue_id, created_at')
            .gte('created_at', today);
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('issue_id, created_at')
            .gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('issue_id, created_at')
            .gte('created_at', monthAgo.toISOString());
          break;
        case 'year':
        default:
          const yearAgo = new Date();
          yearAgo.setDate(yearAgo.getDate() - 365);
          positionsQuery = supabaseAdmin
            .from('positions')
            .select('issue_id, created_at')
            .gte('created_at', yearAgo.toISOString());
      }
    }
    
    const { data: positions, error } = await positionsQuery;
    
    if (error) {
      console.error("Error getting top issues:", error);
      return [];
    }
    
    const issueCount = {};
    positions?.forEach(position => {
      if (position.issue_id) {
        issueCount[position.issue_id] = (issueCount[position.issue_id] || 0) + 1;
      }
    });
    
    return Object.entries(issueCount).map(([issue_id, count]) => ({
      issue_id,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  } catch (error) {
    console.error("Error getting top issues:", error);
    return [];
  }
}

// Get user roles distribution
export async function getRoleDistribution(supabaseAdmin) {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('role');
    
    if (error) {
      console.error("Error getting role distribution:", error);
      return [];
    }
    
    const roleCounts = {};
    profiles?.forEach(profile => {
      if (profile.role) {
        roleCounts[profile.role] = (roleCounts[profile.role] || 0) + 1;
      }
    });
    
    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count
    }));
  } catch (error) {
    console.error("Error getting role distribution:", error);
    return [];
  }
}
