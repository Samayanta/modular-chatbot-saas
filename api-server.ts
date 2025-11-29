/**
 * REST API Server for Frontend
 * Provides endpoints for authentication, agents, knowledge bases, analytics, and settings
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Database connection
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'chatbot_saas',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
interface AuthRequest extends express.Request {
    userId?: string;
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ============ AUTH ROUTES ============

app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
            [email, passwordHash, name]
        );

        const user = result.rows[0];

        // Create token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query(
            'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Create token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, role FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ AGENT ROUTES ============

app.get('/api/agents', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT id, name, platform, status, queue_length, kb_id, created_at, updated_at FROM agents WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/agents', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, platform, api_credentials } = req.body;

        if (!name || !platform) {
            return res.status(400).json({ error: 'Name and platform are required' });
        }

        const result = await pool.query(
            'INSERT INTO agents (user_id, name, platform, api_credentials) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.userId, name, platform, api_credentials || {}]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/agents/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, platform, api_credentials, kb_id } = req.body;

        const result = await pool.query(
            'UPDATE agents SET name = COALESCE($1, name), platform = COALESCE($2, platform), api_credentials = COALESCE($3, api_credentials), kb_id = COALESCE($4, kb_id) WHERE id = $5 AND user_id = $6 RETURNING *',
            [name, platform, api_credentials, kb_id, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/agents/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM agents WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/agents/:id/start', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE agents SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            ['active', id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Start agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/agents/:id/stop', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE agents SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            ['inactive', id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Stop agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ KNOWLEDGE BASE ROUTES ============

app.get('/api/knowledge-bases', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT kb.*, a.name as agent_name 
             FROM knowledge_bases kb 
             LEFT JOIN agents a ON kb.agent_id = a.id 
             WHERE a.user_id = $1 
             ORDER BY kb.created_at DESC`,
            [req.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get KBs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/knowledge-bases', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { agent_id, name, description, source_type, source_url } = req.body;

        if (!agent_id || !name) {
            return res.status(400).json({ error: 'Agent ID and name are required' });
        }

        // Verify agent belongs to user
        const agentCheck = await pool.query(
            'SELECT id FROM agents WHERE id = $1 AND user_id = $2',
            [agent_id, req.userId]
        );

        if (agentCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Agent not found or unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO knowledge_bases (agent_id, name, description, source_type, source_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [agent_id, name, description, source_type, source_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create KB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/knowledge-bases/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM knowledge_bases 
             WHERE id = $1 
             AND agent_id IN (SELECT id FROM agents WHERE user_id = $2) 
             RETURNING id`,
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'KB not found' });
        }

        res.json({ message: 'Knowledge base deleted successfully' });
    } catch (error) {
        console.error('Delete KB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/knowledge-bases/:id/chunks', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const result = await pool.query(
            `SELECT * FROM kb_chunks 
             WHERE kb_id = $1 
             ORDER BY chunk_index 
             LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM kb_chunks WHERE kb_id = $1',
            [id]
        );

        res.json({
            chunks: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit),
        });
    } catch (error) {
        console.error('Get chunks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ ANALYTICS ROUTES ============

app.get('/api/analytics/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        // Get agent stats
        const agentsResult = await pool.query(
            'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM agents WHERE user_id = $2',
            ['active', req.userId]
        );

        // Mock data for now - in production, this would come from analytics DB
        const stats = {
            totalAgents: parseInt(agentsResult.rows[0].total),
            activeAgents: parseInt(agentsResult.rows[0].active),
            totalMessages: 1234, // TODO: Implement message tracking
            avgResponseTime: 1.2, // TODO: Implement from analytics
            queueLength: 5, // TODO: Implement from queue
            errorRate: 2.3, // TODO: Implement from analytics
        };

        res.json(stats);
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/analytics/metrics', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        // Mock historical data for charts
        const metrics = {
            messageVolume: Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                count: Math.floor(Math.random() * 100),
            })),
            responseTime: Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                avg: Math.random() * 3,
            })),
        };

        res.json(metrics);
    } catch (error) {
        console.error('Get metrics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ SETTINGS ROUTES ============

app.get('/api/settings', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM settings WHERE user_id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            // Create default settings
            const newSettings = await pool.query(
                'INSERT INTO settings (user_id) VALUES ($1) RETURNING *',
                [req.userId]
            );
            return res.json(newSettings.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/settings', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { openai_api_key, default_language, fallback_response, webhook_url, notification_preferences } = req.body;

        const result = await pool.query(
            `UPDATE settings 
             SET openai_api_key = COALESCE($1, openai_api_key), 
                 default_language = COALESCE($2, default_language), 
                 fallback_response = COALESCE($3, fallback_response), 
                 webhook_url = COALESCE($4, webhook_url), 
                 notification_preferences = COALESCE($5, notification_preferences) 
             WHERE user_id = $6 
             RETURNING *`,
            [openai_api_key, default_language, fallback_response, webhook_url, notification_preferences, req.userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ KB UPLOAD ROUTES ============

app.post('/api/kb/:id/chunks', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { chunks } = req.body; // Array of { content, metadata }

        if (!chunks || !Array.isArray(chunks)) {
            return res.status(400).json({ error: 'Chunks array required' });
        }

        // Verify KB belongs to user's agent
        const kbCheck = await pool.query(
            `SELECT kb.id FROM knowledge_bases kb
             JOIN agents a ON kb.agent_id = a.id
             WHERE kb.id = $1 AND a.user_id = $2`,
            [id, req.userId]
        );

        if (kbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'KB not found or unauthorized' });
        }

        // Insert chunks
        const insertPromises = chunks.map((chunk: any) =>
            pool.query(
                'INSERT INTO kb_chunks (kb_id, content, metadata) VALUES ($1, $2, $3)',
                [id, chunk.content, chunk.metadata || {}]
            )
        );

        await Promise.all(insertPromises);

        res.status(201).json({ message: `${chunks.length} chunks added successfully` });
    } catch (error) {
        console.error('Add chunks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/kb/:id/chunks', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        // Verify KB belongs to user's agent
        const kbCheck = await pool.query(
            `SELECT kb.id FROM knowledge_bases kb
             JOIN agents a ON kb.agent_id = a.id
             WHERE kb.id = $1 AND a.user_id = $2`,
            [id, req.userId]
        );

        if (kbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'KB not found or unauthorized' });
        }

        const result = await pool.query(
            'SELECT * FROM kb_chunks WHERE kb_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [id, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM kb_chunks WHERE kb_id = $1',
            [id]
        );

        res.json({
            chunks: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit,
        });
    } catch (error) {
        console.error('Get chunks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ MESSAGE INTAKE ENDPOINT ============

app.post('/intake', async (req: Request, res: Response) => {
    try {
        const { agentId, platform, userId, message, timestamp } = req.body;

        if (!agentId || !platform || !userId || !message) {
            return res.status(400).json({ error: 'agentId, platform, userId, and message are required' });
        }

        // Verify agent exists and is active
        const agentResult = await pool.query(
            'SELECT id, status FROM agents WHERE id = $1',
            [agentId]
        );

        if (agentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        if (agentResult.rows[0].status !== 'active') {
            return res.status(400).json({ error: 'Agent is not active' });
        }

        // Import and use queue module to add message
        const { addMessage } = require('./queue/index');

        const normalizedMessage = {
            agent_id: agentId,
            user_id: userId,
            text: message,
            media: [],
            timestamp: timestamp || new Date().toISOString(),
        };

        await addMessage(agentId, normalizedMessage); res.status(202).json({
            message: 'Message queued successfully',
            messageId: `${agentId}-${Date.now()}`,
        });
    } catch (error) {
        console.error('Intake error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ HEALTH CHECK ============

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`[API Server] Running on port ${PORT}`);
    console.log(`[API Server] Health check: http://localhost:${PORT}/health`);
});

export default app;
