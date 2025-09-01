# Backend Service Setup

The frontend application requires a backend service to provide location data and handle scraping tasks. This document explains how to set up the required backend services.

## Required Backend Endpoints

1. **Location Data API**: `http://localhost:4242/api/states/nested`
   - Provides hierarchical location data for US states, counties, cities, and ZIP codes
   - Used by the location selection component

2. **Scraping Task API**: `http://localhost:4242/api/v1/tasks`
   - Handles scraping task submission and management
   - Used for starting new scraping jobs

## Backend Setup Options

### Option 1: Use the Official Mapolio Backend (Recommended)

If you have access to the official Mapolio backend repository:

1. Clone the backend repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see backend repository for details)
4. Start the backend service:
   ```bash
   npm run dev
   ```

### Option 2: Create a Mock Backend for Development

For development purposes, you can create a simple mock server:

1. Create a new directory for your mock backend:
   ```bash
   mkdir mock-backend
   cd mock-backend
   npm init -y
   npm install express cors
   ```

2. Create a simple server file `server.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const app = express();
   const PORT = 4242;

   app.use(cors());
   app.use(express.json());

   // Mock location data endpoint
   app.get('/api/states/nested', (req, res) => {
     res.json({
       success: true,
       data: {
         "california": {
           counties: {
             "los_angeles": {
               cities: {
                 "los_angeles": ["90001", "90002", "90003"],
                 "beverly_hills": ["90210"]
               }
             },
             "san_francisco": {
               cities: {
                 "san_francisco": ["94101", "94102"]
               }
             }
           }
         },
         "texas": {
           counties: {
             "travis": {
               cities: {
                 "austin": ["78701", "78702"]
               }
             }
           }
         }
       }
     });
   });

   // Mock scraping tasks endpoint
   app.post('/api/v1/tasks', (req, res) => {
     // Simulate task creation
     const taskId = 'task_' + Date.now();
     res.json({
       taskId: taskId,
       message: 'Task submitted successfully'
     });
   });

   app.listen(PORT, () => {
     console.log(`Mock backend server running on http://localhost:${PORT}`);
   });
   ```

3. Run the mock server:
   ```bash
   node server.js
   ```

## Environment Variables

The frontend uses the following environment variables (set in `.env.local`):

- `NEXT_PUBLIC_LOCATION_API_URL`: URL for the location data API
- `NEXT_PUBLIC_BACKEND_API_URL`: URL for the scraping task API
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Troubleshooting

### "Failed to fetch" Error

If you see "Failed to fetch" errors in the browser console:

1. Ensure the backend service is running on `http://localhost:4242`
2. Check that the required endpoints are accessible:
   - `http://localhost:4242/api/states/nested`
   - `http://localhost:4242/api/v1/tasks`
3. Verify there are no CORS issues
4. Check the browser's network tab for more detailed error information

### Network Issues

If the frontend cannot connect to the backend:

1. Verify the backend is running:
   ```bash
   curl http://localhost:4242/api/states/nested
   ```
2. Check firewall settings
3. Ensure the correct port is being used
4. Verify environment variables are set correctly

## Production Deployment

For production deployment:

1. Update the environment variables to point to your production backend URLs
2. Ensure proper SSL/TLS configuration
3. Set up appropriate authentication and authorization
4. Configure rate limiting and other security measures