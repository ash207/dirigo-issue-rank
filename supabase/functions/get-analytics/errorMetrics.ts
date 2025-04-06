
// Get error metrics
export async function getErrorMetrics(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let query = supabaseAdmin.from('system_errors').select('*');
    
    // Apply date filtering
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    } else {
      switch (dateRange) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('created_at', today);
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          query = query.gte('created_at', monthAgo.toISOString());
          break;
        case 'year':
        default:
          const yearAgo = new Date();
          yearAgo.setDate(yearAgo.getDate() - 365);
          query = query.gte('created_at', yearAgo.toISOString());
      }
    }
    
    const { data: errors, error } = await query;
    
    if (error) {
      console.error("Error fetching error metrics:", error);
      return { totalErrors: 0, uniqueUserErrors: 0 };
    }
    
    // Count total errors
    const totalErrors = errors?.length || 0;
    
    // Count unique users affected by errors
    const uniqueUserIds = new Set();
    errors?.forEach(error => {
      if (error.user_id) {
        uniqueUserIds.add(error.user_id);
      }
    });
    const uniqueUserErrors = uniqueUserIds.size;
    
    return { totalErrors, uniqueUserErrors };
  } catch (error) {
    console.error("Error getting error metrics:", error);
    return { totalErrors: 0, uniqueUserErrors: 0 };
  }
}

// Get error timeline for charts
export async function getErrorTimeline(supabaseAdmin, dateRange, startDate, endDate) {
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
    
    // Get all errors within the period
    const { data: errors, error } = await supabaseAdmin
      .from('system_errors')
      .select('created_at');
      
    if (error) {
      console.error("Error fetching error timeline:", error);
      return [];
    }
    
    const errorTimeline = [];
    
    for (let day = 0; day < numDays; day++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(startDateObj.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Count errors for this date
      const errorsOnDay = errors?.filter(error => {
        return error.created_at && error.created_at.startsWith(dateStr);
      }).length || 0;
      
      errorTimeline.push({
        date: dateStr,
        count: errorsOnDay
      });
    }
    
    return errorTimeline;
  } catch (error) {
    console.error("Error getting error timeline:", error);
    return [];
  }
}

// Get top components with errors
export async function getTopErrorComponents(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let query = supabaseAdmin.from('system_errors').select('component, count');
    
    // Apply date filtering
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    } else {
      switch (dateRange) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('created_at', today);
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          query = query.gte('created_at', monthAgo.toISOString());
          break;
        case 'year':
        default:
          const yearAgo = new Date();
          yearAgo.setDate(yearAgo.getDate() - 365);
          query = query.gte('created_at', yearAgo.toISOString());
      }
    }
    
    // Add group by component functionality
    query = query.select('component').not('component', 'is', null);
    
    const { data: componentErrors, error } = await query;
    
    if (error) {
      console.error("Error fetching error components:", error);
      return [];
    }
    
    // Count errors by component
    const componentCounts = {};
    componentErrors?.forEach(error => {
      if (error.component) {
        componentCounts[error.component] = (componentCounts[error.component] || 0) + 1;
      }
    });
    
    // Convert to array, sort by count, and take top 5
    return Object.entries(componentCounts)
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch (error) {
    console.error("Error getting top error components:", error);
    return [];
  }
}

// Get errors by type
export async function getErrorsByType(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let query = supabaseAdmin.from('system_errors').select('error_type');
    
    // Apply date filtering
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    } else {
      switch (dateRange) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('created_at', today);
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          query = query.gte('created_at', monthAgo.toISOString());
          break;
        case 'year':
        default:
          const yearAgo = new Date();
          yearAgo.setDate(yearAgo.getDate() - 365);
          query = query.gte('created_at', yearAgo.toISOString());
      }
    }
    
    const { data: typeErrors, error } = await query;
    
    if (error) {
      console.error("Error fetching error types:", error);
      return [];
    }
    
    // Count errors by type
    const typeCounts = {};
    typeErrors?.forEach(error => {
      if (error.error_type) {
        typeCounts[error.error_type] = (typeCounts[error.error_type] || 0) + 1;
      }
    });
    
    // Convert to array format for charts
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count
    }));
  } catch (error) {
    console.error("Error getting errors by type:", error);
    return [];
  }
}
