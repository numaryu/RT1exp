/*
 * 表示する記号・定義式・説明文．数値計算は physics.js．
 *
 * 数式はすべてLaTeX記法で記述する．
 * String.raw`...` を使うと，バックスラッシュを二重にせずに書ける．
 * tex: 独立した数式（区切りの \[ \] は app.js が付ける）
 * note: 説明文（文中の数式は \( ... \) で囲む）
 *
 * groups: [計算キー, LaTeXの記号, 表示名, 単位]
 * 表示式を書き換えても数値計算は変わらない．
 */
(() => {
  "use strict";

  const groups = {
    collision: [
      ["nuEI", String.raw`\nu_{\mathrm{ei}}`, "電子–イオン衝突率", "s⁻¹"],
      ["nuII", String.raw`\nu_{\mathrm{ii}}`, "イオン–イオン衝突率", "s⁻¹"],
      ["tauE", String.raw`\tau^{E}_{\mathrm{ei}}`, "電子温度平衡化時間", "s"],
      ["lambdaE", String.raw`\lambda_{\mathrm{e}}`, "電子の代表自由行程", "m"],
      ["lambdaI", String.raw`\lambda_{\mathrm{i}}`, "イオンの代表自由行程", "m"],
      ["logEI", String.raw`\ln\Lambda_{\mathrm{ei}}`, "電子–イオン Coulomb対数", ""],
      ["logII", String.raw`\ln\Lambda_{\mathrm{ii}}`, "イオン–イオン Coulomb対数", ""],
    ],
    scale: [
      ["fce", String.raw`f_{\mathrm{ce}}`, "電子サイクロトロン周波数", "Hz"],
      ["fci", String.raw`f_{\mathrm{ci}}`, "イオンサイクロトロン周波数", "Hz"],
      ["fpe", String.raw`f_{\mathrm{pe}}`, "電子プラズマ周波数", "Hz"],
      ["rhoe", String.raw`\rho_{\mathrm{e}}`, "電子ラーマー半径", "m"],
      ["rhoi", String.raw`\rho_{\mathrm{i}}`, "イオンラーマー半径", "m"],
      ["debye", String.raw`\lambda_{\mathrm{De}}`, "電子Debye長", "m"],
      ["vA", String.raw`v_{\mathrm{A}}`, "Alfvén速度", "m s⁻¹"],
    ],
    ratio: [
      ["betaE", String.raw`\beta_{\mathrm{e}}`, "電子β", ""],
      ["betaI", String.raw`\beta_{\mathrm{i}}`, "イオンβ", ""],
      ["magE", String.raw`\Omega_{\mathrm{e}}/\nu_{\mathrm{ei}}`, "電子磁化パラメータ", ""],
      ["magI", String.raw`\Omega_{\mathrm{i}}/\nu_{\mathrm{ii}}`, "イオン磁化パラメータ", ""],
      ["KnE", String.raw`\lambda_{\mathrm{e}}/L`, "電子Knudsen数", ""],
      ["KnI", String.raw`\lambda_{\mathrm{i}}/L`, "イオンKnudsen数", ""],
      ["rhoStar", String.raw`\rho_{\mathrm{i}}/L`, "規格化ラーマー半径", ""],
    ],
  };

  const formulas = {
    // 衝突・緩和
    nuEI: {
      tex: String.raw`
        \nu_{\mathrm{ei}}
        = \frac{4\sqrt{2\pi}}{3}
          \frac{n_{\mathrm{i}} Z^2 K^2 \ln\Lambda_{\mathrm{ei}}}
               {\sqrt{m_{\mathrm{e}}}\,\theta_{\mathrm{e}}^{3/2}}
      `,
      note: String.raw`Maxwell電子の運動量緩和率．電子熱速度優勢の極限．\(K = e^2/(4\pi\varepsilon_0)\)，\(\theta_s = eT_s\) [J]．`,
    },
    nuII: {
      tex: String.raw`
        \nu_{\mathrm{ii}}
        = \frac{4\sqrt{\pi}}{3}
          \frac{n_{\mathrm{i}} Z^4 K^2 \ln\Lambda_{\mathrm{ii}}}
               {\sqrt{m_{\mathrm{i}}}\,\theta_{\mathrm{i}}^{3/2}}
      `,
      note: String.raw`同種イオンの衝突率（NRLの定義）．\(K = e^2/(4\pi\varepsilon_0)\)，\(\theta_s = eT_s\) [J]．`,
    },
    tauE: {
      tex: String.raw`
        \tau^{E}_{\mathrm{ei}}
        = \frac{3m_{\mathrm{e}}m_{\mathrm{i}}}
               {8\sqrt{2\pi}\,n_{\mathrm{i}}Z^2K^2\ln\Lambda_{\mathrm{ei}}}
          \left(
            \frac{\theta_{\mathrm{e}}}{m_{\mathrm{e}}}
            + \frac{\theta_{\mathrm{i}}}{m_{\mathrm{i}}}
          \right)^{3/2}
      `,
      note: String.raw`電子温度の変化率：\(\mathrm{d}T_{\mathrm{e}}/\mathrm{d}t = (T_{\mathrm{i}}-T_{\mathrm{e}})/\tau^{E}_{\mathrm{ei}}\)．`,
    },
    lambdaE: {
      tex: String.raw`\lambda_{\mathrm{e}} = \frac{v_{\mathrm{th},\mathrm{e}}}{\nu_{\mathrm{ei}}}`,
      note: String.raw`\(v_{\mathrm{th},\mathrm{e}} = \sqrt{2\theta_{\mathrm{e}}/m_{\mathrm{e}}}\)．`,
    },
    lambdaI: {
      tex: String.raw`\lambda_{\mathrm{i}} = \frac{v_{\mathrm{th},\mathrm{i}}}{\nu_{\mathrm{ii}}}`,
      note: String.raw`\(v_{\mathrm{th},\mathrm{i}} = \sqrt{2\theta_{\mathrm{i}}/m_{\mathrm{i}}}\)．`,
    },
    logEI: {
      tex: String.raw`
        \ln\Lambda_{\mathrm{ei}} =
        \begin{cases}
          23 - \ln\!\left(\dfrac{\sqrt{n_{\mathrm{e,c}}}\,Z}{T_{\mathrm{e}}^{3/2}}\right),
          & T_{\mathrm{e}} < 10Z^2\,\mathrm{eV}, \\[6pt]
          24 - \ln\!\left(\dfrac{\sqrt{n_{\mathrm{e,c}}}}{T_{\mathrm{e}}}\right),
          & T_{\mathrm{e}} \ge 10Z^2\,\mathrm{eV}.
        \end{cases}
      `,
      note: String.raw`自動モードの式．\(n_{\mathrm{e,c}}\) は \(\mathrm{cm}^{-3}\) 単位の電子密度の数値（入力 \(n_{\mathrm{e}}\) の \(10^{-6}\) 倍），\(T_{\mathrm{e}}\) はeV単位の数値．手動モードでは入力値をそのまま使用．`,
    },
    logII: {
      tex: String.raw`
        \ln\Lambda_{\mathrm{ii}}
        = 23 - \ln\!\left(
          \frac{\sqrt{2n_{\mathrm{i,c}}}\,Z^3}{T_{\mathrm{i}}^{3/2}}
        \right)
      `,
      note: String.raw`自動モードの式．\(n_{\mathrm{i,c}}\) は \(\mathrm{cm}^{-3}\) 単位のイオン密度の数値，\(T_{\mathrm{i}}\) はeV単位の数値．手動モードでは入力値をそのまま使用．`,
    },

    // 周波数・長さ
    fce: {
      tex: String.raw`f_{\mathrm{ce}} = \frac{\Omega_{\mathrm{e}}}{2\pi} = \frac{eB}{2\pi m_{\mathrm{e}}}`,
      note: String.raw`\(\Omega_{\mathrm{e}} = eB/m_{\mathrm{e}}\) は角周波数 [\(\mathrm{rad}\,\mathrm{s}^{-1}\)]．`,
    },
    fci: {
      tex: String.raw`f_{\mathrm{ci}} = \frac{\Omega_{\mathrm{i}}}{2\pi} = \frac{ZeB}{2\pi m_{\mathrm{i}}}`,
      note: String.raw`\(\Omega_{\mathrm{i}} = ZeB/m_{\mathrm{i}}\) は角周波数 [\(\mathrm{rad}\,\mathrm{s}^{-1}\)]．`,
    },
    fpe: {
      tex: String.raw`f_{\mathrm{pe}} = \frac{1}{2\pi}\sqrt{\frac{n_{\mathrm{e}}e^2}{\varepsilon_0 m_{\mathrm{e}}}}`,
      note: String.raw`\(\omega_{\mathrm{pe}} = \sqrt{n_{\mathrm{e}}e^2/(\varepsilon_0 m_{\mathrm{e}})}\)，\(f_{\mathrm{pe}} = \omega_{\mathrm{pe}}/(2\pi)\)．`,
    },
    rhoe: {
      tex: String.raw`\rho_{\mathrm{e}} = \frac{v_{\mathrm{th},\mathrm{e}}}{\Omega_{\mathrm{e}}} = \frac{\sqrt{2m_{\mathrm{e}}\theta_{\mathrm{e}}}}{eB}`,
      note: "熱速度の定義に対応する代表ラーマー半径．",
    },
    rhoi: {
      tex: String.raw`\rho_{\mathrm{i}} = \frac{v_{\mathrm{th},\mathrm{i}}}{\Omega_{\mathrm{i}}} = \frac{\sqrt{2m_{\mathrm{i}}\theta_{\mathrm{i}}}}{ZeB}`,
      note: "熱速度の定義に対応する代表ラーマー半径．",
    },
    debye: {
      tex: String.raw`\lambda_{\mathrm{De}} = \sqrt{\frac{\varepsilon_0\theta_{\mathrm{e}}}{n_{\mathrm{e}}e^2}}`,
      note: "電子のみのDebye長．イオンの遮蔽寄与は含めない．",
    },
    vA: {
      tex: String.raw`v_{\mathrm{A}} = \frac{B}{\sqrt{\mu_0 n_{\mathrm{i}} m_{\mathrm{i}}}}`,
      note: "イオン質量密度に基づくAlfvén速度．電子質量を無視．",
    },

    // 無次元量
    betaE: {
      tex: String.raw`\beta_{\mathrm{e}} = \frac{2\mu_0 n_{\mathrm{e}}\theta_{\mathrm{e}}}{B^2}`,
      note: String.raw`等方電子圧力 \(p_{\mathrm{e}} = n_{\mathrm{e}}\theta_{\mathrm{e}}\) と磁気圧の比．`,
    },
    betaI: {
      tex: String.raw`\beta_{\mathrm{i}} = \frac{2\mu_0 n_{\mathrm{i}}\theta_{\mathrm{i}}}{B^2}`,
      note: String.raw`等方イオン圧力 \(p_{\mathrm{i}} = n_{\mathrm{i}}\theta_{\mathrm{i}}\) と磁気圧の比．`,
    },
    magE: {
      tex: String.raw`\frac{\Omega_{\mathrm{e}}}{\nu_{\mathrm{ei}}} = \frac{eB}{m_{\mathrm{e}}\nu_{\mathrm{ei}}}`,
      note: String.raw`角周波数と衝突率の比．\(f_{\mathrm{ce}}/\nu_{\mathrm{ei}}\) とは \(2\pi\) の係数が異なる．`,
    },
    magI: {
      tex: String.raw`\frac{\Omega_{\mathrm{i}}}{\nu_{\mathrm{ii}}} = \frac{ZeB}{m_{\mathrm{i}}\nu_{\mathrm{ii}}}`,
      note: "角周波数と同種イオン衝突率の比．",
    },
    KnE: {
      tex: String.raw`\mathrm{Kn}_{\mathrm{e}} = \frac{\lambda_{\mathrm{e}}}{L} = \frac{v_{\mathrm{th},\mathrm{e}}}{\nu_{\mathrm{ei}}L}`,
      note: String.raw`指定した代表長さ \(L\) に対するKnudsen数．`,
    },
    KnI: {
      tex: String.raw`\mathrm{Kn}_{\mathrm{i}} = \frac{\lambda_{\mathrm{i}}}{L} = \frac{v_{\mathrm{th},\mathrm{i}}}{\nu_{\mathrm{ii}}L}`,
      note: String.raw`指定した代表長さ \(L\) に対するKnudsen数．`,
    },
    rhoStar: {
      tex: String.raw`\rho_* = \frac{\rho_{\mathrm{i}}}{L} = \frac{v_{\mathrm{th},\mathrm{i}}}{\Omega_{\mathrm{i}}L}`,
      note: String.raw`このページでは \(\rho_* = \rho_{\mathrm{i}}/L\) と定義．`,
    },
  };

  window.RT1Definitions = Object.freeze({ groups, formulas });
})();
