"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIpAddressInfo = void 0;
const axios_1 = require("axios");
const IP_REGISTRY_API_KEY = 'lxskvdysb1tsel';
const getIpAddressInfo = async (ipAddress) => {
    const { data = [] } = await axios_1.default.get(`https://api.ipregistry.co/${ipAddress}?key=${IP_REGISTRY_API_KEY}`);
    return data;
};
exports.getIpAddressInfo = getIpAddressInfo;
//# sourceMappingURL=getIpAddressInfo.js.map