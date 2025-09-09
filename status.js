// Import the clients map from bot.js
const { clients } = require('./bot');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'GET') {
    const status = {};
    clients.forEach((client, number) => {
      status[number] = {
        status: client.info ? 'connected' : 'disconnected',
        phone: client.info ? client.info.wid.user : 'unknown'
      };
    });
    
    return res.json({ status: 'success', clients: status });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}