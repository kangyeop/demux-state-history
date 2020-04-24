import path from "path";
import { createLogger, transports, format, Logger } from "winston";
import moment from "moment";

function createAppLogger(): Logger {
    const { combine, timestamp, printf, colorize } = format;
    const time = moment();
    return createLogger({
        format: combine(
            colorize(),
            timestamp({ format: time.format("hh:mm:ss.SSS") }),
            // timestamp(),
            printf((info): string => {
                const label: string = info.label
                    ? " " + info.label + " - "
                    : " ";
                return `${info.timestamp} [${
                    info.level
                }] :${label}${JSON.stringify(info.message)}`;
            })
        ),
        transports: [
            new transports.Console(),
            new transports.File({
                filename: path.join(
                    __dirname,
                    "../../logs",
                    time.format("YYYY-MM-DD")
                )
            })
        ]
    });
}

export const logger: Logger = createAppLogger();

export function log(err: any) {
    let msg: string;
    if (err instanceof Error) {
        msg = err.message;
    } else {
        msg = err;
    }
    logger.error(msg);
}
