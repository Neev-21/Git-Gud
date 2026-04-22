export const EXP_CONSTANTS = {
  COMMIT: { points: 10, dailyCap: 50 },
  PR_OPENED: { points: 25, dailyCap: 50 },
  PR_MERGED: { points: 100, dailyCap: 100 },
};

export type GitHubEventType = 'commit' | 'pr_opened' | 'pr_merged';

export type GitHubEventData = {
  id: string; // github event id
  type: GitHubEventType;
  date: string; // ISO date string
};

export type DatabaseActivityLog = {
  id: string;
  user_id: string;
  event_type: GitHubEventType;
  github_event_id: string;
  exp_awarded: number;
  created_at: string;
};

/**
 * Calculates the user's level based on their total EXP using an escalating curve.
 * Formula: EXP Required for Next Level = 1000 + (Current Level - 1) * 250
 */
export function calculateLevelFromExp(totalExp: number): { level: number, expToNextLevel: number, currentLevelBaseExp: number } {
  let level = 1;
  let currentLevelBaseExp = 0;
  let expRequiredForNext = 1000;

  while (totalExp >= currentLevelBaseExp + expRequiredForNext) {
    currentLevelBaseExp += expRequiredForNext;
    level++;
    expRequiredForNext = 1000 + (level - 1) * 250;
  }

  return {
    level,
    expToNextLevel: expRequiredForNext,
    currentLevelBaseExp
  };
}

/**
 * Processes new GitHub events, applying daily caps based on what has already been logged today.
 * Returns the total EXP gained and the event objects to insert into the database.
 */
export function processNewEvents(
  newEvents: GitHubEventData[], 
  todaysLogs: DatabaseActivityLog[]
): { expGained: number, eventsToLog: Omit<DatabaseActivityLog, 'id' | 'created_at' | 'user_id'>[] } {
  
  // Calculate how much EXP has already been awarded today per type
  let todaysCommitExp = 0;
  let todaysPrOpenedExp = 0;
  let todaysPrMergedExp = 0;

  // Track already processed IDs to avoid double counting even if past events are passed in
  const processedEventIds = new Set(todaysLogs.map(l => l.github_event_id));

  for (const log of todaysLogs) {
    if (log.event_type === 'commit') todaysCommitExp += log.exp_awarded;
    if (log.event_type === 'pr_opened') todaysPrOpenedExp += log.exp_awarded;
    if (log.event_type === 'pr_merged') todaysPrMergedExp += log.exp_awarded;
  }

  let totalExpGained = 0;
  const eventsToLog: Omit<DatabaseActivityLog, 'id' | 'created_at' | 'user_id'>[] = [];

  for (const event of newEvents) {
    if (processedEventIds.has(event.id)) {
      continue;
    }
    
    // Add to processed to handle duplicates within the same batch
    processedEventIds.add(event.id);

    let pointsToAward = 0;
    
    if (event.type === 'commit') {
      const available = Math.max(0, EXP_CONSTANTS.COMMIT.dailyCap - todaysCommitExp);
      pointsToAward = Math.min(EXP_CONSTANTS.COMMIT.points, available);
      if (pointsToAward > 0) todaysCommitExp += pointsToAward;
    } else if (event.type === 'pr_opened') {
      const available = Math.max(0, EXP_CONSTANTS.PR_OPENED.dailyCap - todaysPrOpenedExp);
      pointsToAward = Math.min(EXP_CONSTANTS.PR_OPENED.points, available);
      if (pointsToAward > 0) todaysPrOpenedExp += pointsToAward;
    } else if (event.type === 'pr_merged') {
      const available = Math.max(0, EXP_CONSTANTS.PR_MERGED.dailyCap - todaysPrMergedExp);
      pointsToAward = Math.min(EXP_CONSTANTS.PR_MERGED.points, available);
      if (pointsToAward > 0) todaysPrMergedExp += pointsToAward;
    }

    if (pointsToAward > 0) {
      totalExpGained += pointsToAward;
      eventsToLog.push({
        event_type: event.type,
        github_event_id: event.id,
        exp_awarded: pointsToAward,
      });
    } else {
        // Event was capped, we still log it with 0 EXP so we don't process it again
        eventsToLog.push({
            event_type: event.type,
            github_event_id: event.id,
            exp_awarded: 0,
        });
    }
  }

  return { expGained: totalExpGained, eventsToLog };
}
