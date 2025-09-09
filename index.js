import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedNumbers, setConnectedNumbers] = useState([]);

  const startBot = async () => {
    if (!phoneNumber) {
      setStatus('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setStatus('Starting bot...');
    
    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          phoneNumber: phoneNumber
        }),
      });

      const data = await response.json();
      
      if (data.status === 'qr_required') {
        setQrCode(data.qr);
        setStatus('Scan the QR code with WhatsApp');
      } else if (data.status === 'already_connected') {
        setStatus('Bot is already connected for this number');
      } else {
        setStatus(data.message || 'Bot started successfully');
      }
    } catch (error) {
      setStatus('Error starting bot: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      
      if (data.status === 'success') {
        const connectedNumbersList = Object.entries(data.clients).map(([number, info]) => ({
          number,
          status: info.status
        }));
        setConnectedNumbers(connectedNumbersList);
        setStatus('Status checked successfully');
      }
    } catch (error) {
      setStatus('Error checking status: ' + error.message);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>WhatsApp Bot Manager</title>
        <meta name="description" content="Manage your WhatsApp bots" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>WhatsApp Bot Manager</h1>
        
        <div className="card">
          <h2>Connect WhatsApp Number</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter phone number (with country code)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button 
              onClick={startBot} 
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Bot'}
            </button>
          </div>
        </div>

        {qrCode && (
          <div className="card">
            <h2>QR Code for Pairing</h2>
            <p>Open WhatsApp → Settings → Linked Devices → Link a Device</p>
            <div className="qr-code">
              <pre>{qrCode}</pre>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Bot Status</h2>
          <button onClick={checkStatus}>Check Status</button>
          {connectedNumbers.length > 0 && (
            <div className="status-list">
              <h3>Connected Numbers:</h3>
              <ul>
                {connectedNumbers.map((item, index) => (
                  <li key={index}>
                    {item.number}: <span className={item.status}>{item.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {status && (
          <div className="status-message">
            {status}
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          width: 100%;
        }

        h1 {
          color: #0070f3;
          margin-bottom: 2rem;
        }

        .card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          width: 100%;
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .input-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .qr-code {
          background: white;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
          text-align: center;
          overflow-x: auto;
        }

        .status-list {
          margin-top: 1rem;
        }

        .status-list ul {
          list-style: none;
          padding: 0;
        }

        .status-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .connected {
          color: green;
          font-weight: bold;
        }

        .disconnected {
          color: red;
          font-weight: bold;
        }

        .status-message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
          background-color: #f0f0f0;
          width: 100%;
          text-align: center;
        }
      `}</style>
    </div>
  );
}