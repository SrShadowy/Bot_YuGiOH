import Discord from 'discord.js';
import messages from './module/messages';
const client = new Discord.Client();
import Messages from './module/messages'

client.on('ready', () => {
	console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('message', async message => Messages(client, message));






























client.login('token');
