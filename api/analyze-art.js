const axios = require('axios');

// Vercelサーバーレス関数として動作するAPIエンドポイント
module.exports = async function handler(req, res) {
    try {
        // CORS設定
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
        res.setHeader('Content-Type', 'application/json');

        // OPTIONSリクエストの処理
        if (req.method === 'OPTIONS') {
            res.status(200).json({ message: 'CORS preflight successful' });
            return;
        }

        // POSTメソッドのみ許可
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // デバッグ情報をログに出力
        console.log('=== API呼び出し開始 ===');
        console.log('環境:', process.env.NODE_ENV || 'development');
        console.log('Vercel環境変数:', {
            VERCEL: process.env.VERCEL,
            VERCEL_ENV: process.env.VERCEL_ENV,
            NODE_VERSION: process.version
        });
        console.log('APIキー設定状況:', process.env.ANTHROPIC_API_KEY ? `設定済み(長さ: ${process.env.ANTHROPIC_API_KEY.length})` : '未設定');
        console.log('リクエストメソッド:', req.method);
        console.log('リクエストURL:', req.url);

        const { imageData } = req.body;
        console.log('画像データ受信:', imageData ? 'あり' : 'なし');
        
        // APIキーの検証を強化
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            console.log('エラー: ANTHROPIC_API_KEYが設定されていません');
            return res.status(500).json({ 
                error: 'AI解析サービスの設定が完了していません。管理者にお問い合わせください。',
                debug: 'ANTHROPIC_API_KEY not set'
            });
        }
        
        if (!apiKey.startsWith('sk-ant-')) {
            console.log('エラー: 無効なClaude APIキー形式');
            return res.status(500).json({ 
                error: 'AI解析サービスの設定に問題があります。管理者にお問い合わせください。',
                debug: 'Invalid API key format'
            });
        }

        if (!imageData) {
            console.log('エラー: 画像データがありません');
            return res.status(400).json({ error: '画像データが提供されていません。' });
        }

        // Claude APIへのリクエスト
        try {
            console.log('Claude APIへリクエスト送信中...');
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: 'この絵に、子どもがよろこぶようなタイトルを付けてから、心からほめてください。\n\n形式：\n1行目：「【タイトル】」（例：【にじのお城】、【おはなのひまわり】など）\n2行目以降：ほめ言葉\n\n条件：\n- 小学校３年生までの漢字だけ使用\n- タイトルは子どもがよろこぶような、かわいい名前\n- ほめ言葉は「すごいね！」から始めて、色やかたち、線のかきかたなどいいところをほめる\n- 最後に「これからもがんばってね！」で終わる\n- 全体で150文字くらいのあたたかいメッセージ'
                    }, {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/png',
                            data: imageData.replace(/^data:image\/png;base64,/, '')
                        }
                    }]
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                }
            });
            console.log('Claude APIレスポンス受信成功');

            const analysis = response.data.content[0].text;
            res.json({ analysis });

        } catch (error) {
        console.error('=== エラー発生 ===');
        console.error('エラーメッセージ:', error.message);
        console.error('HTTPステータス:', error.response?.status);
        console.error('レスポンスデータ:', error.response?.data);
        console.error('リクエストURL:', error.config?.url);
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(503).json({ 
                error: 'ネットワーク接続エラーです。しばらくしてから再度お試しください。',
                debug: `Network error: ${error.code}`
            });
        } else if (error.response?.status === 401) {
            res.status(401).json({ 
                error: 'Claude APIキーが無効です。管理者にお問い合わせください。',
                debug: `Invalid API key - Key length: ${apiKey ? apiKey.length : 0}, Starts with: ${apiKey ? apiKey.substring(0, 12) + '...' : 'null'}`
            });
        } else if (error.response?.status === 429) {
            res.status(429).json({ 
                error: 'API利用制限に達しました。しばらく待ってから再試行してください。',
                debug: 'Rate limit exceeded'
            });
        } else {
            res.status(500).json({ 
                error: 'アート解析中にエラーが発生しました。しばらくしてから再度お試しください。',
                debug: error.message || 'Unknown error'
            });
        }
        }
    } catch (globalError) {
        // サーバーレス関数全体のエラーハンドリング
        console.error('=== サーバーレス関数エラー ===');
        console.error('エラー詳細:', globalError);
        
        try {
            res.status(500).json({
                error: 'サーバー内部エラーが発生しました。しばらくしてから再度お試しください。',
                debug: globalError.message || 'Server internal error'
            });
        } catch (responseError) {
            console.error('レスポンス送信エラー:', responseError);
        }
    }
}
