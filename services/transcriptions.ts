// services/transcription.ts
export async function transcribeAudio(audioUri: string): Promise<string> {
  const formData = new FormData();

  formData.append('file', {
    uri: audioUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);
  formData.append('model', 'whisper-large-v3-turbo'); // free & fast
  formData.append('response_format', 'json');

  const apiKey = process.env.GROQ_API_KEY ?? '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';

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Transcription failed');
  return data.text;
}





