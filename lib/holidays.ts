export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string; // Nama hari libur
}

/**
 * Fetches Indonesian public holidays from Google Calendar API.
 * 
 * @param year Optional. The year to fetch holidays for. If not provided, it fetches events starting from the beginning of the current year.
 * @returns Array of Holiday objects containing date and name.
 */
export async function getIndonesianHolidays(year?: number): Promise<Holiday[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_CALENDAR_API_KEY is not defined in environment variables");
  }

  const calendarId = "id.indonesian#holiday@group.v.calendar.google.com";
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  
  url.searchParams.append('key', apiKey);
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');

  if (year) {
    const timeMin = new Date(Date.UTC(year, 0, 1)).toISOString();
    const timeMax = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();
    url.searchParams.append('timeMin', timeMin);
    url.searchParams.append('timeMax', timeMax);
  } else {
    // If no year specified, let's fetch starting from current year minimum
    const currentYear = new Date().getFullYear();
    const timeMin = new Date(Date.UTC(currentYear, 0, 1)).toISOString();
    url.searchParams.append('timeMin', timeMin);
  }

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    const holidays: Holiday[] = data.items.map((event: any) => ({
      // Google Calendar all-day events use event.start.date (YYYY-MM-DD format)
      date: event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : ''),
      name: event.summary || 'Libur Nasional',
    })).filter((h: Holiday) => h.date);

    return holidays;
  } catch (error) {
    console.error("Error fetching Indonesian holidays:", error);
    throw error;
  }
}
