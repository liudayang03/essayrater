export async function invokeLLM(params: {
  messages: { role: string; content: string }[];
  temperature?: number;
  top_p?: number;
  response_format?: any;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未设置');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: params.messages,
      temperature: params.temperature ?? 0.2,
      top_p: params.top_p ?? 0.2,
      response_format: params.response_format,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 调用失败: ${error}`);
  }

  return response.json();
}