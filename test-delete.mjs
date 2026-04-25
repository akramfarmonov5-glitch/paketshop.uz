import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cuhaqoahculndvzpriuq.supabase.co';
const supabaseKey = 'sb_publishable_of4dsH5QvlGKU3Xvn5k34A_WG9L4ZOU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) {
        console.error("Select error:", error);
        return;
    }
    if (!data || data.length === 0) {
        console.log("No leads to delete.");
        return;
    }
    const lead = data[0];
    console.log("Attempting to delete lead:", lead.id);
    const { error: deleteError } = await supabase.from('leads').delete().eq('id', lead.id);
    if (deleteError) {
        console.error("Delete error:", deleteError);
    } else {
        console.log("Delete success!");
    }
}

testDelete();
