module.exports = {
	name: 'ping',
	description: 'Ping!',
	commandOptions: null,
	global: false,
	run: async (interaction, client) => {
		
		client.api.interactions(interaction.id, interaction.token).callback.post({data: {
			type: 4,
			data: {
					content: `:ping_pong: Pong: ${client.ws.ping}ms!`
				}
			}
		})
	},
};