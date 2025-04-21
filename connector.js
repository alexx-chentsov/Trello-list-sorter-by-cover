window.TrelloPowerUp.initialize({
  'list-sorters': function(t) {
    return [{
      text: 'Cover Color',
      callback: function(t, opts) {
        // 1. Gather a simple array of {id, name, color} for logging
        const cardInfos = opts.cards.map(c => ({
          id:   c.id,
          name: c.name,
          color: (c.cover && c.cover.color) || 'none'
        }));
        console.log('🟢 Cover Sorter received:', cardInfos);

        // 2. Do the sort
        const colorOrder = [
          'red','purple','blue','orange','pink',
          'lime','green','sky','yellow','black'
        ];
        const sortedCards = opts.cards.slice().sort((a, b) => {
          const aCol = (a.cover && a.cover.color) || '';
          const bCol = (b.cover && b.cover.color) || '';
          return colorOrder.indexOf(aCol) - colorOrder.indexOf(bCol);
        });

        // 3. Log the result
        const sortedInfos = sortedCards.map(c => ({
          id:   c.id,
          name: c.name,
          color: (c.cover && c.cover.color) || 'none'
        }));
        console.log('🔵 Cover Sorter result:', sortedInfos);

        // 4. Return the new order
        return { sortedIds: sortedCards.map(c => c.id) };
      }
    }];
  }
});
