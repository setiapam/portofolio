import { createClient } from '@supabase/supabase-js'
import { buildReplyEmail, sendMail } from '../utils/mailer'

interface MessageRow {
    id: string
    name: string
    email: string
    subject: string | null
    message: string
    read: boolean
    replied_at: string | null
    created_at: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.messageId?.trim()) {
        throw createError({ statusCode: 400, message: 'Message ID is required' })
    }
    if (!body.replyBody?.trim()) {
        throw createError({ statusCode: 400, message: 'Reply body is required' })
    }

    const config = useRuntimeConfig()

    // Verify auth — check Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Create client with user's token so RLS authenticated policies pass
    const supabase = createClient(
        config.public.supabase.url,
        config.supabaseServiceKey || config.public.supabase.key,
        {
            global: {
                headers: { Authorization: authHeader },
            },
        },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Fetch the original message
    const { data: message, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', body.messageId)
        .single<MessageRow>()

    if (msgError || !message) {
        throw createError({ statusCode: 404, message: 'Message not found' })
    }

    // Fetch profile name for the reply
    const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .limit(1)
        .single<{ name: string }>()

    const profileName = profile?.name || 'Admin'

    // Build and send reply email
    const { subject, html } = buildReplyEmail({
        originalMessage: message.message,
        originalSubject: message.subject,
        senderName: message.name,
        replyBody: body.replyBody.trim(),
        profileName,
    }, config.public.siteUrl)

    await sendMail({
        to: message.email,
        subject,
        html,
        replyTo: config.adminEmail || undefined,
    })

    // Mark as read and store reply timestamp
    await supabase
        .from('messages')
        .update({ read: true, replied_at: new Date().toISOString() })
        .eq('id', body.messageId)

    return { success: true }
})
