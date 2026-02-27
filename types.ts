
export interface Link {
  name: string;
  url: string;
  code?: string;
}

// 列表页使用的轻量数据（不含 detailHtml，可含首图）
export interface Resource {
  id: number;
  title: string;
  desc: string;
  category: string;
  date: string;
  links: Link[];
  tags?: string[];
  gallery?: string[];   // 保留用于卡片封面图展示
}

// 详情页动态加载的数据
export interface ResourceDetail {
  detailHtml: string;
  gallery?: string[];
}

export type View = 'home' | 'downloads' | 'guide';
