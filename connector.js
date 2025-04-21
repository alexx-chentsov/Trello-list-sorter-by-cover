window.TrelloPowerUp.initialize({
  'list-sorters': function(t) {
    return [{
      text: 'Cover Color',
      callback: function(t, opts) {
        const colorOrder = ['green','yellow','orange','red','purple','blue','sky','lime','pink','black'];
        const sorted = opts.cards.slice().sort((a,b) => 
          colorOrder.indexOf((a.cover||{}).color||'') 
          - colorOrder.indexOf((b.cover||{}).color||'')
        );
        return { sortedIds: sorted.map(c => c.id) };
      }
    }];
  }
});
