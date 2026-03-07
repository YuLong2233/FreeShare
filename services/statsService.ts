/**
 * 资源统计服务
 * 封装访问量、点赞的读写操作，统一管理 API 调用和本地状态
 */

const LIKED_KEY = 'freeshare_liked_ids';

// ─── localStorage 点赞状态管理 ─────────────────────────
export const getLikedIds = (): Set<number> => {
    try {
        const raw = localStorage.getItem(LIKED_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

export const setLiked = (resourceId: number, liked: boolean): void => {
    const ids = getLikedIds();
    if (liked) {
        ids.add(resourceId);
    } else {
        ids.delete(resourceId);
    }
    localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]));
};

export const isLiked = (resourceId: number): boolean => {
    return getLikedIds().has(resourceId);
};

// ─── API 调用 ──────────────────────────────────────────

export interface ResourceStats {
    views: number;
    likes: number;
}

/**
 * 批量获取多个资源的统计数据（卡片列表使用）
 */
export const fetchStatsBatch = async (
    ids: number[]
): Promise<Record<number, ResourceStats>> => {
    if (ids.length === 0) return {};
    try {
        const res = await fetch(`/api/stats/batch?ids=${ids.join(',')}`);
        if (!res.ok) return {};
        return await res.json();
    } catch {
        return {};
    }
};

/**
 * 获取单个资源的统计数据（详情页使用）
 */
export const fetchStats = async (
    resourceId: number
): Promise<ResourceStats> => {
    try {
        const res = await fetch(`/api/stats/${resourceId}`);
        if (!res.ok) return { views: 0, likes: 0 };
        return await res.json();
    } catch {
        return { views: 0, likes: 0 };
    }
};

/**
 * 记录一次访问（进入详情页时调用）
 */
export const recordView = async (resourceId: number): Promise<void> => {
    try {
        await fetch(`/api/stats/${resourceId}/view`, { method: 'POST' });
    } catch {
        // 静默失败，不影响用户体验
    }
};

/**
 * 点赞 / 取消点赞
 * @returns 操作后的最新点赞数
 */
export const toggleLike = async (
    resourceId: number
): Promise<{ likes: number; liked: boolean }> => {
    const currentlyLiked = isLiked(resourceId);
    const action = currentlyLiked ? 'unlike' : 'like';

    try {
        const res = await fetch(`/api/stats/${resourceId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        // 操作成功后更新本地状态
        setLiked(resourceId, !currentlyLiked);
        return { likes: data.likes, liked: !currentlyLiked };
    } catch {
        // 失败时回滚，返回当前状态
        return { likes: 0, liked: currentlyLiked };
    }
};
