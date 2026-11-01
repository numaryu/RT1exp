/* Input handling, result display and parameter-scan chart. */
(() => {
  "use strict";

  const { defaults, calculate } = window.RT1Physics;
  const { groups, formulas } = window.RT1Definitions;
  const root = document.getElementById("rt1-prototype");
  const find = (selector) => root.querySelector(selector);
  let activeGroup = "collision";

  function format(value) {
    return value >= 0.01 && value < 1000
      ? Number(value.toPrecision(4)).toString()
      : value.toExponential(3);
  }

  function readInputs() {
    const inputs = { ...defaults };
    for (const key of ["ne", "Te", "Ti", "B", "L", "logEI", "logII"]) {
      inputs[key] = Number(find(`[name="${key}"]`).value);
    }
    inputs.mu = Number(find('[name="ion"]').value);
    inputs.logMode = find('[name="mode"]').value;
    return inputs;
  }

  function renderDefinitions() {
    find(".formula-list").innerHTML = groups[activeGroup].map(
      ([key, symbol, label]) => {
        const [expression, note] = formulas[key];
        return `
          <div class="formula-item">
            <div class="formula-label">${label} · ${symbol}</div>
            <div class="formula-expression">
              <math xmlns="http://www.w3.org/1998/Math/MathML"
                    aria-label="${label}の定義式">
                <mrow>${expression}</mrow>
              </math>
            </div>
            <p class="formula-note">${note}</p>
          </div>`;
      }
    ).join("");
  }

  function renderResults(values) {
    find(".values").innerHTML = groups[activeGroup].map(
      ([key, symbol, label, unit]) => `
        <tr>
          <td>${label}<span class="symbol">${symbol}</span></td>
          <td>${format(values[key])}</td>
          <td>${unit}</td>
        </tr>`
    ).join("");
  }

  function drawChart(inputs) {
    const key = find(".scan").value;
    const chart = find(".chart");
    const width = Math.max(260, chart.getBoundingClientRect().width);
    const height = 210;
    const margin = { left: 80, right: 25, top: 24, bottom: 45 };
    const xMin = Math.log10(inputs[key]) - 1;
    const points = [];

    // Two decades centered on the current input; all other inputs stay fixed.
    for (let index = 0; index <= 60; index++) {
      const x = xMin + index / 30;
      try {
        const scannedInputs = { ...inputs, [key]: 10 ** x };
        const frequency = calculate(scannedInputs).values.nuEI;
        points.push([x, Math.log10(frequency)]);
      } catch {
        // Omit scan samples outside the formula's valid numerical range.
      }
    }
    if (points.length < 2) {
      chart.textContent = "走査範囲を計算できません．";
      return;
    }

    const yMin = Math.min(...points.map((point) => point[1])) - 0.12;
    const yMax = Math.max(...points.map((point) => point[1])) + 0.12;
    const xPixel = (x) => margin.left +
      (x - xMin) / 2 * (width - margin.left - margin.right);
    const yPixel = (y) => margin.top +
      (yMax - y) / (yMax - yMin) * (height - margin.top - margin.bottom);

    let grid = "";
    let labels = "";
    for (let index = 0; index < 3; index++) {
      const x = xMin + index;
      const y = yMin + (yMax - yMin) * index / 2;
      const anchor = index === 2 ? "end" : index === 0 ? "start" : "middle";
      grid += `<line x1="${margin.left}" x2="${width - margin.right}"
                     y1="${yPixel(y)}" y2="${yPixel(y)}" stroke="var(--edge)"/>`;
      labels += `
        <text x="${margin.left - 10}" y="${yPixel(y) + 4}" text-anchor="end">
          ${(10 ** y).toExponential(1)}
        </text>
        <text x="${xPixel(x)}" y="${height - 24}" text-anchor="${anchor}">
          ${(10 ** x).toExponential(1)}
        </text>`;
    }

    const path = points.map(([x, y], index) =>
      `${index ? "L" : "M"}${xPixel(x)},${yPixel(y)}`
    ).join(" ");
    const currentFrequency = calculate(inputs).values.nuEI;
    const xLabel = key === "Te" ? "Tₑ [eV]" : "nₑ [m⁻³]";

    chart.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img"
           aria-label="電子イオン衝突率の両対数パラメータ走査">
        <g fill="var(--sub)" font-family="system-ui" font-size="12">
          ${grid}${labels}
          <text x="${margin.left}" y="14">νₑᵢ [s⁻¹]</text>
          <text x="${width / 2}" y="${height - 3}" text-anchor="middle">
            ${xLabel} · log scale
          </text>
        </g>
        <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2"/>
        <circle cx="${xPixel(Math.log10(inputs[key]))}"
                cy="${yPixel(Math.log10(currentFrequency))}"
                r="4" fill="var(--accent)"/>
      </svg>`;
  }

  function render() {
    renderDefinitions();
    find(".manual").hidden = find('[name="mode"]').value !== "manual";
    try {
      const inputs = readInputs();
      const { values, warnings } = calculate(inputs);
      find(".error").textContent = warnings.join(" ");
      renderResults(values);
      drawChart(inputs);
    } catch (error) {
      find(".error").textContent = error.message;
      find(".values").innerHTML =
        '<tr><td colspan="3">有効な値を入力してください．</td></tr>';
      find(".chart").textContent = "";
    }
  }

  root.addEventListener("input", render);
  root.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeGroup = button.dataset.tab;
      root.querySelectorAll("[data-tab]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      render();
    });
  });

  new ResizeObserver(() => {
    try {
      drawChart(readInputs());
    } catch {
      // An invalid input is already reported by render().
    }
  }).observe(find(".chart"));

  render();
})();
