const { MessageEmbed } = require("discord.js");

module.exports = async(client, msg, suffix) => {
	// Check if user exists
	let user = msg.mentions.users.first() ? msg.mentions.users.first() : await client.users.fetch(suffix);
	if (!user) return msg.reply("How am I supposed to look up non existant user?!");

	// Get all the needed information
	let dmChannel = await user.createDM().catch(e => null);
	let dmNumber;
	if (dmChannel) dmNumber = (await r.table("Numbers").filter({ channel: dmChannel.id }))[0];
	const strikes = await r.table("Strikes").filter({ offender: user.id });
	let account = await r.table("Accounts").get(user.id).default(null);
	let blacklisted = await r.table("Blacklist").get(suffix);

	if (!account) {
		account = { id: user.id, balance: 0 };
		await r.table("Accounts").insert(account);
	}

	// Inform the CS
	const embed = new MessageEmbed()
		.setColor(config.colors.info)
		.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
		.addField("Blacklisted", blacklisted ? "True" : "False", true)
		.addField("DM number", `\`${dmNumber ? dmNumber.id : "None"}\``, true)
		.addField("Balance", `¥${account.balance}`, true)
		.addField(strikes.length ? `Strikes (${strikes.length})` : "Strikes", strikes.length ? (await strikes.map(s => `Strike by ${s.creator} (${client.users.fetch(s.creator) ? client.users.get(s.creator).tag : "-"})\n${s.reason}`)).join("\n") : "None")
		.setFooter("Use >permcheck to check their permission, >strikes for more information.");

	msg.channel.send({ embed: embed });
};
