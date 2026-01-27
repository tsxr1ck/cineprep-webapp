// Qwen AI Service - Lore generation and utilities
import { Movie, LoreAnalysis } from '../types';

const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

/**
 * Generate lore analysis using Qwen API
 */
export async function generateLoreWithQwen(
    currentMovie: Movie,
    previousMovies: Movie[]
): Promise<LoreAnalysis> {
    const QWEN_API_KEY = process.env.QWEN_API_KEY;

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

/**
 * Build the detailed prompt for Qwen
 */
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

/**
 * Parse and validate Qwen response
 */
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

/**
 * Calculate approximate cost for token usage
 */
export function calculateCost(tokens: number, model: string): string {
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
