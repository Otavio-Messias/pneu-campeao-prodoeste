// ============================================================
//  PNEU CAMPEÃO PRODOESTE — script.js
//  Envio via JSONP (contorna CORS do Google Apps Script)
// ============================================================

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxarz-J7CKJqAMWlfnT_d0kdeBuEVS1eCYNHnbhd1gT/exec';

// Máscara de telefone
document.getElementById('telefone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').substring(0, 11);
  if (v.length >= 7)      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if (v.length >= 3) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length > 0)  v = `(${v}`;
  this.value = v;
});

// Permitir apenas números na Nota Fiscal
document.getElementById('nota').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

function validateForm(data) {
  if (!data.nome.trim()) return 'Nome do cliente é obrigatório.';
  if (!data.nota.trim()) return 'Número da Nota Fiscal é obrigatório.';
  if (data.telefone.replace(/\D/g,'').length < 10) return 'Telefone / WhatsApp inválido.';

  if (data.brasil === '') return 'Informe o palpite de gols do Brasil.';
  if (data.marrocos === '') return 'Informe o palpite de gols do adversário.';

  return null;
}

function showFeedback(type, message) {
  const el = document.getElementById('formFeedback');
  el.className = `form-feedback ${type}`;
  el.textContent = message;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function sendViaJsonp(data) {
  return new Promise((resolve, reject) => {
    const callbackName = 'gs_cb_' + Date.now();
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout: sem resposta do servidor.'));
    }, 10000);

    function cleanup() {
      delete window[callbackName];
      const s = document.getElementById('jsonp_script');
      if (s) s.remove();
    }

    window[callbackName] = function (response) {
      clearTimeout(timeout);
      cleanup();
      if (response && response.status === 'ok') {
        resolve(response);
      } else {
        reject(new Error(response?.message || 'Resposta inesperada do servidor.'));
      }
    };

    const params = new URLSearchParams({ ...data, callback: callbackName });
    const script = document.createElement('script');
    script.id  = 'jsonp_script';
    script.src = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Erro ao conectar com o servidor.'));
    };
    document.body.appendChild(script);
  });
}

document.getElementById('notaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');

  const data = {
    nome: document.getElementById('nome').value.trim(),
    nota: document.getElementById('nota').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),

    brasil: document.getElementById('brasil').value.trim(),
    marrocos: document.getElementById('marrocos').value.trim(),

    timestamp: new Date().toLocaleString('pt-BR'),
  };

  const error = validateForm(data);
  if (error) {
    showFeedback('error', error);
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
  document.getElementById('formFeedback').classList.add('hidden');

  try {
    await sendViaJsonp(data);
    showFeedback('success', '✅ Cadastro realizado com sucesso! Boa sorte no sorteio e no palpite premiado!');
    this.reset();
  } catch (err) {
    console.error('Erro:', err);
    showFeedback('error', '❌ Erro ao enviar: ' + err.message);
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = '<i class="fa-solid fa-futbol"></i> PARTICIPAR';
  }
});

document.querySelectorAll('a[href="#formulario"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('formulario').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});