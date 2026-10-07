# COPROG 論文導讀影片

用程式逐幀畫出來的中文講解影片（約 21 分鐘），從零講解這篇論文：

> C. Hu, B. D. Youn, T. Kim, P. Wang (2015). *A co-training-based approach for prediction of remaining useful life utilizing both failure and suspension data.* Mechanical Systems and Signal Processing, 62–63, 75–90. doi:10.1016/j.ymssp.2015.03.004

成品：`out/coprog_explainer.mp4`（含旁白、背景音樂、內嵌字幕），另附 `out/subtitles.srt`。

## 影片章節

| 章 | 內容 |
|---|---|
| 開場 | 問題：還沒壞就被拆下的機器，資料有沒有用？ |
| 1 為什麼要預測壽命 | 維修策略演進、PHM、剩餘使用壽命 RUL、三種預測路線 |
| 2 失效資料與停機資料 | failure data vs suspension data、右設限資料 |
| 3 機器學習速成 | 監督式學習、迴歸、半監督學習、自我訓練、先前方法、協同訓練 |
| 4 兩位學生 | FFNN（tanh、輸入設計、SSE、過度擬合、提前停止）、RBN（多諧樣條、偽反矩陣） |
| 5 COPROG 演算法 | 候選池、暫時標註、信心值 Δ、交換標註、停止條件、SQP 加權組合、虛擬碼 |
| 6 為什麼有效 | 預測空間的擴張、多樣性、雜訊傳播 |
| 7 案例一：滾動軸承 | 軸承構造、缺陷頻率、FFT 與包絡解調、熵、實驗設計、結果 |
| 8 案例二：散熱風扇 | 加速劣化實驗、RMS 特徵、結果 |
| 9 總結與延伸 | 重點、未來方向、存活分析與深度學習的關係、限制 |

## 怎麼做出來的

參考 [opus-video-prompts](https://github.com/joeseesun/opus-video-prompts) 的「用程式拍影片」做法：

1. `script.json`：旁白腳本（字幕文字 `t`，需要時另給語音用的 `say`）。
2. `tools/tts.py`：逐句產生 zh-TW 語音、加速並去除靜音，排出時間軸，輸出 `timing.js` 與字幕。
3. `index.html` + `engine.js` + `scenes/*.js`：每一幀都只由時間 `t` 決定（`seek(t)`），沒有計時器或 CSS 動畫，所以可以並行渲染。
4. `tools/audio.py`：用 numpy 合成環境音樂，在旁白出現時自動降低音量，最後做響度正規化。
5. `tools/render.mjs`：Playwright 逐幀截圖 → FFmpeg 編碼 → 合併音軌。

## 重新產生

需要 Node 22、Python 3（numpy）、FFmpeg（含 rubberband）、Playwright 的 Chromium。

```bash
npm install                    # 字型與 KaTeX
python3 tools/tts.py           # 旁白與時間軸（需要網路）
python3 tools/audio.py         # 音樂與混音 → out/audio.m4a
node tools/render.mjs snap 12 95 400   # 抽幾幀檢查 → build/snap/
node tools/render.mjs video 3  # 完整渲染 → out/coprog_explainer.mp4
```

在瀏覽器預覽：先跑過 `tools/audio.py` 產生 `out/audio.m4a`（未納入版本控制），再在此資料夾執行 `npx http-server`，打開 `index.html`，按空白鍵播放（←/→ 跳 5 秒，網址加 `?t=秒數` 可直接跳到某處）。

## 說明

- 圖表中標示「論文 Fig. X」的圖片取自原論文，僅供學習；其他圖為示意重繪，標註「示意」的數值不是論文數據。
- 結果數字（Table 3、Table 4）均直接取自論文。
- 字型：Noto Sans TC、LXGW WenKai TC（皆為 OFL 授權）；公式：KaTeX。
