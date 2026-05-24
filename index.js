// ===============================
// BOT FAC RP - SISTEMA COMPLETO
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
    PermissionFlagsBits,

    ModalBuilder,
    TextInputBuilder,
    TextInputStyle

} = require('discord.js');

// ===============================
// CONFIG
// ===============================

const TOKEN = process.env.TOKEN;

const CLIENT_ID = '1507961405545119814';
const GUILD_ID = '1505576877505646702';

const CARGO_STAFF = '1505576877505646711';

// COLOCA OS IDS REAIS
const CARGO_SEM_CARGO = '1505576877505646703';
const CARGO_MEMBRO = '1505576877505646707';

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
// COMANDOS
// ===============================

const commands = [

    new SlashCommandBuilder()

    .setName('set')

    .setDescription('Enviar painel de set'),

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

    try {

        await member.roles.add(CARGO_SEM_CARGO);

        console.log(`${member.user.tag} recebeu SEM CARGO`);

    } catch (err) {

        console.log(err);

    }

});

// ===============================
// INTERAÇÕES
// ===============================

client.on(Events.InteractionCreate, async interaction => {

    // ===========================
    // COMANDO /SET
    // ===========================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'set') {

            const embed = new EmbedBuilder()

            .setTitle('📌 SOLICITAR SET')

            .setDescription(

                `Clique no botão abaixo para solicitar sua setagem.\n\n` +
                `Preencha corretamente as informações.`

            )

            .setColor('DarkRed');

            const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                .setCustomId('solicitar_set')

                .setLabel('SOLICITAR SET')

                .setStyle(ButtonStyle.Danger)

            );

            await interaction.channel.send({

                embeds: [embed],
                components: [row]

            });

            return interaction.reply({

                content: '✅ Painel enviado.',
                ephemeral: true

            });

        }

    }

    // ===========================
    // BOTÕES
    // ===========================

    if (interaction.isButton()) {

        // =======================
        // SOLICITAR SET
        // =======================

        if (interaction.customId === 'solicitar_set') {

            const modal = new ModalBuilder()

            .setCustomId('modal_set')

            .setTitle('Solicitação de Set');

            const nomeInput = new TextInputBuilder()

            .setCustomId('nome_jogo')

            .setLabel('Nome no jogo')

            .setStyle(TextInputStyle.Short)

            .setRequired(true);

            const idInput = new TextInputBuilder()

            .setCustomId('id_jogo')

            .setLabel('ID do jogo')

            .setStyle(TextInputStyle.Short)

            .setRequired(true);

            const row1 =
            new ActionRowBuilder().addComponents(nomeInput);

            const row2 =
            new ActionRowBuilder().addComponents(idInput);

            modal.addComponents(row1, row2);

            return await interaction.showModal(modal);

        }

        // =======================
        // APROVAR
        // =======================

        if (interaction.customId.startsWith('aprovar_')) {

            const userId =
            interaction.customId.split('_')[1];

            const membro =
            await interaction.guild.members.fetch(userId);

            await membro.roles.remove(CARGO_SEM_CARGO);

            await membro.roles.add(CARGO_MEMBRO);

            await interaction.reply({

                content:
                `✅ ${membro} foi aprovado e liberado.`

            });

        }

    }

    // ===========================
    // MODAL
    // ===========================

    if (interaction.isModalSubmit()) {

        if (interaction.customId === 'modal_set') {

            const nome =
            interaction.fields.getTextInputValue('nome_jogo');

            const id =
            interaction.fields.getTextInputValue('id_jogo');

            const canal =
            await interaction.guild.channels.create({

                name: `set-${interaction.user.username}`,

                type: ChannelType.GuildText,

                permissionOverwrites: [

                    {
                        id: interaction.guild.id,

                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
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

            .addFields(

                {
                    name: '👤 Nome no jogo',
                    value: nome
                },

                {
                    name: '🆔 ID do jogo',
                    value: id
                }

            )

            .setColor('Red');

            const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                .setCustomId(`aprovar_${interaction.user.id}`)

                .setLabel('APROVAR')

                .setStyle(ButtonStyle.Success)

            );

            canal.send({

                content: `<@&${CARGO_STAFF}>`,

                embeds: [embed],

                components: [row]

            });

            interaction.reply({

                content:
                `✅ Solicitação enviada para staff.`,

                ephemeral: true

            });

        }

    }

});

// ===============================
// LOGIN
// ===============================

client.login(TOKEN);
