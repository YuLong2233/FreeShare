/**
 * GET /api/stats/batch?ids=1,2,3
 * 批量获取多个资源的统计数据（供卡片列表使用，减少请求数）
 */
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids') || '';

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const ids = idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (ids.length === 0) {
        return new Response(JSON.stringify({}), { headers: corsHeaders });
    }

    // 如果 KV 未绑定（本地开发），返回全 0 的模拟数据
    if (!env.FREESHARE_STATS) {
        const empty = {};
        ids.forEach((id) => { empty[id] = { views: 0, likes: 0 }; });
        return new Response(JSON.stringify(empty), { headers: corsHeaders });
    }

    try {
        // 并发读取所有 id 的 views 和 likes
        const keys = ids.flatMap((id) => [
            env.FREESHARE_STATS.get(`views:${id}`),
            env.FREESHARE_STATS.get(`likes:${id}`),
        ]);
        const values = await Promise.all(keys);

        const result = {};
        ids.forEach((id, i) => {
            result[id] = {
                views: parseInt(values[i * 2] || '0', 10),
                likes: parseInt(values[i * 2 + 1] || '0', 10),
            };
        });

        return new Response(JSON.stringify(result), { headers: corsHeaders });
    } catch (e) {
        const empty = {};
        ids.forEach((id) => { empty[id] = { views: 0, likes: 0 }; });
        return new Response(JSON.stringify(empty), { headers: corsHeaders });
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
