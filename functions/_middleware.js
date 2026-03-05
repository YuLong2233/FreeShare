export async function onRequest(context) {
    const url = new URL(context.request.url);

    // 检查当前访问的域名是否是 Cloudflare 默认的 .pages.dev 域名
    if (url.hostname.endsWith('pages.dev')) {
        // 强制跳转到正式域名
        url.hostname = 'freeshare.uk';

        // 执行 301 永久重定向，告诉搜索引擎这是永久转移
        return Response.redirect(url.toString(), 301);
    }

    // 如果已经是正式域名或本地测试，则继续处理请求
    return context.next();
}
