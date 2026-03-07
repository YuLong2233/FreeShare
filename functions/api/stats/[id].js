/**
 * GET /api/stats/:id
 * 获取单个资源的访问量和点赞数
 */
export async function onRequestGet(context) {
    const { params, env } = context;
    const id = params.id;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    // 如果 KV 未绑定（本地开发环境），返回模拟数据
    if (!env.FREESHARE_STATS) {
        return new Response(JSON.stringify({ views: 0, likes: 0 }), {
            headers: corsHeaders,
        });
    }

    try {
        const [views, likes] = await Promise.all([
            env.FREESHARE_STATS.get(`views:${id}`),
            env.FREESHARE_STATS.get(`likes:${id}`),
        ]);

        return new Response(
            JSON.stringify({
                views: parseInt(views || '0', 10),
                likes: parseInt(likes || '0', 10),
            }),
            { headers: corsHeaders }
        );
    } catch (e) {
        return new Response(JSON.stringify({ views: 0, likes: 0 }), {
            headers: corsHeaders,
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
    });
}
