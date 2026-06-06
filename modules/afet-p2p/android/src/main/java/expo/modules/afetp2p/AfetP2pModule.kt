package expo.modules.afetp2p

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Android: Multipeer yok — P2P yalnızca iOS'ta desteklenir. */
class AfetP2pModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AfetP2p")

    Events("onMessage", "onPeerUpdate")

    AsyncFunction("start") { _: String ->
      // Android'de P2P kullanılmıyor
    }

    AsyncFunction("stop") {}

    AsyncFunction("sendMessage") { _: String -> 0 }

    Function("getPeers") { emptyList<Map<String, Any>>() }
  }
}
