const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.once('ready', async () => {
  console.log(`\nLogged in as ${client.user.tag}\n`)
  client.user.setActivity(`Awesome Slashhandler by Tierbyte :3`, { type: "WATCHING" })
    .then((presense) => console.log(`Setted presence: ${presense.activities[0]}\n`))
    .catch(console.error);

  try {
    fs.readdirSync('./commands').forEach(dir => {
      const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(`./commands/${dir}/${file}`);
        client.api.applications(client.user.id).guilds(config.guildID).commands.post({
          data: {
            name: command.name,
            description: command.description,
            options: command.commandOptions
          }
        })
        if (command.global == true) {
          client.api.applications(client.user.id).commands.post({
            data: {
              name: command.name,
              description: command.description,
              options: command.commandOptions
            }
          })
        }

        client.commands.set(command.name, command);
        console.log(`Posted ${command.name} from ${file} (${command.global ? "global" : "guild"})`)
      }
      console.log("")
    })
  } catch (error) { console.log(error) }
  let cmdArrGlobal = await client.api.applications(client.user.id).commands.get()
  let cmdArrGuild = await client.api.applications(client.user.id).guilds(config.guildID).commands.get()
  cmdArrGlobal.forEach(element => {
    console.log("Globalcommand loaded: " + element.name + " (" + element.id + ")")
  });
  console.log("")
  cmdArrGuild.forEach(element => {
    console.log("Guildcommand loaded: " + element.name + " (" + element.id + ")")
  });
  console.log("")
});


client.ws.on('INTERACTION_CREATE', async interaction => {

  if (!client.commands.has(interaction.data.name)) return;

  try {
    client.commands.get(interaction.data.name).run(interaction, client);
  } catch (error) {
    console.log(`Error from command ${interaction.data.name} in ${interaction.guild_id}: ${error.message}`);
    console.log(`${error.stack}\n`)
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: `Sorry, there was an error executing that command: ${error}`
        }
      }
    })
  }

})

client.login(config.token);
