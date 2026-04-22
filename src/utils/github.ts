import { GitHubEventData } from './expEngine';

/**
 * Fetches recent public activity for a given GitHub username.
 * Processes 'PushEvent' and 'PullRequestEvent' into a standard format.
 */
export async function fetchUserRecentActivity(username: string): Promise<GitHubEventData[]> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitGud-App'
    };

    // If you have a GitHub token, adding it prevents strict rate limiting (60 requests/hr unauthenticated vs 5000/hr authenticated)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
      headers,
      next: { revalidate: 0 } // Do not cache, always fetch fresh data for the cron
    });

    if (!res.ok) {
      console.error(`Failed to fetch GitHub events for ${username}: ${res.status} ${res.statusText}`);
      return [];
    }

    const events = await res.json();
    const processedEvents: GitHubEventData[] = [];

    for (const event of events) {
      if (event.type === 'PushEvent') {
        const commits = event.payload.commits || [];
        for (const commit of commits) {
          processedEvents.push({
            id: commit.sha, // use commit sha as unique ID
            type: 'commit',
            date: event.created_at
          });
        }
      } else if (event.type === 'PullRequestEvent') {
        if (event.payload.action === 'opened') {
          processedEvents.push({
            id: `pr_opened_${event.payload.pull_request.id}`,
            type: 'pr_opened',
            date: event.created_at
          });
        } else if (event.payload.action === 'closed' && event.payload.pull_request.merged) {
          processedEvents.push({
            id: `pr_merged_${event.payload.pull_request.id}`,
            type: 'pr_merged',
            date: event.created_at
          });
        }
      }
    }

    return processedEvents;
  } catch (err) {
    console.error(`Error fetching GitHub events for ${username}:`, err);
    return [];
  }
}
