import { createClient } from '@supabase/supabase-js'

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

    const { error } = await supabase
        .from('messages')
        .insert({
            name: body.name.trim(),
            email: body.email.trim(),
            subject: body.subject?.trim() || null,
            message: body.message.trim(),
        })

    if (error) {
        throw createError({ statusCode: 500, message: 'Failed to save message' })
    }

    return { success: true }
})
