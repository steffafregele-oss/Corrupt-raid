const { Client, GatewayIntentBits, Partials, EmbedBuilder, SlashCommandBuilder, Events, WebhookClient } = require('discord.js');
const { REST, Routes } = require('discord.js');
const TOKEN = 'PUNE_TOKENUL_TAU_AICI';
const CLIENT_ID = 'PUNE_CLIENT_ID_AICI';
const WEBHOOK_URL = 'PUNE_WEBHOOK_UL_TAU_AICI'; // 🔗 Webhook unde se trimit logurile

// 🔐 Doar cine are ID-ul de mai jos poate da premium
const OWNER_ID = '1386627461197987841';

// 🧠 Lista userilor cu acces premium
const premiumUsers = new Set();

// 🪝 Clientul webhookului
const webhook = new WebhookClient({ url: WEBHOOK_URL });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Channel]
});

// === Înregistrăm comenzile ===
const commands = [
    new SlashCommandBuilder()
        .setName('a-message')
        .setDescription('Trimite mesajul public de prezentare'),

    new SlashCommandBuilder()
        .setName('custommessage')
        .setDescription('Trimite un mesaj personalizat (premium only)')
        .addStringOption(option =>
            option.setName('mesaj')
                .setDescription('Mesajul pe care vrei să-l trimită botul')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('spooki-message')
        .setDescription('Trimite mesajul special de Halloween'),

    new SlashCommandBuilder()
        .setName('give-premium-acces')
        .setDescription('Dă acces premium unui user (privat)')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID-ul userului căruia vrei să-i dai acces premium')
                .setRequired(true))
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('⏳ Înregistrăm comenzile...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comenzi înregistrate cu succes!');
    } catch (error) {
        console.error(error);
    }
})();

// === Funcție pentru log pe webhook ===
async function logToWebhook(user, command, messageContent) {
    const logEmbed = new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle('📩 Command Log')
        .setDescription(`**User:** ${user.tag} (${user.id})\n**Command:** /${command}\n**Message Sent:**\n${messageContent}`)
        .setTimestamp();

    try {
        await webhook.send({ embeds: [logEmbed] });
    } catch (err) {
        console.error('❌ Eroare trimitere webhook:', err);
    }
}

// === Când o comandă e folosită ===
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user, options } = interaction;

    // 🟢 /a-message
    if (commandName === 'a-message') {
        const mesaj = "_ _\n> **- 🦴 3 OP GENERATORS,\n> - 🌐 HAVE OWN SITE,\n> - 🧠 OP METHODS,\n> - 👀 !STATS BOT\n> - 🫆 MANAGE UR OWN SITE/DASHBOARD,\n> - 🗒️ USERNAME & PASSWORD,\n> - 🔒 ACCOUNT STATUS,\n> - 🚀 FAST LOGIN SPEED\n> - 📷 FULL TUTORIALS ON HOW TO BEAM**\n━━━━━━━━━━━━┓\n https://discord.gg/JgckfuuJg\n━━━━━━━━━━━━┛\n@everyone";
        await interaction.reply({ content: mesaj });

        await logToWebhook(user, 'a-message', mesaj);
    }

    // 🟡 /custommessage
    if (commandName === 'custommessage') {
        const mesaj = options.getString('mesaj');

        if (!premiumUsers.has(user.id)) {
            await interaction.reply({ content: '❌ You need premium to use this command.', ephemeral: true });
            await logToWebhook(user, 'custommessage (NO ACCESS)', '❌ Attempted without premium.');
            return;
        }

        await interaction.reply({ content: mesaj });
        await logToWebhook(user, 'custommessage', mesaj);
    }

    // 🎃 /spooki-message
    if (commandName === 'spooki-message') {
        const embed = new EmbedBuilder()
            .setColor('#ff6600')
            .setTitle('—HAPPY HALLOWEEN—')
            .setDescription('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_5SOFKI-axkCGp5AfBKTa9eW-zoHhjUZ4Z1v2eH1rg&')
            .setImage('https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/662817914f69f7001de7c721.png')
            .setFooter({ text: '—SPOOKY— 🎃' });

        await interaction.reply({ embeds: [embed] });
        await logToWebhook(user, 'spooki-message', '🎃 Sent Spooky Halloween Message');
    }

    // 🔒 /give-premium-acces
    if (commandName === 'give-premium-acces') {
        if (user.id !== OWNER_ID) {
            await interaction.reply({ content: '🚫 You do not have permission to use this command.', ephemeral: true });
            await logToWebhook(user, 'give-premium-acces (NO PERM)', '❌ Tried to use without permission.');
            return;
        }

        const targetId = options.getString('userid');
        premiumUsers.add(targetId);

        await interaction.reply({ content: `✅ Premium access granted to <@${targetId}>!` });
        await logToWebhook(user, 'give-premium-acces', `Granted premium to user ID: ${targetId}`);
    }
});

client.login(TOKEN);
