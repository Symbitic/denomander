import Arguments from "./Arguments.ts";
import Command from "./Command.ts";
import Kernel from "./Kernel.ts";
import CustomOption from "./CustomOption.ts";
import { PublicAPI } from "./types/interfaces.ts";
import { CommandOption, VersionType } from "./types/types.ts";

/** The main class */
export default class Denomander extends Kernel implements PublicAPI {
  public lastCommand?: Command;

  /** Parses the args*/
  public parse(args: Array<string>) {
    this.args = new Arguments(args);
    this.args.parse();

    this.run();
  }

  public addOption(...options: Array<CustomOption>): Denomander {
    const command: Command | undefined = this.commands.slice(-1)[0];
    options.map((option: CustomOption) => command.addCustomOption(option));

    return this;
  }

  /** Implements the option command */
  public option(
    value: string,
    description: string,
    callback?: Function,
    defaultValue?: any,
  ): Denomander {
    const command: Command | undefined = this.commands.slice(-1)[0];

    const defaultArgs: CommandOption = {
      flags: value,
      description,
      callback: callback || undefined,
      defaultValue: defaultValue || undefined,
    };

    command.addOption(defaultArgs);

    return this;
  }

  /** Implements the required option command */
  public requiredOption(
    value: string,
    description: string,
    callback?: Function,
  ): Denomander {
    const command: Command | undefined = this.commands.slice(-1)[0];

    if (command) {
      if (callback) {
        command.addOption({
          flags: value,
          description,
          callback,
          isRequired: true,
        });
      } else {
        command.addOption({ flags: value, description, isRequired: true });
      }
    }

    return this;
  }

  /* Implements the base option */
  public baseOption(value: string, description: string): Denomander {
    this.BASE_COMMAND.addOption({
      flags: value,
      description,
    });

    return this;
  }

  public globalOption(value: string, description: string): Denomander {
    this.globalOptions.push({ value, description });

    return this;
  }

  /** Implements the option command */
  public command(
    value: string,
    description?: string,
    action?: Function,
  ): Denomander {
    const new_command: Command = new Command({
      value,
      description,
    });
    this.commands.push(new_command);

    if (action) {
      this.action(action);
    }

    this.lastCommand = new_command;

    return this;
  }

  /** Implements the option command */
  public subCommand(
    value: string,
    description?: string,
    action?: Function,
  ): Denomander {
    if (this.lastCommand) {
      const parentCommand: Command = this.lastCommand;
      const new_command: Command = new Command({
        value,
        description,
        subCommand: { parent: parentCommand },
      });
      this.commands.push(new_command);

      if (action) {
        this.action(action);
      }
    }

    return this;
  }

  /** Implements the description of the previous mentioned command (by the user) */
  public description(description: string): Denomander {
    const command: Command = this.commands.slice(-1)[0];

    if (command) {
      command.description = description;
    }

    return this;
  }

  /** Implements the action of a command registered by the user */
  public action(callback: Function): Denomander {
    const command: Command = this.commands.slice(-1)[0];

    if (command) {
      command.action = callback;
      this.available_actions.push(command);
    }

    return this;
  }

  /** Implements the .on() option */
  public on(arg: string, callback: Function): Denomander {
    this.on_commands.push({ arg, callback });

    return this;
  }

  public alias(...aliases: Array<string>): Denomander {
    const command: Command = this.commands.slice(-1)[0];
    if (command) {
      aliases.map((alias) => command.addAlias(alias));
    }

    return this;
  }

  /** Lets user to customize the version method */
  public setVersion(params: VersionType): Denomander {
    this.versionOption.reset(params.flags, params.description);

    if (params.version) {
      this.app_version = params.version;
    }

    return this;
  }

  public argDescription(arg: string, description: string): Denomander {
    const command: Command = this.commands.slice(-1)[0];
    command.setArgDescription(arg, description);
    return this;
  }
}
