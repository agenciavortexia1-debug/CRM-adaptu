import { subscribeToPush } from './push';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function registerPush() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker not supported in this browser");
    return false;
  }

  try {
    console.log("Starting push registration...");
    const subscription = await subscribeToPush();
    
    if (!subscription) {
      console.error("No subscription object returned");
      return false;
    }

    const subData = JSON.parse(JSON.stringify(subscription));
    console.log("Subscription obtained:", subData.endpoint);
    
    // Salva no Supabase usando o endpoint como chave primária
    const { data, error } = await supabase.from('push_subscriptions').upsert({ 
      endpoint: subData.endpoint,
      subscription: subData 
    }).select();
    
    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }
    
    console.log("Push registered and saved to Supabase:", data);
    return true;
  } catch (error) {
    console.error("Push registration failed detailed error:", error);
    return false;
  }
}
