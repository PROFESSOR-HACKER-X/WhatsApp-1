const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Store client instances in memory (for Vercel serverless functions)
let clients = new Map();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { action, phoneNumber } = req.body;

    if (action === 'start' && phoneNumber) {
      try {
        // Check if client already exists for this number
        if (clients.has(phoneNumber)) {
          const client = clients.get(phoneNumber);
          if (client.info) {
            return res.json({ 
              status: 'already_connected', 
              message: 'Bot is already connected for this number' 
            });
          }
        }

        // Create new client
        const client = new Client({
          authStrategy: new LocalAuth({ clientId: phoneNumber }),
          puppeteer: {
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-gpu'
            ]
          }
        });

        let qrCodeData = null;

        client.on('qr', (qr) => {
          console.log('QR Received for:', phoneNumber);
          qrCodeData = qr;
          qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
          console.log('Client is ready for:', phoneNumber);
          clients.set(phoneNumber, client);
        });

        client.on('authenticated', () => {
          console.log('Authenticated for:', phoneNumber);
        });

        client.on('auth_failure', (msg) => {
          console.log('Authentication failed for:', phoneNumber, msg);
          clients.delete(phoneNumber);
        });

        client.on('disconnected', (reason) => {
          console.log('Client disconnected for:', phoneNumber, reason);
          clients.delete(phoneNumber);
        });

        client.on('message', async (message) => {
          // Handle .ping command
          if (message.body === '.ping') {
            const start = Date.now();
            await message.reply('Pong!');
            const latency = Date.now() - start;
            
            let speed;
            if (latency < 200) speed = '🚀 Extremely Fast';
            else if (latency < 500) speed = '⚡ Fast';
            else if (latency < 1000) speed = '👍 Normal';
            else speed = '🐢 Slow';
            
            await message.reply(`Bot speed: ${speed} | Latency: ${latency}ms`);
          }
          
          // Handle .help command
          if (message.body === '.help') {
            const helpText = `
*Available Commands:*
• .ping - Check bot response speed
• .help - Show this help message
            `;
            await message.reply(helpText);
          }
          
          // Auto-reply to greetings
          const greetings = ['hello', 'hi', 'hey'];
          const messageText = message.body.toLowerCase();
          if (greetings.some(greeting => messageText.includes(greeting))) {
            await message.reply('Hello! How can I help you?');
          }
        });

        // Initialize client
        await client.initialize();

        // Wait a bit for QR code generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (qrCodeData) {
          return res.json({ 
            status: 'qr_required', 
            qr: qrCodeData,
            message: 'Scan the QR code to connect WhatsApp' 
          });
        } else {
          return res.json({ 
            status: 'initializing', 
            message: 'Initializing WhatsApp client...' 
          });
        }

      } catch (error) {
        console.error('Error starting bot:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Failed to start bot: ' + error.message 
        });
      }
    } else {
      return res.status(400).json({ error: 'Invalid request' });
    }
  } else if (req.method === 'GET') {
    // Return status of all clients
    const status = {};
    clients.forEach((client, number) => {
      status[number] = client.info ? 'connected' : 'disconnected';
    });
    
    return res.json({ status: 'success', clients: status });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}