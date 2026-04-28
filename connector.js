window.TrelloPowerUp.initialize({
  'list-sorters': function (t) {
    return [{
      text: 'Cover + Labels',
      callback: function (t, opts) {
        const normalizePalette = (v) => {
          if (v == null || v === '') return '';
          return String(v).toLowerCase().trim();
        };

        const hasRenderableCover = (cv) => {
          return !!(cv && (cv.color || cv.idAttachment || cv.idUploadedBackground || cv.scaled));
        };

        const pickMergedCard = (optCard, listCard, boardCard) => {
          const sources = [listCard, boardCard, optCard].filter(Boolean);
          let cover;
          for (let i = 0; i < sources.length; i++) {
            const cv = sources[i].cover;
            if (cv && normalizePalette(cv.color)) {
              cover = cv;
              break;
            }
          }
          if (!cover) {
            for (let i = 0; i < sources.length; i++) {
              const cv = sources[i].cover;
              if (hasRenderableCover(cv)) {
                cover = cv;
                break;
              }
            }
          }
          if (!cover) {
            for (let i = 0; i < sources.length; i++) {
              if (sources[i].cover !== undefined && sources[i].cover !== null) {
                cover = sources[i].cover;
                break;
              }
            }
          }
          let labels;
          for (let i = 0; i < sources.length; i++) {
            const ls = sources[i].labels;
            if (Array.isArray(ls) && ls.length) {
              labels = ls;
              break;
            }
          }
          return {
            ...optCard,
            cover: cover !== undefined ? cover : optCard.cover,
            labels: labels !== undefined ? labels : (Array.isArray(optCard.labels) ? optCard.labels : [])
          };
        };

        return Promise.all([
          t.list('id', 'name', 'cards').catch(function () {
            return { cards: [] };
          }),
          t.cards('all').catch(function () {
            return [];
          })
        ]).then(function (results) {
          const list = results[0];
          const boardCards = results[1];
          const listById = new Map((list.cards || []).map(c => [c.id, c]));
          const boardById = new Map(boardCards.map(c => [c.id, c]));
          const cards = opts.cards.map(function (c) {
            return pickMergedCard(c, listById.get(c.id), boardById.get(c.id));
          });

          const colorOrder = [
            'red','purple','blue','orange','pink',
            'lime','green','sky','yellow','black'
          ];

          const origIndex = new Map(cards.map((c, i) => [c.id, i]));

          const hasCover = (c) => {
            const cv = c && c.cover;
            return hasRenderableCover(cv);
          };

          const coverKey = (c) => {
            const col = normalizePalette(c.cover && c.cover.color);
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
                const r = colorOrder.indexOf(normalizePalette(col));
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

          const cardInfos = cards.map(c => {
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

          const sortedCards = cards.slice().sort((a, b) => {
            const cka = coverKey(a), ckb = coverKey(b);
            if (cka.bucket !== ckb.bucket) return cka.bucket - ckb.bucket;
            if (cka.bucket === 1) {
              if (cka.colorRank !== ckb.colorRank) return cka.colorRank - ckb.colorRank;
              const coverCmp = cka.logCover.localeCompare(ckb.logCover);
              if (coverCmp) return coverCmp;
            }

            const al = labelKey(a), bl = labelKey(b);
            if (cka.bucket === 0 && al.has !== bl.has) return bl.has - al.has;

            if (al.colorRank !== bl.colorRank) return al.colorRank - bl.colorRank;
            if (al.nameKey !== bl.nameKey) return al.nameKey.localeCompare(bl.nameKey);

            const n = (a.name || '').localeCompare(b.name || '');
            if (n) return n;
            return (origIndex.get(a.id) ?? 0) - (origIndex.get(b.id) ?? 0);
          });

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

          return { sortedIds: sortedCards.map(c => c.id) };
        }).catch(function (err) {
          console.error('Cover sorter: failed to load list/board cards for cover data', err);
          return { sortedIds: opts.cards.map(c => c.id) };
        });
      }
    }];
  }
});
