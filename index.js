// ===============================
// BOT FAC RP - SET + PARCERIA
// ===============================

const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,

    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,

    SlashCommandBuilder,
    REST,
    Routes,

    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

// ===============================
// CONFIG
// ===============================

const TOKEN = 'const TOKEN = process.env.TOKEN;';
const CLIENT_ID = '1507961405545119814';
const GUILD_ID = '1505576877505646702';

const CANAL_SET = '1505576877517967423';
const CANAL_PARCERIA = '1505576878541635651';

const CARGO_STAFF = '1505576877505646711';

// ===============================
// CLIENT
// ===============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],

    partials: [Partials.Channel]
});

// ===============================
// COMANDO /PARCERIA
// ===============================

const commands = [

    new SlashCommandBuilder()

    .setName('parceria')
    .setDescription('Enviar parceria')

    .addStringOption(option =>
        option
        .setName('localizacao')
        .setDescription('Localização da fac')
        .setRequired(true)
    )

    .addStringOption(option =>
        option
        .setName('familia')
        .setDescription('Nome da família')
        .setRequired(true)
    )

    .addAttachmentOption(option =>
        option
        .setName('foto')
        .setDescription('Foto da fac')
        .setRequired(true)
    )

].map(command => command.toJSON());

// ===============================
// REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {

    try {

        console.log('Registrando comandos...');

        await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),

            { body: commands }
        );

        console.log('Comandos registrados.');

    } catch (error) {
        console.log(error);
    }

})();

// ===============================
// BOT ONLINE
// ===============================

client.once(Events.ClientReady, () => {

    console.log(`Bot online: ${client.user.tag}`);

});

// ===============================
// MEMBRO ENTROU
// ===============================

client.on(Events.GuildMemberAdd, async member => {

    const canal = member.guild.channels.cache.get(CANAL_SET);

    if (!canal) return;

    const embed = new EmbedBuilder()

    .setTitle('📌 SOLICITAR SET')

    .setDescription(

        `Bem-vindo ${member}\n\n` +
        `Clique no botão abaixo para solicitar sua setagem.`

    )

    .setColor('DarkRed');

    const row = new ActionRowBuilder()

    .addComponents(

        new ButtonBuilder()

        .setCustomId('solicitar_set')

        .setLabel('SOLICITAR SET')

        .setStyle(ButtonStyle.Danger)

    );

    canal.send({
        embeds: [embed],
        components: [row]
    });

});

// ===============================
// INTERAÇÕES
// ===============================

client.on(Events.InteractionCreate, async interaction => {

    // ===========================
    // BOTÃO SOLICITAR SET
    // ===========================

    if (interaction.isButton()) {

        if (interaction.customId === 'solicitar_set') {

            const canal = await interaction.guild.channels.create({

                name: `set-${interaction.user.username}`,

                type: ChannelType.GuildText,

                permissionOverwrites: [

                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },

                    {
                        id: interaction.user.id,

                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages
                        ]
                    },

                    {
                        id: CARGO_STAFF,

                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages
                        ]
                    }

                ]

            });

            const embed = new EmbedBuilder()

            .setTitle('📌 NOVA SOLICITAÇÃO')

            .setDescription(

                `Usuário: ${interaction.user}\n\n` +
                `Aguardando aprovação da staff.`

            )

            .setColor('Red');

            canal.send({

                content: `<@&${CARGO_STAFF}>`,
                embeds: [embed]

            });

            interaction.reply({

                content: `✅ Ticket criado: ${canal}`,
                ephemeral: true

            });

        }

    }

    // ===========================
    // COMANDO /PARCERIA
    // ===========================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'parceria') {

            const localizacao =
            interaction.options.getString('localizacao');

            const familia =
            interaction.options.getString('familia');

            const foto =
            interaction.options.getAttachment('foto');

            const canal =
            interaction.guild.channels.cache.get(CANAL_PARCERIA);

            if (!canal) {

                return interaction.reply({

                    content: '❌ Canal de parceria não encontrado.',
                    ephemeral: true

                });

            }

            const embed = new EmbedBuilder()

            .setTitle('🤝 NOVA PARCERIA')

            .addFields(

                {
                    name: '📍 Localização',
                    value: localizacao
                },

                {
                    name: '👥 Família',
                    value: familia
                }

            )

            .setImage(foto.url)

            .setColor('DarkRed')

            .setFooter({

                text: `Parceria enviada por ${interaction.user.username}`

            });

            canal.send({
                embeds: [embed]
            });

            interaction.reply({

                content: '✅ Parceria enviada.',
                ephemeral: true

            });

        }

    }

});

// ===============================
// LOGIN
// ===============================

client.login(TOKEN);
