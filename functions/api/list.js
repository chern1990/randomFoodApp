
import { createClient } from '@supabase/supabase-js';
export async function onRequest(context) {
  try {
    // Environment variables are available in the context.env object.
    const SUPABASE_URL = context.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = context.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log(SUPABASE_URL);
    console.log(SUPABASE_SERVICE_ROLE_KEY);
    // Check if the required environment variables are set.
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Supabase environment variables are not set.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize the Supabase admin client. This happens securely on the server.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { request } = context;

    // --- Handle GET requests (Fetch all items) ---
    if (request.method === 'GET') {
      const { data, error } = await supabase.from('food_list').select('id,name');
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Handle POST requests (Add a new item) ---
    if (request.method === 'POST') {
      const { name } = await request.json();
      if (!name) {
         return new Response(JSON.stringify({ error: 'Item name is required.' }), { status: 400 });
      }
      const { data, error } = await supabase.from('food_list').insert({ name }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 201 });
    }

    // --- Handle DELETE requests (Remove an item) ---
    if (request.method === 'DELETE') {
      const { name } = await request.json();
       if (!name) {
         return new Response(JSON.stringify({ error: 'Item name is required.' }), { status: 400 });
      }
      const { error } = await supabase.from('food_list').delete().eq('name', name);
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Item deleted successfully' }), { status: 200 });
    }

    // If the method is not supported
    return new Response('Method Not Allowed', { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
