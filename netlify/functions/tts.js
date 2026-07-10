exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  try {
    const { text, voiceId } = JSON.parse(event.body);

    const reqBody = { text };
    if (voiceId) reqBody.reference_id = voiceId;

    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': 's2.1-pro-free',
      },
      body: JSON.stringify(reqBody),
    });

    if (!response.ok) {
      return { statusCode: response.status, headers: cors, body: JSON.stringify({ error: 'Fish TTS error' }) };
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'audio/mpeg' },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'TTS proxy error' }) };
  }
};
