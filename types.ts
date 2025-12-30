
export interface Link {
  name: string;
  url: string;
  code?: string;
}

export interface Resource {
  id: number;
  title: string;
  desc: string;
  category: string;
  date: string;
  links: Link[];
  tags?: string[];
  // 新增字段
  detailHtml?: string; // 详细介绍的 HTML 内容
  gallery?: string[];  // 详情页展示的图片 URL 数组
}

export type View = 'home' | 'downloads' | 'guide';
