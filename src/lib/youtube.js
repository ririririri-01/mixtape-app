const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

let debounceTimer = null;

export function searchYouTube(query, callback) {
  clearTimeout(debounceTimer);
  if (!query || query.trim().length < 2) {
    callback([]);
    return;
  }
  debounceTimer = setTimeout(async () => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=5&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        const results = data.items.map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
          channel: item.snippet.channelTitle,
        }));
        callback(results);
      } else {
        callback([]);
      }
    } catch {
      callback([]);
    }
  }, 400);
}
