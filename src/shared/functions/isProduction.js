const isProduction = () => {
  const developmentCommands = ["dev", "remote-dev"];
  return !developmentCommands.includes(process.env.npm_lifecycle_event);
};

module.exports = isProduction;
