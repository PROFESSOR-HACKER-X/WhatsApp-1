module.exports = {
    handle: async (message, client) => {
        // Add general message handling logic here
        // For example, you could log messages, auto-reply, etc.
        
        // Example: Auto-reply to specific keywords
        const keywords = ['hello', 'hi', 'hey'];
        const messageText = message.body.toLowerCase();
        
        if (keywords.some(keyword => messageText.includes(keyword))) {
            await message.reply('Hello! How can I help you?');
        }
    }
};