import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
})

export async function sendEmail({
    to,
    subject,
    html
}: {
    to: string
    subject: string
    html: string
}) {
    // In development without creds, log instead of failing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.log('EMAIL_CONFIG_MISSING: Mock Sending:', { to, subject, html })
        return { success: true, mock: true }
    }

    try {
        const info = await transporter.sendMail({
            from: '"MechanicDriver" <no-reply@mechanicdriver.com>',
            to,
            subject,
            html,
            replyTo: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com'
        })
        console.log('Email sent:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error: any) {
        console.error('Email send failed:', error)
        return { success: false, error: error.message }
    }
}
