import { Message } from 'discord.js';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const conversationHistory: ChatCompletionRequestMessage[] = [
    { role: 'system', content: 'Você é um assistente para estudantes de TI.' },
];

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function handleGPTMessage(message: Message) {
    const content = message.content.trim();

    if (!content) {
        await message.reply('⚠️ Por favor, forneça uma mensagem para consultar o GPT.');
        return;
    }

    conversationHistory.push({ role: 'user', content });

    try {
        await delay(2000); // Intervalo de 2 segundos
      
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationHistory,
        });

        const reply = response.data.choices[0].message?.content || 'Não consegui gerar uma resposta.';
        conversationHistory.push({ role: 'assistant', content: reply });

        await message.reply(reply);
    } catch (error: any) {
        console.error('Erro ao se comunicar com o ChatGPT:', error.message);
        await message.reply('⚠️ Ocorreu um erro ao processar sua consulta.');
    }
}
