require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, SlashCommandBuilder, Events, WebhookClient } = require('discord.js');
const { REST, Routes } = require('discord.js');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// 🔐 ID-ul tău (doar tu poți da premium)
const OWNER_ID = '1386627461197987841';

// 🧠 Lista userilor cu acces premium (temporar în RAM)
const premiumUsers = new Set();

// 🪝 Webhook pentru loguri
const webhook = new WebhookClient({ url: WEBHOOK_URL });

// 🧩 Clientul botului
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

// 🔧 Înregistrăm comenzile global (merg oriunde)
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
        .setDescription('Dă acces premium unui user (doar pentru owner)')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID-ul userului căruia vrei să-i dai premium')
                .setRequired(true))
]
.map(cmd => cmd.toJSON());

// 🚀 Înregistrăm comenzile global
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('⏳ Înregistrăm comenzile slash...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comenzi înregistrate global!');
    } catch (error) {
        console.error(error);
    }
})();

// 📦 Funcție de log pe webhook
async function logToWebhook(user, command, messageContent) {
    const embed = new EmbedBuilder()
        .setColor('#ffff00')
        .setTitle('📩 Command Log')
        .setDescription(`👤 **User:** ${user.tag} (${user.id})\n💬 **Command:** /${command}\n📝 **Message:**\n${messageContent}`)
        .setTimestamp();

    try {
        await webhook.send({ embeds: [embed] });
    } catch (err) {
        console.error('❌ Eroare trimitere webhook:', err);
    }
}

// 🧠 Răspuns la comenzi
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
            await logToWebhook(user, 'custommessage (NO ACCESS)', '❌ Tried without premium');
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
        await logToWebhook(user, 'spooki-message', '🎃 Sent Spooky Message');
    }

    // 🔒 /give-premium-acces
    if (commandName === 'give-premium-acces') {
        if (user.id !== OWNER_ID) {
            await interaction.reply({ content: '🚫 You do not have permission to use this command.', ephemeral: true });
            await logToWebhook(user, 'give-premium-acces (NO PERM)', '❌ Tried without owner permission');
            return;
        }
        const targetId = options.getString('userid');
        premiumUsers.add(targetId);
        await interaction.reply({ content: `✅ Premium access granted to <@${targetId}>!` });
        await logToWebhook(user, 'give-premium-acces', `Gave premium to user ID: ${targetId}`);
    }
});

client.once('ready', () => {
    console.log(`✅ Bot online ca ${client.user.tag}`);
});

client.login(TOKEN);
