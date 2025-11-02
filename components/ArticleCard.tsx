
import React from 'react';
import type { SummarizedArticle } from '../types';

interface ArticleCardProps {
  article: SummarizedArticle;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const feedHostname = new URL(article.feedUrl).hostname.replace('www.', '');

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                {feedHostname}
            </span>
            <span className="text-xs text-slate-500">{article.publishedDate}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{article.title}</h3>
        <p className="text-slate-600 leading-relaxed text-base">
          {article.summary}
        </p>
      </div>
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center"
        >
          Read Full Article
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;
