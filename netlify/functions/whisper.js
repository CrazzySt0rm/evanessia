exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  try {
    const { audio, mimeType } = JSON.parse(event.body);
    const audioBuffer = Buffer.from(audio, 'base64');
    const blob        = new Blob([audioBuffer], { type: mimeType });
    const ext         = mimeType.includes('webm') ? 'webm' : 'ogg';

    const form = new FormData();
    form.append('file', blob, `audio.${ext}`);
    form.append('model', 'whisper-large-v3-turbo');
    form.append('language', 'ru');
    form.append('response_format', 'json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: form,
    });

    const data = await response.json();
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
  } catch {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'Whisper error' }) };
  }
};
