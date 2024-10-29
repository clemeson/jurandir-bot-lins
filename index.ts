import { Client, GatewayIntentBits, Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleDomainMessage } from './handle/brasilapi';
import { handleFeriadoMessage } from './handle/holiday';
import { handleLinkedinMessage } from './handle/linkedin'

dotenv.config();



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});


const VAGAS_CHANNEL_ID = process.env.VAGAS_CHANNEL_ID;
const DOMAIN_CHANNEL_ID = process.env.DOMAIN_CHANNEL_ID;
const FERIADO_CHANNEL_ID = process.env.FERIADO_CHANNEL_ID;

if (!DOMAIN_CHANNEL_ID  || !FERIADO_CHANNEL_ID || !VAGAS_CHANNEL_ID) {
    console.error('⚠️ IDs dos canais não foram configurados corretamente no .env.');
    process.exit(1);
}
client.once('ready', () => {
    console.log(`Bot ${client.user?.tag} está online e pronto!`);
});




client.on('guildMemberAdd', async (member) => {
    try {

     
        // Procura pelo canal "geral" para enviar a mensagem de boas-vindas
        const generalChannel = member.guild.channels.cache.find(
            (channel) => channel.name === 'geral' && channel.isTextBased()
        );

        if (!generalChannel) {
            console.error('Canal geral não encontrado.');
            return;
        }

        // Mensagem de boas-vindas personalizada
        const message = `🌊 **Bem-vindo(a), ${member.user.tag}!**\n` +
            `Você acaba de entrar no **${member.guild.name}**, um verdadeiro ecossistema de aprendizado! 🦀🌱\n\n` +
            `🔸 **Explore nossos Canais:**\n` +
            `- 🛖 **CoWorking** – Para trabalhos colaborativos.\n` +
            `- 🛖 **Brainstorming** – Para bate-papos descontraídos e ideias.\n` +
            `- 🛖 **Coding** – Para projetos, desenvolvimento e pair-programming.\n\n` +
            `🔸 **Explore o Jurandir Bot Lins**:\n` +
            `📌 **Consulta de Domínios.br:** Digite o nome do domínio no canal **consulta-dominios**.\n` +
            `📌 **Feriados Nacionais:** Digite o ano desejado no canal **feriados** (ex: 2024).\n\n` +
            `🚀 Estamos felizes por você se juntar a nós! Mergulhe fundo e aproveite essa maré de aprendizado!`;

        // Envia a mensagem no canal "geral"
        await (generalChannel as any).send(message);
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
            case FERIADO_CHANNEL_ID:
                await handleFeriadoMessage(message);
                break;
            case VAGAS_CHANNEL_ID:
                case VAGAS_CHANNEL_ID:
                    const searchTerm = message.content.replace('buscar vagas', '').trim();
                    if (searchTerm) {
                        await handleLinkedinMessage(message, searchTerm);
                    } else {
                        await message.reply('⚠️ Por favor, forneça um termo de pesquisa. Exemplo: "buscar vagas backend remoto".');
                    }
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
