/**
 * POST /api/stats/:id/view
 * 记录一次资源访问，访问量 +1
 */
export async function onRequestPost(context) {
    const { params, env } = context;
    const id = params.id;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    if (!env.FREESHARE_STATS) {
        return new Response(JSON.stringify({ views: 0 }), { headers: corsHeaders });
    }

    try {
        const current = parseInt(
            (await env.FREESHARE_STATS.get(`views:${id}`)) || '0',
            10
        );
        const next = current + 1;
        await env.FREESHARE_STATS.put(`views:${id}`, String(next));

        return new Response(JSON.stringify({ views: next }), {
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
