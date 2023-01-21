const prod = process.env.NODE_ENV === "production";

module.exports = {
  productionBrowserSourceMaps: true,
  reactStrictMode: false,
  transpilePackages: ["rent-market"],
  webpack: (config) => {
    return {
      ...config,
      devtool: prod ? "inline-source-map" : "source-map",
    };
  },
};
