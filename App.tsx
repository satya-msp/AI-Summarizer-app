import React, { useState, useCallback } from 'react';
import { summarizeText } from './services/geminiService';
import type { SummarizedArticle, RawArticle } from './types';
import { CORS_PROXY, DEFAULT_FEEDS } from './constants';
import ArticleCard from './components/ArticleCard';
import FeedManager from './components/FeedManager';

const App: React.FC = () => {
  const [feedUrls, setFeedUrls] = useState<string[]>(DEFAULT_FEEDS);
  const [articles, setArticles] = useState<SummarizedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const cleanHtml = (html: string): string => {
    return decodeHtmlEntities(html.replace(/<[^>]*>?/gm, ' ')).replace(/\s+/g, ' ').trim();
  };
  
  const handleFetchAndSummarize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setArticles([]);

    const parser = new DOMParser();

    const fetchPromises = feedUrls.map(async (url) => {
      try {
        const response = await fetch(`${CORS_PROXY}${url}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.statusText}`);
        }
        const text = await response.text();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = Array.from(xml.querySelectorAll('item'));
        const recentArticles: RawArticle[] = [];

        // Get the latest 10 articles from the feed.
        const latestItems = items.slice(0, 10);

        latestItems.forEach((item, index) => {
          const pubDateString = item.querySelector('pubDate')?.textContent;
          const pubDate = pubDateString ? new Date(pubDateString) : new Date();

          const title = item.querySelector('title')?.textContent ?? 'No Title';
          const link = item.querySelector('link')?.textContent ?? '';
          const description = item.querySelector('description')?.textContent ?? '';
          const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent ?? '';
          
          const content = cleanHtml(contentEncoded || description);

          if (link && content) {
              recentArticles.push({
                  id: `${url}-${index}`, // Simple unique ID
                  title,
                  link,
                  content,
                  publishedDate: pubDate.toLocaleTimeString(),
                  feedUrl: url,
              });
          }
        });
        return recentArticles;
      } catch (e) {
        console.error(`Error processing feed ${url}:`, e);
        return []; // Return empty array on error to not break Promise.all
      }
    });

    try {
      const allRawArticlesNested = await Promise.all(fetchPromises);
      const allRawArticles = allRawArticlesNested.flat();

      if (allRawArticles.length === 0) {
        setError("No articles found in the provided feeds.");
        setIsLoading(false);
        return;
      }

      const summaryPromises = allRawArticles.map(async (article) => {
        const summary = await summarizeText(article.content);
        return {
          id: article.id,
          title: article.title,
          summary,
          link: article.link,
          publishedDate: article.publishedDate,
          feedUrl: article.feedUrl
        };
      });
      
      const summarizedArticles = await Promise.all(summaryPromises);
      setArticles(summarizedArticles);
    } catch (e) {
      setError("An unexpected error occurred while summarizing articles.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [feedUrls]);

  const addFeed = (url: string) => {
    setFeedUrls(prev => [...prev, url]);
  };
  
  const removeFeed = (url: string) => {
    setFeedUrls(prev => prev.filter(feed => feed !== url));
  };


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Telugu News Summarizer
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <FeedManager feeds={feedUrls} onAddFeed={addFeed} onRemoveFeed={removeFeed} isFetching={isLoading} />
        
        <div className="text-center mb-8">
          <button
            onClick={handleFetchAndSummarize}
            disabled={isLoading}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ease-in-out disabled:bg-slate-400 disabled:cursor-wait transform hover:scale-105"
          >
            {isLoading ? 'Fetching & Summarizing...' : 'Get Latest News Summaries'}
          </button>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        )}

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && !error && (
            <div className="text-center py-12">
                <p className="text-slate-500 text-lg">Click the button above to fetch and summarize the latest news.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
