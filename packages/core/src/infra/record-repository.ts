import { AtpAgent, AtUri } from "@atproto/api";
import { setTimeout as sleep } from "timers/promises";

import type { EntryRecord } from "../types/record.js";

export class RecordRepository {
  #agent: AtpAgent | null = null;

  async login(pds: URL, identifier: string, password: string): Promise<void> {
    this.#agent = new AtpAgent({ service: pds });
    await this.#agent.login({ identifier, password });
  }

  async list(collection: string): Promise<EntryRecord[]> {
    if (!this.#agent) {
      throw new Error("Not logged in");
    }

    const records: EntryRecord[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.#agent.com.atproto.repo.listRecords({
        repo: this.#agent.assertDid,
        collection,
        ...(cursor ? { cursor } : {}),
      });

      for (const record of response.data.records) {
        const uri = new AtUri(record.uri);
        records.push({ collection, rkey: uri.rkey, json: record.value });
      }

      cursor = response.data.cursor;
      if (cursor) await sleep(2000);
    } while (cursor);

    return records;
  }

  async save(record: EntryRecord): Promise<void> {
    if (!this.#agent) {
      throw new Error("Not logged in");
    }

    await this.#agent.com.atproto.repo.putRecord({
      repo: this.#agent.assertDid,
      collection: record.collection,
      rkey: record.rkey,
      record: record.json,
    });
  }

  async delete(uri: AtUri): Promise<void> {
    if (!this.#agent) {
      throw new Error("Not logged in");
    }

    await this.#agent.com.atproto.repo.deleteRecord({
      repo: this.#agent.assertDid,
      collection: uri.collection,
      rkey: uri.rkey,
    });
  }
}
