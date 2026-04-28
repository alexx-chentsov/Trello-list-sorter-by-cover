window.TrelloPowerUp.initialize({
  'list-sorters': function (t) {
    return [{
      text: 'Cover + Labels',
      callback: function (t, opts) {
        const colorOrder = [
          'red','purple','blue','orange','pink',
          'lime','green','sky','yellow','black'
        ];

        const origIndex = new Map(opts.cards.map((c, i) => [c.id, i]));

        const hasCover = (c) => {
          const cv = c && c.cover;
          return !!(cv && (cv.color || cv.idAttachment || cv.idUploadedBackground || cv.scaled));
        };

        const coverKey = (c) => {
          const col = (c.cover && c.cover.color) || '';
          if (!col) {
            return { bucket: 0, logCover: hasCover(c) ? 'image' : 'none' };
          }
          const r = colorOrder.indexOf(col);
          return {
            bucket: 1,
            colorRank: r === -1 ? 998 : r,
            logCover: col
          };
        };

        const labelKey = (c) => {
          const labels = Array.isArray(c.labels) ? c.labels : [];
          if (!labels.length) return { has: 0, colorRank: 999, nameKey: '' };

          const colors = labels.map(l => l && l.color).filter(Boolean);
          const ranks = colors
            .map(col => {
              const r = colorOrder.indexOf(col);
              return r === -1 ? 998 : r;
            });
          const minRank = ranks.length ? Math.min(...ranks) : 998;

          const nameKey = labels
            .map(l => (l && l.name ? l.name.trim() : ''))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
            .join('|');

          return { has: 1, colorRank: minRank, nameKey };
        };

        // 1) Log input
        const cardInfos = opts.cards.map(c => {
          const ck = coverKey(c);
          const labels = Array.isArray(c.labels) ? c.labels : [];
          return {
            id: c.id,
            name: c.name,
            cover: ck.logCover,
            labels: labels.map(l => `${l.color || 'none'}:${l.name || ''}`).join(', ') || 'none'
          };
        });
        console.log('🟢 Sorter received:', cardInfos);

        // 2) Sort:
        //    - bucket 0 first: no solid cover.color (no cover or image cover)
        //    - bucket 1 second: solid palette cover, ordered by colorOrder
        //    - within bucket 1: palette rank, then label color/name (step 3 skipped)
        //    - within bucket 0: labeled before unlabeled, then label color/name
        const sortedCards = opts.cards.slice().sort((a, b) => {
          const cka = coverKey(a), ckb = coverKey(b);
          if (cka.bucket !== ckb.bucket) return cka.bucket - ckb.bucket;
          if (cka.bucket === 1 && cka.colorRank !== ckb.colorRank) return cka.colorRank - ckb.colorRank;

          const al = labelKey(a), bl = labelKey(b);
          if (cka.bucket === 0 && al.has !== bl.has) return bl.has - al.has;

          if (al.colorRank !== bl.colorRank) return al.colorRank - bl.colorRank;
          if (al.nameKey !== bl.nameKey) return al.nameKey.localeCompare(bl.nameKey);

          const n = (a.name || '').localeCompare(b.name || '');
          if (n) return n;
          return (origIndex.get(a.id) ?? 0) - (origIndex.get(b.id) ?? 0);
        });

        // 3) Log output
        const sortedInfos = sortedCards.map(c => {
          const ck = coverKey(c);
          const labels = Array.isArray(c.labels) ? c.labels : [];
          return {
            id: c.id,
            name: c.name,
            cover: ck.logCover,
            labels: labels.map(l => `${l.color || 'none'}:${l.name || ''}`).join(', ') || 'none'
          };
        });
        console.log('🔵 Sorter result:', sortedInfos);

        // 4) Return new order
        return { sortedIds: sortedCards.map(c => c.id) };
      }
    }];
  }
});
