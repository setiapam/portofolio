import { createClient } from '@supabase/supabase-js'
import { buildNotificationEmail, sendMail } from '../utils/mailer'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validate
    if (!body.name?.trim()) {
        throw createError({ statusCode: 400, message: 'Name is required' })
    }
    if (!body.email?.trim()) {
        throw createError({ statusCode: 400, message: 'Email is required' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        throw createError({ statusCode: 400, message: 'Invalid email address' })
    }
    if (!body.message?.trim()) {
        throw createError({ statusCode: 400, message: 'Message is required' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
        config.public.supabase.url,
        config.supabaseServiceKey || config.public.supabase.key,
    )

    const messageData = {
        name: body.name.trim(),
        email: body.email.trim(),
        subject: body.subject?.trim() || null,
        message: body.message.trim(),
    }

    const { error } = await supabase
        .from('messages')
        .insert(messageData)

    if (error) {
        throw createError({ statusCode: 500, message: 'Failed to save message' })
    }

    // Send notification email to admin (non-blocking)
    if (config.adminEmail && config.smtpUser) {
        const { subject, html } = buildNotificationEmail(
            { ...messageData, created_at: new Date().toISOString() },
            config.public.siteUrl,
        )
        sendMail({
            to: config.adminEmail,
            subject,
            html,
            replyTo: messageData.email,
        }).catch((err) => {
            console.error('Failed to send notification email:', err)
        })
    }

    return { success: true }
})
