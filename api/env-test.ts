export default function handler(req, res) {
    res.status(200).json({
        supabaseUrlDefined: !!process.env.VITE_SUPABASE_URL,
        supabaseKeyDefined: !!process.env.VITE_SUPABASE_KEY,
        nodeEnv: process.env.NODE_ENV,
        urlValueStart: process.env.VITE_SUPABASE_URL ? process.env.VITE_SUPABASE_URL.substring(0, 8) : 'none'
    });
}
