import axios from 'axios';

const IP_REGISTRY_API_KEY = 'lxskvdysb1tsel';

export const getIpAddressInfo = async (ipAddress: string) => {
  const { data = [] } = await axios.get(`https://api.ipregistry.co/${ipAddress}?key=${IP_REGISTRY_API_KEY}`);
  return data;
}