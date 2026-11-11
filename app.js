/* 入力取得・計算結果の反映・表示切替・グラフの更新．固定の内容はindex.html． */
(() => {
    "use strict";

    const { defaults, calculate } = window.RT1Physics;
    const root = document.getElementById("rt1-prototype");
    const find = (selector) => root.querySelector(selector);
    const outputs = root.querySelectorAll("[data-value]");
    const svgNamespace = "http://www.w3.org/2000/svg";

    function format(value) {
        return value >= 0.01 && value < 1000
            ? Number(value.toPrecision(4)).toString()
            : value.toExponential(3);
    }

    function readInputs() {
        const inputs = { ...defaults };
        root.querySelectorAll(".fields input[name]").forEach((field) => {
            inputs[field.name] = Number(field.value);
        });
        inputs.mass_number = Number(find('[name="ion"]').value);
        inputs.logMode = find('[name="mode"]').value;
        return inputs;
    }

    // 値の欄だけを更新する．行名・記号・単位・数式のDOMは作り直さない．
    function updateValues(values) {
        outputs.forEach((cell) => {
            const value = values?.[cell.id];
            cell.textContent = Number.isFinite(value) ? format(value) : "—";
        });
    }

    function selectGroup(group) {
        root.querySelectorAll("[data-group]").forEach((section) => {
            section.hidden = section.dataset.group !== group;
        });
        root.querySelectorAll("[data-tab]").forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.tab === group));
        });
        sessionStorage.setItem("rt1-tab", group);
    }

    function setAttributes(element, attributes) {
        for (const [name, value] of Object.entries(attributes)) {
            element.setAttribute(name, String(value));
        }
    }

    // 目盛など，入力値に応じて変わるSVG要素だけを作成する．
    function svgElement(tag, attributes, text) {
        const element = document.createElementNS(svgNamespace, tag);
        setAttributes(element, attributes);
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function drawChart(inputs) {
        const key = find(".scan").value;
        const resultKey = find(".scan-y").value;
        const chart = find(".scan-chart");
        const width = Math.max(260, find(".chart").getBoundingClientRect().width);
        const height = 210;
        const margin = { left: 80, right: 25, top: 24, bottom: 45 };
        const xMin = Math.log10(inputs[key]) - 1;
        const points = [];

        // 現在の値を中心とする前後1桁を走査．その他のパラメータは固定．
        for (let index = 0; index <= 60; index++) {
            const x = xMin + index / 30;
            try {
                const scannedInputs = { ...inputs, [key]: 10 ** x };
                const value = calculate(scannedInputs).values[resultKey];
                if (!Number.isFinite(value) || value <= 0) continue;
                points.push([x, Math.log10(value)]);
            } catch {
                // 数値計算できない走査点を省く．
            }
        }

        chart.toggleAttribute("hidden", points.length < 2);
        find(".chart-message").hidden = points.length >= 2;
        if (points.length < 2) return;

        const yMin = Math.min(...points.map((point) => point[1])) - 0.12;
        const yMax = Math.max(...points.map((point) => point[1])) + 0.12;
        const xPixel = (x) => margin.left +
            (x - xMin) / 2 * (width - margin.left - margin.right);
        const yPixel = (y) => margin.top +
            (yMax - y) / (yMax - yMin) * (height - margin.top - margin.bottom);

        chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
        const grid = document.createDocumentFragment();
        const ticks = document.createDocumentFragment();
        for (let index = 0; index < 3; index++) {
            const x = xMin + index;
            const y = yMin + (yMax - yMin) * index / 2;
            const anchor = index === 2 ? "end" : index === 0 ? "start" : "middle";
            grid.append(svgElement("line", {
                x1: margin.left, x2: width - margin.right,
                y1: yPixel(y), y2: yPixel(y),
            }));
            ticks.append(svgElement("text", {
                x: margin.left - 10, y: yPixel(y) + 4, "text-anchor": "end",
            }, (10 ** y).toExponential(1)));
            ticks.append(svgElement("text", {
                x: xPixel(x), y: height - 24, "text-anchor": anchor,
            }, (10 ** x).toExponential(1)));
        }
        find(".chart-grid").replaceChildren(grid);
        find(".chart-ticks").replaceChildren(ticks);

        // 軸名はHTMLにあるものを切り替え，位置だけを更新する．
        root.querySelectorAll("[data-scan-result]").forEach((title) => {
            title.toggleAttribute("hidden", title.dataset.scanResult !== resultKey);
            setAttributes(title, { x: margin.left, y: 14 });
        });
        const xLabel = find(".scan").selectedOptions[0].textContent.trim();
        const yLabel = find(".scan-y").selectedOptions[0].textContent.trim();
        chart.setAttribute("aria-label", `${yLabel}の${xLabel}依存性（両対数）`);
        root.querySelectorAll("[data-scan-axis]").forEach((title) => {
            title.toggleAttribute("hidden", title.dataset.scanAxis !== key);
            setAttributes(title, { x: width / 2, y: height - 12 });
        });

        const path = points.map(([x, y], index) =>
            `${index ? "L" : "M"}${xPixel(x)},${yPixel(y)}`
        ).join(" ");
        find(".chart-curve").setAttribute("d", path);
        setAttributes(find(".chart-current"), {
            cx: xPixel(Math.log10(inputs[key])),
            cy: yPixel(Math.log10(calculate(inputs).values[resultKey])),
        });
    }

    function render() {
        find(".manual").hidden = find('[name="mode"]').value !== "manual";
        try {
            const inputs = readInputs();
            const { values, warnings } = calculate(inputs);
            updateValues(values);
            drawChart(inputs);
        } catch (error) {
            updateValues(null);
            find(".scan-chart").toggleAttribute("hidden", true);
            find(".chart-message").hidden = true;
        }
    }

    root.addEventListener("input", (event) => {
        if (event.target.matches(".scan-y")) {
            sessionStorage.setItem("rt1-scan-y", event.target.value);
        }
        if (event.target.matches("input, select")) render();
    });
    root.querySelectorAll("[data-tab]").forEach((button) => {
        button.addEventListener("click", () => selectGroup(button.dataset.tab));
    });

    new ResizeObserver(() => {
        try {
            drawChart(readInputs());
        } catch {
            // 不正な入力はrender()が表示する．
        }
    }).observe(find(".chart"));

    const savedResult = sessionStorage.getItem("rt1-scan-y");
    if (Array.from(find(".scan-y").options).some((option) => option.value === savedResult)) {
        find(".scan-y").value = savedResult;
    }
    selectGroup(sessionStorage.getItem("rt1-tab") || "collision");
    render();
})();

