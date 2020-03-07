/*
 * Gabe Dunn 2020
 * Process file for the command listener
 */

import { Client, DMChannel, GuildMember, Message, PartialMessage, TextChannel } from 'discord.js'
import { ConfigInterface } from '../types/interfaces/ConfigInterface'
import { log } from '../utils/log'
import { ProcessInterface } from '../types/interfaces/ProcessInterface'
import { InsufficientPermissionsError } from '../types/errors/InsufficientPermissionsError'
import { SubmodulesInterface } from '../types/interfaces/SubmodulesInterface'

export const commandListener: ProcessInterface = {
    name: 'CommandListener',
    init (client: Client, config: ConfigInterface, sub:Partial<SubmodulesInterface>) {
        client.on('message', async message => {
            if (['text', 'dm'].some(channelType => message.channel.type == channelType) && message.content[0] == config.prefix) {
                // Separate the entire command after the prefix into args.
                const args = message.content.substr(1).split(' ')

                // Set the command to the first argument and remove it from the args array.
                const commandName = args.shift()

                // If the command exists, test for permissions and run the command function.
                if (Object.prototype.hasOwnProperty.call(commands, commandName)) {
                    // Save the command to a variable.
                    const command = commands[commandName]

                    // If the message was a DM, populate the member field
                    // if (message.channel.type == 'dm') {
                    //     message.member = ''
                    // }

                    // Test that the users has the proper permissions to run the command.
                    if (!sub.utils.hasPermissions(message.member, command.permissions)) {
                        // Run the command.
                        command.exec(message, args, message.channel, message.member, client, config)
                    } else {
                        throw new InsufficientPermissionsError(`Insufficient permissions to run command (@${message.member.user.tag}:${commandName})`, 'CommandListener')
                    }
                }
            }
        })
    }
}

const commands = {
    test: {
        name: 'Test Command',
        aliases: ['test'],
        category: 'utils',
        description: 'Test command',
        permissions: ['ADMINISTRATOR'],
        exec (message: Message | PartialMessage, args: string[], channel: TextChannel | DMChannel, member: GuildMember, client: Client, config: ConfigInterface) {
            log('Test', `Test Message: ${args.join(' ')}`)
        }
    }
}
