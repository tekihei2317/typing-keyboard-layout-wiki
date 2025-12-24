# cminiの各種指標の計算方法を調べる

[Apsu/cmini: A layout analyzer in bot form](https://github.com/Apsu/cmini)

cminiはAlt Keyboard LayoutのDiscordで使われているBotです。

Botの使用例は次のとおりです。表示されている各指標の計算方法を調べてみます。

```txt
> !cmini view qwerty
QWERTY (cmini) (0 likes)
  q w e r t  y u i o p [ ] \
   a s d f g  h j k l ; '
    z x c v b  n m , . /

MT-QUOTES:
  Alt: 19.31%
  Rol: 38.43%   (In/Out: 20.62% | 17.81%)
  One:  2.31%   (In/Out:  1.03% |  1.28%)
  Rtl: 40.74%   (In/Out: 21.65% | 19.09%)
  Red:  6.07%   (Bad:     0.37%)

  SFB:  5.84%
  SFS: 12.67%   (Red/Alt: 6.68% | 5.98%)

  LH/RH: 54.42% | 45.58%
```

## 流れを追っていく

`cmds/*.py`が各コマンドに対応するファイルになっているので、`cmd/view.py`から呼んでいく。コードは簡潔に書かれていて非常に読みやすい。

```python
def exec(message: Message):
    name = parser.get_arg(message)
    ll = memory.find(name.lower())
    return layout.to_string(ll, id=message.author.id)
```

memory.findで配列を検索してインスタンス化する。

配列は以下のようなJSONファイルで定義されている。layout.keysにこのままの情報が入る。fingerのLP、LRはLeft Pinkey、Left Ringの略。

```json
{
  "keys": {
    "q": {
      "row": 0,
      "col": 0,
      "finger": "LP"
    },
    "w": {
      "row": 0,
      "col": 1,
      "finger": "LR"
    }
  }
}
```

次はlayout.to_stringを呼んでいる。この中で指標の計算をやっているはずなので、探す。

```python
def to_string(ll: Layout, id: int):
    monogram = corpora.ngrams(1, id=id)
    bigram = corpora.ngrams(2, id=id)
    trigram = corpora.ngrams(3, id=id)

    matrix_str = get_matrix_str(ll)

    stats = analyzer.trigrams(ll, trigram)
    sfb = analyzer.sfb_bigram(ll, bigram)
    use = analyzer.use(ll, monogram)

    # Ghetto sfb getting
    stats["sfb"] = sfb

    res = (
        f'```\n'
        f'{ll.name} ({author}) ({likes} {like_string})\n'
        f'{matrix_str}\n'
        f'\n'
        f'{corpora.get_corpus(id).upper()}:\n'
        f'{stats_str(stats, use)}'
        f'```\n'
        f'{external_link}\n'
    )

    return res
```

割とそのままだ。`stats["sfb"] = sfb`で、3-gramのデータを2-gramのデータで上書きしているのが見える。Ghettoは不完全あるいは簡易的という意味。

コーパスの持ち方を把握してから、analyzer.use、analyzer.sfb_bigram、analyzer.trigramsの順番に見ていこう。

## corpusの持ち方

idに何が入っているのかはわからないが、とりあえず無視する。idを指定しなかったら`mt-quotes`が使われるみたい。mtはMonkeyTypeの略だろうか？

```python
def ngrams(n: int, *, id: int = 0):
    file = get_corpus(id)
    path = f'corpora/{file}/{NGRAMS[n - 1]}.json'
    grams = load_json(path)
    return grams
```

`file = 'mt-quotes'`として読み進める。corpora/{corpus}ディレクトリには、monograms.json、bigrams.json、trigrams.json、words.jsonの4つのファイルが入っている。

json.loadの返り値はオブジェクトだから、普通に連想配列としてデータを持っている

## analyzer

analyzer.useを見る。

```python
def use(ll: Layout, grams: Dict[str, str]):
    fingers = {}

    for gram, count in grams.items():
        gram = gram.lower()

        if gram not in ll.keys:
            continue

        finger = ll.keys[gram].finger

        if finger not in fingers:
            fingers[finger] = 0

        fingers[finger] += count

    total = sum(fingers.values())
    for finger in fingers:
        fingers[finger] /= total

    fingers['LH'] = sum(fingers[x] for x in fingers if x[0] in 'L')
    fingers['RH'] = sum(fingers[x] for x in fingers if x[0] in 'RT')

    return fingers
```

sum(...)がちょっと見慣れない構文だが、L=左手の指はLH、R=右手の指、またはT=親指？はRHにカウントしている。

つまり、fingersには各指（`LP`、`LR`、`LM`、...）の割合と、左手`LH`と右手`RH`の割合が入っている。

---

続いてanalyzer.sfb_bigramを読む。こっちはbigramのデータを使っている。

```python
def sfb_bigram(ll: Layout, grams: Dict[str, int]):
    counts = 0
    valid_keys = set(ll.keys.keys())

    for gram, count in grams.items():
        gram = gram.lower()

        if any(char not in valid_keys for char in gram):
            continue

        if ' ' in gram or gram[0] == gram[1]:
            continue

        if ll.keys[gram[0]].finger == ll.keys[gram[1]].finger:
            counts += count

    return counts / sum(grams.values())
```

レイアウトに存在しないキーを含んでいるものは除外している。ここは配列ごとに差異がでないように注意が必要だろう。

スペースを含んでいるもの、または同じキーを押すものは除外している。後者はちょっと意外だが、英語配列だったら不可避なので除外していると考えられる。

---

3-gramの統計を読む。`DEFAULT_COUNTER`はスキップ。

```python
def trigrams(ll: Layout, grams: Dict[str, int]):
    counts = DEFAULT_COUNTER.copy()
    fingers = {x: ll.keys[x].finger for x in ll.keys}

    for gram, count in grams.items():
        gram = gram.lower()

        if ' ' in gram:
            continue

        if gram[0] == gram[1] or gram[1] == gram[2] or gram[0] == gram[2]:
            counts['sfR'] += count
            continue

        finger_combo = '-'.join(fingers[x] for x in gram if x in fingers)
        finger_combo = finger_combo.replace('TB', 'RT')
        gram_type = TABLE.get(finger_combo, 'unknown')

        counts[gram_type] += count

    total = sum(counts.values())
    for stat in counts:
        counts[stat] /= total

    return counts
```

`codex`が`sfR`って言うから何のことだろうと思っていたら、これのことだったのか。同じキーを押す場合は`sfR`としてカウントしている。以下はCodex評。

> 略語としては “same‑finger repeat” / “same‑finger repetition” を想定してるっぽいですが、実際の判定は「同じキーが繰り返されたか」だけなので、意味としては “same‑key repeat” に近いです。

gram_typeには何があるか、table.jsonを見てみると以下のようになっている。

- `sfb` 同指連続がある
- `dsfb` skipgramがある
- `sft`、`sfT` 同指3連続
- `roll-out` 外ロール
- `roll-in` 内ロール
- `bad-redirect`
- `redirect` 折り返し打鍵
- `oneh-in` 片手内ロール
- `oneh-out` 片手外ロール
- `dsfb-red` skipgramがある折り返し打鍵
- `dsfb-alt` skipgramがある交互打鍵
- `alternate` 交互打鍵

`finger_combo = finger_combo.replace('TB', 'RT')` これは親指を右親指にしているっぽい感じがある。これらを集計している箇所に戻って読む。

---

```python
def stats_str(stats: JSON, use: JSON) -> str:
    return (f' {"Alt:":>5} {stats["alternate"]:>6.2%}\n'
            f' {"Rol:":>5} {stats["roll-in"] + stats["roll-out"]:>6.2%}'
            f'   (In/Out: {stats["roll-in"]:>6.2%} | {stats["roll-out"]:>6.2%})\n'
            # f'   (In: {stats["roll-in"]:>6.2%} Out: {stats["roll-out"]:>6.2%})\n'
            f' {"One:":>5} {stats["oneh-in"] + stats["oneh-out"]:>6.2%}'
            f'   (In/Out: {stats["oneh-in"]:>6.2%} | {stats["oneh-out"]:>6.2%})\n'
            # f'   (In: {stats["oneh-in"]:>6.2%} Out: {stats["oneh-out"]:>6.2%})\n'
            f' {"Rtl:":>5} {stats["roll-in"] + stats["roll-out"] + stats["oneh-in"] + stats["oneh-out"]:>6.2%}'
            f'   (In/Out: {stats["roll-in"] + stats["oneh-in"]:>6.2%} | {stats["roll-out"] + stats["oneh-out"]:>6.2%})\n'
            f' {"Red:":>5} {stats["redirect"] + stats["bad-redirect"]:>6.2%}'
            f'   (Bad: {stats["bad-redirect"]:>9.2%})\n'
            '\n'
            f' {"SFB:":>5} {stats["sfb"]:>6.2%}\n'
            f' {"SFS:":>5} {stats["dsfb-red"] + stats["dsfb-alt"]:>6.2%}'
            f'   (Red/Alt: {stats["dsfb-red"]:>5.2%} | {stats["dsfb-alt"]:>5.2%})\n'
            '\n'
            f'  LH/RH: {use["LH"]:.2%} | {use["RH"]:.2%}')
```

- `alternate`→Alt
- `roll-in`、`roll-out`→Rol
- `oneh-in`、`oneh-out`→One
- `roll-in`、`roll-out`、`oneh-in`、`oneh-out`→Rtl
- `redirect`、`bad-redirect`→Red
- `sfb`（これは2-gramの方）→SFB
- `dsfb-red`、`dsfb-alt`→SFS

となっている。使われていないのは、`dsfb`、`sfb`（3-gramの方）、`sft`、`sfT`、`sfR`、`unknown`かな。

結局のところ、`table.json`がどのように作られているのかを理解する必要があるので、次はその辺りを読もう。

## 現時点での疑問点

- コーパスはどうやって作っている？
  - corpora/<corpus>/{monogram,bigram,trigram}.json
- 3-gramのタイプを表すtable.jsonはどうやって作っている？

### コーパスはどうやって作っているか

`scripts/data.py`が、テキストファイルを読み込んで`{monogram|bigram|trigram|words}.json`を作成するスクリプトだ。

### table.jsonはどうやって作っているか

`table.json`を作るファイルは見つからなかったので、スクリプトを再現してもらった。`scripts/generate_table.py`で作成できる。

```
python3 scripts/generate_table.py
```

打鍵3-gramの分類ルールは次のとおり。

- 同じ指が3連続→`sft`（親指のみ）、それ以外は`sfT`
- 同じ指が2連続→`sfb`
- 同じ指が1つ飛ばしである
  - `TB-?-TB`かつ`?`が親指以外→`dsfb`
  - 交互打鍵（LRL/RLR）→`dsfb-alt`
  - 同じ手（LLL/RRR）→`dsfb-red`
- 同じ手が3連続している
  - 同一方向
    - 内ロール→`oneh-in`
    - 外ロール→`oneh-out`
  - それ以外
    - `redirect`か`bad-redirect`（インデックス指を含むと`redirect`、含まないと`bad-redirect`）
- 同じ手が2連続している
  - 内ロール→`roll-in`
  - 外ロール→`roll-out`
- 同じ手が連続していない→`alternate`

## メモ

Codexが一瞬で調べてくれたやつ。これを参考にコードを追っていった。コードも綺麗だし、内容も比較的単純なので楽しく読めた。

```text
!cmini view の出力は、cmds/view.py から util/layout.py に入って計算・整形されています。追い方はこんな流れで
  す。

- 入口: cmds/view.py → util/memory.py の find() で layouts/<name>.json を読み、Layout を作成（見つからなければ
  近い名前を選ぶ）
- 文字配列: util/layout.py の get_matrix_str() が Layout.keys から配列を作り、QWERTY 配列を表示
- コーパス選択: util/layout.py の to_string() が util/corpora.py の get_corpus() を呼び、corpora.json のユーザ
  設定 or 既定 mt-quotes を選ぶ（表示の MT-QUOTES はここ）
- 主要な統計:
    - util/analyzer.py の trigrams() が corpora/<corpus>/trigrams.json を読んで統計を作成
      文字列→指の並び(LP-LR-...)にして、分類は table.json の対応表
    - util/analyzer.py の sfb_bigram() が corpora/<corpus>/bigrams.json から SFB を計算
    - util/analyzer.py の use() が corpora/<corpus>/monograms.json から指使用率と LH/RH を計算
- 表示: util/layout.py の stats_str() が以下の表示ルールで整形
  Alt=alternate、Rol=roll-in+roll-out、One=oneh-in+oneh-out、Rtl=Rol+One、Red=redirect+bad-redirect、SFS=dsfb-
  red+dsfb-alt、LH/RH=左/右合算
  なお SFB は trigrams() 由来ではなく sfb_bigram() で上書き（Ghetto sfb getting のコメント）

計算の中身を追うなら、まずここを見るのが最短です。

- 入口: cmds/view.py
- 出力組み立て: util/layout.py
- コーパス切替: util/corpora.py と corpora.json
- 統計ロジック: util/analyzer.py
- トリグラム分類表: table.json
- レイアウトの指割り当て: layouts/qwerty.json など

必要なら、特定の項目（例: Red の詳細や roll-in の定義）を table.json で該当カテゴリを探しながら確認するとわか
りやすいです。
```
