/**
 * Organization API
 * Fetches current user's organization details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/authServer';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, organization:organizations(*)')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile.organization);
  } catch (error: any) {
    console.error('Organization fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile and organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, organization:organizations(*)')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if user has admin permissions
    if (!['owner', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const updates = await request.json();

    // Only allow updating certain fields
    const allowedFields = ['name', 'logo_url', 'primary_color', 'custom_domain'];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update(filteredUpdates)
      .eq('id', profile.organization.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedOrg);
  } catch (error: any) {
    console.error('Organization update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 500 }
    );
  }
}
