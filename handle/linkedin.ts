import { Client, GatewayIntentBits, Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { scrapeLinkedinVagas } from './scraping';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializa o cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// ID do canal de vagas (configure no .env)
const VAGAS_CHANNEL_ID = process.env.VAGAS_CHANNEL_ID!;

// Função para consultar vagas e enviar a resposta
export async function handleLinkedinMessage(message: Message, searchTerm: string) {
    try {
        const vagas = await scrapeLinkedinVagas(searchTerm, 1);

        // Limitar o número de vagas a 15
        const vagasLimitadas = vagas.slice(0, 40);

        if (vagasLimitadas.length === 0) {
            await message.reply('Nenhuma vaga encontrada.');
            return;
        }

        let mensagem = '📝 **Vagas Remotas Encontradas no Brasil:**\n';
        for (const vaga of vagasLimitadas) {
            mensagem += `[${vaga.title}](${vaga.link}) - ${vaga.company}, ${vaga.location}\n`;
        }

        // Dividir em partes se a mensagem exceder 2000 caracteres
        const partes = mensagem.match(/.{1,2000}/g) || [];

        for (const parte of partes) {
            await message.reply(parte);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre respostas
        }
    } catch (error) {
        console.error('Erro ao consultar vagas:', error);
        await message.reply('⚠️ Ocorreu um erro ao consultar as vagas. Tente novamente mais tarde.');
    }
}

// Evento: Bot pronto
client.once('ready', () => {
    console.log(`🤖 Bot ${client.user?.tag} está online e pronto para buscar vagas!`);
});

// Evento: Escutar mensagens e verificar o comando "buscar vagas"
client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    const VAGAS_CHANNEL_ID = process.env.VAGAS_CHANNEL_ID;

    if (message.channel.id === VAGAS_CHANNEL_ID) {
        const searchTerm = message.content.replace('buscar vagas', '').trim();

        if (!searchTerm) {
            await message.reply('⚠️ Por favor, forneça um termo de pesquisa. Exemplo: "buscar vagas backend remoto".');
            return;
        }

        try {
            await message.reply('🔎 Buscando vagas, aguarde...');
            const vagas = await scrapeLinkedinVagas(searchTerm, 2); // Limita a 2 páginas de scroll

            if (vagas.length === 0) {
                await message.reply('Nenhuma vaga encontrada.');
                return;
            }

            let mensagem = '📝 **Vagas Encontradas:**\n';
            vagas.slice(0, 15).forEach((vaga, index) => {
                mensagem += `${index + 1}. [${vaga.title}](${vaga.link}) - ${vaga.company}, ${vaga.location}\n`;
            });

            // Garante que a mensagem não ultrapasse o limite de 2000 caracteres
            const mensagens = mensagem.match(/.{1,1900}(\n|$)/g) || [];

            for (const msg of mensagens) {
                await message.reply(msg);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre mensagens
            }
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            await message.reply('⚠️ Ocorreu um erro ao buscar vagas. Tente novamente mais tarde.');
        }
    }
});

// Login do bot
client.login(process.env.TOKEN_BOT).catch((error) => {
    console.error('Erro ao fazer login:', error);
});
