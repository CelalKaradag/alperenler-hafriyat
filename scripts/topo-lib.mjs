/**
 * Topoğrafik eş yükselti haritası üreticisi (deterministik, rastgelelik yok).
 * Birkaç "tepe"den oluşan düzgün olmayan bir yükseklik alanından marching squares ile
 * eş yükselti çizgileri çıkarılır; kenarlarda açık uçlu, birbirine paralel organik eğriler oluşur.
 */
const W = 1200;
const H = 700;

// [merkezX, merkezY, yayılma, yükseklik] (0–1 aralığında)
const HILLS = [
  [0.78, 0.4, 0.22, 1.0],
  [0.52, 0.8, 0.16, 0.7],
  [0.96, 0.88, 0.2, 0.8],
  [0.28, 0.18, 0.14, 0.45],
];

export function topoSvg({ seed = 0, density = 'normal' } = {}) {
  const low = density === 'low';
  const COLS = low ? 40 : 64;
  const ROWS = low ? 24 : 38;
  const dx = W / COLS;
  const dy = H / ROWS;

  const field = (u, v) => {
    let sum = 0;
    for (const [cx, cy, spread, height] of HILLS) {
      const px = cx + 0.06 * Math.sin(seed * 2.3 + cx * 7);
      const py = cy + 0.05 * Math.cos(seed * 1.7 + cy * 5);
      const ddx = (u - px) * (W / H);
      const ddy = v - py;
      sum += height * Math.exp(-(ddx * ddx + ddy * ddy) / (2 * spread * spread));
    }
    sum += 0.07 * Math.sin(6 * u + 1.3 + seed) * Math.cos(4.5 * v + 0.7);
    sum += 0.05 * Math.sin(11 * u + 9 * v + seed * 2);
    return sum;
  };

  const grid = [];
  for (let j = 0; j <= ROWS; j++) {
    const row = [];
    for (let i = 0; i <= COLS; i++) row.push(field(i / COLS, j / ROWS));
    grid.push(row);
  }

  /** Kenar anahtarı ("h<i>,<j>" yatay, "v<i>,<j>" dikey) → enterpolasyonlu nokta */
  const edgePoint = (key, level) => {
    const [i, j] = key.slice(1).split(',').map(Number);
    if (key[0] === 'h') {
      const v1 = grid[j][i];
      const v2 = grid[j][i + 1];
      return [(i + (level - v1) / (v2 - v1)) * dx, j * dy];
    }
    const v1 = grid[j][i];
    const v2 = grid[j + 1][i];
    return [i * dx, (j + (level - v1) / (v2 - v1)) * dy];
  };

  const segmentsFor = (level) => {
    const segments = [];
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const a = grid[j][i];
        const b = grid[j][i + 1];
        const c = grid[j + 1][i + 1];
        const d = grid[j + 1][i];
        const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        const T = `h${i},${j}`;
        const B = `h${i},${j + 1}`;
        const L = `v${i},${j}`;
        const R = `v${i + 1},${j}`;
        const centerHigh = (a + b + c + d) / 4 > level;
        switch (index) {
          case 1:
          case 14:
            segments.push([L, B]);
            break;
          case 2:
          case 13:
            segments.push([B, R]);
            break;
          case 3:
          case 12:
            segments.push([L, R]);
            break;
          case 4:
          case 11:
            segments.push([T, R]);
            break;
          case 6:
          case 9:
            segments.push([T, B]);
            break;
          case 7:
          case 8:
            segments.push([T, L]);
            break;
          case 5:
            segments.push(...(centerHigh ? [[T, L], [B, R]] : [[T, R], [L, B]]));
            break;
          case 10:
            segments.push(...(centerHigh ? [[T, R], [L, B]] : [[T, L], [B, R]]));
            break;
          default:
            break;
        }
      }
    }
    return segments;
  };

  /** Parçaları uç uca bağlayıp sürekli çizgilere (açık uçlu ve kapalı) dönüştürür. */
  const chainSegments = (segments) => {
    const adjacency = new Map();
    const link = (p, q) => {
      const list = adjacency.get(p);
      if (list) list.push(q);
      else adjacency.set(p, [q]);
    };
    for (const [p, q] of segments) {
      link(p, q);
      link(q, p);
    }

    const usedEdges = new Set();
    const edgeKey = (p, q) => (p < q ? `${p}|${q}` : `${q}|${p}`);

    const walk = (start) => {
      const chain = [start];
      let current = start;
      for (;;) {
        const next = (adjacency.get(current) ?? []).find((n) => !usedEdges.has(edgeKey(current, n)));
        if (!next) break;
        usedEdges.add(edgeKey(current, next));
        chain.push(next);
        current = next;
      }
      return chain;
    };

    const chains = [];
    // Önce açık uçlar (derece 1), sonra kalan kapalı halkalar
    for (const [node, neighbors] of adjacency) {
      if (neighbors.length === 1 && !usedEdges.has(edgeKey(node, neighbors[0]))) {
        chains.push(walk(node));
      }
    }
    for (const node of adjacency.keys()) {
      const chain = walk(node);
      if (chain.length > 1) chains.push(chain);
    }
    return chains;
  };

  /** Noktaları orta nokta yöntemiyle yumuşatılmış bir SVG yoluna çevirir. */
  const toPath = (points) => {
    if (points.length < 4) return '';
    const f = (n) => n.toFixed(1);
    let d = `M${f(points[0][0])} ${f(points[0][1])}`;
    for (let k = 1; k < points.length - 1; k++) {
      const [x, y] = points[k];
      const [nx, ny] = points[k + 1];
      d += `Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`;
    }
    const last = points[points.length - 1];
    return `${d}L${f(last[0])} ${f(last[1])}`;
  };

  const levelCount = low ? 10 : 16;
  const levels = Array.from({ length: levelCount }, (_, k) => 0.1 + k * (1.12 / levelCount));
  const accentLevels = new Set(low ? [3, 7] : [5, 11]);

  const normal = [];
  const accent = [];
  levels.forEach((level, k) => {
    const d = chainSegments(segmentsFor(level))
      .map((chain) => toPath(chain.map((key) => edgePoint(key, level))))
      .join('');
    (accentLevels.has(k) ? accent : normal).push(d);
  });

  // Çizgi kalınlığı sabit (vector-effect YOK): non-scaling-stroke, SVG'nin CSS background-image olarak
  // kullanıldığı durumda tarayıcılarda çizgileri görünmez/hairline yapabiliyor. 0.8 birim, 1200 birimlik
  // görünümün ekrana ~1,2–1,6 ölçeklenmesiyle yaklaşık 1 px'e denk gelir.
  const common = 'fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<path d="${normal.join('')}" stroke="#f3f1ed" ${common}/>` +
    `<path d="${accent.join('')}" stroke="#f5b400" stroke-opacity="0.75" ${common}/>` +
    '</svg>\n'
  );
}
