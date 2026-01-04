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
                                    Mechanic<span style="color: #84cc16;">Driver</span>
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
