import { getIndonesianHolidays } from '../../../lib/holidays';

// Store original fetch to restore it later
const originalFetch = global.fetch;

describe('getIndonesianHolidays', () => {
  const mockApiKey = 'mock-api-key';
  
  beforeEach(() => {
    // Set environment variable
    process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
    
    // Clear mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Clean up
    delete process.env.GOOGLE_CALENDAR_API_KEY;
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should fetch and map holidays correctly', async () => {
    const mockResponse = {
      items: [
        {
          summary: 'Tahun Baru Masehi',
          start: { date: '2024-01-01' }
        },
        {
          summary: 'Tahun Baru Imlek',
          start: { dateTime: '2024-02-10T00:00:00Z' }
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const holidays = await getIndonesianHolidays(2024);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchUrl).toContain('googleapis.com');
    expect(fetchUrl).toContain(`key=${mockApiKey}`);
    expect(fetchUrl).toContain('timeMin=2024-01-01T00%3A00%3A00.000Z');
    
    expect(holidays).toHaveLength(2);
    expect(holidays[0]).toEqual({ date: '2024-01-01', name: 'Tahun Baru Masehi' });
    expect(holidays[1]).toEqual({ date: '2024-02-10', name: 'Tahun Baru Imlek' });
  });

  it('should throw an error if GOOGLE_CALENDAR_API_KEY is not defined', async () => {
    delete process.env.GOOGLE_CALENDAR_API_KEY;
    
    await expect(getIndonesianHolidays()).rejects.toThrow('GOOGLE_CALENDAR_API_KEY is not defined');
  });

  it('should throw an error if API response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ error: { message: 'Invalid API key' } }),
    });

    await expect(getIndonesianHolidays()).rejects.toThrow('Google Calendar API error');
  });

  it('should return empty array if items are missing in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const holidays = await getIndonesianHolidays();
    expect(holidays).toEqual([]);
  });
});
