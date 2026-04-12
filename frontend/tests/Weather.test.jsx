import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Weather, { parseWeatherData } from '../src/components/Weather';

// --- Helpers ---

const makeHours = (pressure, count = 24) =>
    Array.from({ length: count }, () => ({ pressure_mb: pressure }));

const makeMockApiResponse = ({
    temp_c = 15,
    feelslike_c = 13,
    mintemp_c = 10,
    maxtemp_c = 20,
    sunrise = '06:00 AM',
    sunset = '08:00 PM',
    todayPressure = 1013,
    tomorrowPressure = 1013,
} = {}) => ({
    current: { temp_c, feelslike_c },
    forecast: {
        forecastday: [
            {
                day: { mintemp_c, maxtemp_c },
                astro: { sunrise, sunset },
                hour: makeHours(todayPressure),
            },
            {
                day: { mintemp_c, maxtemp_c },
                astro: { sunrise, sunset },
                hour: makeHours(tomorrowPressure),
            },
        ],
    },
});

const mockApiUrl = 'http://mock-api/weather';

// --- MSW server ---

const server = setupServer(
    http.get(mockApiUrl, () => HttpResponse.json(makeMockApiResponse()))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


// --- parseWeatherData ---

describe('parseWeatherData', () => {
    it('formats temperatures with degree symbol and C', () => {
        const data = makeMockApiResponse({ temp_c: 15, feelslike_c: 13, mintemp_c: 10, maxtemp_c: 20 });
        const result = parseWeatherData(data);
        expect(result.currentTemp).toBe('15°C');
        expect(result.feelLike).toBe('13°C');
        expect(result.dailyLow).toBe('10°C');
        expect(result.dailyHigh).toBe('20°C');
    });

    it('maps sunrise and sunset from astro data', () => {
        const data = makeMockApiResponse({ sunrise: '06:30 AM', sunset: '09:00 PM' });
        const result = parseWeatherData(data);
        expect(result.sunrise).toBe('06:30 AM');
        expect(result.sunset).toBe('09:00 PM');
    });

    it('sets pressureWarning to true when pressure difference >= 6', () => {
        const data = makeMockApiResponse({ todayPressure: 1010, tomorrowPressure: 1020 });
        expect(parseWeatherData(data).pressureWarning).toBe(true);
    });

    it('sets pressureWarning to false when pressure difference < 6', () => {
        const data = makeMockApiResponse({ todayPressure: 1013, tomorrowPressure: 1014 });
        expect(parseWeatherData(data).pressureWarning).toBe(false);
    });

    it('returns null pressure when current hour entry is missing', () => {
        const data = makeMockApiResponse();
        data.forecast.forecastday[0].hour = [];
        expect(parseWeatherData(data).pressure).toBeNull();
    });

    it('sets updateTime to a non-empty string', () => {
        const result = parseWeatherData(makeMockApiResponse());
        expect(typeof result.updateTime).toBe('string');
        expect(result.updateTime.length).toBeGreaterThan(0);
    });
});

// --- Weather component ---

describe('Weather component', () => {
    beforeEach(() => {
        server.use(
            http.get(mockApiUrl, () => HttpResponse.json(makeMockApiResponse()))
        );
    });

    it('shows loading state on initial render before fetch resolves', () => {
        server.use(
            http.get(mockApiUrl, () => new Promise(() => {}))
        );
        render(<Weather apiUrl={mockApiUrl} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders weather data after a successful fetch', async () => {
        server.use(
            http.get(mockApiUrl, () =>
                HttpResponse.json(makeMockApiResponse({ temp_c: 15, maxtemp_c: 20, mintemp_c: 10 }))
            )
        );
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument());
        expect(screen.getByText(/20°C/)).toBeInTheDocument();
        expect(screen.getByText(/10°C/)).toBeInTheDocument();
    });

    it('renders feels like temperature', async () => {
        server.use(
            http.get(mockApiUrl, () =>
                HttpResponse.json(makeMockApiResponse({ feelslike_c: 13 }))
            )
        );
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() => expect(screen.getByText(/13°C/)).toBeInTheDocument());
    });

    it('shows error state on a server error response', async () => {
        server.use(
            http.get(mockApiUrl, () => new HttpResponse(null, { status: 500 }))
        );
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() =>
            expect(screen.getByText('Network Error')).toBeInTheDocument()
        );
    });

    it('shows error state when fetch rejects entirely', async () => {
        server.use(
            http.get(mockApiUrl, () => HttpResponse.error())
        );
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() =>
            expect(screen.getByText('Network Error')).toBeInTheDocument()
        );
    });

    it('shows migraine warning when pressure difference >= 6', async () => {
        server.use(
            http.get(mockApiUrl, () =>
                HttpResponse.json(makeMockApiResponse({ todayPressure: 1000, tomorrowPressure: 1020 }))
            )
        );
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() =>
            expect(screen.getByText('Migraine Warning')).toBeInTheDocument()
        );
    });

    it('does not show migraine warning when pressure difference < 6', async () => {
        server.use(
            http.get(mockApiUrl, () =>
                HttpResponse.json(makeMockApiResponse({ todayPressure: 1013, tomorrowPressure: 1014 }))
            )
        );
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument());
        expect(screen.queryByText('Migraine Warning')).not.toBeInTheDocument();
    });

    it('does not show pressure reading when pressure is null', async () => {
        const data = makeMockApiResponse();
        data.forecast.forecastday[0].hour = [];
        server.use(http.get(mockApiUrl, () => HttpResponse.json(data)));
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument());
        expect(screen.queryByText(/hPa/)).not.toBeInTheDocument();
    });

    it('refetches after one hour', async () => {
        let callCount = 0;
        server.use(
            http.get(mockApiUrl, () => {
                callCount++;
                return HttpResponse.json(makeMockApiResponse());
            })
        );

        render(<Weather apiUrl={mockApiUrl} refreshInterval={50} />);

        await waitFor(() => expect(callCount).toBe(1));
        await waitFor(() => expect(callCount).toBe(2), { timeout: 500 });
    });

    it('clears error state when a subsequent fetch succeeds', async () => {
        let callCount = 0;
        server.use(
            http.get(mockApiUrl, () => {
                callCount++;
                if (callCount === 1) return new HttpResponse(null, { status: 500 });
                return HttpResponse.json(makeMockApiResponse());
            })
        );

        vi.useFakeTimers({ shouldAdvanceTime: true });
        render(<Weather apiUrl={mockApiUrl} />);

        await waitFor(() => expect(screen.getByText('Network Error')).toBeInTheDocument());

        await act(async () => {
            vi.advanceTimersByTime(1 * 60 * 60 * 1000);
        });

        await waitFor(() =>
            expect(screen.queryByText('Network Error')).not.toBeInTheDocument()
        );
        vi.useRealTimers();
    });

    it('clears the interval on unmount', async () => {
        render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument());

        const { unmount } = render(<Weather apiUrl={mockApiUrl} />);
        await waitFor(() => expect(screen.getAllByText('15°C').length).toBe(2));

        const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
        unmount();
        expect(clearIntervalSpy).toHaveBeenCalled();
        clearIntervalSpy.mockRestore();
    });
});