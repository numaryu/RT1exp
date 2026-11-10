/* Numerical physics only. Temperatures: eV; density: m^-3; field: T; length: m. */
(() => {
    "use strict";

    const C = Object.freeze({
        e: 1.602176634e-19,       // elementary charge [C]
        me: 9.1093837139e-31,    // electron mass [kg]
        mp: 1.67262192595e-27,   // proton mass [kg]
        eps: 8.8541878188e-12,   // vacuum permittivity [F/m] [eps = 1/(mu0 * c^2)]
        mu0: 1.25663706127e-6,   // vacuum permeability [H/m] [4.e-7*pi]
        c: 299792458,           // speed of light [m/s]
    });

    const defaults = Object.freeze({
        ne: 1e17,
        Te: 10,
        Ti: 1,
        B: 0.01,
        L: 1,
        mu: 4,                 // ion mass / proton mass
        Z: 1,
        logMode: "auto",
        logEI: 15,
        logII: 12,
    });

    function calculate(inputs) {
        for (const key of ["ne", "Te", "Ti", "B", "L", "mu", "Z"]) {
            if (!Number.isFinite(inputs[key]) || inputs[key] <= 0) {
                throw new Error(`${key} は正の有限値を入力してください．`);
            }
        }
        if (!Number.isInteger(inputs.Z)) {
            throw new Error("Z は正の整数で指定してください．");
        }
        if (!["auto", "manual"].includes(inputs.logMode)) {
            throw new Error("Coulomb対数のモードが不正です．");
        }

        const { e, me, mp, eps, mu0, c } = C;
        const { ne, Te, Ti, B, L, mu, Z } = inputs;
        const mi = mu * mp;
        const ni = ne / Z;
        const nc = ne / 1e6;     // electron density in cm^-3 (NRL logarithms only)
        const nic = ni / 1e6;    // ion density in cm^-3
        const warnings = [];

        // NRL Coulomb logarithms: density in cm^-3, temperature in eV.
        const logEI = inputs.logMode === "manual"
            ? inputs.logEI
            : Te < 10 * Z * Z
                ? 23 - Math.log(Math.sqrt(nc) * Z / Te ** 1.5)
                : 24 - Math.log(Math.sqrt(nc) / Te);
        const logII = inputs.logMode === "manual"
            ? inputs.logII
            : 23 - Math.log(Math.sqrt(2 * nic) * Z ** 3 / Ti ** 1.5);

        if (![logEI, logII].every((value) => Number.isFinite(value) && value > 0)) {
            throw new Error("Coulomb対数が正でありません．この近似の適用範囲を確認してください．");
        }
        if (Math.min(logEI, logII) < 3) {
            warnings.push("ln Λ < 3：弱結合近似の精度が低下しています．");
        }
        if (Te <= 10 * Ti * me / mi) {
            warnings.push("Tₑ が Tᵢ mₑ/mᵢ に近いかそれ以下です．νₑᵢ と自動 ln Λₑᵢ の電子熱速度優勢近似は適用範囲外です．");
        }
        if (Te >= 5000) {
            warnings.push("Tₑ ≥ 5 keV：非相対論近似の誤差に注意してください．RT-1の高温電子分布を直接表すモデルではありません．");
        }

        // K = e² / (4πε₀). All calculations below use SI units.
        const k = e * e / (4 * Math.PI * eps);

        // Electron-ion momentum relaxation and same-species ion collision rate.
        const nuEI = 4 * Math.sqrt(2 * Math.PI) / 3 * ni * Z ** 2 * k * k * logEI
            / (Math.sqrt(me) * (e * Te) ** 1.5);
        const nuII = 4 * Math.sqrt(Math.PI) / 3 * ni * Z ** 4 * k * k * logII
            / (Math.sqrt(mi) * (e * Ti) ** 1.5);
        const nuIE = Z * me / mi * nuEI;

        // Electron temperature equilibration time: dTe/dt = (Ti - Te) / tauE.
        const tauE = 3 * me * mi
            / (8 * Math.sqrt(2 * Math.PI) * ni * Z ** 2 * k * k * logEI)
            * (e * Te / me + e * Ti / mi) ** 1.5;

        // Thermal speed convention: v_t = sqrt(2 e T / m).
        const vte = Math.sqrt(2 * e * Te / me);
        const vti = Math.sqrt(2 * e * Ti / mi);
        const oce = e * B / me;
        const oci = Z * e * B / mi;
        const wpe = Math.sqrt(ne * e * e / (eps * me));
        const wpi = Math.sqrt(ni * (Z * e) ** 2 / (eps * mi));
        const debye = Math.sqrt(eps * e * Te / (ne * e * e));

        const values = {
            ni,
            logEI,
            logII,
            nuEI,
            nuIE,
            nuII,
            tauE,
            tauDelta: tauE / (1 + Z),
            vte,
            vti,
            oce,
            oci,
            wpe,
            wpi,
            fce: oce / (2 * Math.PI),
            fci: oci / (2 * Math.PI),
            fpe: wpe / (2 * Math.PI),
            fpi: wpi / (2 * Math.PI),
            rhoe: vte / oce,
            rhoi: vti / oci,
            rhos: Math.sqrt(Z * e * Te / mi) / oci,
            lambdaE: vte / nuEI,
            lambdaI: vti / nuII,
            KnE: vte / nuEI / L,
            KnI: vti / nuII / L,
            debye,
            skinE: c / wpe,
            skinI: c / wpi,
            betaE: 2 * mu0 * ne * e * Te / B ** 2,
            betaI: 2 * mu0 * ni * e * Ti / B ** 2,
            vA: B / Math.sqrt(mu0 * ni * mi),
            magE: oce / nuEI,
            magI: oci / nuII,
            rhoStar: vti / oci / L,
        };
        values.beta = values.betaE + values.betaI;

        if (!Object.values(values).every(Number.isFinite)) {
            throw new Error("数値範囲を超えました．入力の桁数を確認してください．");
        }
        return { values, warnings };
    }

    window.RT1Physics = Object.freeze({ constants: C, defaults, calculate });
})();

