/* YouTube poster selection: prefer genuine widescreen thumbnails, never stretch a frame. */
export async function fetchVideoPoster(id, sharp, fetcher = fetch) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Invalid YouTube id');
  const attempts = [];
  for (const variant of ['maxresdefault', 'hq720', 'mqdefault']) {
    const url = `https://i.ytimg.com/vi/${id}/${variant}.jpg`;
    const response = await fetcher(url, { signal: AbortSignal.timeout(15000), redirect: 'error' });
    attempts.push({ variant, status: response.status });
    if (!response.ok) { if ([404, 410].includes(response.status)) continue; throw new Error(`Poster HTTP ${response.status}: ${id}`); }
    if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error('Poster is not an image');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 8 * 1024 * 1024) throw new Error('Poster size exceeds budget');
    const meta = await sharp(bytes).metadata();
    if (meta.width >= 320 && meta.height >= 180 && Math.abs(meta.width / meta.height - 16 / 9) < 0.02) {
      return { bytes, url, width: meta.width, height: meta.height, attempts };
    }
  }
  throw new Error(`No valid widescreen poster found: ${id}`);
}
