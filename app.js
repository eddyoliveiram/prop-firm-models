const tradeTemplate = document.getElementById('tradeTemplate');
const addTradeBtn = document.getElementById('addTrade');
const addTradeCushionBtn = document.getElementById('addTradeCushion');
const addTradeSaqueBtn = document.getElementById('addTradeSaque');
const modelDefaultInput = document.getElementById('modelDefault');
const modelScaledInput = document.getElementById('modelScaled');
const stopAllBtn = document.getElementById('stopAll');
const resetAllBtn = document.getElementById('resetAll');
const resetKeepSaqueBtn = document.getElementById('resetKeepSaque');
const targetInput = document.getElementById('target');
const ddInput = document.getElementById('dd');
const ddTypeApprovalTrailing = document.getElementById('ddTypeTrailing');
const ddTypeApprovalStatic = document.getElementById('ddTypeStatic');
const targetCushionInput = document.getElementById('targetCushion');
const ddCushionInput = document.getElementById('ddCushion');
const ddTypeCushionTrailing = document.getElementById('ddTypeCushionTrailing');
const ddTypeCushionStatic = document.getElementById('ddTypeCushionStatic');
const enableCushionInput = document.getElementById('enableCushion');
const cushionConfigCard = document.getElementById('cushionConfigCard');
const cushionTradesCard = document.getElementById('cushionTradesCard');
const cushionExecutionCard = document.getElementById('cushionExecutionCard');
const targetSaqueInput = document.getElementById('targetSaque');
const ddSaqueInput = document.getElementById('ddSaque');
const ddTypeSaqueTrailing = document.getElementById('ddTypeSaqueTrailing');
const ddTypeSaqueStatic = document.getElementById('ddTypeSaqueStatic');
const targetSaquePostInput = document.getElementById('targetSaquePost');
const ddSaquePostInput = document.getElementById('ddSaquePost');
const enableSaquePostInput = document.getElementById('enableSaquePost');
const speedInput = document.getElementById('speed');
const accountsInput = document.getElementById('accounts');
const accountValueInput = document.getElementById('accountValue');
const payoutInput = document.getElementById('payout');
const tradesEl = document.getElementById('trades');
const tradesCushionEl = document.getElementById('tradesCushion');
const tradesSaqueEl = document.getElementById('tradesSaque');
const tradesSaquePostEl = document.getElementById('tradesSaquePost');
const addTradeSaquePostBtn = document.getElementById('addTradeSaquePost');
const saquePostCard = document.getElementById('saquePostCard');
const accountsGridApproval = document.getElementById('accountsGridApproval');
const accountsGridCushion = document.getElementById('accountsGridCushion');
const accountsGridSaque = document.getElementById('accountsGridSaque');
const statusBadge = document.getElementById('statusBadge');
const runInfoApproval = document.getElementById('runInfoApproval');
const runInfoCushion = document.getElementById('runInfoCushion');
const runInfoSaque = document.getElementById('runInfoSaque');
const investedTotalEl = document.getElementById('investedTotal');
const profitTotalEl = document.getElementById('profitTotal');
const reportBoughtEl = document.getElementById('reportBought');
const reportApprovalEl = document.getElementById('reportApproval');
const reportCushionEl = document.getElementById('reportCushion');
const reportSaqueEl = document.getElementById('reportSaque');
const reportPayoutsEl = document.getElementById('reportPayouts');
const reportInvestedEl = document.getElementById('reportInvested');
const reportReturnEl = document.getElementById('reportReturn');
const reportRoiEl = document.getElementById('reportRoi');
const reportTradesEl = document.getElementById('reportTrades');

let approvalTimer = null;
let cushionTimer = null;
let saqueTimer = null;
let accounts = [];
let approvalTradesExecuted = 0;
let cushionTradesExecuted = 0;
let saqueTradesExecuted = 0;
let totalInvested = 0;
let totalReturned = 0;
let totalBought = 0;
let totalTrades = 0;
let totalApprovalPass = 0;
let totalCushionPass = 0;
let totalSaquePass = 0;
let totalPayouts = 0;

const PHASES = {
  approval: {
    key: 'approval',
    name: 'Fase de Aprovação',
    tradesEl,
    targetInput,
    ddInput,
    ddTypeTrailing: ddTypeApprovalTrailing,
    ddTypeStatic: ddTypeApprovalStatic,
    accountsGrid: accountsGridApproval,
  },
  cushion: {
    key: 'cushion',
    name: 'Fase Colchão',
    tradesEl: tradesCushionEl,
    targetInput: targetCushionInput,
    ddInput: ddCushionInput,
    ddTypeTrailing: ddTypeCushionTrailing,
    ddTypeStatic: ddTypeCushionStatic,
    accountsGrid: accountsGridCushion,
  },
  saque: {
    key: 'saque',
    name: 'Fase Saque',
    tradesEl: tradesSaqueEl,
    targetInput: targetSaqueInput,
    ddInput: ddSaqueInput,
    ddTypeTrailing: ddTypeSaqueTrailing,
    ddTypeStatic: ddTypeSaqueStatic,
    accountsGrid: accountsGridSaque,
  },
};

function formatMoney(value) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
}

function formatUSD(value) {
  return `US$ ${value.toLocaleString('en-US')}`;
}

function calcProbability(risk, reward) {
  const r = Math.max(0, risk);
  const w = Math.max(0, reward);
  if (r + w === 0) return 0;
  return r / (r + w);
}

function updateProbability(tradeEl) {
  const risk = Number(tradeEl.querySelector('.risk').value) || 0;
  const reward = Number(tradeEl.querySelector('.reward').value) || 0;
  const prob = calcProbability(risk, reward);
  const probEl = tradeEl.querySelector('.probValue');
  probEl.textContent = `${(prob * 100).toFixed(2).replace('.', ',')}%`;
}

function addTradeTo(container, { risk = 1000, reward = 1000 } = {}) {
  const node = tradeTemplate.content.cloneNode(true);
  const tradeEl = node.querySelector('.trade');
  const riskInput = tradeEl.querySelector('.risk');
  const rewardInput = tradeEl.querySelector('.reward');
  const removeBtn = tradeEl.querySelector('.remove');

  riskInput.value = risk;
  rewardInput.value = reward;

  const onChange = () => updateProbability(tradeEl);
  riskInput.addEventListener('input', onChange);
  rewardInput.addEventListener('input', onChange);

  removeBtn.addEventListener('click', () => {
    if (container.children.length <= 1) return;
    tradeEl.remove();
    updateAllProbabilities(container);
  });

  container.appendChild(tradeEl);
  updateProbability(tradeEl);
}

function updateAllProbabilities(container) {
  Array.from(container.children).forEach(updateProbability);
}

function getTradesFrom(container) {
  return Array.from(container.children).map((tradeEl) => {
    const risk = Number(tradeEl.querySelector('.risk').value) || 0;
    const reward = Number(tradeEl.querySelector('.reward').value) || 0;
    const prob = calcProbability(risk, reward);
    return { risk, reward, prob };
  });
}

function setTradesFor(container, trades) {
  container.innerHTML = '';
  trades.forEach((trade) => addTradeTo(container, trade));
  updateAllProbabilities(container);
}

function isCushionEnabled() {
  return enableCushionInput.checked;
}

function isSaquePostEnabled() {
  return enableSaquePostInput.checked;
}

function updateCushionDisabledState() {
  const disabled = !isCushionEnabled();
  if (cushionConfigCard) {
    cushionConfigCard.classList.toggle('disabled', false);
  }
  [cushionTradesCard, cushionExecutionCard].forEach((card) => {
    if (!card) return;
    card.classList.toggle('disabled', disabled);
  });
}

function updateSaquePostDisabledState() {
  const disabled = !isSaquePostEnabled();
  if (saquePostCard) {
    saquePostCard.classList.toggle('disabled', disabled);
  }
}

function createPhaseState(initialStatus) {
  return {
    equity: 0,
    peak: 0,
    status: initialStatus,
    lastDelta: 0,
    history: [],
    tradeIndex: 0,
  };
}

function purchaseAccounts(count) {
  const accountValue = Number(accountValueInput.value) || 0;
  totalBought += count;
  totalInvested += count * accountValue;
}

function resetSimulation() {
  const count = Math.max(1, Number(accountsInput.value) || 1);
  accounts = Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    approval: createPhaseState('active'),
    cushion: createPhaseState('locked'),
    saque: createPhaseState('locked'),
    paid: false,
    payoutCount: 0,
    lastBreakPhase: null,
    approvalPassed: false,
    cushionPassed: false,
    saqueReached: false,
  }));

  approvalTradesExecuted = 0;
  cushionTradesExecuted = 0;
  saqueTradesExecuted = 0;
  totalInvested = 0;
  totalReturned = 0;
  totalBought = 0;
  totalTrades = 0;
  totalApprovalPass = 0;
  totalCushionPass = 0;
  totalSaquePass = 0;
  totalPayouts = 0;
  purchaseAccounts(count);

  renderAccounts('approval');
  renderAccounts('cushion');
  renderAccounts('saque');
  updateStats();
  updateRunInfoApproval();
  updateRunInfoCushion();
  updateRunInfoSaque();
  setStatus('Pronto para simular', 'ready');
  updateResetKeepSaqueState();
}

function resetCycleFresh() {
  const count = Math.max(1, Number(accountsInput.value) || 1);
  accounts = Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    approval: createPhaseState('active'),
    cushion: createPhaseState('locked'),
    saque: createPhaseState('locked'),
    paid: false,
    payoutCount: 0,
    lastBreakPhase: null,
    approvalPassed: false,
    cushionPassed: false,
    saqueReached: false,
  }));

  approvalTradesExecuted = 0;
  cushionTradesExecuted = 0;
  saqueTradesExecuted = 0;

  totalInvested = 0;
  totalReturned = 0;
  totalBought = 0;
  totalTrades = 0;
  totalApprovalPass = 0;
  totalCushionPass = 0;
  totalSaquePass = 0;
  totalPayouts = 0;

  purchaseAccounts(count);

  renderAccounts('approval');
  renderAccounts('cushion');
  renderAccounts('saque');
  updateStats();
  updateRunInfoApproval();
  updateRunInfoCushion();
  updateRunInfoSaque();
  setStatus('Pronto para simular', 'ready');
  updateResetKeepSaqueState();
}

function resetKeepingSaque() {
  const targetCount = Math.max(1, Number(accountsInput.value) || 1);
  const kept = accounts.filter(
    (account) => account.payoutCount > 0 && account.saque.status !== 'fail'
  );
  let nextId = accounts.reduce((maxId, account) => Math.max(maxId, account.id), 0) + 1;
  const newCount = Math.max(0, targetCount - kept.length);
  const fresh = Array.from({ length: newCount }, () => ({
    id: nextId++,
    approval: createPhaseState('active'),
    cushion: createPhaseState('locked'),
    saque: createPhaseState('locked'),
    paid: false,
    payoutCount: 0,
    lastBreakPhase: null,
    approvalPassed: false,
    cushionPassed: false,
    saqueReached: false,
  }));

  accounts = [...kept, ...fresh];

  approvalTradesExecuted = 0;
  cushionTradesExecuted = 0;
  saqueTradesExecuted = 0;

  if (newCount > 0) {
    purchaseAccounts(newCount);
  }

  renderAccounts('approval');
  renderAccounts('cushion');
  renderAccounts('saque');
  updateStats();
  updateRunInfoApproval();
  updateRunInfoCushion();
  updateRunInfoSaque();
  setStatus('Pronto para simular', 'ready');
  updateResetKeepSaqueState();
}

function updateStats() {
  accounts.forEach((account) => {
    updateAccountCard('approval', account.id);
    updateAccountCard('cushion', account.id);
    updateAccountCard('saque', account.id);
  });
  updateSessionFinance();
}

function updateRunInfoApproval() {
  const approved = accounts.filter((account) => account.approval.status === 'success').length;
  const failed = accounts.filter((account) => account.approval.status === 'fail').length;
  const active = accounts.filter((account) => account.approval.status === 'active').length;
  const tradeCounts = accounts.map((account) => account.approval.tradeIndex);
  const minTrades = tradeCounts.length ? Math.min(...tradeCounts) : 0;
  const maxTrades = tradeCounts.length ? Math.max(...tradeCounts) : 0;
  const avgTrades = tradeCounts.length
    ? tradeCounts.reduce((sum, value) => sum + value, 0) / tradeCounts.length
    : 0;
  if (approvalTradesExecuted === 0) {
    runInfoApproval.textContent = `Sem trades executados — ${active} ativa(s)`;
  } else {
    runInfoApproval.textContent = `Trades por conta: ${minTrades}–${maxTrades} (média ${avgTrades.toFixed(1).replace('.', ',')}) — ${active} ativa(s), ${approved} aprovadas, ${failed} quebradas`;
  }
}

function updateRunInfoCushion() {
  if (!isCushionEnabled()) {
    runInfoCushion.textContent = 'Fase Colchão desabilitada';
    return;
  }
  const eligible = accounts.filter((account) => account.approval.status === 'success');
  const active = eligible.filter((account) => account.cushion.status === 'active').length;
  const pending = eligible.filter((account) => account.cushion.status === 'pending').length;
  const success = eligible.filter((account) => account.cushion.status === 'success').length;
  const fail = eligible.filter((account) => account.cushion.status === 'fail').length;
  const tradeCounts = eligible.map((account) => account.cushion.tradeIndex);
  const minTrades = tradeCounts.length ? Math.min(...tradeCounts) : 0;
  const maxTrades = tradeCounts.length ? Math.max(...tradeCounts) : 0;
  const avgTrades = tradeCounts.length
    ? tradeCounts.reduce((sum, value) => sum + value, 0) / tradeCounts.length
    : 0;
  if (eligible.length === 0) {
    runInfoCushion.textContent = 'Sem contas aprovadas para executar';
    return;
  }
  if (cushionTradesExecuted === 0) {
    runInfoCushion.textContent = `Aguardando execução — ${pending} pendente(s), ${active} ativa(s)`;
  } else {
    runInfoCushion.textContent = `Trades por conta: ${minTrades}–${maxTrades} (média ${avgTrades.toFixed(1).replace('.', ',')}) — ${active} ativa(s), ${success} aprovadas, ${fail} quebradas`;
  }
}

function updateRunInfoSaque() {
  const eligible = isCushionEnabled()
    ? accounts.filter((account) => account.cushion.status === 'success')
    : accounts.filter((account) => account.approval.status === 'success');
  const active = eligible.filter((account) => account.saque.status === 'active').length;
  const pending = eligible.filter((account) => account.saque.status === 'pending').length;
  const success = eligible.filter((account) => account.payoutCount > 0).length;
  const fail = eligible.filter((account) => account.saque.status === 'fail').length;
  const tradeCounts = eligible.map((account) => account.saque.tradeIndex);
  const minTrades = tradeCounts.length ? Math.min(...tradeCounts) : 0;
  const maxTrades = tradeCounts.length ? Math.max(...tradeCounts) : 0;
  const avgTrades = tradeCounts.length
    ? tradeCounts.reduce((sum, value) => sum + value, 0) / tradeCounts.length
    : 0;
  if (eligible.length === 0) {
    runInfoSaque.textContent = 'Sem contas aprovadas para executar';
    return;
  }
  if (saqueTradesExecuted === 0) {
    runInfoSaque.textContent = `Aguardando execução — ${pending} pendente(s), ${active} ativa(s)`;
  } else {
    runInfoSaque.textContent = `Trades por conta: ${minTrades}–${maxTrades} (média ${avgTrades.toFixed(1).replace('.', ',')}) — ${active} ativa(s), ${success} aprovadas, ${fail} quebradas`;
  }
}

function setStatus(text, state) {
  statusBadge.textContent = text;
  statusBadge.dataset.state = state;
}

function updateSessionFinance() {
  const payout = Number(payoutInput.value) || 0;
  const returned = totalReturned;
  const invested = totalInvested;
  const profit = returned - invested;
  investedTotalEl.textContent = formatUSD(invested);
  profitTotalEl.textContent = formatUSD(profit);
  profitTotalEl.style.color = profit >= 0 ? '#2f6d4a' : '#9e3a2e';

  reportBoughtEl.textContent = String(totalBought);
  reportApprovalEl.textContent = String(totalApprovalPass);
  reportCushionEl.textContent = String(totalCushionPass);
  reportSaqueEl.textContent = String(totalSaquePass);
  reportPayoutsEl.textContent = String(totalPayouts);
  reportInvestedEl.textContent = formatUSD(invested);
  reportReturnEl.textContent = formatUSD(returned);
  const roi = invested === 0 ? 0 : (profit / invested) * 100;
  reportRoiEl.textContent = `${roi.toFixed(2).replace('.', ',')}%`;
  reportRoiEl.style.color = roi >= 0 ? '#2f6d4a' : '#9e3a2e';
  reportTradesEl.textContent = String(totalTrades);
  updateResetKeepSaqueState();
}

function updateResetKeepSaqueState() {
  // Iniciar novo ciclo fica sempre habilitado.
}

function renderAccounts(phaseKey) {
  const phase = PHASES[phaseKey];
  const container = phase.accountsGrid;
  container.innerHTML = '';
  const toRender = accounts.filter((account) => {
    if (phaseKey === 'approval') {
      if (account.payoutCount > 0 && account.saque.status !== 'fail') return false;
      return true;
    }
    if (phaseKey === 'cushion') {
      if (!isCushionEnabled()) return false;
      return account.approval.status === 'success';
    }
    if (phaseKey === 'saque') {
      return isCushionEnabled()
        ? account.cushion.status === 'success'
        : account.approval.status === 'success';
    }
    return true;
  });

  toRender.forEach((account) => {
    const phaseState = account[phaseKey];
    const card = document.createElement('div');
    card.className = 'account-card';
    card.dataset.status = phaseState.status;
    card.dataset.accountId = String(account.id);
    card.innerHTML = `
      <header>
        <strong>Conta ${account.id}</strong>
        <span class="badge">${statusLabel(phaseKey, phaseState.status, account)}</span>
      </header>
      <p class="muted">Fase atual: ${phase.name}</p>
      <p class="muted break-info">${breakLabel(account)}</p>
      <div class="account-metrics">
        <div>
          <span>Acumulado</span>
          <strong>${formatMoney(phaseState.equity)}</strong>
        </div>
        <div>
          <span>Pico</span>
          <strong>${formatMoney(phaseState.peak)}</strong>
        </div>
        <div>
          <span>Último trade</span>
          <strong>${phaseState.lastDelta === 0 ? '-' : formatMoney(phaseState.lastDelta)}</strong>
        </div>
        <div>
          <span>Limite</span>
          <strong>${formatMoney(getBreakPointForAccount(phaseKey, phaseState, account))}</strong>
        </div>
        ${phaseKey === 'saque'
          ? `<div><span>Saques</span><strong class="saque-count">${account.payoutCount}</strong></div>`
          : ''}
      </div>
      <div class="account-history" aria-label="Histórico de trades">
        <div class="history-header">
          <span class="muted">Trades</span>
          <strong class="history-count">0</strong>
        </div>
        <div class="history-dots"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateAccountCard(phaseKey, accountId) {
  const phase = PHASES[phaseKey];
  const container = phase.accountsGrid;
  const card = container.querySelector(`[data-account-id="${accountId}"]`);
  if (!card) return;
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return;
  const phaseState = account[phaseKey];
  card.dataset.status = phaseState.status;
  card.querySelector('.badge').textContent = statusLabel(phaseKey, phaseState.status, account);
  const breakInfo = card.querySelector('.break-info');
  if (breakInfo) {
    breakInfo.textContent = breakLabel(account);
    breakInfo.style.display = breakInfo.textContent ? 'block' : 'none';
  }
  const metrics = card.querySelectorAll('.account-metrics strong');
  metrics[0].textContent = formatMoney(phaseState.equity);
  metrics[1].textContent = formatMoney(phaseState.peak);
  metrics[2].textContent = phaseState.lastDelta === 0 ? '-' : formatMoney(phaseState.lastDelta);
  metrics[3].textContent = formatMoney(getBreakPointForAccount(phaseKey, phaseState, account));
  const saqueCount = card.querySelector('.saque-count');
  if (saqueCount) {
    saqueCount.textContent = String(account.payoutCount);
  }
  const historyEl = card.querySelector('.account-history');
  const dotsEl = historyEl.querySelector('.history-dots');
  const countEl = historyEl.querySelector('.history-count');
  dotsEl.innerHTML = '';

  countEl.textContent = String(phaseState.history.length);
  phaseState.history
    .slice()
    .reverse()
    .forEach((entry) => {
    const dot = document.createElement('span');
    dot.className = `history-dot ${entry.delta >= 0 ? 'positive' : 'negative'}`;
    dotsEl.appendChild(dot);
  });
}

function getBreakPoint(phaseKey, phaseState) {
  const phase = PHASES[phaseKey];
  const dd = Number(phase.ddInput.value) || 0;
  const isStatic = phase.ddTypeStatic.checked;
  if (isStatic) {
    return dd;
  }
  return phaseState.peak + dd;
}

function getBreakPointForAccount(phaseKey, phaseState, account) {
  if (phaseKey === 'saque' && account.payoutCount > 0 && isSaquePostEnabled()) {
    return Number(ddSaquePostInput.value) || 0;
  }
  return getBreakPoint(phaseKey, phaseState);
}

function getSaqueTradesForAccount(account) {
  if (account.payoutCount > 0 && isSaquePostEnabled()) {
    return getTradesFrom(tradesSaquePostEl);
  }
  return getTradesFrom(tradesSaqueEl);
}

function getSaqueTargetForAccount(account) {
  if (account.payoutCount > 0 && isSaquePostEnabled()) {
    return Number(targetSaquePostInput.value) || 0;
  }
  return Number(targetSaqueInput.value) || 0;
}

function breakLabel(account) {
  if (!account.lastBreakPhase) return '';
  const phaseName = PHASES[account.lastBreakPhase]?.name || account.lastBreakPhase;
  return `Quebrou na ${phaseName}`;
}

function statusLabel(phaseKey, status, account) {
  if (status === 'fail') {
    return breakLabel(account) || 'Quebrada';
  }
  if (phaseKey === 'saque' && account.payoutCount > 0) {
    return `Saque ${account.payoutCount}x`;
  }
  if (phaseKey === 'cushion' && status === 'pending') return 'Pendente';
  if (phaseKey === 'cushion' && status === 'locked') return 'Bloqueada';
  if (phaseKey === 'saque' && status === 'pending') return 'Pendente';
  if (phaseKey === 'saque' && status === 'locked') return 'Bloqueada';
  return 'Ativa';
}

function runApprovalStep() {
  const trades = getTradesFrom(tradesEl);
  if (trades.length === 0) return;

  const target = Number(targetInput.value) || 0;
  const dd = Number(ddInput.value) || 0;
  const activeAccounts = accounts.filter((account) => account.approval.status === 'active');
  if (activeAccounts.length === 0) {
    stopApproval();
    setStatus('Fase de Aprovação encerrada', 'success');
    return;
  }

  let hasNewApproval = false;

  accounts.forEach((account) => {
    if (account.approval.status !== 'active') return;
    const trade = trades[account.approval.tradeIndex % trades.length];
    const win = Math.random() < trade.prob;
    const delta = win ? trade.reward : -trade.risk;

    account.approval.equity += delta;
    if (account.approval.equity > account.approval.peak) {
      account.approval.peak = account.approval.equity;
    }
    account.approval.lastDelta = delta;
    account.approval.tradeIndex += 1;
    account.approval.history.unshift({
      delta,
      label: win ? 'Trade vencedor' : 'Trade perdedor',
    });

    const breakPoint = getBreakPoint('approval', account.approval);
    approvalTradesExecuted += 1;
    totalTrades += 1;

    if (account.approval.equity >= target) {
      account.approval.status = 'success';
      if (!account.approvalPassed) {
        account.approvalPassed = true;
        totalApprovalPass += 1;
      }
      if (account.cushion.status === 'locked') {
        account.cushion.status = 'pending';
        hasNewApproval = true;
      }
    } else if (account.approval.equity <= breakPoint) {
      account.approval.status = 'fail';
      account.lastBreakPhase = 'approval';
    }

    updateAccountCard('approval', account.id);
  });

  if (hasNewApproval) {
    renderAccounts('cushion');
  }

  updateStats();
  updateRunInfoApproval();

  const active = accounts.filter((account) => account.approval.status === 'active').length;
  if (active === 0) {
    stopApproval();
    const eligible = accounts.filter((account) => account.approval.status === 'success');
    if (eligible.length > 0) {
      if (isCushionEnabled()) {
        eligible.forEach((account) => {
          if (account.cushion.status === 'pending') {
            account.cushion.status = 'active';
          }
        });
        renderAccounts('cushion');
        updateRunInfoCushion();
        startCushion();
        return;
      }
      eligible.forEach((account) => {
        if (account.saque.status === 'locked') {
          account.saque.status = 'pending';
        }
      });
      renderAccounts('saque');
      updateRunInfoSaque();
      startSaque();
      return;
    }
    setStatus('Fase de Aprovação encerrada', 'success');
  } else {
    setStatus(`Executando Fase de Aprovação… (${active} ativa(s))`, 'running');
  }
}

function runCushionStep() {
  if (!isCushionEnabled()) {
    stopCushion();
    return;
  }
  const trades = getTradesFrom(tradesCushionEl);
  if (trades.length === 0) return;

  const target = Number(targetCushionInput.value) || 0;
  const dd = Number(ddCushionInput.value) || 0;
  const activeAccounts = accounts.filter(
    (account) => account.approval.status === 'success' && account.cushion.status === 'active'
  );

  if (activeAccounts.length === 0) {
    stopCushion();
    setStatus('Fase Colchão encerrada', 'success');
    return;
  }

  let hasNewApproval = false;

  accounts.forEach((account) => {
    if (account.approval.status !== 'success') return;
    if (account.cushion.status !== 'active') return;

    const trade = trades[account.cushion.tradeIndex % trades.length];
    const win = Math.random() < trade.prob;
    const delta = win ? trade.reward : -trade.risk;

    account.cushion.equity += delta;
    if (account.cushion.equity > account.cushion.peak) {
      account.cushion.peak = account.cushion.equity;
    }
    account.cushion.lastDelta = delta;
    account.cushion.tradeIndex += 1;
    account.cushion.history.unshift({
      delta,
      label: win ? 'Trade vencedor' : 'Trade perdedor',
    });

    const breakPoint = getBreakPoint('cushion', account.cushion);
    cushionTradesExecuted += 1;
    totalTrades += 1;

    if (account.cushion.equity >= target) {
      account.cushion.status = 'success';
      if (!account.cushionPassed) {
        account.cushionPassed = true;
        totalCushionPass += 1;
      }
      if (account.saque.status === 'locked') {
        account.saque.status = 'pending';
        hasNewApproval = true;
      }
    } else if (account.cushion.equity <= breakPoint) {
      account.cushion.status = 'fail';
      account.lastBreakPhase = 'cushion';
    }

    updateAccountCard('cushion', account.id);
  });

  if (hasNewApproval) {
    renderAccounts('saque');
  }

  updateStats();
  updateRunInfoCushion();

  const stillActive = accounts.filter(
    (account) => account.approval.status === 'success' && account.cushion.status === 'active'
  ).length;

  if (stillActive === 0) {
    stopCushion();
    const eligible = accounts.filter((account) => account.cushion.status === 'success');
    if (eligible.length > 0) {
      eligible.forEach((account) => {
        if (account.saque.status === 'pending') {
          account.saque.status = 'active';
        }
      });
      renderAccounts('saque');
      updateRunInfoSaque();
      startSaque();
      return;
    }
    setStatus('Fase Colchão encerrada', 'success');
  } else {
    setStatus(`Executando Fase Colchão… (${stillActive} ativa(s))`, 'running');
  }
}

function runSaqueStep() {
  const payout = Number(payoutInput.value) || 0;
  const activeAccounts = accounts.filter((account) => {
    const eligible = isCushionEnabled()
      ? account.cushion.status === 'success'
      : account.approval.status === 'success';
    return eligible && account.saque.status === 'active';
  });

  if (activeAccounts.length === 0) {
    stopSaque();
    setStatus('Fase Saque encerrada', 'success');
    return;
  }

  accounts.forEach((account) => {
    const eligible = isCushionEnabled()
      ? account.cushion.status === 'success'
      : account.approval.status === 'success';
    if (!eligible) return;
    if (account.saque.status !== 'active') return;

    const trades = getSaqueTradesForAccount(account);
    if (trades.length === 0) return;
    const trade = trades[account.saque.tradeIndex % trades.length];
    const win = Math.random() < trade.prob;
    const delta = win ? trade.reward : -trade.risk;

    account.saque.equity += delta;
    if (account.saque.equity > account.saque.peak) {
      account.saque.peak = account.saque.equity;
    }
    account.saque.lastDelta = delta;
    account.saque.tradeIndex += 1;
    account.saque.history.unshift({
      delta,
      label: win ? 'Trade vencedor' : 'Trade perdedor',
    });

    const breakPoint = getBreakPointForAccount('saque', account.saque, account);
    saqueTradesExecuted += 1;
    totalTrades += 1;

    const targetForAccount = getSaqueTargetForAccount(account);
    if (account.saque.equity >= targetForAccount) {
      if (!account.saqueReached) {
        account.saqueReached = true;
        totalSaquePass += 1;
      }
      account.payoutCount += 1;
      totalPayouts += 1;
      totalReturned += payout;
      account.saque.equity = 0;
      account.saque.peak = 0;
      account.saque.lastDelta = 0;
      account.saque.tradeIndex = 0;
      account.saque.history = [];
      account.saque.status = 'active';
    } else if (account.saque.equity <= breakPoint) {
      account.saque.status = 'fail';
      account.lastBreakPhase = 'saque';
    }

    updateAccountCard('saque', account.id);
  });

  updateStats();
  updateRunInfoSaque();

  const stillActive = accounts.filter((account) => {
    const eligible = isCushionEnabled()
      ? account.cushion.status === 'success'
      : account.approval.status === 'success';
    return eligible && account.saque.status === 'active';
  }).length;

  if (stillActive === 0) {
    stopSaque();
    setStatus('Fase Saque encerrada', 'success');
  } else {
    setStatus(`Executando Fase Saque… (${stillActive} ativa(s))`, 'running');
  }
}

function startApproval() {
  if (approvalTimer) return;
  const speed = Math.max(0.1, Number(speedInput.value) || 0.1);
  approvalTimer = setInterval(runApprovalStep, speed * 1000);
  stopAllBtn.disabled = false;
  setStatus('Executando Fase de Aprovação…', 'running');
}

function stopApproval() {
  if (!approvalTimer) return;
  clearInterval(approvalTimer);
  approvalTimer = null;
  if (!cushionTimer && !saqueTimer) {
    stopAllBtn.disabled = true;
  }
}

function startCushion() {
  if (cushionTimer) return;
  if (!isCushionEnabled()) return;
  const eligible = accounts.filter((account) => account.approval.status === 'success');
  if (eligible.length === 0) return;
  eligible.forEach((account) => {
    if (account.cushion.status === 'pending') {
      account.cushion.status = 'active';
    }
  });
  renderAccounts('cushion');
  updateRunInfoCushion();
  const speed = Math.max(0.1, Number(speedInput.value) || 0.1);
  cushionTimer = setInterval(runCushionStep, speed * 1000);
  stopAllBtn.disabled = false;
  setStatus('Executando Fase Colchão…', 'running');
}

function stopCushion() {
  if (!cushionTimer) return;
  clearInterval(cushionTimer);
  cushionTimer = null;
  if (!approvalTimer && !saqueTimer) {
    stopAllBtn.disabled = true;
  }
}

function startSaque() {
  if (saqueTimer) return;
  const eligible = isCushionEnabled()
    ? accounts.filter((account) => account.cushion.status === 'success')
    : accounts.filter((account) => account.approval.status === 'success');
  if (eligible.length === 0) return;
  eligible.forEach((account) => {
    if (account.saque.status === 'pending') {
      account.saque.status = 'active';
    }
  });
  renderAccounts('saque');
  updateRunInfoSaque();
  const speed = Math.max(0.1, Number(speedInput.value) || 0.1);
  saqueTimer = setInterval(runSaqueStep, speed * 1000);
  stopAllBtn.disabled = false;
  setStatus('Executando Fase Saque…', 'running');
}

function stopSaque() {
  if (!saqueTimer) return;
  clearInterval(saqueTimer);
  saqueTimer = null;
  if (!approvalTimer && !cushionTimer) {
    stopAllBtn.disabled = true;
  }
}

function startSimulationFlow() {
  if (approvalTimer || cushionTimer || saqueTimer) return;
  startApproval();
}

function startNewCycle() {
  if (approvalTimer || cushionTimer || saqueTimer) return;
  if (totalSaquePass > 0) {
    resetKeepingSaque();
  } else {
    resetCycleFresh();
  }
  startSimulationFlow();
}

function stopSimulationFlow() {
  stopApproval();
  stopCushion();
  stopSaque();
}

addTradeBtn.addEventListener('click', () => addTradeTo(tradesEl));
addTradeCushionBtn.addEventListener('click', () => addTradeTo(tradesCushionEl, { risk: 2000, reward: 2000 }));
addTradeSaqueBtn.addEventListener('click', () => addTradeTo(tradesSaqueEl, { risk: 250, reward: 250 }));
addTradeSaquePostBtn.addEventListener('click', () => addTradeTo(tradesSaquePostEl, { risk: 1400, reward: 300 }));
function applyModelDefault() {
  setTradesFor(tradesEl, [
    { risk: 1000, reward: 1000 },
    { risk: 1000, reward: 1000 },
    { risk: 1000, reward: 1000 },
  ]);
  setTradesFor(tradesCushionEl, [{ risk: 2000, reward: 2000 }]);
  setTradesFor(tradesSaqueEl, [
    { risk: 250, reward: 250 },
    { risk: 250, reward: 250 },
    { risk: 250, reward: 250 },
    { risk: 250, reward: 250 },
  ]);
  setTradesFor(tradesSaquePostEl, [
    { risk: 1400, reward: 300 },
    { risk: 1700, reward: 300 },
    { risk: 2000, reward: 300 },
    { risk: 2300, reward: 300 },
    { risk: 2600, reward: 300 },
  ]);
}

function applyModelScaled() {
  setTradesFor(tradesEl, [
    { risk: 2000, reward: 500 },
    { risk: 2500, reward: 500 },
    { risk: 3000, reward: 500 },
  ]);
  setTradesFor(tradesCushionEl, [
    { risk: 2000, reward: 500 },
    { risk: 2500, reward: 500 },
    { risk: 3000, reward: 500 },
    { risk: 3500, reward: 500 },
  ]);
  setTradesFor(tradesSaqueEl, [
    { risk: 2000, reward: 250 },
    { risk: 2250, reward: 250 },
    { risk: 2500, reward: 250 },
    { risk: 2750, reward: 250 },
  ]);
  setTradesFor(tradesSaquePostEl, [
    { risk: 1400, reward: 300 },
    { risk: 1700, reward: 300 },
    { risk: 2000, reward: 300 },
    { risk: 2300, reward: 300 },
    { risk: 2600, reward: 300 },
  ]);
}

modelDefaultInput.addEventListener('change', () => {
  if (modelDefaultInput.checked) applyModelDefault();
});
modelScaledInput.addEventListener('change', () => {
  if (modelScaledInput.checked) applyModelScaled();
});
stopAllBtn.addEventListener('click', stopSimulationFlow);
resetAllBtn.addEventListener('click', () => {
  stopSimulationFlow();
  resetSimulation();
});
resetKeepSaqueBtn.addEventListener('click', () => {
  startNewCycle();
});

[
  targetInput,
  ddInput,
  ddTypeApprovalTrailing,
  ddTypeApprovalStatic,
  targetCushionInput,
  ddCushionInput,
  ddTypeCushionTrailing,
  ddTypeCushionStatic,
  targetSaqueInput,
  ddSaqueInput,
  ddTypeSaqueTrailing,
  ddTypeSaqueStatic,
  targetSaquePostInput,
  ddSaquePostInput,
].forEach((input) => {
  input.addEventListener('change', updateStats);
});

enableCushionInput.addEventListener('change', () => {
  if (!enableCushionInput.checked && cushionTimer) {
    stopCushion();
  }
  updateCushionDisabledState();
  renderAccounts('cushion');
  renderAccounts('saque');
  updateRunInfoCushion();
  updateRunInfoSaque();
});

accountsInput.addEventListener('input', () => {
  if (approvalTimer || cushionTimer || saqueTimer) return;
  resetSimulation();
});

[accountValueInput, payoutInput].forEach((input) => {
  input.addEventListener('input', updateStats);
});

enableSaquePostInput.addEventListener('change', () => {
  updateSaquePostDisabledState();
  updateStats();
});

resetSimulation();
applyModelScaled();
updateCushionDisabledState();
updateResetKeepSaqueState();
updateSaquePostDisabledState();
