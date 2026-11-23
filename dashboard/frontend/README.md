# AtmoGraph Dashboard

AtmoGraph is a React dashboard for exploring a sample supply-chain network, viewing disruption risk, simulating ripple effects, and comparing mitigation strategies.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

From the repository root:

```sh
cd dashboard/frontend
npm ci
npm run dev
```

Vite prints the local URL after startup.

## Verify changes

```sh
npm test
npm run build
```

## Data and API configuration

The dashboard ships with synthetic network data and canned predictions. Treat all displayed risks, delays, events, and mitigation outcomes as illustrative rather than operational forecasts.

The API client uses `http://localhost:8000` by default. To point it at another API, create a `.env.local` file in `dashboard/frontend` and set:

```sh
VITE_API_BASE_URL=https://your-api-host
```

The supported routes and fallback behavior are implemented in `src/api/client.js`. When a request is unavailable or returns an unsuccessful response, the client uses bundled demo data.
