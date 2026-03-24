require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// --- EXRESS CONFIGURATION ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup with SQLite
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: '.'
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS in production
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// --- DISCORD OAUTH2 ROUTES ---
const OAUTH_AUTHORIZE_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;

app.get('/auth/discord', (req, res) => {
    res.redirect(OAUTH_AUTHORIZE_URL);
});

app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('No code provided');

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

        // Get user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        // Save session
        req.session.userId = userData.id;
        req.session.username = userData.username;
        req.session.avatar = userData.avatar;

        res.redirect('/whitelist.html');
    } catch (error) {
        console.error('OAuth2 Error:', error);
        res.status(500).send('Authentication failed');
    }
});

// Helper route for frontend to check login status
app.get('/api/user', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, userId: req.session.userId, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Middleware to protect API routes
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

// --- API ROUTES ---
app.post('/api/submit-visado', isAuthenticated, async (req, res) => {
    try {
        const { oocName, oocAge, fivemName, experience, icName, icAge, icPath, icStory } = req.body;
        const userId = req.session.userId;

        // Verify Bot is ready
        if (!client.isReady()) {
            return res.status(500).json({ error: 'Discord bot is not ready' });
        }

        let channel = client.channels.cache.get(process.env.STAFF_CHANNEL_ID);
        if (!channel) {
            try {
                channel = await client.channels.fetch(process.env.STAFF_CHANNEL_ID);
            } catch (err) {
                console.error('Error fetching channel from Discord API:', err);
            }
        }
        
        if (!channel) {
            console.error('Staff channel not found!');
            return res.status(500).json({ error: 'Staff channel not configured correctly or bot lacks access permissions' });
        }

        const embed = new EmbedBuilder()
            .setTitle('🛂 NEW DIGITAL VISA - BORDER CONTROL ID')
            .setColor('#E63946')
            .addFields(
                { name: "Real Name (OOC)", value: oocName || 'N/A', inline: true },
                { name: "Real Age (OOC)", value: oocAge || 'N/A', inline: true },
                { name: "Discord/FiveM Name", value: fivemName || 'N/A', inline: true },
                { name: "Experience", value: experience || 'N/A', inline: true },
                { name: "RP Identity", value: icName || 'N/A', inline: true },
                { name: "Declared Age (IC)", value: icAge || 'N/A', inline: true },
                { name: "Path (Legal/Illegal)", value: icPath || 'N/A', inline: true },
                { name: "Discord Username", value: `<@${userId}> (${req.session.username})`, inline: false },
                { name: "Background Dossier", value: icStory || 'N/A' }
            )
            .setFooter({ text: 'Abrams RP Kiosk - Automated Biometric System' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${userId}`)
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_${userId}`)
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
            );

        await channel.send({ embeds: [embed], components: [row] });

        res.json({ success: true, message: 'Visado submitted successfully' });

    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Internal server error while processing visado' });
    }
});


// --- DISCORD BOT ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

client.once('ready', () => {
    console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    // Acknowledge interaction quickly to prevent timeout
    await interaction.deferUpdate();

    const staffId = interaction.user.id;
    const customId = interaction.customId; // approve_12345 or reject_12345
    const action = customId.split('_')[0];
    const targetUserId = customId.split('_')[1];

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) throw new Error('Guild not found');

        let member;
        try {
            member = await guild.members.fetch(targetUserId);
        } catch (err) {
            console.log(`Could not fetch member ${targetUserId}, might have left.`);
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        if (action === 'approve') {
            if (member) {
                const role = guild.roles.cache.get(process.env.ROLE_WHITELIST_ID);
                if (role) {
                    await member.roles.add(role);
                } else {
                    console.error('Role to assign not found!');
                }
                // Send DM
                try {
                    await member.send(`🎉 Congratulations! Your visa for Abrams RP has been **Approved**. You can now access the Discord server and proceed to the waiting room for your Whitelist interview.`);
                } catch (dmError) {
                    console.log(`Could not send DM to ${targetUserId}. DMs are closed.`);
                }
            }
            
            // Update message
            embed.setColor('#2ECC71'); // Green
            embed.spliceFields(
                embed.data.fields.length, 0,
                { name: "📝 STATUS", value: `✅ Approved by <@${staffId}>` }
            );

            await interaction.message.edit({ embeds: [embed], components: [] });

        } else if (action === 'reject') {
            
            if (member) {
                // Send DM
                try {
                    await member.send(`❌ Your visa for Abrams RP has been **Rejected**. If you have any questions, please open a ticket on the server.`);
                } catch (dmError) {
                    console.log(`Could not send DM to ${targetUserId}. DMs are closed.`);
                }
            }

            // Update message
            embed.setColor('#E74C3C'); // Red
            embed.spliceFields(
                embed.data.fields.length, 0,
                { name: "📝 STATUS", value: `❌ Rejected by <@${staffId}>` }
            );

            await interaction.message.edit({ embeds: [embed], components: [] });
        }
    } catch (error) {
        console.error('Error handling button interaction:', error);
    }
});


// --- START APPLICATION ---
app.listen(port, () => {
    console.log(`🌐 API Server listening at http://localhost:${port}`);
    // Start bot only after web server is up
    client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
        console.error("Failed to login to Discord Bot:", err);
    });
});
