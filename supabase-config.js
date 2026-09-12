// Public browser configuration only. Never put a service_role/secret key here.
window.SUPABASE_URL = "https://oiokjgggllndwozrhede.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_cFkYJhGujxGS-YDhvvVvVw_7dOOTKMc";

if (window.SUPABASE_URL.startsWith("http") && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.startsWith("YOUR_")) {
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  s.onload = () => {
    window.supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );
    window.loadLiveMenu?.();
  };
  document.head.appendChild(s);
}
