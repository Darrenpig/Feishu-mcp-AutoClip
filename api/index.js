// Vercel API function to handle HTTP requests
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle different API endpoints
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'RanJok Creative Platform API',
      status: 'running',
      endpoints: {
        '/api/health': 'Health check',
        '/api/status': 'Service status'
      }
    });
    return;
  }
  
  if (req.method === 'POST') {
    // Handle POST requests
    const { action, data } = req.body || {};
    
    switch (action) {
      case 'health':
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString()
        });
        break;
        
      default:
        res.status(200).json({
          message: 'API endpoint received',
          action: action || 'none',
          data: data || null
        });
    }
    return;
  }
  
  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}