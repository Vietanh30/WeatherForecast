export default {
  expo: {
    name: "WeatherForecast",
    slug: "WeatherForecast",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      WEATHERAPI_KEY: "YOUR_WEATHER_API_KEY",
      GEOAPIFY_KEY: "4d8e69d77ca943a7b1f0c2b137983440",
    },
  },
};
