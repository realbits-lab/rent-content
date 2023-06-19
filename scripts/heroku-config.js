const util = require("util");
const { json } = require("express");
const exec = util.promisify(require("child_process").exec);
const dotenv = require("dotenv");
const wait = require("waait");
const { Command } = require("commander");
const program = new Command();

const HEROKU_CONFIG_JSON_COMMAND = "/opt/homebrew/bin/heroku config --json";
const HEROKU_CONFIG_UNSET_COMMAND = "/opt/homebrew/bin/heroku config:unset ";
const HEROKU_CONFIG_SET_COMMAND = "/opt/homebrew/bin/heroku config:set ";
const WAIT_TIME = 1000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function setConfig() {
  //* Get heroku config list.
  //* Execute heroku config --json
  let jsonConfigResponse;

  const { stdout, stderr } = await exec(HEROKU_CONFIG_JSON_COMMAND);
  // console.log("stdout: " + stdout);
  // console.log("stderr: " + stderr);

  jsonConfigResponse = JSON.parse(stdout);
  // console.log("jsonConfigResponse: ", jsonConfigResponse);

  //* Unset all heroku config variables.
  let promies = Object.entries(jsonConfigResponse).map(
    async ([key, value], idx) => {
      // console.log("key: ", key);
      // console.log("value: ", value);
      if (key !== "DATABASE_URL") {
        await wait(WAIT_TIME);
        const { stdout, stderr } = await exec(
          `${HEROKU_CONFIG_UNSET_COMMAND} ${key}`
        );
        console.log(`heroku config:unset ${key}`);
        // console.log("stdout: " + stdout);
      }
    }
  );
  Promise.all(promies);

  //* Set heroku config variables with .env HEROKU_CONFIG_UNSET_COMMAND.
  let dotenvConfig = dotenv.config();
  // console.log("dotenvConfig: ", dotenvConfig);

  promies = Object.entries(dotenvConfig.parsed).map(
    async ([key, value], idx) => {
      // console.log("key: ", key);
      // console.log("value: ", value);
      if (key !== "DATABASE_URL") {
        await wait(WAIT_TIME);
        const { stdout, stderr } = await exec(
          `${HEROKU_CONFIG_SET_COMMAND} ${key}=\"${value}\"`
        );
        console.log(`heroku config:set ${key}=\"${value}\"`);
        // console.log("stdout: " + stdout);
        // console.log("stderr: " + stderr);
      }
    }
  );
  Promise.all(promies);
}

async function compare() {
  //* Compare the heroku config list and .env config list.

  //* Get heroku config list.
  console.log("-- Heroku config list");
  const { stdout, stderr } = await exec(HEROKU_CONFIG_JSON_COMMAND);
  // console.log("stdout: ", stdout);
  const jsonConfigResponse = JSON.parse(stdout);
  const herokuConfigList = Object.entries(jsonConfigResponse);
  // herokuConfigList.map(([key, value]) => console.log(`${key}=${value}`));
  // console.log("herokuConfigList: ", herokuConfigList);

  //* Get .env config list.
  console.log("-- .env config list");
  dotenvConfig = dotenv.config();
  // console.log("dotenvConfig: ", dotenvConfig);
  const envConfigList = Object.entries(dotenvConfig.parsed);
  // envConfigList.map(([key, value]) => console.log(`${key}=${value}`));
  // console.log("envConfigList: ", envConfigList);

  const herokuConfigDiff = herokuConfigList.filter((herokuConfig) => {
    const result = envConfigList.filter((envConfig) => {
      return (
        envConfig[0] === herokuConfig[0] && envConfig[1] === herokuConfig[1]
      );
    });
    return result.length === 0;
  });
  console.log("herokuConfigDiff: ", herokuConfigDiff);
  const envConfigDiff = envConfigList.filter((envConfig) => {
    const result = herokuConfigList.filter((herokuConfig) => {
      return (
        herokuConfig[0] === envConfig[0] && herokuConfig[1] === envConfig[1]
      );
    });
    return result.length === 0;
  });
  console.log("envConfigDiff: ", envConfigDiff);
}

async function main() {
  program
    .name("heroku-config")
    .description("CLI to set heroku config variables.")
    .version("0.0.1");
  program.option("-c, --compare", "Compare the heroku and .env config");
  program.option("-s, --set", "Set the heroku config");

  program.parse(process.argv);
  const options = program.opts();
  // console.log("options: ", options);

  if (options.compare) {
    await compare();
  } else if (options.set) {
    await setConfig();
  } else {
    console.error("Use -c or -s option.");
  }
}

main();
