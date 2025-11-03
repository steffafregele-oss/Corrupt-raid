
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const OWNER_ID = '1386627461197987841'; // tu

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

// Premium users
const premiumUsers = new Set();

// Webhook
const { WebhookClient } = require('discord.js');
const webhook = new WebhookClient({ url: WEBHOOK_URL });

// Slash commands
const commands = [
    new SlashCommandBuilder().setName('a-message').setDescription('Trimite mesajul public predefinit'),
    new SlashCommandBuilder()
        .setName('custommessage')
        .setDescription('Trimite mesaj personalizat (premium)')
        .addStringOption(option => option.setName('mesaj').setDescription('Mesajul tău').setRequired(true)),
    new SlashCommandBuilder().setName('spooki-message').setDescription('Mesaj special Halloween'),
    new SlashCommandBuilder()
        .setName('give-premium-access')
        .setDescription('Dă acces premium unui user (doar owner)')
        .addStringOption(option => option.setName('userid').setDescription('ID user').setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('⏳ Înregistrăm comenzile...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comenzi înregistrate!');
    } catch (err) {
        console.error(err);
    }
})();

// Mesaj predefinit
const PREDEFINED_MESSAGE = `
_ _
> **- 🦴 3 OP GENERATORS,
> - 🌐 HAVE OWN SITE,
> - 🧠 OP METHODS,
> - 👀 !STATS BOT
> - 🫆 MANAGE UR OWN SITE/DASHBOARD,
> - 🗒️ USERNAME & PASSWORD,
> - 🔒 ACCOUNT STATUS,
> - 🚀 FAST LOGIN SPEED
> - 📷 FULL TUTORIALS ON HOW TO BEAM**
━━━━━━━━━━━━┓
 https://discord.gg/JgckfuuJg
━━━━━━━━━━━━┛
@everyone
`;

// Interaction
client.on(Events.InteractionCreate, async interaction => {
    // Slash commands
    if (interaction.isChatInputCommand()) {

        // /a-message
        if (interaction.commandName === 'a-message') {
            await sendEmbedWithButton(interaction, PREDEFINED_MESSAGE, 'send_a_message');
        }

        // /custommessage
        if (interaction.commandName === 'custommessage') {
            const userId = interaction.user.id;
            if (!premiumUsers.has(userId)) {
                await interaction.reply({ content: '❌ You need premium to use this command.', ephemeral: true });
                return;
            }
            const msg = interaction.options.getString('mesaj');
            await sendEmbedWithButton(interaction, msg, 'send_custom_message');
        }

        // /spooki-message
        if (interaction.commandName === 'spooki-message') {
            const embed = new EmbedBuilder()
                .setColor('#ff6600')
                .setTitle('—HAPPY HALLOWEEN—')
                .setDescription('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_5SOFKI-axkCGp5AfBKTa9eW-zoHhjUZ4Z1v2eH1rg&')
                .setImage('https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/662817914f69f7001de7c721.png')
                .setFooter({ text: '—SPOOKY— 🎃' });

            await interaction.reply({ embeds: [embed] });
            await logWebhook(interaction.user, '/spooki-message', '🎃 Sent spooky message');
        }

        // /give-premium-access
        if (interaction.commandName === 'give-premium-access') {
            if (interaction.user.id !== OWNER_ID) {
                await interaction.reply({ content: '🚫 You do not have permission to use this command.', ephemeral: true });
                return;
            }
            const targetId = interaction.options.getString('userid');
            premiumUsers.add(targetId);
            await interaction.reply({ content: `✅ Premium access granted to <@${targetId}>!` });
        }
    }

    // Button clicks
    if (interaction.isButton()) {
        let msgToSend = interaction.message.embeds[0]?.description || '';
        await interaction.channel.send(msgToSend);
        await interaction.reply({ content: '✅ Message sent!', ephemeral: true });
        await logWebhook(interaction.user, 'button_click', msgToSend);
    }
});

// Funcție să trimiți embed cu button
async function sendEmbedWithButton(interaction, message, buttonId) {
    const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('💌 Wanna send this message?')
        .setDescription(message);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(buttonId)
            .setLabel('Wanna send this message')
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    await logWebhook(interaction.user, interaction.commandName, message);
}

// Log pe webhook
async function logWebhook(user, command, message) {
    try {
        await webhook.send({
            embeds: [{
                color: 16776960,
                title: '📩 Command Log',
                description: `👤 **User:** ${user.tag} (${user.id})\n💬 **Command:** ${command}\n📝 **Message:**\n${message}`,
                timestamp: new Date()
            }]
        });
    } catch (err) {
        console.error('Webhook error:', err);
    }
}

client.once('ready', () => console.log(`✅ Bot online ca ${client.user.tag}`));
client.login(TOKEN);
