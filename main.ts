import {
	createBot,
	Intents,
	InteractionResponseTypes,
	startBot,
} from "https://deno.land/x/discordeno@13.0.0-rc45/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { createCounter, onMessage } from "./hiCounters.ts";

const token = Deno.env.get("DISCORD_TOKEN");
if (!token) {
	throw new Error("Make sure the DISCORD_TOKEN environment variable is set");
}
const appIdStr = Deno.env.get("DISCORD_APPLICATION_ID");
if (!appIdStr) {
	throw new Error(
		"Make sure the DISCORD_APPLICATION_ID environment variable is set",
	);
}
const appId = BigInt(appIdStr);

const bot = createBot({
	token,
	intents: Intents.Guilds | Intents.GuildMessages,

	applicationId: appId,
	events: {
		ready() {
			console.log("Successfully connected to gateway");
		},
		async messageCreate(bot, message) {
			if (
				message.isBot && message.applicationId == appId &&
				message.content == "Done."
			) {
				await bot.helpers.deleteMessage(message.channelId, message.id);
			} else {
				const messageWithContent = await bot.helpers.getMessage(
					message.channelId,
					message.id,
				);
				onMessage(messageWithContent);
			}
		},
		async interactionCreate(bot, interaction) {
			if (interaction.data?.name == "createhicounter") {
				if (interaction.channelId) {
					createCounter(bot, interaction.channelId);
				}
				await bot.helpers.sendInteractionResponse(
					interaction.id,
					interaction.token,
					{
						type: InteractionResponseTypes.ChannelMessageWithSource,
						data: {
							content: "Done.",
						},
					},
				);
			}
		},
	},
});

// bot.rest.debug = console.log;s

await startBot(bot);
