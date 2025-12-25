/**
 * Supabase Client for MCP Builder Demo
 * 
 * Handles all database interactions for the AI Employee demo.
 * Uses public anon key - safe for frontend.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types for our database tables
export interface CouponCode {
    id: string
    code: string
    uses_remaining: number
    created_at: string
}

export interface MCPRequest {
    id: string
    coupon_code: string
    goal: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    logs: string[]
    created_at: string
    updated_at: string
}

export interface MCPResult {
    id: string
    request_id: string
    server_code: string
    tools_json: Record<string, unknown>
    download_url: string | null
    created_at: string
}

// Initialize Supabase client
// IMPORTANT: Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client (will be non-functional if credentials are missing)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Validate a coupon code
 * Returns the coupon if valid and has remaining uses
 */
export async function validateCoupon(code: string): Promise<{
    valid: boolean
    error?: string
    remaining?: number
}> {
    if (!isSupabaseConfigured) {
        return { valid: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

    if (error || !data) {
        return { valid: false, error: 'Invalid coupon code' }
    }

    const coupon = data as CouponCode
    if (coupon.uses_remaining <= 0) {
        return { valid: false, error: 'Coupon has been fully used' }
    }

    return { valid: true, remaining: coupon.uses_remaining }
}

/**
 * Submit a new MCP generation request
 */
export async function submitMCPRequest(
    couponCode: string,
    goal: string
): Promise<{
    success: boolean
    requestId?: string
    error?: string
}> {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured' }
    }

    // First validate and decrement coupon
    const { data: couponData, error: couponError } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single()

    if (couponError || !couponData) {
        return { success: false, error: 'Invalid coupon code' }
    }

    const coupon = couponData as CouponCode
    if (coupon.uses_remaining <= 0) {
        return { success: false, error: 'Coupon has been fully used' }
    }

    // Create the request
    const { data: requestData, error: requestError } = await supabase
        .from('mcp_requests')
        .insert({
            coupon_code: couponCode.toUpperCase(),
            goal: goal
        })
        .select()
        .single()

    if (requestError || !requestData) {
        return { success: false, error: 'Failed to create request' }
    }

    const request = requestData as MCPRequest

    // Decrement coupon uses
    await supabase
        .from('coupon_codes')
        .update({ uses_remaining: coupon.uses_remaining - 1 })
        .eq('code', couponCode.toUpperCase())

    return { success: true, requestId: request.id }
}

/**
 * Poll for request status updates
 */
export async function pollRequestStatus(requestId: string): Promise<{
    status: MCPRequest['status']
    logs: string[]
    error?: string
}> {
    if (!isSupabaseConfigured) {
        return { status: 'failed', logs: [], error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
        .from('mcp_requests')
        .select('status, logs')
        .eq('id', requestId)
        .single()

    if (error || !data) {
        return { status: 'failed', logs: [], error: 'Request not found' }
    }

    const request = data as Pick<MCPRequest, 'status' | 'logs'>
    return { status: request.status, logs: request.logs || [] }
}

/**
 * Get the generated MCP result
 */
export async function getMCPResult(requestId: string): Promise<{
    success: boolean
    result?: MCPResult
    error?: string
}> {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
        .from('mcp_results')
        .select('*')
        .eq('request_id', requestId)
        .single()

    if (error || !data) {
        return { success: false, error: 'Result not found' }
    }

    return { success: true, result: data as MCPResult }
}

/**
 * Subscribe to real-time updates for a request
 */
export function subscribeToRequest(
    requestId: string,
    onUpdate: (status: MCPRequest['status'], logs: string[]) => void
) {
    if (!isSupabaseConfigured) {
        return () => { } // No-op unsubscribe
    }

    const channel = supabase
        .channel(`request-${requestId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'mcp_requests',
                filter: `id=eq.${requestId}`
            },
            (payload) => {
                const newData = payload.new as MCPRequest
                onUpdate(newData.status, newData.logs || [])
            }
        )
        .subscribe()

    // Return unsubscribe function
    return () => {
        supabase.removeChannel(channel)
    }
}
