const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const createSessionData = (req, token) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const geo = geoip.lookup(ip);
  const location = geo
    ? `${geo.city || "Unknown City"}, ${geo.region || "Unknown Region"}, ${
        geo.country || "Unknown Country"
      }`
    : "Unknown Location";

  const device = ua.device.type || "Desktop";
  const browser = `${ua.browser.name || "Unknown Browser"} ${
    ua.browser.version || ""
  }`.trim();
  const os = `${ua.os.name || "Unknown OS"} ${ua.os.version || ""}`.trim();

  return {
    token,
    ip,
    location,
    device,
    browser,
    os,
    lastActivity: new Date().toISOString(),
  };
};

module.exports = { createSessionData };
