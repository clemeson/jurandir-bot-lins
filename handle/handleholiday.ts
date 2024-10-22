import { Message } from 'discord.js';
import axios from 'axios';

export async function handleFeriadoMessage(message: Message) {
    const year = message.content.trim();

    if (!year || isNaN(Number(year))) {
        await message.reply('⚠️ Por favor, forneça um ano válido para consultar.');
        return;
    }

    try {
      
        const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
        const holidays = response.data;

        let reply = `🎉 **Feriados Nacionais de ${year}:**\n`;
        holidays.forEach((holiday: any) => {
            reply += `- **${holiday.date}**: ${holiday.name}\n`;
        });

        await message.reply(reply);
    } catch (error: any) {
        console.error('Erro ao consultar feriados:', error.message);
        await message.reply('⚠️ Não consegui consultar os feriados. Verifique o ano e tente novamente.');
    }
}
