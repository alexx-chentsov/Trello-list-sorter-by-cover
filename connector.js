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
          if (!hasCover(c)) return { typeRank: 1, colorRank: 999, color: '' }; // no cover
          const col = (c.cover && c.cover.color) || '';
          if (!col) return { typeRank: 0, colorRank: -1, color: 'image' };    // image cover
          const r = colorOrder.indexOf(col);
          return { typeRank: 0, colorRank: r === -1 ? 998 : r, color: col };
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
            cover: ck.typeRank === 0 ? ck.color : 'none',
            labels: labels.map(l => `${l.color || 'none'}:${l.name || ''}`).join(', ') || 'none'
          };
        });
        console.log('🟢 Sorter received:', cardInfos);

        // 2) Sort:
        //    - covers first
        //    - then (no cover) labeled cards
        //    - then unlabeled
        //    - within covers: cover color (images first), then label color/name
        //    - within label group: label color, then label names
        const sortedCards = opts.cards.slice().sort((a, b) => {
          const ac = coverKey(a), bc = coverKey(b);
          if (ac.typeRank !== bc.typeRank) return ac.typeRank - bc.typeRank; // cover (0) before none (1)
          if (ac.typeRank === 0 && ac.colorRank !== bc.colorRank) return ac.colorRank - bc.colorRank;

          const al = labelKey(a), bl = labelKey(b);
          if (ac.typeRank === 1 && al.has !== bl.has) return bl.has - al.has; // labeled before unlabeled (only when no cover)

          if (al.colorRank !== bl.colorRank) return al.colorRank - bl.colorRank;
          if (al.nameKey !== bl.nameKey) return al.nameKey.localeCompare(bl.nameKey);

          // final tie-breakers: card name, then original order for stability
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
            cover: ck.typeRank === 0 ? ck.color : 'none',
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
