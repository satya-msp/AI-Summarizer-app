
import React, { useState } from 'react';
import TrashIcon from './icons/TrashIcon';

interface FeedManagerProps {
  feeds: string[];
  onAddFeed: (url: string) => void;
  onRemoveFeed: (url: string) => void;
  isFetching: boolean;
}

const FeedManager: React.FC<FeedManagerProps> = ({ feeds, onAddFeed, onRemoveFeed, isFetching }) => {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [error, setError] = useState('');

  const handleAddFeed = () => {
    if (!newFeedUrl.trim()) {
      setError('URL cannot be empty.');
      return;
    }
    try {
      new URL(newFeedUrl); // Basic URL validation
      if (feeds.includes(newFeedUrl)) {
        setError('This feed URL has already been added.');
        return;
      }
      onAddFeed(newFeedUrl);
      setNewFeedUrl('');
      setError('');
    } catch (_) {
      setError('Please enter a valid URL.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">News Feeds</h2>
      <div className="space-y-3 mb-6">
        {feeds.map((feed) => (
          <div key={feed} className="flex items-center justify-between bg-slate-100 p-3 rounded-md">
            <span className="text-slate-600 text-sm truncate mr-4">{feed}</span>
            <button
              onClick={() => onRemoveFeed(feed)}
              disabled={isFetching}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Remove ${feed}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={newFeedUrl}
          onChange={(e) => setNewFeedUrl(e.target.value)}
          placeholder="https://example.com/rss.xml"
          className="flex-grow px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={isFetching}
        />
        <button
          onClick={handleAddFeed}
          disabled={isFetching}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          Add Feed
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default FeedManager;
