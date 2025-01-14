const isProduction = () => {
  return process.env.npm_lifecycle_event !== "dev";
};
 
module.exports = isProduction;
