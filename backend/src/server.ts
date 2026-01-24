// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Types matching frontend expectations
interface Movie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path?: string;
}

interface KeyFact {
    id: number;
    text: string;
    importance: 'critical' | 'important';
}

interface MovieSummary {
    narrative: string;
    tone: string;
    key_facts: KeyFact[];
    emotional_beats: string[];
}

interface RequiredMovie {
    tmdb_id: number;
    title: string;
    poster_path: string;
    priority: 'essential' | 'recommended';
    watch_time: string;
    summary: MovieSummary;
    audio: {
        status: 'pending' | 'ready';
        duration: string;
        voice_name: string;
    };
}

interface LoreAnalysis {
    status: 'ready' | 'error';
    generated_at: string;
    required_movies: RequiredMovie[];
    spoiler_free_guarantee: {
        enabled: boolean;
        message: string;
    };
    preparation_time: string;
    token_usage?: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
        estimated_cost?: string;
    };
}

// Generate Lore Analysis endpoint
app.post('/api/lore/generate', async (req: Request, res: Response) => {
    try {
        const { currentMovie, previousMovies } = req.body;

        if (!currentMovie || !previousMovies) {
            return res.status(400).json({
                error: 'Missing required fields: currentMovie and previousMovies'
            });
        }

        console.log(`🎬 Generating lore for: ${currentMovie.title}`);
        console.log(`📚 Analyzing ${previousMovies.length} previous movies`);

        const analysis = await generateLoreWithQwen(currentMovie, previousMovies);

        res.json(analysis);

    } catch (error) {
        console.error('❌ Error generating lore:', error);

        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Qwen API integration
async function generateLoreWithQwen(
    currentMovie: Movie,
    previousMovies: Movie[]
): Promise<LoreAnalysis> {
    const QWEN_API_KEY = process.env.QWEN_API_KEY;
    const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

    if (!QWEN_API_KEY) {
        throw new Error('QWEN_API_KEY not configured');
    }

    const prompt = buildDetailedPrompt(currentMovie, previousMovies);

    console.log('🤖 Calling Qwen API...');

    const response = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${QWEN_API_KEY}`,
            'Content-Type': 'application/json',
            'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify({
            model: 'qwen-plus',
            input: {
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto cinéfilo que crea resúmenes detallados y narrativos de películas. Siempre respondes ÚNICAMENTE con JSON válido, sin texto adicional.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            },
            parameters: {
                temperature: 0.8,
                max_tokens: 4000,
                result_format: 'message'
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qwen API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.output?.choices?.[0]?.message?.content;

    if (!aiResponse) {
        console.error('Qwen response:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response from Qwen API');
    }

    // Extract token usage from Qwen response
    const tokenUsage = data.usage ? {
        input_tokens: data.usage.input_tokens || 0,
        output_tokens: data.usage.output_tokens || 0,
        total_tokens: data.usage.total_tokens || 0,
    } : undefined;

    if (tokenUsage) {
        console.log('💰 Token Usage:', {
            input: tokenUsage.input_tokens,
            output: tokenUsage.output_tokens,
            total: tokenUsage.total_tokens,
            estimated_cost: calculateCost(tokenUsage.total_tokens, 'qwen-plus')
        });
    }

    console.log('📝 Raw AI Response (first 500 chars):', aiResponse.substring(0, 500));
    console.log('📝 Raw AI Response (full):', aiResponse);

    const analysis = parseQwenResponse(aiResponse, currentMovie);

    // Add token usage to analysis
    if (tokenUsage) {
        analysis.token_usage = {
            ...tokenUsage,
            estimated_cost: calculateCost(tokenUsage.total_tokens, 'qwen-plus')
        };
    }

    console.log('✅ Parsed JSON successfully');
    console.log('📊 Analysis structure:', {
        movies_count: analysis.required_movies.length,
        first_movie: analysis.required_movies[0]?.title,
        has_narrative: !!analysis.required_movies[0]?.summary?.narrative,
        narrative_preview: analysis.required_movies[0]?.summary?.narrative?.substring(0, 100),
        token_usage: tokenUsage
    });

    return analysis;
}

function buildDetailedPrompt(currentMovie: Movie, previousMovies: Movie[]): string {
    const moviesInfo = previousMovies.map((movie, index) => `
${index + 1}. "${movie.title}" (${new Date(movie.release_date).getFullYear()})
   - ID: ${movie.id}
   - Poster: ${movie.poster_path || 'N/A'}
   - Sinopsis: ${movie.overview || 'No disponible'}
`).join('\n');

    const movieTitle = currentMovie.title;
    const movieYear = new Date(currentMovie.release_date).getFullYear();

    return `Necesito que generes un resumen COMPLETO y DETALLADO de las películas previas de una saga.

📋 CONTEXTO:
El usuario va a ver "${movieTitle}" (${movieYear}) y necesita entender qué pasó antes.

🎬 PELÍCULAS A RESUMIR:
${moviesInfo}

⚠️ REGLAS CRÍTICAS:
1. NUNCA menciones spoilers de "${movieTitle}"
2. Resume SOLO las películas previas listadas
3. Sé narrativo y enganchante, NO hagas bullet points aburridos
4. Usa español latinoamericano neutro
5. Cada película debe tener 5 key_facts MÍNIMO (3 critical + 2 important)
6. Incluye 4-6 emotional_beats con emojis relevantes

📊 RESPONDE SOLO CON ESTE JSON (sin texto adicional, sin markdown, sin \`\`\`):

{
  "status": "ready",
  "generated_at": "${new Date().toISOString()}",
  "required_movies": [
    {
      "tmdb_id": ${previousMovies[0]?.id || 0},
      "title": "${previousMovies[0]?.title || 'Título'}",
      "poster_path": "${previousMovies[0]?.poster_path || '/default.jpg'}",
      "priority": "essential",
      "watch_time": "120 min",
      "summary": {
        "narrative": "IMPORTANTE: Esto DEBE ser un párrafo narrativo BREVE de 4-6 oraciones (máximo 400 caracteres) que cuenta la historia completa de forma fluida. NO uses bullet points, NO hagas listas, escribe un párrafo continuo.",
        "tone": "épico y emotivo",
        "key_facts": [
          {"id": 1, "text": "Hecho crítico 1 que es absolutamente necesario recordar", "importance": "critical"},
          {"id": 2, "text": "Hecho crítico 2", "importance": "critical"},
          {"id": 3, "text": "Hecho crítico 3", "importance": "critical"},
          {"id": 4, "text": "Hecho importante 4", "importance": "important"},
          {"id": 5, "text": "Hecho importante 5", "importance": "important"}
        ],
        "emotional_beats": [
          "💔 Momento emocional clave 1",
          "⚔️ Momento emocional clave 2",
          "✨ Momento emocional clave 3",
          "🎬 Momento emocional clave 4"
        ]
      },
      "audio": {
        "status": "pending",
        "duration": "~2:30",
        "voice_name": "Narrador IA"
      }
    }
  ],
  "spoiler_free_guarantee": {
    "enabled": true,
    "message": "Este resumen NO contiene spoilers de ${movieTitle}. Solo cubre las películas anteriores."
  },
  "preparation_time": "2h 30min"
}

IMPORTANTE:
- **El campo "narrative" ES OBLIGATORIO** y debe ser breve (máximo 400 caracteres, ~5 oraciones).
- Ejemplo de narrative correcto: "La historia comienza cuando un grupo de sobrevivientes descubre que una misteriosa catástrofe ha devastado el planeta. A medida que buscan refugio, descubren que no están solos y que las reglas del mundo han cambiado completamente. El protagonista, inicialmente escéptico, debe aprender a confiar en su grupo mientras enfrentan amenazas tanto naturales como humanas. Los lazos entre los personajes se fortalecen a través de sacrificios y decisiones difíciles. Finalmente, descubren la verdadera naturaleza de la catástrofe, lo que cambia todo lo que creían saber. La película termina con una revelación que prepara el escenario para la siguiente entrega."
- Genera UN objeto para CADA película en previousMovies
- Usa los IDs, títulos y posters EXACTOS de las películas proporcionadas
- Incluye EXACTAMENTE 5 key_facts (mínimo 3 critical)
- Incluye 4-6 emotional_beats con emojis relevantes
- Calcula preparation_time sumando todos los watch_time

Responde SOLO con el JSON, sin \`\`\`json ni explicaciones.`;
}

function parseQwenResponse(aiResponse: string, currentMovie: Movie): LoreAnalysis {
    try {
        let jsonStr = aiResponse.trim();

        // Remove markdown code blocks
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Extract JSON
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('❌ No JSON found');
            throw new Error('No JSON found in AI response');
        }

        const parsed: LoreAnalysis = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed JSON:', {
            status: parsed.status,
            movies_count: parsed.required_movies?.length,
            has_spoiler_guarantee: !!parsed.spoiler_free_guarantee
        });

        // Validate structure
        if (!parsed.required_movies || !Array.isArray(parsed.required_movies)) {
            throw new Error('Invalid: missing required_movies array');
        }

        if (parsed.required_movies.length === 0) {
            throw new Error('Invalid: required_movies is empty');
        }

        // Validate and fix each movie structure
        for (const movie of parsed.required_movies) {
            if (!movie.summary) {
                throw new Error(`Invalid: movie "${movie.title}" missing summary object`);
            }

            // Ensure narrative exists and is a string
            if (!movie.summary.narrative || typeof movie.summary.narrative !== 'string') {
                console.warn(`⚠️ Movie "${movie.title}" missing narrative, using overview`);
                movie.summary.narrative = `Esta película es parte de la saga y contiene eventos importantes para la continuidad de la historia.`;
            }

            // Ensure key_facts exists
            if (!movie.summary.key_facts || !Array.isArray(movie.summary.key_facts)) {
                console.warn(`⚠️ Movie "${movie.title}" missing key_facts`);
                movie.summary.key_facts = [];
            }

            // Ensure emotional_beats exists
            if (!movie.summary.emotional_beats || !Array.isArray(movie.summary.emotional_beats)) {
                console.warn(`⚠️ Movie "${movie.title}" missing emotional_beats`);
                movie.summary.emotional_beats = [];
            }

            // Ensure tone exists
            if (!movie.summary.tone) {
                movie.summary.tone = 'épico y narrativo';
            }
        }

        return parsed;

    } catch (error) {
        console.error('❌ Parse error:', error);
        console.error('Response was:', aiResponse);
        throw new Error('Failed to parse AI response: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        qwen_configured: !!process.env.QWEN_API_KEY
    });
});

// Token usage stats endpoint (optional - for tracking)
let totalTokensUsed = 0;
let requestCount = 0;

app.get('/api/stats', (_req: Request, res: Response) => {
    res.json({
        total_requests: requestCount,
        total_tokens_used: totalTokensUsed,
        average_tokens_per_request: requestCount > 0 ? Math.round(totalTokensUsed / requestCount) : 0,
        estimated_total_cost: calculateCost(totalTokensUsed, 'qwen-plus')
    });
});

// Helper function to calculate approximate cost
function calculateCost(tokens: number, model: string): string {
    // Qwen pricing (approximate - check official pricing)
    const pricing: Record<string, { input: number, output: number }> = {
        'qwen-turbo': { input: 0.0003, output: 0.0006 }, // per 1K tokens
        'qwen-plus': { input: 0.0004, output: 0.0012 },
        'qwen-max': { input: 0.004, output: 0.012 },
    };

    const price = pricing[model] || pricing['qwen-plus'];
    // Simplified: assume 50/50 split between input/output
    const avgPrice = (price.input + price.output) / 2;
    const cost = (tokens / 1000) * avgPrice;

    return `${cost.toFixed(4)} USD`;
}

// Middleware to track tokens (add after the main lore generation)
app.use('/api/lore/generate', (req: Request, res: Response, next) => {
    const originalJson = res.json;
    res.json = function (data: any) {
        if (data.token_usage) {
            totalTokensUsed += data.token_usage.total_tokens;
            requestCount++;
        }
        return originalJson.call(this, data);
    };
    next();
});
// CORRECTED Audio Generation - Using MultiModal Conversation API

// Generate audio from narrative - WORKING VERSION
app.post('/api/audio/generate', async (req: Request, res: Response) => {
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

// Alternative: Streaming audio generation (for longer text)
app.post('/api/audio/generate-stream', async (req: Request, res: Response) => {
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

// Browser-based fallback (no API required)
app.post('/api/audio/generate-fallback', async (req: Request, res: Response) => {
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

// Available voices endpoint (for reference)
app.get('/api/audio/voices', (_req: Request, res: Response) => {
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
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔑 Qwen API Key: ${process.env.QWEN_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
});