// Parse request body for filter parameters
export async function parseFilterParams(req) {
  let dateRange = 'week'; // Default to week
  let startDate = null;
  let endDate = null;
  
  if (req.body) {
    try {
      const body = await req.json();
      dateRange = body.dateRange || 'week';
      startDate = body.startDate || null;
      endDate = body.endDate || null;
    } catch (e) {
      console.error("Error parsing JSON body:", e);
    }
  }

  return { dateRange, startDate, endDate };
}

// Build date filter function for JS filtering
export function getDateFilterFunction(dateRange, startDate, endDate) {
  const now = new Date();
  
  if (startDate && endDate) {
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();
    return (date) => {
      const time = new Date(date).getTime();
      return time >= startDateTime && time <= endDateTime;
    };
  }
  
  switch (dateRange) {
    case 'today': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return (date) => new Date(date).getTime() >= today;
    }
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const weekAgoTime = weekAgo.getTime();
      return (date) => new Date(date).getTime() >= weekAgoTime;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      const monthAgoTime = monthAgo.getTime();
      return (date) => new Date(date).getTime() >= monthAgoTime;
    }
    case 'year': {
      const yearAgo = new Date(now);
      yearAgo.setDate(now.getDate() - 365);
      const yearAgoTime = yearAgo.getTime();
      return (date) => new Date(date).getTime() >= yearAgoTime;
    }
    default: {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const weekAgoTime = weekAgo.getTime();
      return (date) => new Date(date).getTime() >= weekAgoTime;
    }
  }
}

// Build SQL date filter based on date range - keeping this for backwards compatibility
export function buildDateFilter(dateRange, startDate, endDate) {
  if (startDate && endDate) {
    return `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`;
  }
  
  switch (dateRange) {
    case 'today':
      return "AND created_at >= current_date";
    case 'week':
      return "AND created_at >= current_date - interval '7 days'";
    case 'month':
      return "AND created_at >= current_date - interval '30 days'";
    case 'year':
      return "AND created_at >= current_date - interval '365 days'";
    default:
      return "AND created_at >= current_date - interval '7 days'";
  }
}
