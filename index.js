const Discord = require('discord.js');

const {google} = require('googleapis');

const client = new Discord.Client();
const config = require('./config.json');


const captainRoleId = '571729215758794763';
const playerRoleId = '565517370509230100';

const teamsChannelCategory = '565519532483936308';


const spreadsheetId = '1F73VtNylV9xaKhAFJEoHmcjkG07QKB14RaalgVvEhD4'; //Id of the Google Spreedsheet connected to the team names' Google Form
const spreadsheetRange = 'B2:B'; //Spreedsheet's range to get all the Team Names

const sheets = google.sheets({
	version: 'v4',
	auth: config.sheetsApiKey
});


if (config.debug)
	var roleChannelId = '571726631668809728'; //Debug Channel
else
	var roleChannelId = '568482301000941608'; //Role Channel



async function getTeamNames() {
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: spreadsheetRange
	});
	return res.data
}

function createTeam(name, msg) {
	msg.guild.createRole({
		name: name,
		color: 'GOLD',
		mentionable: true,
		hoist: true
	})
		.then(role => {
			console.log(`Created new role with name ${role.name} and color ${role.color}`);
			msg.member.addRoles([role, captainRoleId])
				.then(member => {

					console.log(`GuildMember ${member.user.username} successfully registered as a Captain.`);
					msg.react('✅')
						.then(console.log('White Check Mark added.'))
						.catch(console.error);
					
					msg.guild.createChannel(name, 'voice', [{
						id: msg.guild.id,
						deny: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL', 'CONNECT', 'SPEAK']
					}])
						.then(channel => {
							channel.setParent(teamsChannelCategory)
								.then(updated => {

									updated.overwritePermissions(role, {
										'CREATE_INSTANT_INVITE': true,
										'VIEW_CHANNEL': true,
										'CONNECT': true,
										'SPEAK': true
									})
									.then(console.log(`Successfully created the voice channel for the team ${name}.`))
									.catch(console.error);
								})
								.catch(console.error);

						})
						.catch(console.error);
				})
				.catch(console.error);

		})
		.catch(console.error);

}

function joinTeam(name, msg) {
	msg.member.addRoles([msg.guild.roles.find(x => x.name === name), playerRoleId])
		.then(member => {
			console.log(`Player ${member.user.username} successfully joined team ${name}.`)
			msg.react('✅')
				.then(console.log('White Check Mark added.'))
				.catch(console.error);
		})
		.catch(console.error);
}

function updateActivity(nbTeams) {
	client.user.setActivity(`Managing ${nbTeams} Teams registered to LEL`);
}

function alreadyHasTeam(member) {
	return member.roles.find(x => x.id === captainRoleId || x.id === playerRoleId);
}

function doesTeamExist(name, guild) {
	return guild.roles.find(x => x.name === name);
}

function isTeamFull(name, guild) {
	return guild.members.filter(x => x.roles.find(role => role.name === name)).size >= 5;
}

async function executeCmd(msg) {
	if (msg.author.bot || msg.content.indexOf(config.prefix) || roleChannelId !== msg.channel.id)
		return;

	const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (config.debug) {
		if (command === 'clean') {

			msg.channel.fetchMessages({ limit: 10, })
    			.then(messages => {

    				messages.forEach(message => {
    					message.delete();	
	    			});
	    		})
	    		.catch(console.error);

			return;
		}
	}

	if (command === 'capitaine') {

		let teamNames = await getTeamNames();
		console.log(teamNames);

		if (!args[0])
			return msg.reply("merci de préciser le nom de ton équipe.");
		else if (alreadyHasTeam(msg.member))
			return msg.reply("tu fais déjà partie d'une équipe.");

		createTeam(args[0], msg);

	} else if (command === 'joueur') {

		if (!args[0])
			return msg.reply("merci de préciser le nom de ton équipe.");
		else if (alreadyHasTeam(msg.member))
			return msg.reply("tu fais déjà partie d'une équipe.");
		else if (!doesTeamExist(args[0], msg.guild))
			return msg.reply("l'équipe que tu essaies de rejoindre n'existe pas.");
		else if (isTeamFull(args[0], msg.guild))
			return msg.reply("l'équipe que tu essaies de rejoindre est complète.");

		joinTeam(args[0], msg);


	} else {
		return msg.reply("commande inconnue. Merci d'utiliser !capitaine ou !joueur.");
	}
}

client.on('ready', () => {
	console.log(`LEL Bot launched with ${client.users.size} users in ${client.channels.size} channels.`);

	getTeamNames()
		.then(names => {
			updateActivity(names.values.length);
		})
		.catch(console.error);
});

client.on('message', msg => {
	executeCmd(msg)
});

client.login(config.token);