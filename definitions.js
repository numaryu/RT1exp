/*
 * Display labels, units and definition formulas.
 *
 * groups: [calculation key, symbol, Japanese label, unit]
 * formulas: [MathML expression, explanation]
 *
 * Edit the entry with the same key in both sections to change a label/formula.
 * Numerical calculations are in physics.js; changing a formula here changes
 * the displayed explanation only.
 *
 * Math helpers:
 *   sub('n', 'e')    -> electron density symbol
 *   frac(a, b)      -> a / b
 *   sqrt(a)         -> square root of a
 *   sup(a, 2)       -> a squared
 *   power32(a)      -> a to the power 3/2
 */
(() => {
"use strict";

const groups = {
  collision: [
    ['nuEI', 'νₑᵢ', '電子–イオン衝突率', 's⁻¹'],
    ['nuII', 'νᵢᵢ', 'イオン–イオン衝突率', 's⁻¹'],
    ['tauE', 'τᴱₑᵢ', '電子温度平衡化時間', 's'],
    ['lambdaE', 'λₑ', '電子の代表自由行程', 'm'],
    ['lambdaI', 'λᵢ', 'イオンの代表自由行程', 'm'],
    ['logEI', 'ln Λₑᵢ', '電子–イオン Coulomb対数', ''],
    ['logII', 'ln Λᵢᵢ', 'イオン–イオン Coulomb対数', ''],
  ],
  scale: [
    ['fce', 'f꜀ₑ', '電子サイクロトロン周波数', 'Hz'],
    ['fci', 'f꜀ᵢ', 'イオンサイクロトロン周波数', 'Hz'],
    ['fpe', 'fₚₑ', '電子プラズマ周波数', 'Hz'],
    ['rhoe', 'ρₑ', '電子ラーマー半径', 'm'],
    ['rhoi', 'ρᵢ', 'イオンラーマー半径', 'm'],
    ['debye', 'λDₑ', '電子Debye長', 'm'],
    ['vA', 'vA', 'Alfvén速度', 'm s⁻¹'],
  ],
  ratio: [
    ['betaE', 'βₑ', '電子β', ''],
    ['betaI', 'βᵢ', 'イオンβ', ''],
    ['magE', 'Ωₑ/νₑᵢ', '電子磁化パラメータ', ''],
    ['magI', 'Ωᵢ/νᵢᵢ', 'イオン磁化パラメータ', ''],
    ['KnE', 'λₑ/L', '電子Knudsen数', ''],
    ['KnI', 'λᵢ/L', 'イオンKnudsen数', ''],
    ['rhoStar', 'ρᵢ/L', '規格化ラーマー半径', ''],
  ],
};

// MathML is native to the browser; no external script or typesetting service.
const sub=(s,k)=>`<msub><mi>${s}</mi><mi>${k}</mi></msub>`;
const sup=(s,k)=>`<msup>${s}<mn>${k}</mn></msup>`;
const frac=(a,b)=>`<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`;
const sqrt=a=>`<msqrt>${a}</msqrt>`;
const mi=s=>`<mi>${s}</mi>`;
const num=s=>`<mn>${s}</mn>`;
const op=s=>`<mo>${s}</mo>`;
const eq=op('=');
const ns=s=>sub('n',s);
const ms=s=>sub('m',s);
const T=s=>sub('T',s);
const th=s=>sub('θ',s);
const vt=s=>sub('v', 't'+s);
const om=s=>sub('Ω',s);
const nu=s=>sub('ν',s);
const rho=s=>sub('ρ',s);
const ln=s=>`<mi mathvariant="normal">ln</mi>${sub('Λ',s)}`;
const power32=a=>`<msup><mrow>${a}</mrow><mfrac><mn>3</mn><mn>2</mn></mfrac></msup>`;
const e=mi('e');
const Z=mi('Z');
const B=mi('B');
const K=mi('K');
const L=mi('L');
const eps=sub('ε', '0');
const mu0=sub('μ', '0');

const formulas = {

  // nuEI
  nuEI: [
    nu('ei')+eq+frac(num(4)+sqrt(num(2)+mi('π')),num(3))+frac(ns('i')+sup(Z,2)+sup(K,2)+ln('ei'),sqrt(ms('e'))+power32(th('e'))),
    'Maxwell電子の運動量緩和率．電子熱速度優勢の極限．',
  ],
  // nuII
  nuII: [
    nu('ii')+eq+frac(num(4)+sqrt(mi('π')),num(3))+frac(ns('i')+sup(Z,4)+sup(K,2)+ln('ii'),sqrt(ms('i'))+power32(th('i'))),
    '同種イオンの衝突率（NRLの定義）．',
  ],
  // tauE
  tauE: [
    sup(sub('τ', 'ei'),'E')+eq+frac(num(3)+ms('e')+ms('i'),num(8)+sqrt(num(2)+mi('π'))+ns('i')+sup(Z,2)+sup(K,2)+ln('ei'))+power32(op('(')+frac(th('e'),ms('e'))+op('+')+frac(th('i'),ms('i'))+op(')')),
    '電子温度の変化率：dTₑ/dt = (Tᵢ − Tₑ)/τᴱₑᵢ．',
  ],
  // lambdaE
  lambdaE: [
    sub('λ', 'e')+eq+frac(vt('e'),nu('ei')),
    'vₜₑ = √(2θₑ/mₑ)．',
  ],
  // lambdaI
  lambdaI: [
    sub('λ', 'i')+eq+frac(vt('i'),nu('ii')),
    'vₜᵢ = √(2θᵢ/mᵢ)．',
  ],
  // logEI
  logEI: [
    ln('ei')+eq+`<mrow><mo>{</mo><mtable columnalign="left"><mtr><mtd><mn>23</mn><mo>−</mo><mi mathvariant="normal">ln</mi><mo>(</mo>${frac(sqrt(ns('e,c'))+Z,power32(T('e')))}<mo>)</mo></mtd><mtd>${T('e')}<mo>&lt;</mo><mn>10</mn>${sup(Z,2)}<mtext> eV</mtext></mtd></mtr><mtr><mtd><mn>24</mn><mo>−</mo><mi mathvariant="normal">ln</mi><mo>(</mo>${frac(sqrt(ns('e,c')),T('e'))}<mo>)</mo></mtd><mtd>${T('e')}<mo>≥</mo><mn>10</mn>${sup(Z,2)}<mtext> eV</mtext></mtd></mtr></mtable></mrow>`,
    '自動モードの式．nₑ,cはcm⁻³単位の電子密度の数値（入力nₑの10⁻⁶倍），TₑはeV単位の数値．手動モードでは入力値をそのまま使用．',
  ],
  // logII
  logII: [
    ln('ii')+eq+num(23)+op('−')+'<mi mathvariant="normal">ln</mi>'+op('(')+frac(sqrt(num(2)+ns('i,c'))+sup(Z,3),power32(T('i')))+op(')'),
    '自動モードの式．nᵢ,cはcm⁻³単位のイオン密度の数値，TᵢはeV単位の数値．手動モードでは入力値をそのまま使用．',
  ],
  // fce
  fce: [
    sub('f', 'ce')+eq+frac(om('e'),num(2)+mi('π'))+eq+frac(e+B,num(2)+mi('π')+ms('e')),
    'Ωₑ = eB/mₑ は角周波数 [rad s⁻¹]．',
  ],
  // fci
  fci: [
    sub('f', 'ci')+eq+frac(om('i'),num(2)+mi('π'))+eq+frac(Z+e+B,num(2)+mi('π')+ms('i')),
    'Ωᵢ = ZeB/mᵢ は角周波数 [rad s⁻¹]．',
  ],
  // fpe
  fpe: [
    sub('f', 'pe')+eq+frac(num(1),num(2)+mi('π'))+sqrt(frac(ns('e')+sup(e,2),eps+ms('e'))),
    'ωₚₑ = √(nₑe²/ε₀mₑ)，fₚₑ = ωₚₑ/(2π)．',
  ],
  // rhoe
  rhoe: [
    rho('e')+eq+frac(vt('e'),om('e'))+eq+frac(sqrt(num(2)+ms('e')+th('e')),e+B),
    '熱速度の定義に対応する代表ラーマー半径．',
  ],
  // rhoi
  rhoi: [
    rho('i')+eq+frac(vt('i'),om('i'))+eq+frac(sqrt(num(2)+ms('i')+th('i')),Z+e+B),
    '熱速度の定義に対応する代表ラーマー半径．',
  ],
  // debye
  debye: [
    sub('λ', 'De')+eq+sqrt(frac(eps+th('e'),ns('e')+sup(e,2))),
    '電子のみのDebye長．イオンの遮蔽寄与は含めない．',
  ],
  // vA
  vA: [
    sub('v', 'A')+eq+frac(B,sqrt(mu0+ns('i')+ms('i'))),
    'イオン質量密度に基づくAlfvén速度．電子質量を無視．',
  ],
  // betaE
  betaE: [
    sub('β', 'e')+eq+frac(num(2)+mu0+ns('e')+th('e'),sup(B,2)),
    '等方電子圧力 pₑ = nₑθₑ と磁気圧の比．',
  ],
  // betaI
  betaI: [
    sub('β', 'i')+eq+frac(num(2)+mu0+ns('i')+th('i'),sup(B,2)),
    '等方イオン圧力 pᵢ = nᵢθᵢ と磁気圧の比．',
  ],
  // magE
  magE: [
    frac(om('e'),nu('ei'))+eq+frac(e+B,ms('e')+nu('ei')),
    '角周波数と衝突率の比（f꜀ₑ/νₑᵢではない）．',
  ],
  // magI
  magI: [
    frac(om('i'),nu('ii'))+eq+frac(Z+e+B,ms('i')+nu('ii')),
    '角周波数と同種イオン衝突率の比．',
  ],
  // KnE
  KnE: [
    sub('Kn', 'e')+eq+frac(sub('λ', 'e'),L)+eq+frac(vt('e'),nu('ei')+L),
    '指定した代表長さLに対するKnudsen数．',
  ],
  // KnI
  KnI: [
    sub('Kn', 'i')+eq+frac(sub('λ', 'i'),L)+eq+frac(vt('i'),nu('ii')+L),
    '指定した代表長さLに対するKnudsen数．',
  ],
  // rhoStar
  rhoStar: [
    sub('ρ', '*')+eq+frac(rho('i'),L)+eq+frac(vt('i'),om('i')+L),
    'このページではρ* = ρᵢ/Lと定義．',
  ],
};

window.RT1Definitions = Object.freeze({ groups, formulas });
})();
