// Lore generation routes
import { Router, Request, Response, NextFunction } from 'express';
import { generateLoreWithQwen, calculateCost } from '../services/qwen.service';

const router = Router();

// Token usage tracking
let totalTokensUsed = 0;
let requestCount = 0;

/**
 * POST /api/lore/generate
 * Generate lore analysis for a movie saga
 */
router.post('/generate', async (req: Request, res: Response) => {
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

        // Track token usage
        if (analysis.token_usage) {
            totalTokensUsed += analysis.token_usage.total_tokens;
            requestCount++;
        }

        res.json(analysis);

    } catch (error) {
        console.error('❌ Error generating lore:', error);

        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * GET /api/stats
 * Get token usage statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
    res.json({
        total_requests: requestCount,
        total_tokens_used: totalTokensUsed,
        average_tokens_per_request: requestCount > 0 ? Math.round(totalTokensUsed / requestCount) : 0,
        estimated_total_cost: calculateCost(totalTokensUsed, 'qwen-plus')
    });
});

export default router;
