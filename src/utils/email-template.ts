export function getEmailTemplate(title: string, content: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0c0c0c; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e5e5e5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0c0c;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #1e1e1e; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #1e1e1e; padding: 30px 40px; border-bottom: 1px solid #333333;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                                    Mechanic <span style="color: #84cc16;">Driver</span>
                                </h1>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 40px; line-height: 1.6;">
                                <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 20px; color: #ffffff;">${title}</h2>
                                ${content}
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #151515; padding: 20px 40px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #333333;">
                                <p style="margin: 0;">&copy; ${new Date().getFullYear()} Mechanic Driver. All rights reserved.</p>
                                <p style="margin: 5px 0 0;">This is an automated notification.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
}

export function generateKeyValue(label: string, value: string) {
    return `
    <div style="margin-bottom: 8px;">
        <span style="color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${label}</span><br/>
        <span style="color: #ffffff; font-size: 15px; font-weight: 500;">${value}</span>
    </div>
    `
}

export function generateSection(title: string) {
    return `
    <h3 style="color: #84cc16; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 15px; padding-bottom: 8px; border-bottom: 1px solid #333333;">${title}</h3>
    `
}

export function generateReceiptTable(items: { description: string; amount: number }[], total: number) {
    const rows = items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #e5e5e5;">${item.description}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; text-align: right; color: #ffffff; font-weight: 500;">₦${item.amount.toLocaleString()}</td>
        </tr>
    `).join('')

    return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
        <thead>
            <tr>
                <th align="left" style="padding-bottom: 12px; border-bottom: 2px solid #84cc16; color: #84cc16; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Description</th>
                <th align="right" style="padding-bottom: 12px; border-bottom: 2px solid #84cc16; color: #84cc16; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
            <tr>
                <td style="padding-top: 20px; font-weight: bold; color: #ffffff; font-size: 16px;">Total</td>
                <td style="padding-top: 20px; text-align: right; font-weight: bold; color: #84cc16; font-size: 20px;">₦${total.toLocaleString()}</td>
            </tr>
        </tbody>
    </table>
    `
}

export function generateCTAButton(text: string, url: string) {
    return `
    <div style="margin-top: 30px; text-align: center;">
        <a href="${url}" style="display: inline-block; background-color: #84cc16; color: #000000; font-weight: 700; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(132, 204, 22, 0.3);">
            ${text}
        </a>
    </div>
    `
}
