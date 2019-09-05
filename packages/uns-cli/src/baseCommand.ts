import { Command, flags as oFlags } from "@oclif/command";
import { Client, configManager } from "@uns/crypto";
import { cli } from "cli-ux";
import { UNSCLIAPI } from "./api";
import { CommandOutput, Formater, getFormatFlag, OUTPUT_FORMAT } from "./formater";
import * as UTILS from "./utils";

export abstract class BaseCommand extends Command {
    public static baseFlags = {
        help: oFlags.help({ char: "h" }),
        network: oFlags.string({
            description: "Network used to create UNIK nft token (local are for development only)",
            required: true,
            options: UTILS.getNetworksList(),
        }),
        verbose: oFlags.boolean({
            description: "Detailed logs",
        }),
    };

    protected client: Client;
    protected api;
    protected verbose: boolean;

    private formater;

    public async run() {
        // Add dynamic format flag
        Object.assign(this.getCommand().flags, getFormatFlag(this.getDefaultFormat(), this.getAvailableFormats()));

        const { flags } = this.parse(this.getCommand());

        // Set formater
        this.formater = OUTPUT_FORMAT[flags.format];
        this.verbose = flags.verbose;

        /**
         * Configuration
         */
        const networkName = flags.network === "local" ? "testnet" : flags.network;

        const networkPreset = configManager.getPreset(networkName);

        networkPreset.network.name = flags.network;

        this.api = new UNSCLIAPI(networkPreset);

        this.client = new Client(networkPreset);

        try {
            const commandResult = await this.do(flags);
            if (commandResult && Object.keys(commandResult).length > 0) {
                // Keep super.log to force log
                super.log(this.formater && this.formater.action ? this.formater.action(commandResult) : commandResult);
            }
        } catch (globalCatchException) {
            this.promptErrAndExit(globalCatchException.message);
        }
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json];
    }

    protected getDefaultFormat(): Formater {
        return OUTPUT_FORMAT.json;
    }
    protected abstract do(flags: Record<string, any>): Promise<CommandOutput>;
    protected abstract getCommand(): typeof BaseCommand;
    protected abstract getCommandTechnicalName(): string;

    protected logAttribute(label: string, value: string) {
        this.log(`\t${label}: ${value}`);
    }

    protected fromSatoshi(value: number): string {
        return `${value / 100000000}`;
    }

    /**
     * Checks that all heights passed in parameter are equals
     * @param heights
     */
    protected checkDataConsistency(...heights: number[]) {
        if (!heights.every(v => v === heights[0])) {
            throw new Error("Data consistency error. Please retry.");
        }
    }

    protected actionStart(msg: string) {
        if (this.verbose) {
            cli.action.start(msg);
        }
    }

    protected actionStop() {
        if (this.verbose) {
            cli.action.stop();
        }
    }

    /**
     * Check transaction api util retrieved transaction has {expectedConfirmations} confirmations during {retry} block times maximum
     * @param blockTime
     * @param transactionId
     * @param numberOfRetry
     * @param expectedConfirmations
     */
    protected async waitTransactionConfirmations(
        blockTime: number,
        transactionId: string,
        numberOfRetry: number = 0,
        expectedConfirmations: number = 0,
    ) {
        const transactionFromNetwork = await this.api.getTransaction(transactionId, blockTime * 1000);
        const confirmations = transactionFromNetwork.confirmations;
        if (confirmations < expectedConfirmations && numberOfRetry > 0) {
            return await this.waitTransactionConfirmations(
                blockTime,
                transactionId,
                numberOfRetry - 1,
                expectedConfirmations,
            );
        }
        return transactionFromNetwork;
    }

    /**
     *
     * @param errorMsg Prompt error and exit command.
     */
    private promptErrAndExit(errorMsg: string): void {
        this.error(`[${this.getCommandTechnicalName()}] ${errorMsg}`);
        this.exit(1);
    }
}
