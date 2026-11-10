# RT-1 Plasma Calculator

固定の画面・定義式・説明文はHTMLに，計算と値の更新はJavaScriptに分けた版です．

## ファイル構成と編集場所

| ファイル | 内容 |
| --- | --- |
| `index.html` | 入力欄，結果表の行・項目名・記号・単位，LaTeXの定義式，説明文，グラフの軸名 |
| `style.css` | 配置，色，フォントと文字サイズ |
| `physics.js` | 物理定数，数値計算，入力検証と近似の警告 |
| `app.js` | 入力の取得，計算値の差し込み，タブ切替，曲線・数値目盛の更新 |

## 既存リポジトリへの反映

1. 上記4ファイルをリポジトリ直下の同名ファイルと差し替えます．
2. `definitions.js` は読み込まない構成になったので削除できます．Git管理下なら `git rm definitions.js` を実行します．
3. commit・pushします．GitHub Pagesが設定済みならそのまま更新されます．

この版は2026-11-10に取得したGitHub上の最新版を基にしています．`physics.js` は取得した内容と同一です．直近の14pxのフォント設定を引き継いでいます．モデル説明に残っていた温度平衡化時間の添字を，結果表と同じτᴱₑᵢに揃え，Kの定義は衝突式の説明にまとめています．

## HTMLで定義式を編集する

`index.html` の「表示中のパラメータの定義式」以下を編集します．

```html
<section class="formula-item">
    <div class="formula-label">電子の代表自由行程 · \(\lambda_{\mathrm{e}}\)</div>
    <div class="formula-expression">
        \[
            \lambda_{\mathrm{e}}
            = \frac{v_{\mathrm{th},\mathrm{e}}}{\nu_{\mathrm{ei}}}
        \]
    </div>
    <p class="formula-note">ここに説明文を書きます．</p>
</section>
```

HTMLなので `String.raw` やJavaScriptの引用符は不要です．文中は `\( ... \)`，別行立ては `\[ ... \]` を使います．HTML中の数式の `<` は `&lt;`，場合分けなどの `&` は `&amp;` と書きます．

## 表の項目を編集する

```html
<tr>
    <td>電子–イオン衝突率<span class="symbol">\(\nu_{\mathrm{ei}}\)</span></td>
    <td id="nuEI" data-value>—</td>
    <td>s⁻¹</td>
</tr>
```

項目名・記号・単位はこの行で編集します．数値欄の `id` は `physics.js` が返す `values` のキーに対応させます．`data-value` が付いた欄にだけJSが数値を書き込みます．

表と定義式の `data-group="collision"`，`"scale"`，`"ratio"` がタブに対応します．タブ切替はHTMLにある節の表示・非表示を変えるだけです．

表示式の変更は数値計算には反映されません．計算式自体を変えるときは `physics.js` の対応する項目を編集してください．

## 開き方

全ファイルを同じフォルダに置いて `index.html` をブラウザで開くか，GitHub Pagesで表示します．MathJaxをHTMLに設定されたCDNから読み込むため，数式表示の初回にはネット接続が必要です．

## 動作確認

全21式のMathJax表示，3タブの表・式の切替，温度変更後の再計算，密度・温度の走査切替，無効入力からの回復，Coulomb対数の手動指定をブラウザで確認しています．入力変更後にも数式のDOMが維持されることを確認しています．
