import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const WHISPER_MODEL = 'whisper-1';
export const GPT_MODEL = 'gpt-4o-mini';
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];