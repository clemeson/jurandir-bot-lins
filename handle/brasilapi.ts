import { Message } from 'discord.js';
import axios from 'axios';

export async function handleDomainMessage(message: Message) {
    const domain = message.content.trim();

    if (!domain) {
        await message.reply('⚠️ Por favor, forneça um domínio para consultar.');
        return;
    }

    try {
        const response = await axios.get(`https://brasilapi.com.br/api/registrobr/v1/${domain}`);
        const data = response.data;

        const reply = `🔍 **Consulta de Domínio:** ${domain}
- **Disponível:** ${data.status === 'AVAILABLE' ? '✅ Sim' : '❌ Não'}
- **Publicado:** ${data.status === 'REGISTERED' ? '📅 Sim' : '📅 Não'}
- **Data de Expiração:** ${data.expires_at || 'Indisponível'}`;

        await message.reply(reply);
    } catch (error: any) {
        console.error('Erro ao consultar domínio:', error.message);
        await message.reply('⚠️ Não consegui consultar o domínio. Verifique o nome e tente novamente.');
    }
}
