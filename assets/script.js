// ============================================================
// SALL shared scripts
// ============================================================

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function(){
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.main-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
  }
});

// ---------- Checklist progress (used on self-check & reflection pages) ----------
function initChecklist(listId, progressFillId, progressLabelId, storageKey){
  var list = document.getElementById(listId);
  if(!list) return;
  var boxes = list.querySelectorAll('input[type=checkbox]');
  var fill = document.getElementById(progressFillId);
  var label = document.getElementById(progressLabelId);

  function load(){
    try{
      var saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      boxes.forEach(function(b){ if(saved[b.id]) b.checked = true; });
    }catch(e){}
  }
  function save(){
    var state = {};
    boxes.forEach(function(b){ state[b.id] = b.checked; });
    try{ sessionStorage.setItem(storageKey, JSON.stringify(state)); }catch(e){}
  }
  function update(){
    var total = boxes.length;
    var checked = 0;
    boxes.forEach(function(b){ if(b.checked) checked++; });
    var pct = total ? Math.round((checked/total)*100) : 0;
    if(fill) fill.style.width = pct + '%';
    if(label) label.textContent = checked + ' of ' + total + ' complete (' + pct + '%)';
    save();
  }
  boxes.forEach(function(b){ b.addEventListener('change', update); });
  load();
  update();
}

// ---------- Quiz engine ----------
// quizData: array of { q, choices: [...], answerIndex, explain }
function initQuiz(containerId, quizData, resultId){
  var container = document.getElementById(containerId);
  var resultBox = document.getElementById(resultId);
  if(!container) return;

  quizData.forEach(function(item, qi){
    var qDiv = document.createElement('div');
    qDiv.className = 'quiz-q';
    qDiv.id = 'q-' + qi;

    var qText = document.createElement('div');
    qText.className = 'q-text';
    qText.textContent = (qi+1) + '. ' + item.q;
    qDiv.appendChild(qText);

    item.choices.forEach(function(choice, ci){
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'q' + qi;
      input.value = ci;
      label.appendChild(input);
      label.appendChild(document.createTextNode(choice));
      qDiv.appendChild(label);
    });

    var fb = document.createElement('div');
    fb.className = 'feedback-msg';
    fb.style.display = 'none';
    fb.id = 'fb-' + qi;
    qDiv.appendChild(fb);

    container.appendChild(qDiv);
  });

  var btn = document.createElement('button');
  btn.className = 'btn btn-green';
  btn.type = 'button';
  btn.textContent = 'Check my answers';
  btn.style.marginTop = '10px';
  container.appendChild(btn);

  btn.addEventListener('click', function(){
    var score = 0;
    quizData.forEach(function(item, qi){
      var qDiv = document.getElementById('q-' + qi);
      var selected = qDiv.querySelector('input[name=q' + qi + ']:checked');
      var fb = document.getElementById('fb-' + qi);
      qDiv.classList.remove('correct','incorrect');
      fb.style.display = 'block';
      if(!selected){
        fb.textContent = 'Please choose an answer.';
        fb.className = 'feedback-msg incorrect';
        return;
      }
      var val = parseInt(selected.value, 10);
      if(val === item.answerIndex){
        score++;
        qDiv.classList.add('correct');
        fb.className = 'feedback-msg correct';
        fb.textContent = '✓ Correct! ' + (item.explain || '');
      } else {
        qDiv.classList.add('incorrect');
        fb.className = 'feedback-msg incorrect';
        fb.textContent = '✗ Not quite. ' + (item.explain || '');
      }
    });

    if(resultBox){
      var pct = Math.round((score/quizData.length)*100);
      var msg = pct >= 80 ? "Great work — you're ready for the next stage."
              : pct >= 50 ? "Good effort. Review the missed items, then try again."
              : "Let's revisit this stage's material before moving on.";
      resultBox.innerHTML = '<div class="score">' + score + ' / ' + quizData.length + '</div>' +
                            '<div>' + pct + '% — ' + msg + '</div>';
      resultBox.style.display = 'block';
      resultBox.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });
}
