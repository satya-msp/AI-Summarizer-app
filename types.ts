
export interface SummarizedArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedDate: string;
  feedUrl: string;
}

export interface RawArticle {
    id: string;
    title: string;
    content: string;
    link: string;
    publishedDate: string;
    feedUrl: string;
}
