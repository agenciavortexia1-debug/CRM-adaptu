import { subscribeToPush } from './push';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function registerPush() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const subscription = await subscribeToPush();
    const subData = JSON.parse(JSON.stringify(subscription));
    
    // Salva no Supabase usando o endpoint como chave única
    const { error } = await supabase.from('push_subscriptions').upsert({ 
      subscription: subData 
    }, { onConflict: 'subscription' });
    
    if (error) throw error;
    
    console.log("Push registered and saved to Supabase");
    return true;
  } catch (error) {
    console.error("Push registration failed:", error);
    return false;
  }
}
