import config from '@/utils/config';
import axios from 'axios';

const sendMessage = async (message: string, message_id?: number) => {
    try {
        const url = `https://api.telegram.org/bot${config.TOKEN}/sendMessage`;

        const payload: {
            chat_id: string;
            text: string;
            parse_mode: string;
            reply_to_message_id?: number;
        } = {
            chat_id: config.CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };

        if (message_id) {
            payload.reply_to_message_id = message_id;
        }

        const response = await axios.post(url, payload);
        const result = response.data?.result;
        return {
            success: true,
            data: response.data,
            message_id: result?.message_id ?? null
        };
    } catch {
        return {
            success: false
        };
    }
};
export default sendMessage;
