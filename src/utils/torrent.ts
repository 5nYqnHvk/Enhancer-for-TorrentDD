export const parseTorrentFromUint8 = (
  u8: Uint8Array
): {
  infoSlice: ArrayBuffer | null;
  meta: { name: string | null; trackers: string[] };
} => {
  let pos = 0;
  let infoStart: number | null = null;
  let infoEnd: number | null = null;

  const readChar = (): string => String.fromCharCode(u8[pos]);

  const parseElement = (): any => {
    const c = readChar();
    if (c === "i") return parseIntElement();
    if (c === "l") return parseList();
    if (c === "d") return parseDict();
    if (/\d/.test(c)) return parseString();
    throw new Error("bencode parse error at pos " + pos);
  };

  const parseIntElement = (): number => {
    pos++;
    const start = pos;
    while (readChar() !== "e") pos++;
    const numStr = decodeUtf8(u8.subarray(start, pos));
    pos++;
    return parseInt(numStr, 10);
  };

  const parseString = (): { raw: Uint8Array; str: string } => {
    const start = pos;
    while (readChar() !== ":") pos++;
    const lenStr = decodeUtf8(u8.subarray(start, pos));
    const strLen = parseInt(lenStr, 10);
    pos++;
    const data = u8.subarray(pos, pos + strLen);
    pos += strLen;
    return { raw: data, str: decodeUtf8(data) };
  };

  const parseList = (): any[] => {
    pos++;
    const arr: any[] = [];
    while (readChar() !== "e") arr.push(parseElement());
    pos++;
    return arr;
  };

  const parseDict = (): Record<string, any> => {
    pos++;
    const obj: Record<string, any> = {};
    while (readChar() !== "e") {
      const key = parseString().str;
      if (key === "info") {
        infoStart = pos;
        obj[key] = parseElement();
        infoEnd = pos;
      } else {
        obj[key] = parseElement();
      }
    }
    pos++;
    return obj;
  };

  const top = parseElement();

  const trackers: string[] = [];
  if (top.announce?.str) trackers.push(top.announce.str);
  if (top["announce-list"]) {
    const al = top["announce-list"];
    if (Array.isArray(al)) {
      al.forEach((tier) => {
        if (Array.isArray(tier)) {
          tier.forEach((t) => {
            if (t?.str) trackers.push(t.str);
          });
        }
      });
    }
  }

  let name: string | null = null;
  try {
    if (top.info?.name?.str) name = top.info.name.str;
  } catch {}

  const infoSlice: ArrayBuffer | null =
    infoStart != null && infoEnd != null
      ? u8.slice(infoStart, infoEnd).buffer
      : null;

  return { infoSlice, meta: { name, trackers } };
};

// helpers
export const decodeUtf8 = (u8: Uint8Array): string => {
  try {
    return new TextDecoder().decode(u8);
  } catch {
    return String.fromCharCode(...u8);
  }
};

export const toBase32 = (bytes: Uint8Array): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0,
    value = 0,
    output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
};
