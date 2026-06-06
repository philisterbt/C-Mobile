// SQLite yerel veritabanı - mesajlar, sync meta, toplanma alanları ve indirilen bölgeler
import * as SQLite from "expo-sqlite";
import type { LocalMessage, IncomingMessage, DownloadedRegion } from "../types/offline";
import type { AssemblyPoint } from "../types/api";

let dbInstance: SQLite.SQLiteDatabase | null = null;

/** Veritabanını açar ve tabloları oluşturur. */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync("afet_yolu.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS messages (
      client_id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      room_id TEXT PRIMARY KEY,
      last_sync_at TEXT
    );

    CREATE TABLE IF NOT EXISTS room_meta (
      room_id TEXT PRIMARY KEY,
      last_read_at TEXT
    );

    CREATE TABLE IF NOT EXISTS assembly_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region_id TEXT NOT NULL,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS downloaded_regions (
      region_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      downloaded_at TEXT NOT NULL,
      tile_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  dbInstance = db;
  return db;
}

/** Yeni mesaj ekler (offline-first, status: pending). */
export async function insertMessage(msg: LocalMessage): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO messages (client_id, room_id, sender, content, created_at, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [msg.client_id, msg.room_id, msg.sender, msg.content, msg.created_at, msg.status]
  );
}

/** Bir odadaki tüm mesajları kronolojik sırayla getirir. */
export async function getMessagesByRoom(roomId: string): Promise<LocalMessage[]> {
  const db = await getDatabase();
  return db.getAllAsync<LocalMessage>(
    `SELECT client_id, room_id, sender, content, created_at, status
     FROM messages WHERE room_id = ? ORDER BY created_at ASC`,
    [roomId]
  );
}

/** Gönderilmeyi bekleyen mesajları getirir. */
export async function getPendingMessages(roomId: string): Promise<LocalMessage[]> {
  const db = await getDatabase();
  return db.getAllAsync<LocalMessage>(
    `SELECT client_id, room_id, sender, content, created_at, status
     FROM messages WHERE room_id = ? AND status = 'pending' ORDER BY created_at ASC`,
    [roomId]
  );
}

/** Sunucudan gelen mesajı ekler veya günceller. */
export async function upsertIncomingMessage(msg: IncomingMessage): Promise<void> {
  const db = await getDatabase();
  const clientId =
    msg.client_id ?? `srv_${msg.room_id}_${msg.created_at}_${msg.sender}`;

  await db.runAsync(
    `INSERT OR REPLACE INTO messages (client_id, room_id, sender, content, created_at, status)
     VALUES (?, ?, ?, ?, ?, 'sent')`,
    [clientId, msg.room_id, msg.sender, msg.content, msg.created_at]
  );
}

/** Mesajı gönderildi olarak işaretle. */
export async function markSent(clientId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE messages SET status = 'sent' WHERE client_id = ?`, [
    clientId,
  ]);
}

/** Mesajı başarısız olarak işaretle. */
export async function markFailed(clientId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE messages SET status = 'failed' WHERE client_id = ?`, [
    clientId,
  ]);
}

/** Son senkronizasyon zamanını getirir. */
export async function getLastSync(roomId: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ last_sync_at: string | null }>(
    `SELECT last_sync_at FROM sync_meta WHERE room_id = ?`,
    [roomId]
  );
  return row?.last_sync_at ?? null;
}

/** Son senkronizasyon zamanını kaydeder. */
export async function setLastSync(roomId: string, serverTime: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (room_id, last_sync_at) VALUES (?, ?)`,
    [roomId, serverTime]
  );
}

/** Oda okundu zamanını günceller. */
export async function markRoomRead(roomId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO room_meta (room_id, last_read_at) VALUES (?, ?)`,
    [roomId, new Date().toISOString()]
  );
}

/** Okunmamış mesaj sayısını döndürür. */
export async function getUnreadCount(
  roomId: string,
  currentUser: string
): Promise<number> {
  const db = await getDatabase();
  const meta = await db.getFirstAsync<{ last_read_at: string | null }>(
    `SELECT last_read_at FROM room_meta WHERE room_id = ?`,
    [roomId]
  );
  const lastRead = meta?.last_read_at ?? "1970-01-01T00:00:00.000Z";

  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM messages
     WHERE room_id = ? AND sender != ? AND created_at > ?`,
    [roomId, currentUser, lastRead]
  );
  return row?.count ?? 0;
}

/** Odadaki son mesajı getirir. */
export async function getLastMessage(roomId: string): Promise<LocalMessage | null> {
  const db = await getDatabase();
  return db.getFirstAsync<LocalMessage>(
    `SELECT client_id, room_id, sender, content, created_at, status
     FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 1`,
    [roomId]
  );
}

/** Tüm bekleyen mesaj sayısını döndürür. */
export async function getTotalPendingCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM messages WHERE status = 'pending'`
  );
  return row?.count ?? 0;
}

/** Offline bundle toplanma alanlarını kaydeder. */
export async function saveAssemblyPoints(
  regionId: string,
  points: AssemblyPoint[]
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM assembly_points WHERE region_id = ?`, [regionId]);
  for (const p of points) {
    await db.runAsync(
      `INSERT INTO assembly_points (region_id, name, lat, lng, capacity) VALUES (?, ?, ?, ?, ?)`,
      [regionId, p.name, p.lat, p.lng, p.capacity]
    );
  }
}

/** Yerel toplanma alanlarını getirir (belirli bölge veya tümü). */
export async function getLocalAssemblyPoints(
  regionId?: string
): Promise<AssemblyPoint[]> {
  const db = await getDatabase();
  if (regionId) {
    return db.getAllAsync<AssemblyPoint>(
      `SELECT name, lat, lng, capacity FROM assembly_points WHERE region_id = ?`,
      [regionId]
    );
  }
  return db.getAllAsync<AssemblyPoint>(
    `SELECT name, lat, lng, capacity FROM assembly_points`
  );
}

/** İndirilen bölge kaydını ekler. */
export async function saveDownloadedRegion(region: DownloadedRegion): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO downloaded_regions (region_id, name, downloaded_at, tile_count)
     VALUES (?, ?, ?, ?)`,
    [region.region_id, region.name, region.downloaded_at, region.tile_count]
  );
}

/** İndirilen bölgeleri listeler. */
export async function getDownloadedRegions(): Promise<DownloadedRegion[]> {
  const db = await getDatabase();
  return db.getAllAsync<DownloadedRegion>(
    `SELECT region_id, name, downloaded_at, tile_count FROM downloaded_regions ORDER BY downloaded_at DESC`
  );
}

/** İndirilen bölgeyi ve toplanma alanlarını siler. */
export async function deleteDownloadedRegion(regionId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM downloaded_regions WHERE region_id = ?`, [
    regionId,
  ]);
  await db.runAsync(`DELETE FROM assembly_points WHERE region_id = ?`, [regionId]);
}
