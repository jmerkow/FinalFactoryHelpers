import { drawBoxes, } from "./main.js";
import { Blueprint } from "./blueprint.js";
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { polyfillPath2D } from "path2d-polyfill";
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { uploadBlueprint } from './azure-helper.cjs';

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

const handler = async interaction => {
    const blueprintString = interaction.options.getString('blueprint_string');
    if (!blueprintString) {
        await interaction.reply({ content: 'you must supply a blueprint string', ephemeral: true });
    }

    const canvas = createCanvas(500,500);
    const blueprint = Blueprint.create(blueprintString);
    await drawBoxes(canvas, blueprint);

    const img = new AttachmentBuilder(canvas.toBuffer())
        .setName("image.png");

    const link = await uploadBlueprint(blueprint.serialize());

    console.log(link);

    const response = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Some blueprint')
        .setImage('attachment://image.png')

    const button = new ButtonBuilder()
        .setLabel('view blueprint')
        .setURL(link)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
        .addComponents(button);

    await interaction.reply({ embeds: [response], files: [img], components: [row] });
}


const command = new SlashCommandBuilder()
    .setName('bp')
    .setDescription('Render blueprint string')
    .addStringOption(option => option.setName("blueprint_string").setDescription("blueprint to render").setRequired(true));

export { command, handler }