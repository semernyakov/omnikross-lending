type RegistrationSyncPayload = {
  type: 'agency' | 'solo';
  role: 'agency' | 'solo';
  lang: 'ru' | 'en';
  email: string;
  telegram?: string;
  company?: string;
  clientsCount?: number;
  confirmToken: string;
};

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const hasSupabase = () => Boolean(supabaseUrl && supabaseServiceRoleKey);

const headers = () => ({
  apikey: supabaseServiceRoleKey ?? '',
  Authorization: `Bearer ${supabaseServiceRoleKey ?? ''}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal'
});

export const syncRegistrationToSupabase = async (payload: RegistrationSyncPayload) => {
  if (!hasSupabase()) return;

  const response = await fetch(`${supabaseUrl}/rest/v1/registrations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      type: payload.type,
      role: payload.role,
      lang: payload.lang,
      email: payload.email,
      telegram: payload.telegram ?? null,
      company: payload.company ?? null,
      clients_count: payload.clientsCount ?? null,
      confirm_token: payload.confirmToken,
      is_confirmed: false
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Supabase registration sync failed:', response.status, text);
  }
};

export const markRegistrationConfirmedInSupabase = async (token: string) => {
  if (!hasSupabase()) return;

  const response = await fetch(`${supabaseUrl}/rest/v1/registrations?confirm_token=eq.${encodeURIComponent(token)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({
      is_confirmed: true,
      confirmed_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Supabase confirmation sync failed:', response.status, text);
  }
};
