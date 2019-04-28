const Discord = require('discord.js');

const client = new Discord.Client();
const config = require('./config.json');

const captainRoleId = '571729215758794763';
const playerRoleId = '565517370509230100';

const teamsChannelCategory = '565519532483936308'

const roleChannelId = '571726631668809728'; //Channel de debug
//const roleChannelId = '568482301000941608'; //Channel de role

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

function alreadyHasTeam(member) {
	return member.roles.find(x => x.id === captainRoleId || x.id === playerRoleId);
}

function doesTeamExist(name, msg) {
	return msg.guild.roles.find(x => x.name === name);
}

function isTeamFull(name) {
	return false;
}

function joinTeam(name, msg) {
	msg.member.addRoles([role, playerRoleId])
		.then(member => {
			console.log(`Player ${member.user.username} successfully joined team ${name}.`)
		})
		.catch(console.error);
}

client.on('ready', () => {
	console.log(`LEL Bot launched with ${client.users.size} users in ${client.channels.size} channels.`);
	client.user.setActivity('PepS has big booty');
});

client.on('message', msg => {

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

		if (!args[0])
			return msg.reply("Merci de préciser le nom de ton équipe.");
		else if (alreadyHasTeam(msg.member))
			return msg.reply("Tu fais déjà partie d'une équipe.");
		//check form

		createTeam(args[0], msg);

	} else if (command === 'joueur') {

		if (!args[0])
			return msg.reply("Merci de préciser le nom de ton équipe.");
		else if (!doesTeamExist(args[0], msg))
			return msg.reply("L'équipe que tu essaies de rejoindre n'existe pas.");
		else if (isTeamFull(args[0]))
			return msg.reply("L'équipe que tu essaies de rejoindre est complète.");


	} else {
		return msg.reply("Commande inconnue. Merci d'utiliser !capitaine ou !joueur.");
	}

});

client.login(config.token);