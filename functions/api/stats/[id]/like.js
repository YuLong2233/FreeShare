/**
 * POST /api/stats/:id/like
 * Body: { action: 'like' | 'unlike' }
 * 点赞 +1 或取消点赞 -1（最小值为 0）
 */
export async function onRequestPost(context) {
    const { params, env, request } = context;
    const id = params.id;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    if (!env.FREESHARE_STATS) {
        return new Response(JSON.stringify({ likes: 0 }), { headers: corsHeaders });
    }

    let action = 'like';
    try {
        const body = await request.json();
        action = body.action || 'like';
    } catch {
        // body 解析失败时默认 like
    }

    try {
        const current = parseInt(
            (await env.FREESHARE_STATS.get(`likes:${id}`)) || '0',
            10
        );
        const next =
            action === 'unlike' ? Math.max(0, current - 1) : current + 1;
        await env.FREESHARE_STATS.put(`likes:${id}`, String(next));

        return new Response(JSON.stringify({ likes: next }), {
            headers: corsHeaders,
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Failed' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
    });
}
