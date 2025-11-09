import { IdResolver } from "@atproto/identity";

export class HandleResolver {
  #resolver: IdResolver;

  constructor() {
    this.#resolver = new IdResolver();
  }

  async resolve(handle: string): Promise<URL> {
    const did = await this.#resolver.handle.resolve(handle);
    if (!did) {
      throw new Error(`Failed to resolve handle: ${handle}`);
    }

    const doc = await this.#resolver.did.resolveAtprotoData(did);
    if (!doc.pds) {
      throw new Error(`PDS not found for handle: ${handle}`);
    }

    return new URL(doc.pds);
  }
}
