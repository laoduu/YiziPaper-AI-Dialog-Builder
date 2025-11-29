// 模型配置文件
window.appConfig = {
    modelList: {
        volcengine: [
            { name: 'doubao-seed-1-6-lite-251015', value: 'doubao-seed-1-6-lite-251015' },
            { name: 'doubao-seed-1-6-thinking-250715', value: 'doubao-seed-1-6-thinking-250715' },
            { name: 'doubao-seed-1-6-flash-250828', value: 'doubao-seed-1-6-flash-250828' },
            { name: 'doubao-seed-1-6-251015', value: 'doubao-seed-1-6-251015' },
            { name: 'doubao-1-5-thinking-pro-250415', value: 'doubao-1-5-thinking-pro-250415' },
            { name: 'doubao-1-5-pro-32k-250115', value: 'doubao-1-5-pro-32k-250115' },
            { name: 'kimi-k2-250905', value: 'kimi-k2-250905' },
            { name: 'kimi-k2-thinking-251104', value: 'kimi-k2-thinking-251104' },
            { name: 'deepseek-r1-250528', value: 'deepseek-r1-250528' },
            { name: 'deepseek-v3-250715', value: 'deepseek-v3-250715' }
        ],
        aliyun: [
            { name: 'qwen3-max', value: 'qwen3-max' },
            { name: 'qwen3-max-preview', value: 'qwen3-max-preview' },
            { name: 'qwen-plus-latest', value: 'qwen-plus-latest' },
            { name: 'qwen-flash', value: 'qwen-flash' },
            { name: 'qwen-turbo-latest', value: 'qwen-turbo-latest' },
            { name: 'qwq-plus-latest', value: 'qwq-plus-latest' },
            { name: 'qwen-turbo', value: 'qwen-turbo' },
            { name: 'qwen-max', value: 'qwen-max' },
            { name: 'qwen-max-longcontext', value: 'qwen-max-longcontext' }
        ],
        openai: [
            { name: 'gpt-4o', value: 'gpt-4o' },
            { name: 'gpt-4o-mini', value: 'gpt-4o-mini' },
            { name: 'gpt-4-turbo', value: 'gpt-4-turbo' },
            { name: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' }
        ],
        anthropic: [
            { name: 'claude-3-5-sonnet-20240620', value: 'claude-3-5-sonnet-20240620' },
            { name: 'claude-3-opus-20240229', value: 'claude-3-opus-20240229' },
            { name: 'claude-3-sonnet-20240229', value: 'claude-3-sonnet-20240229' },
            { name: 'claude-3-haiku-20240307', value: 'claude-3-haiku-20240307' }
        ],
        google: [
            { name: 'gemini-1.5-pro', value: 'gemini-1.5-pro' },
            { name: 'gemini-1.5-flash', value: 'gemini-1.5-flash' }
        ]
    },
    requestConfigs: {
        volcengine: {
            endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {{apiKey}}',
                'Accept': 'application/json'
            },
            body: {
                'model': '{{model}}',
                'messages': '{{messages}}',
                'temperature': 0.7,
                'max_tokens': 4096,
                'stream': true,
                'enable_thinking': true
            }
        },
        aliyun: {
            endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {{apiKey}}'
            },
            body: {
                'model': '{{model}}',
                'messages': '{{messages}}',
                'temperature': 0.7,
                'max_tokens': 4096,
                'stream': true,
                'enable_thinking': true
            }
        },
        openai: {
            endpoint: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {{apiKey}}'
            },
            body: {
                'model': '{{model}}',
                'messages': '{{messages}}',
                'temperature': 0.7,
                'max_tokens': 4096,
                'stream': true
            }
        },
        anthropic: {
            endpoint: 'https://api.anthropic.com/v1/messages',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': '{{apiKey}}',
                'anthropic-version': '2023-06-01'
            },
            body: {
                'model': '{{model}}',
                'messages': '{{messages}}',
                'temperature': 0.7,
                'max_tokens': 4096,
                'stream': true
            }
        },
        google: {
            endpoint: 'https://generativelanguage.googleapis.com/v1/models/{{model}}:generateContent',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': '{{apiKey}}'
            },
            body: {
                'contents': '{{messages}}',
                'generationConfig': {
                    'temperature': 0.7,
                    'maxOutputTokens': 4096
                },
                'stream': true
            }
        }
    }
};