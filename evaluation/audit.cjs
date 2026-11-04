/**
 * Project / Проект: Tiny AI XO 107601 — isolated strength audit
 * Author / Автор: Beck Sarbassov | Version / Версия: 1.0.0
 * Release / Дата выпуска: 2026-11-05 | Updated / Последнее обновление: 2026-11-05
 * Copyright / Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Reproducible offline evaluation; never writes to the checkpoint or browser.
 * RU: Воспроизводимая проверка на копиях; не меняет файл опыта и браузер.
 */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const project = path.resolve(__dirname, "..");
for (const file of ["core", "neural", "learner"]) require(path.join(project, "web", file + ".js"));
const R = globalThis.XORules, N = globalThis.XONeural, L = globalThis.XOLearning;
const input = path.resolve(process.argv[2] || path.join(project, "model", "checkpoint-185.json"));
const outputDirectory = process.argv[3] ? path.resolve(process.argv[3]) : fs.mkdtempSync(path.join(require("node:os").tmpdir(), "tiny-ai-xo-audit-"));
fs.mkdirSync(outputDirectory, {recursive: true});
const bytes = fs.readFileSync(input);
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const inputHash = sha(bytes);
const snapshot = JSON.parse(bytes.toString("utf8"));
const current = new L.Learner(snapshot);
const initial = new N.Network();
const weightHash = net => sha(Buffer.from(net.weights.buffer, net.weights.byteOffset, net.weights.byteLength));
const checkpointWeightHash = weightHash(current.network);
const rng = seed => N.randomSource(seed);
const coord = i => String.fromCharCode(65 + i % 9) + (1 + Math.floor(i / 9));
const legal = b => b.flatMap((v, i) => v === 0 ? [i] : []);
const pick = (items, random) => items[Math.floor(random.next() * items.length)];
const mean = xs => xs.length ? xs.reduce((a, v) => a + v, 0) / xs.length : null;

// EN: Only lines through a candidate can become a new win. Cross-checked below.
// RU: Новый выигрыш может проходить только через выбранную клетку; ниже есть сверка.
function winningMove(b, at, player) {
  if (b[at] !== 0) return false;
  const row = Math.floor(at / 9), col = at % 9;
  for (const [dr, dc] of R.DIRECTIONS) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let y = row + sign * dr, x = col + sign * dc;
      while (y >= 0 && y < 9 && x >= 0 && x < 9 && b[y * 9 + x] === player) {
        count++; y += sign * dr; x += sign * dc;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}
const winningMoves = (b, player) => legal(b).filter(i => winningMove(b, i, player));
const windows = [];
for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) for (const [dr, dc] of R.DIRECTIONS) {
  if (r + dr * 4 < 0 || r + dr * 4 >= 9 || c + dc * 4 < 0 || c + dc * 4 >= 9) continue;
  windows.push(Array.from({length: 5}, (_, k) => (r + dr * k) * 9 + c + dc * k));
}
const cellWindows = Array.from({length: 81}, (_, i) => windows.filter(w => w.includes(i)));
function bot(b, type, random) {
  const cells = legal(b), p = R.turn(b);
  if (type === "random") return pick(cells, random);
  const wins = winningMoves(b, p);
  if (wins.length) return pick(wins, random);
  const blocks = winningMoves(b, -p);
  if (blocks.length) return pick(blocks, random);
  if (type === "win_block_random") return pick(cells, random);
  const values = [0, 1, 7, 50, 600, 100000];
  let maximum = -Infinity, best = [];
  for (const cell of cells) {
    let score = 0;
    for (const w of cellWindows[cell]) {
      let ours = 0, theirs = 0;
      for (const i of w) { if (b[i] === p) ours++; else if (b[i] === -p) theirs++; }
      if (!theirs) score += values[ours + 1];
      if (!ours) score += .95 * values[theirs + 1];
    }
    if (score > maximum) { maximum = score; best = [cell]; }
    else if (score === maximum) best.push(cell);
  }
  return pick(best, random);
}

function tacticalFixtures(kind, count = 400) {
  const random = rng(kind === "win" ? 2026110501 : 2026110502);
  const seen = new Set(), out = [];
  for (let attempt = 0; out.length < count && attempt < 100000; attempt++) {
    const index = out.length, player = index % 2 === 0 ? 1 : -1;
    const direction = Math.floor(index / 2) % 4;
    const len = 5 + Math.floor(index / 8) % 5;
    const [dr, dc] = R.DIRECTIONS[direction];
    const starts = [];
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (y + dr * (len - 1) >= 0 && y + dr * (len - 1) < 9 &&
          x + dc * (len - 1) >= 0 && x + dc * (len - 1) < 9) starts.push([y, x]);
    }
    const [row, col] = pick(starts, random);
    const gaps = Array.from({length: len}, (_, i) => i).filter(i => i <= 4 && len - i - 1 <= 4);
    const gap = pick(gaps, random), targetPlayer = kind === "win" ? player : -player;
    const b = Array(81).fill(0);
    for (let k = 0; k < len; k++) if (k !== gap) b[(row + dr * k) * 9 + col + dc * k] = targetPlayer;
    const targetCount = len - 1;
    const fillerCount = targetPlayer === 1 ? targetCount - (player === -1 ? 1 : 0) : targetCount + (player === -1 ? 1 : 0);
    for (let k = 0; k < fillerCount; k++) b[pick(legal(b), random)] = -targetPlayer;
    if (R.outcome(b).done || R.turn(b) !== player) continue;
    R.validateBoard(b);
    const wins = winningMoves(b, player), blocks = winningMoves(b, -player);
    const expected = kind === "win" ? wins : blocks;
    if (!expected.length || kind === "block" && (wins.length || blocks.length !== 1)) continue;
    const state = R.encode(b);
    if (seen.has(state)) continue;
    seen.add(state); out.push({state, expected, player, direction, len});
  }
  assert.equal(out.length, count);
  return out;
}
const fixtures = {win: tacticalFixtures("win"), block: tacticalFixtures("block")};

// EN: Check the custom opponents and threat detector against the shipped rules.
// RU: Проверяем тестовых соперников и поиск угроз по правилам самой игры.
let detectorChecks = 0;
for (const kind of Object.keys(fixtures)) for (const f of fixtures[kind]) {
  const b = R.decode(f.state);
  for (const p of [1, -1]) for (const at of legal(b)) {
    const copy = b.slice(); copy[at] = p;
    assert.equal(winningMove(b, at, p), R.outcome(copy).winner === p);
    detectorChecks++;
  }
  const chosen = bot(b, "win_block_random", rng(77));
  assert(f.expected.includes(chosen));
}
function testTactics(net) {
  const out = {};
  for (const [kind, cases] of Object.entries(fixtures)) {
    let correct = 0, probability = 0;
    const byPlayer = {X: {correct: 0, total: 0}, O: {correct: 0, total: 0}};
    for (const f of cases) {
      const p = net.policy(R.decode(f.state));
      const good = f.expected.includes(p.move);
      correct += Number(good); probability += f.expected.reduce((sum, i) => sum + p.scores[i], 0);
      const group = byPlayer[f.player === 1 ? "X" : "O"]; group.correct += Number(good); group.total++;
    }
    out[kind] = {correct, total: cases.length, accuracy: correct / cases.length,
      meanProbabilityOnCorrectMoves: probability / cases.length, byPlayer};
  }
  return out;
}
function opening(seed, plies) {
  const random = rng(seed ^ 0x123abc), b = Array(81).fill(0);
  for (let k = 0; k < plies; k++) b[pick(legal(b), random)] = R.turn(b);
  assert(!R.outcome(b).done);
  return b;
}
function match(net, type, seed, role, exploration = 0) {
  const b = opening(seed, (seed % 4) * 2);
  const opponentRandom = rng(seed ^ (role === 1 ? 0x1234fe : 0x987bcd));
  const ownRandom = rng(seed ^ 0x8f3752);
  const moves = [];
  while (!R.outcome(b).done) {
    const player = R.turn(b);
    let move;
    if (player === role) {
      if (exploration && ownRandom.next() < exploration) move = pick(legal(b), ownRandom);
      else move = net.policy(b, false).move;
    } else move = bot(b, type, opponentRandom);
    assert(Number.isInteger(move) && b[move] === 0);
    b[move] = player; moves.push(move);
  }
  const result = R.outcome(b);
  return {winner: result.winner, score: result.winner === role ? 1 : result.winner === 0 ? .5 : 0,
    length: moves.length, role};
}
function summarizeGames(games) {
  const wins = games.filter(g => g.score === 1).length;
  const draws = games.filter(g => g.score === .5).length;
  return {games: games.length, wins, draws, losses: games.length - wins - draws,
    score: mean(games.map(g => g.score)), averagePliesAfterOpening: mean(games.map(g => g.length)),
    byRole: Object.fromEntries([1, -1].map(role => [role === 1 ? "X" : "O", {
      wins: games.filter(g => g.role === role && g.score === 1).length,
      draws: games.filter(g => g.role === role && g.score === .5).length,
      games: games.filter(g => g.role === role).length}]))};
}
function bootstrapPairs(differences) {
  const random = rng(2026110588), samples = [];
  for (let i = 0; i < 4000; i++) {
    let total = 0;
    for (let k = 0; k < differences.length; k++) total += pick(differences, random);
    samples.push(total / differences.length);
  }
  samples.sort((a, b) => a - b);
  return {difference: mean(differences), pairedSeedBootstrap95: [samples[100], samples[3899]]};
}
function compareGames(exploration = 0, seeds = 100) {
  const out = {};
  for (const type of ["random", "win_block_random", "pattern"]) {
    const a = [], b = [], differences = [];
    for (let k = 0; k < seeds; k++) {
      let diff = 0;
      for (const role of [1, -1]) {
        const seed = 202611050 + k;
        const ga = match(initial, type, seed, role, exploration);
        const gb = match(current.network, type, seed, role, exploration);
        a.push(ga); b.push(gb); diff += gb.score - ga.score;
      }
      differences.push(diff / 2);
    }
    out[type] = {initial: summarizeGames(a), trained: summarizeGames(b), comparison: bootstrapPairs(differences)};
    console.log(JSON.stringify({stage: "matches", opponent: type, exploration, result: out[type]}));
  }
  return out;
}
function findHistoricalBlunders() {
  const rows = [];
  for (const h of current.history) {
    if (!h.winner || h.moves.length < 2) continue;
    const b = Array(81).fill(0), ply = h.moves.length - 2;
    for (let i = 0; i < ply; i++) b[h.moves[i]] = R.turn(b);
    const actor = R.turn(b), threats = winningMoves(b, -actor), wins = winningMoves(b, actor);
    if (actor === h.winner || threats.length !== 1 || wins.length || h.moves[ply] === threats[0]) continue;
    rows.push({gameId: h.id, gameIndex: current.history.indexOf(h), source: h.ai === 0 ? "self" : "human",
      state: R.encode(b), ply, wrongAction: h.moves[ply], requiredBlock: threats[0], player: actor});
  }
  return rows;
}
function evaluateHistorical(rows, net) {
  return rows.map(row => {
    const p = net.policy(R.decode(row.state));
    return {...row, chosen: p.move, corrected: p.move === row.requiredBlock,
      repeatsWrongMove: p.move === row.wrongAction, wrongProbability: p.scores[row.wrongAction],
      blockProbability: p.scores[row.requiredBlock]};
  });
}
function historySummary(rows) {
  return {cases: rows.length, corrected: rows.filter(x => x.corrected).length,
    repeatsWrongMove: rows.filter(x => x.repeatsWrongMove).length,
    choosesOtherStillLosingMove: rows.filter(x => !x.corrected && !x.repeatsWrongMove).length,
    meanWrongProbability: mean(rows.map(x => x.wrongProbability)), meanBlockProbability: mean(rows.map(x => x.blockProbability))};
}
async function replayEntireHistory(rows) {
  if (current.history.length !== current.stats.games) return {available: false, reason: "History is truncated"};
  const replay = new L.Learner(), atGame = {};
  for (let i = 0; i < current.history.length; i++) {
    const h = current.history[i];
    atGame[h.id] = evaluateHistorical(rows.filter(row => row.gameId === h.id), replay.network);
    await replay.learn(h);
    if ((i + 1) % 25 === 0) console.log(JSON.stringify({stage: "isolated-history-replay", games: i + 1}));
  }
  let maxDifference = 0, squaredDifference = 0;
  replay.network.weights.forEach((v, i) => { const d = v - current.network.weights[i];
    maxDifference = Math.max(maxDifference, Math.abs(d)); squaredDifference += d * d; });
  const comparisons = rows.map(row => {
    const then = atGame[row.gameId][0], now = evaluateHistorical([row], current.network)[0];
    return {...now, thenChosen: then.chosen, thenCorrected: then.corrected,
      thenWrongProbability: then.wrongProbability, thenBlockProbability: then.blockProbability};
  });
  return {available: true, exactWeightsMatch: weightHash(replay.network) === checkpointWeightHash,
    maxWeightDifference: maxDifference, rmsWeightDifference: Math.sqrt(squaredDifference / N.COUNT),
    optimizerStepMatch: replay.optimizer.step === current.optimizer.step,
    optimizerFirstMatch: N.pack(replay.optimizer.first) === snapshot.optimizer.first,
    optimizerSecondMatch: N.pack(replay.optimizer.second) === snapshot.optimizer.second,
    rngMatch: replay.rng.state === snapshot.rng,
    statsMatch: JSON.stringify(replay.stats) === JSON.stringify(current.stats),
    replayMatch: JSON.stringify(replay.replay) === JSON.stringify(current.replay),
    historyMatch: JSON.stringify(replay.history) === JSON.stringify(current.history),
    historicalPolicyAtGameStart: {cases: comparisons.length,
      thenCorrected: comparisons.filter(x => x.thenCorrected).length,
      nowCorrected: comparisons.filter(x => x.corrected).length,
      wrongMoveProbabilityDecreased: comparisons.filter(x => x.wrongProbability < x.thenWrongProbability).length,
      blockProbabilityIncreased: comparisons.filter(x => x.blockProbability > x.thenBlockProbability).length},
    comparisons};
}
async function errorLearningProbes(rows) {
  const count = Math.min(24, rows.length), selected = [];
  for (let i = 0; i < count; i++) selected.push(rows[Math.floor(i * rows.length / count)]);
  const probes = [];
  for (let i = 0; i < selected.length; i++) {
    const row = selected[i], before = evaluateHistorical([row], current.network)[0];
    const copy = new L.Learner(snapshot);
    const episode = {...current.history[row.gameIndex], id: "audit-copy-" + i};
    const result = await copy.learn(episode);
    const after = evaluateHistorical([row], copy.network)[0];
    assert.equal(copy.stats.games, current.stats.games + 1);
    assert.equal(current.stats.games, snapshot.stats.games);
    probes.push({gameIndex: row.gameIndex, gameId: row.gameId, state: row.state,
      wrongAction: row.wrongAction, requiredBlock: row.requiredBlock,
      before: {chosen: before.chosen, corrected: before.corrected, wrongProbability: before.wrongProbability, blockProbability: before.blockProbability},
      after: {chosen: after.chosen, corrected: after.corrected, wrongProbability: after.wrongProbability, blockProbability: after.blockProbability},
      training: result});
  }
  return {cases: probes.length, separateCloneForEveryCase: true, updatesPerClone: 6,
    wrongMoveProbabilityDecreased: probes.filter(p => p.after.wrongProbability < p.before.wrongProbability).length,
    correctBlockProbabilityIncreased: probes.filter(p => p.after.blockProbability > p.before.blockProbability).length,
    choseCorrectBlockBefore: probes.filter(p => p.before.corrected).length,
    choseCorrectBlockAfter: probes.filter(p => p.after.corrected).length,
    meanWrongProbabilityBefore: mean(probes.map(p => p.before.wrongProbability)),
    meanWrongProbabilityAfter: mean(probes.map(p => p.after.wrongProbability)),
    meanBlockProbabilityBefore: mean(probes.map(p => p.before.blockProbability)),
    meanBlockProbabilityAfter: mean(probes.map(p => p.after.blockProbability)), probes};
}

(async () => {
  const started = Date.now();
  console.log(JSON.stringify({stage: "validated", stats: current.stats, replay: current.replay.length,
    history: current.history.length, detectorChecks, inputHash}));
  const historical = findHistoricalBlunders();
  const historicalInitial = evaluateHistorical(historical, initial);
  const historicalTrained = evaluateHistorical(historical, current.network);
  const tactical = {initial: testTactics(initial), trained: testTactics(current.network)};
  console.log(JSON.stringify({stage: "tactics", tactical,
    historical: {initial: historySummary(historicalInitial), trained: historySummary(historicalTrained)}}));
  const matches = compareGames(0, 100);
  const matchesExploration = compareGames(.10, 100);
  const reproduced = await replayEntireHistory(historical);
  console.log(JSON.stringify({stage: "history-replay-finished", exactWeightsMatch: reproduced.exactWeightsMatch,
    maxWeightDifference: reproduced.maxWeightDifference, historical: reproduced.historicalPolicyAtGameStart}));
  const probes = await errorLearningProbes(historical);
  let changed = 0, sum = 0, max = 0;
  current.network.weights.forEach((v, i) => {const d = v - initial.weights[i]; changed += Number(d !== 0); sum += d * d; max = Math.max(max, Math.abs(d));});
  assert.equal(weightHash(current.network), checkpointWeightHash);
  assert.equal(sha(fs.readFileSync(input)), inputHash);
  const report = {generatedAt: new Date().toISOString(), elapsedSeconds: (Date.now() - started) / 1000,
    input: {path: path.relative(project, input), bytes: bytes.length, sha256: inputHash, unchangedAfterAudit: true},
    engine: Object.fromEntries(["core", "neural", "learner"].map(f => [f + ".js", sha(fs.readFileSync(path.join(project, "web", f + ".js")))])),
    architecture: N.DIMS, parameters: N.COUNT, stats: current.stats, optimizerStep: current.optimizer.step,
    historyCount: current.history.length, replayCount: current.replay.length,
    weightChangeFromInitial: {changed, l2: Math.sqrt(sum), rms: Math.sqrt(sum / N.COUNT), max},
    methods: {seed: 202611050, pairedSeeds: 100, roles: [1, -1], openingPlies: [0, 2, 4, 6],
      primaryExploration: 0, supplementaryEqualExploration: .10,
      bootstrap: "4000 paired-seed cluster resamples; both roles kept together",
      tactics: "400 own wins and 400 unique forced blocks, balanced by actor, four directions, line length 5..9; independently seeded positions",
      historical: "Last losing move before the final winning move, with exactly one opponent instant win and no own instant win; seen training positions",
      trainingProbe: "24 independent in-memory copies; each receives one additional historical losing episode via the unmodified learner; discarded afterwards",
      caveats: ["Custom fixed bots are not optimal play", "No training occurs during matches", "No evaluation boards are trained into the original model", "Historical positions are not a held-out measure", "A different bad move does not count as a corrected error"]},
    detectorChecks, tactical, matches, matchesExploration,
    historical: {initial: historySummary(historicalInitial), trained: historySummary(historicalTrained), cases: historicalTrained},
    reproduced, probes};
  const output = path.join(outputDirectory, "results.json");
  fs.writeFileSync(output, JSON.stringify(report, null, 2), {flag: "wx"});
  fs.writeFileSync(path.join(outputDirectory, "tactical-fixtures.json"), JSON.stringify(fixtures), {flag: "wx"});
  console.log(JSON.stringify({stage: "complete", output, elapsedSeconds: report.elapsedSeconds,
    probes: {...probes, probes: undefined}, inputUnchanged: true}));
})().catch(e => {console.error(e.stack); process.exitCode = 1;});
