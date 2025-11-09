export type RecordJson = Record<string, unknown>;

export type EntryRecord = {
  collection: string;
  rkey: string;
  json: RecordJson;
};
