(function(){
  var SHAPES = [
    {n:'círculo', c:'#ff5d8f', p:'<circle cx="50" cy="50" r="32"/>'},
    {n:'triângulo', c:'#ff9f1c', p:'<polygon points="50,14 88,82 12,82"/>'},
    {n:'quadrado', c:'#3ddc97', p:'<rect x="18" y="18" width="64" height="64" rx="12"/>'},
    {n:'estrela', c:'#ffc400', p:'<polygon points="50,10 61,38 91,40 68,59 76,88 50,72 24,88 32,59 9,40 39,38"/>'},
    {n:'losango', c:'#2bb3f3', p:'<polygon points="50,8 92,50 50,92 8,50"/>'},
    {n:'coração', c:'#e8335a', p:'<path d="M50 86C20 64 11 46 11 33 11 21 21 12 32 12c9 0 15 5 18 12 3-7 9-12 18-12 11 0 21 9 21 21 0 13-9 31-39 53z"/>'},
    {n:'hexágono', c:'#9b5de5', p:'<polygon points="50,8 87,29 87,71 50,92 13,71 13,29"/>'},
    {n:'cruz', c:'#1fb5a8', p:'<path d="M38 12h24v26h26v24H62v26H38V62H12V38h26z"/>'}
  ];

  var board = document.getElementById('board');
  var movesEl = document.getElementById('moves');
  var timeEl = document.getElementById('time');
  var bestEl = document.getElementById('best');
  var overlay = document.getElementById('overlay');

  var first = null, lock = false, moves = 0, matched = 0, seconds = 0, timer = null, started = false;

  function fmt(s){ return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }

  function getBest(){
    try { var v = localStorage.getItem('memoria-recorde'); return v ? parseInt(v,10) : null; }
    catch(e){ return null; }
  }
  function setBest(v){
    try { localStorage.setItem('memoria-recorde', String(v)); } catch(e){}
  }
  function showBest(){
    var b = getBest();
    bestEl.textContent = b ? b : '–';
  }

  function shuffle(a){
    for (var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a;
  }

  function stopTimer(){ clearInterval(timer); timer = null; }
  function startTimer(){
    if (started) return;
    started = true;
    timer = setInterval(function(){ seconds++; timeEl.textContent = fmt(seconds); }, 1000);
  }

  function newGame(){
    stopTimer();
    first = null; lock = false; moves = 0; matched = 0; seconds = 0; started = false;
    movesEl.textContent = '0'; timeEl.textContent = '0:00';
    overlay.classList.remove('show');
    showBest();
    var deck = [];
    SHAPES.forEach(function(s,i){ deck.push(i, i); });
    shuffle(deck);
    board.innerHTML = '';
    deck.forEach(function(id){
      var s = SHAPES[id];
      var b = document.createElement('button');
      b.className = 'card';
      b.type = 'button';
      b.dataset.id = id;
      b.setAttribute('aria-label', 'Carta virada para baixo');
      b.innerHTML =
        '<span class="inner">' +
          '<span class="face back"></span>' +
          '<span class="face front"><svg viewBox="0 0 100 100" fill="' + s.c + '" aria-hidden="true">' + s.p + '</svg></span>' +
        '</span>';
      b.addEventListener('click', function(){ flip(b); });
      board.appendChild(b);
    });
  }

  function flip(card){
    if (lock || card.classList.contains('open') || card.classList.contains('done')) return;
    startTimer();
    card.classList.add('open');
    card.setAttribute('aria-label', 'Carta: ' + SHAPES[card.dataset.id].n);
    if (!first){ first = card; return; }

    moves++;
    movesEl.textContent = moves;
    var a = first, b = card;
    first = null;

    if (a.dataset.id === b.dataset.id){
      a.classList.replace('open','done');
      b.classList.replace('open','done');
      a.disabled = b.disabled = true;
      matched++;
      if (matched === SHAPES.length) win();
    } else {
      lock = true;
      setTimeout(function(){
        [a,b].forEach(function(c){
          c.classList.remove('open');
          c.setAttribute('aria-label','Carta virada para baixo');
        });
        lock = false;
      }, 850);
    }
  }

  function win(){
    stopTimer();
    var best = getBest();
    var record = !best || moves < best;
    if (record){ setBest(moves); showBest(); }
    document.getElementById('win-text').textContent = moves + ' jogadas em ' + fmt(seconds) + '.';
    document.getElementById('win-best').textContent = record ? 'Novo recorde!' : 'Seu recorde é ' + best + ' jogadas.';
    setTimeout(function(){
      overlay.classList.add('show');
      document.getElementById('again').focus();
    }, 600);
  }

  document.getElementById('restart').addEventListener('click', newGame);
  document.getElementById('again').addEventListener('click', newGame);

  document.getElementById('theme').addEventListener('click', function(){
    var root = document.documentElement;
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
  });

  newGame();
})();
