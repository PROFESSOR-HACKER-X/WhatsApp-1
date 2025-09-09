const pingUtility = require('../utils/pingUtility');

const commands = {
    'ping': async (message, client) => {
        const start = Date.now();
        await message.reply('Pong!');
        const latency = Date.now() - start;
        
        const speed = pingUtility.calculateSpeed(latency);
        await message.reply(`Bot speed: ${speed} | Latency: ${latency}ms`);
    },
    'help': async (message, client) => {
        const helpText = `
        *Available Commands:*
        • .ping - Check bot response speed
        • .help - Show this help message
        • Add more commands as needed
        `;
        await message.reply(helpText);
    }
};

module.exports = {
    handle: async (message, client) => {
        const command = message.body.slice(1).toLowerCase().split(' ')[0];
        
        if (commands[command]) {
            try {
                await commands[command](message, client);
            } catch (error) {
                console.error(`Error executing command ${command}:`, error);
                await message.reply('An error occurred while processing your command.');
            }
        }
    }
};