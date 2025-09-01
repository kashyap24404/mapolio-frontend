# Mapolio Backend Setup

This document explains how to set up the backend service required for the Mapolio frontend application.

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Quick Start with Mock Backend

For development purposes, you can use the provided mock backend server:

1. Create a new directory for the backend:
   ```bash
   mkdir mapolio-backend
   cd mapolio-backend
   ```

2. Initialize a new Node.js project:
   ```bash
   npm init -y
   ```

3. Install required dependencies:
   ```bash
   npm install express cors
   ```

4. Create a file named `server.js` with the following content:
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

5. Run the mock backend server:
   ```bash
   node server.js
   ```

6. The backend should now be running on `http://localhost:4242`

## Environment Variables

Make sure your frontend `.env.local` file contains the correct backend URLs:

```env
NEXT_PUBLIC_LOCATION_API_URL=http://localhost:4242/api/states/nested
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4242/api/v1/tasks
```

## Testing the Backend

You can test if the backend is running correctly by making a request to the location data endpoint:

```bash
curl http://localhost:4242/api/states/nested
```

You should receive a JSON response with location data.

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
4. Verify environment variables are set correctly in the frontend