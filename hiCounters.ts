import type {
	Bot,
	Message,
} from "https://deno.land/x/discordeno@13.0.0-rc45/mod.ts";

interface CounterData {
	count: number;
	counterMessage: bigint;
	lastUser: bigint | null;
	bot: Bot;
}

const createdCounters = new Map<bigint, CounterData>();

export async function onMessage(message: Message) {
	const counterData = createdCounters.get(message.channelId);
	if (!counterData) return;

	let needsUpdate = false;
	if (
		message.content == "hi" &&
		(!counterData.lastUser || message.authorId != counterData.lastUser)
	) {
		counterData.count++;
		counterData.lastUser = message.authorId;
		needsUpdate = true;
	} else if (counterData.count > 0) {
		counterData.count = 0;
		needsUpdate = true;
	}

	if (needsUpdate) {
		await counterData.bot.helpers.editMessage(
			message.channelId,
			counterData.counterMessage,
			{
				content: String(counterData.count),
			},
		);
	}
}

export async function createCounter(bot: Bot, channelId: bigint) {
	const message = await bot.helpers.sendMessage(channelId, {
		content: "0",
	});
	createdCounters.set(channelId, {
		count: 0,
		counterMessage: message.id,
		bot,
		lastUser: null,
	});
}
