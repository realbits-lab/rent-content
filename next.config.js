const prod = process.env.NODE_ENV === "production";

module.exports = {
  // productionBrowserSourceMaps: true,
  reactStrictMode: false,
  // webpack: (config) => {
  //   return {
  //     ...config,
  //     devtool: prod ? "inline-source-map" : "inline-source-map",
  //   };
  // },
};
