import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = 'https://qxihfpviufppdscsetbs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWhmcHZpdWZwcGRzY3NldGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMxMzgsImV4cCI6MjA4NjUwOTEzOH0.YyvQh61ow7aP2670Ct157K_mBZjyvPZdvbtEdqkReB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

webpush.setVapidDetails(
  "mailto:admin@adaptu.com.br",
  "BAgJktjT0hDpog_z3HpEakDjnvJjEI2DelSnW7lwUZTl_ZvKblveLxdc8x3pwXoX_r-BTipY18Ye1ymR5VT6pms",
  "UDtWlsMgFMiIHQohgIIhQaYZWfw5gohjLTXX6giWcNQ"
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    // Busca todas as inscrições do Supabase
    const { data: subs, error } = await supabase.from('push_subscriptions').select('subscription');
    
    if (error) throw error;

    const payload = {
      title: "Novo Lead Recebido! 🚀",
      body: req.body.company ? `Empresa: ${req.body.company}` : "Um novo lead acaba de entrar no sistema.",
      url: "/"
    };

    const notifications = subs.map(s => 
      webpush.sendNotification(s.subscription, JSON.stringify(payload))
        .catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Remove inscrição inválida/expirada
            return supabase.from('push_subscriptions').delete().eq('subscription', s.subscription);
          }
        })
    );

    await Promise.all(notifications);
    res.status(200).json({ success: true, sent: subs.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
