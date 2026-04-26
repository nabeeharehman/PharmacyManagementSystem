import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const defaultStaffPassword = Deno.env.get('DEFAULT_STAFF_PASSWORD') ?? '';
    const authHeader = request.headers.get('Authorization');

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !defaultStaffPassword) {
      throw new Error('Missing Supabase environment variables.');
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: callerError?.message || 'Unauthorized request.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: callerProfile, error: callerProfileError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerProfileError || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can create staff accounts.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const role = body.role as 'pharmacist' | 'inventory_manager';
    const fullName = String(body.full_name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : null;
    const employeeId = String(body.employee_id ?? '').trim();
    const licenseNumber = body.license_number ? String(body.license_number).trim() : null;
    const licenseExpiry = body.license_expiry ? String(body.license_expiry).trim() : null;

    if (!['pharmacist', 'inventory_manager'].includes(role)) {
      throw new Error('Invalid role supplied.');
    }

    if (!fullName || !email || !employeeId) {
      throw new Error('Missing required staff fields.');
    }

    if (role === 'pharmacist' && (!licenseNumber || !licenseExpiry)) {
      throw new Error('Pharmacists require a license number and license expiry.');
    }

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: defaultStaffPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    });

    if (authError || !authUser.user) {
      throw authError ?? new Error('Could not create auth user.');
    }

    const userId = authUser.user.id;

    const { error: userInsertError } = await adminClient.from('users').upsert({
      id: userId,
      email,
      full_name: fullName,
      role,
      phone,
      status: 'active',
    }, {
      onConflict: 'id',
    });

    if (userInsertError) {
      await adminClient.auth.admin.deleteUser(userId);
      throw userInsertError;
    }

    if (role === 'pharmacist') {
      const { error: pharmacistInsertError } = await adminClient.from('pharmacists').insert({
        id: userId,
        employee_id: employeeId,
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
      });

      if (pharmacistInsertError) {
        await adminClient.from('users').delete().eq('id', userId);
        await adminClient.auth.admin.deleteUser(userId);
        throw pharmacistInsertError;
      }
    }

    if (role === 'inventory_manager') {
      const { error: managerInsertError } = await adminClient.from('inventory_managers').insert({
        id: userId,
        employee_id: employeeId,
        full_name: fullName,
        email,
        phone,
      });

      if (managerInsertError) {
        await adminClient.from('users').delete().eq('id', userId);
        await adminClient.auth.admin.deleteUser(userId);
        throw managerInsertError;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Created ${role} account for ${email}.`,
        user_id: userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : 'Unknown error occurred.';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
