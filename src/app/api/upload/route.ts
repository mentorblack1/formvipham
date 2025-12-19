import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONFIG_PATH = join(process.cwd(), 'config.txt');

const getConfig = async () => {
    try {
        const data = await readFile(CONFIG_PATH, 'utf-8');
        const lines = data.split('\n');
        const config: Record<string, string> = {};

        for (const line of lines) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                config[key.trim()] = valueParts.join('=').trim();
            }
        }

        return config;
    } catch {
        return {};
    }
};

const POST = async (req: NextRequest) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log(`[${requestId}] Incoming upload request:`, {
        timestamp: new Date().toISOString(),
        ip: clientIp,
        userAgent
    });

    try {
        const formData = await req.formData();
        const file = formData.get('photo') as File;
        const message_id = formData.get('message_id') as string | null;

        console.log(`[${requestId}] Upload request:`, {
            fileName: file?.name || 'N/A',
            fileSize: file?.size || 0,
            fileType: file?.type || 'N/A',
            message_id
        });

        if (!file) {
            console.error(`[${requestId}] Missing file`);
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const config = await getConfig();
        const { TOKEN, CHAT_ID } = config;

        console.log(`[${requestId}] Config loaded:`, {
            hasToken: !!TOKEN,
            hasChatId: !!CHAT_ID
        });

        if (!TOKEN || !CHAT_ID) {
            console.error(`[${requestId}] Missing config`);
            return NextResponse.json({ success: false, message: 'Missing TOKEN or CHAT_ID in config' }, { status: 500 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const telegramFormData = new FormData();
        telegramFormData.append('chat_id', CHAT_ID);
        telegramFormData.append('photo', new Blob([buffer], { type: file.type }), file.name);

        const url = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;

        if (message_id) {
            telegramFormData.append('reply_to_message_id', message_id);
        }

        console.log(`[${requestId}] Sending photo to Telegram`);

        const response = await axios.post(url, telegramFormData, {
            params: {
                parse_mode: 'HTML'
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000
        });

        const result = response.data?.result;

        const duration = Date.now() - startTime;
        console.log(`[${requestId}] Photo uploaded:`, {
            success: true,
            statusCode: response.status,
            duration: `${duration}ms`
        });

        return NextResponse.json({
            success: true,
            message_id: result?.message_id ?? null
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        const isAxiosError = axios.isAxiosError(error);

        console.error(`[${requestId}] Upload failed:`, {
            error: isAxiosError
                ? {
                      message: error.message,
                      code: error.code,
                      status: error.response?.status,
                      statusText: error.response?.statusText
                  }
                : error instanceof Error
                  ? error.message
                  : 'Unknown error',
            duration: `${duration}ms`
        });

        return NextResponse.json(
            {
                success: false,
                error: isAxiosError ? error.message : 'Internal server error'
            },
            { status: isAxiosError && error.response?.status ? error.response.status : 500 }
        );
    }
};

export { POST };
