const path = require("path");

const firstVoicesGamesWebpack = require(path.join("@fpcc/fv-games-framework", "webpack.config.js"));

module.exports = env =>
{
    return firstVoicesGamesWebpack({
        env: env,
        appRootPath: __dirname,
        outputPath: path.join(__dirname, "www"),
    })
};