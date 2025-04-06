
// Get issues and positions counts
export async function getContentCounts(supabaseAdmin, dateRange, startDate, endDate) {
  let dateFilter = '';
  
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

  const { count: issuesCount } = await supabaseAdmin
    .from('issues')
    .select('*', { count: 'exact', head: true })
    .filter(dateFilter);

  const { count: positionsCount } = await supabaseAdmin
    .from('positions')
    .select('*', { count: 'exact', head: true })
    .filter(dateFilter);
  
  return { issuesCount: issuesCount || 0, positionsCount: positionsCount || 0 };
}

// Get user activity over time (for charts)
export async function getUserActivity(supabaseAdmin, dateRange, startDate, endDate) {
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
  
  const userActivity = [];
  const { data: profiles } = await supabaseAdmin.from('profiles').select('created_at');
  
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
}

// Get top issues by engagement
export async function getTopIssues(supabaseAdmin, dateRange, startDate, endDate) {
  let dateFilter = '';
  
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

  const { data: positions } = await supabaseAdmin
    .from('positions')
    .select('issue_id, created_at')
    .filter(dateFilter);
  
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
}

// Get user roles distribution
export async function getRoleDistribution(supabaseAdmin) {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('role');
  
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
}
