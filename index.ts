import { Client, GatewayIntentBits, Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleGPTMessage } from './handlegpt';
import { handleDomainMessage } from './handlebrasilapi';
import { handleFeriadoMessage } from './handleholiday';

dotenv.config();



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});


const GPT_CHANNEL_ID = process.env.GPT_CHANNEL_ID;
const DOMAIN_CHANNEL_ID = process.env.DOMAIN_CHANNEL_ID;
const FERIADO_CHANNEL_ID = process.env.FERIADO_CHANNEL_ID;

if (!DOMAIN_CHANNEL_ID || !GPT_CHANNEL_ID || !FERIADO_CHANNEL_ID) {
    console.error('⚠️ IDs dos canais não foram configurados corretamente no .env.');
    process.exit(1);
}
client.once('ready', () => {
    console.log(`Bot ${client.user?.tag} está online e pronto!`);
});



client.on('guildMemberAdd', async (member) => {
    try {
        // Canal onde a mensagem de boas-vindas será enviada
        const welcomeChannel = member.guild.systemChannel;

        if (!welcomeChannel) return; // Se não houver um canal padrão, retorna

        const message = `🌊 **Bem-vindo(a), ${member.user.tag}!**\n` +
        `Você acaba de entrar no **${member.guild.name}**, um verdadeiro ecossistema de aprendizado! 🦀🌱\n\n` +
     
        `🔸 Explore nossas "Canais":\n` +
        `- 🛖 **CoWorking** – Para trabalhos colaborativos.\n` +
        `- 🛖 **Brainstorming** – Para bate-papos descontraídos e idéias.\n` +
        `- 🛖 **Coding** – Para projetos, desenvolvimento e pair-programing.\n\n` +
        `🔸 Explore o Jurandir Bot Lins":\n` +
        `📌 Para consultar dominios.br disponívels digite o nomedominio no canal consulta-dominios!\n` +
        `📌 Para consultar os feriados nacionais digite ano que vc deseja(ex: 2024) \n` +
        `🚀 Estamos felizes por você se juntar a nós. Mergulhe fundo e aproveite essa maré de aprendizado!`;

        await welcomeChannel.send(message);
    } catch (error) {
        console.error('Erro ao enviar mensagem de boas-vindas:', error);
    }
});

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    try {
        switch (message.channel.id) {
            case DOMAIN_CHANNEL_ID:
                await handleDomainMessage(message);
                break;
            case GPT_CHANNEL_ID:
                await handleGPTMessage(message);
                break;
            case FERIADO_CHANNEL_ID:
                await handleFeriadoMessage(message);
                break;
            default:
                await message.reply('⚠️ Este canal não está configurado para nenhuma funcionalidade específica.');
        }
    } catch (error) {
        console.error('Erro ao processar a mensagem:', error);
        await message.reply('⚠️ Ocorreu um erro ao processar sua solicitação.');
    }
});
// Login no bot
client.login(process.env.TOKEN_BOT).catch((error) => {
    console.error('Erro ao fazer login:', error);
});
