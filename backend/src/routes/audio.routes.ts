// Audio generation routes
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/audio/generate
 * Generate audio from narrative using Qwen TTS
 */
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { narrative, movieTitle } = req.body;

        if (!narrative || !movieTitle) {
            return res.status(400).json({
                error: 'Missing required fields: narrative and movieTitle'
            });
        }

        // Truncate narrative to meet API limit (600 chars)
        let processedNarrative = narrative;
        if (processedNarrative.length > 590) {
            console.warn(`⚠️ Narrative too long (${processedNarrative.length} chars), truncating...`);
            // Take first 590 chars to leave room for ellipsis
            const truncated = processedNarrative.substring(0, 590);
            // Try to cut at the last sentence end
            const lastPeriod = truncated.lastIndexOf('.');
            const lastExclamation = truncated.lastIndexOf('!');
            const lastQuestion = truncated.lastIndexOf('?');

            const cutIndex = Math.max(lastPeriod, lastExclamation, lastQuestion);

            if (cutIndex > 0) {
                processedNarrative = truncated.substring(0, cutIndex + 1);
            } else {
                // Fallback: cut at last space
                const lastSpace = truncated.lastIndexOf(' ');
                processedNarrative = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
            }
            console.log(`✂️ Truncated narrative to ${processedNarrative.length} chars`);
        } else {
            console.log(`✅ Narrative length explicitly checks out: ${processedNarrative.length} chars`);
        }

        console.log(`🎙️ Generating audio for: ${movieTitle}`);

        const QWEN_API_KEY = process.env.QWEN_API_KEY;

        if (!QWEN_API_KEY) {
            throw new Error('QWEN_API_KEY not configured');
        }

        // Correct endpoint: Use MultiModalConversation API
        const apiUrl = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen3-tts-flash', // Correct model name
                input: {
                    text: processedNarrative
                },
                parameters: {
                    voice: 'Chelsie', // Available voices: Cherry, Chelsie, Ethan, Serena, etc.
                    language_type: 'Latino', // Set language to Spanish
                    format: 'mp3',
                    sample_rate: 24000
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS Error:', errorText);
            throw new Error(`TTS API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('TTS Response:', JSON.stringify(data, null, 2));

        // Extract audio URL from response
        if (data.output?.audio_url) {
            res.json({
                success: true,
                audio_url: data.output.audio_url,
                duration: data.output?.audio_duration || 'unknown',
                format: 'mp3'
            });
        } else if (data.output?.audio) {
            // Base64 audio response
            res.json({
                success: true,
                audio_base64: data.output.audio,
                format: 'mp3',
                note: 'Audio returned as base64'
            });
        } else {
            throw new Error('No audio data in response');
        }

    } catch (error) {
        console.error('❌ Audio generation error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to generate audio',
            fallback_available: true
        });
    }
});

/**
 * POST /api/audio/generate-stream
 * Streaming audio generation for longer text
 */
router.post('/generate-stream', async (req: Request, res: Response) => {
    try {
        const { narrative, movieTitle } = req.body;

        if (!narrative || !movieTitle) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const QWEN_API_KEY = process.env.QWEN_API_KEY;

        if (!QWEN_API_KEY) {
            throw new Error('QWEN_API_KEY not configured');
        }

        const apiUrl = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable' // Enable streaming
            },
            body: JSON.stringify({
                model: 'qwen3-tts-flash',
                input: {
                    text: narrative
                },
                parameters: {
                    voice: 'Cherry',
                    language_type: 'Spanish',
                    format: 'mp3',
                    sample_rate: 24000,
                    incremental_output: true // Enable streaming output
                }
            })
        });

        if (!response.ok) {
            throw new Error(`TTS Error: ${response.status}`);
        }

        // Forward the streaming response to client
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                res.write(chunk);
            }
        }

        res.end();

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).json({ error: 'Streaming failed' });
    }
});

/**
 * POST /api/audio/generate-fallback
 * Browser-based fallback (no API required)
 */
router.post('/generate-fallback', async (req: Request, res: Response) => {
    try {
        const { narrative } = req.body;

        if (!narrative) {
            return res.status(400).json({ error: 'Missing narrative' });
        }

        // Return the narrative for browser-side synthesis
        res.json({
            success: true,
            script: narrative,
            method: 'browser_synthesis',
            instructions: {
                lang: 'es-MX', // Spanish (Mexico)
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8
            },
            note: 'Use Web Speech API for synthesis'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to prepare audio' });
    }
});

/**
 * GET /api/audio/voices
 * Available voices endpoint (for reference)
 */
router.get('/voices', (_req: Request, res: Response) => {
    res.json({
        available_voices: [
            { name: 'Cherry', language: 'English', gender: 'Female' },
            { name: 'Chelsie', language: 'English', gender: 'Female' },
            { name: 'Ethan', language: 'English', gender: 'Male' },
            { name: 'Serena', language: 'English', gender: 'Female' },
            { name: 'Dylan', language: 'English', gender: 'Male' },
            { name: 'Jada', language: 'English', gender: 'Female' },
            { name: 'Sunny', language: 'English', gender: 'Male' }
        ],
        note: 'Qwen3-TTS supports 49 character voices and 10 languages',
        supported_languages: [
            'English', 'Spanish', 'Chinese', 'Japanese', 'Korean',
            'French', 'German', 'Russian', 'Arabic', 'Portuguese'
        ]
    });
});

export default router;
