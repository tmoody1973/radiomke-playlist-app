export interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

export interface VideoCandidate {
  video: YouTubeSearchItem;
  score: number;
  isOfficial: boolean;
  query: string;
  searchAttempt: number;
}