import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchUserRecentActivity } from '@/utils/github';
import { processNewEvents, calculateLevelFromExp, DatabaseActivityLog } from '@/utils/expEngine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Verify cron key to protect the route
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_KEY &&
      authHeader !== `Bearer ${process.env.CRON_KEY}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase admin client (we need to bypass RLS to read all users and update them)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
    
    if (!supabaseServiceKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
        return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch all users who have a username (github username)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, exp, level')
      .not('username', 'is', null);

    if (usersError || !users) {
      throw new Error(`Failed to fetch users: ${usersError?.message}`);
    }

    // We will process them sequentially to avoid rate limits, or in small batches
    const results = [];

    for (const user of users) {
      if (!user.username) continue;

      // 3. Fetch their recent GitHub activity
      const githubEvents = await fetchUserRecentActivity(user.username);
      
      if (githubEvents.length === 0) {
        results.push({ user: user.username, status: 'no_new_events' });
        continue;
      }

      // 4. Fetch their already-awarded activity for today
      // Postgres: created_at >= current_date (UTC)
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      const { data: todaysLogs, error: logsError } = await supabase
        .from('github_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString());

      if (logsError) {
        console.error(`Failed to fetch logs for ${user.username}`, logsError);
        continue;
      }

      // 5. Calculate new EXP and what events to log
      const { expGained, eventsToLog } = processNewEvents(githubEvents, (todaysLogs as DatabaseActivityLog[]) || []);

      if (eventsToLog.length === 0) {
        results.push({ user: user.username, status: 'all_events_processed_or_capped' });
        continue;
      }

      // 6. Update database inside a transaction/batch
      // Calculate new total EXP and Level
      const newExp = user.exp + expGained;
      const { level: newLevel } = calculateLevelFromExp(newExp);

      // Prepare insert for logs
      const logsToInsert = eventsToLog.map(event => ({
        user_id: user.id,
        event_type: event.event_type,
        github_event_id: event.github_event_id,
        exp_awarded: event.exp_awarded
      }));

      // Insert new activity logs
      const { error: insertError } = await supabase
        .from('github_activity_log')
        .insert(logsToInsert);

      if (insertError) {
        console.error(`Failed to insert logs for ${user.username}`, insertError);
        // We probably should rollback or skip updating exp if insert fails
        continue;
      }

      // Update total EXP and level
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ exp: newExp, level: newLevel })
        .eq('id', user.id);

      if (updateError) {
        console.error(`Failed to update profile for ${user.username}`, updateError);
        continue;
      }

      results.push({ 
        user: user.username, 
        status: 'updated', 
        expGained, 
        newExp, 
        newLevel,
        eventsLogged: eventsToLog.length 
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
