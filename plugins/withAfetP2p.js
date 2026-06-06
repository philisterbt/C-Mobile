/** iOS Multipeer Connectivity izinleri ve Bonjour servisi */
const { withInfoPlist } = require("@expo/config-plugins");

const SERVICE_NAME = "afet-yolu";

function withAfetP2p(config, props = {}) {
  const localNetworkText =
    props.localNetworkUsagePermissionText ??
    "Afet Yolu, internetsiz mesajlaşma için yakındaki cihazları yerel ağ üzerinden keşfeder.";
  const bluetoothText =
    props.bluetoothUsagePermissionText ??
    "Afet Yolu, yakındaki cihazlarla internetsiz mesajlaşmak için Bluetooth kullanır.";

  return withInfoPlist(config, (config) => {
    config.modResults.NSLocalNetworkUsageDescription = localNetworkText;
    config.modResults.NSBluetoothAlwaysUsageDescription = bluetoothText;
    config.modResults.NSBluetoothPeripheralUsageDescription = bluetoothText;

    const bonjourKey = "NSBonjourServices";
    const serviceEntry = `_${SERVICE_NAME}._tcp`;
    const existing = config.modResults[bonjourKey] ?? [];
    if (!existing.includes(serviceEntry)) {
      config.modResults[bonjourKey] = [...existing, serviceEntry];
    }

    return config;
  });
}

module.exports = withAfetP2p;
