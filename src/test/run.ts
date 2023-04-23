import * as Mocha from "mocha";
import { Command } from "commander";

const commander = new Command();
const runner = new Mocha({
  timeout: 10000,
  ui: "bdd",
  color: true,
});

commander
  .usage("npm run test [options] [file pattern]")
  .option(
    "-l, --level [level]",
    `Only show messages at or above the specified level. You can specify level *names* or the internal numeric values.
                Default WARN.`,
    "warn"
  )
  .option(
    "-o, --output [format]",
    `Specify an output mode/format. One of:
                long: (the default) pretty
                json: JSON output, 2-space indent
                json-N: JSON output, N-space indent, e.g. "json-4"
                bunyan: 0 indented JSON, bunyan's native format
                inspect: node.js "util.inspect" output
                short: like "long", but more concise
                simple: level, followed by "-" and then the message`,
    "short"
  )
  .parse(process.argv);
