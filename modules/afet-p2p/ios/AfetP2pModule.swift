import ExpoModulesCore
import MultipeerConnectivity

private struct PeerRecord {
  let peerId: String
  let name: String
  var connected: Bool
}

public class AfetP2pModule: Module {
  private let serviceType = "afet-yolu"
  private var myPeerID: MCPeerID?
  private var session: MCSession?
  private var advertiser: MCNearbyServiceAdvertiser?
  private var browser: MCNearbyServiceBrowser?
  private var peers: [String: PeerRecord] = [:]

  private func peerKey(_ peerID: MCPeerID) -> String {
    peerID.displayName
  }

  public func definition() -> ModuleDefinition {
    Name("AfetP2p")

    Events("onMessage", "onPeerUpdate")

    AsyncFunction("start") { (displayName: String) in
      try self.startSession(displayName: displayName)
    }

    AsyncFunction("stop") {
      self.stopSession()
    }

    AsyncFunction("sendMessage") { (payload: String) -> Int in
      return try self.broadcast(payload)
    }

    Function("getPeers") { () -> [[String: Any]] in
      return self.peers.values.map { peer in
        [
          "peerId": peer.peerId,
          "name": peer.name,
          "connected": peer.connected,
        ]
      }
    }
  }

  private func startSession(displayName: String) throws {
    stopSession()

    let peerID = MCPeerID(displayName: displayName)
    myPeerID = peerID

    let session = MCSession(peer: peerID, securityIdentity: nil, encryptionPreference: .required)
    session.delegate = self
    self.session = session

    let discoveryInfo = ["app": "afet-yolu"]
    let advertiser = MCNearbyServiceAdvertiser(
      peer: peerID,
      discoveryInfo: discoveryInfo,
      serviceType: serviceType
    )
    advertiser.delegate = self
    advertiser.startAdvertisingPeer()
    self.advertiser = advertiser

    let browser = MCNearbyServiceBrowser(peer: peerID, serviceType: serviceType)
    browser.delegate = self
    browser.startBrowsingForPeers()
    self.browser = browser
  }

  private func stopSession() {
    advertiser?.stopAdvertisingPeer()
    browser?.stopBrowsingForPeers()
    session?.disconnect()
    advertiser = nil
    browser = nil
    session = nil
    myPeerID = nil
    peers.removeAll()
  }

  private func broadcast(_ payload: String) throws -> Int {
    guard let session = session else { return 0 }
    guard let data = payload.data(using: .utf8) else { return 0 }

    let targets = session.connectedPeers
    if targets.isEmpty { return 0 }

    try session.send(data, toPeers: targets, with: .reliable)
    return targets.count
  }

  private func upsertPeer(id: String, name: String, connected: Bool) {
    peers[id] = PeerRecord(peerId: id, name: name, connected: connected)
    sendEvent("onPeerUpdate", [
      "peerId": id,
      "name": name,
      "connected": connected,
    ])
  }
}

extension AfetP2pModule: MCSessionDelegate {
  public func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
    let id = peerKey(peerID)
    switch state {
    case .connected:
      upsertPeer(id: id, name: peerID.displayName, connected: true)
    case .notConnected:
      upsertPeer(id: id, name: peerID.displayName, connected: false)
    case .connecting:
      upsertPeer(id: id, name: peerID.displayName, connected: false)
    @unknown default:
      break
    }
  }

  public func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
    guard let text = String(data: data, encoding: .utf8) else { return }
    sendEvent("onMessage", [
      "text": text,
      "peerId": peerKey(peerID),
    ])
  }

  public func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {}
  public func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {}
  public func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}
}

extension AfetP2pModule: MCNearbyServiceAdvertiserDelegate {
  public func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
    invitationHandler(true, session)
  }

  public func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didNotStartAdvertisingPeer error: Error) {}
}

extension AfetP2pModule: MCNearbyServiceBrowserDelegate {
  public func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String: String]?) {
    guard let session = session else { return }
    if peerID == myPeerID { return }
    browser.invitePeer(peerID, to: session, withContext: nil, timeout: 20)
    upsertPeer(id: peerKey(peerID), name: peerID.displayName, connected: false)
  }

  public func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
    upsertPeer(id: peerKey(peerID), name: peerID.displayName, connected: false)
  }

  public func browser(_ browser: MCNearbyServiceBrowser, didNotStartBrowsingForPeers error: Error) {}
}
