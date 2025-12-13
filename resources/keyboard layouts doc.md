# keyboard layouts doc

海外では「最適なキーボード配列とは何か？」に興味を持った人たちが、DiscordやRedditに集まって議論を交わしている。そこで蓄積された知見をAlt Keyboard Layouts DiscordサーバーのEc0氏がまとめたのgkeyboard layouts doc。

[Keyboard layouts doc (3rd edition) - Google ドキュメント](https://docs.google.com/document/d/1W0jhfqJI2ueJ2FNseR4YAFpNfsUM-_FlREHbpNGmC2o/edit?tab=t.2ztid8v3jw2i)

その抄訳を、以下の記事でRyude氏が作成してくださっている。

[海外キーボードレイアウトコミュニティの紹介](./海外キーボードレイアウトコミュニティの紹介（英語新配列の最新動向）.md)

[Keyboard layouts doc (3rd edition) 抄訳 - Google ドキュメント](https://docs.google.com/document/d/1yEN0ueHlpjUU6KmvQ8ORmytNUOcjiOYfFZJwaeHmqkE/edit?tab=t.0#heading=h.gffz55k76g8a)

まずは抄訳を読んで、重要そうな部分を探して読んでいこう。

### 疑問点

- 日本は配列の評価方法が遅れていると記事で言われていたが、その評価方法や指標には何が使われているのか？
- 今の時点で、海外で理想的とされている配列はあるか？またその配列の実績はどれくらいか？

## 章ごとに読む

### Preface

### Chater 1: Typing basics

### Chater 2: Angle mod

Angle modは、左手下段キー（ZXC）の担当指を標準運指から変えるテクニックのこと。

確かに、下段と中段は0.5キー分ずれているから、左手を標準運指から一つ左にずらせば下段と中段は左右対称になる。

### Chapter 3: English data

### Chapter 4: SFBs, SFSs and distance

- SFBs: Same Finger Bigrams、同じ指で打つ2文字のこと
- SFSs: Same Finger Skipgram、何文字か飛ばしたときに同じ指の連打になる2文字のこと
- distance: その指で前回打ったキーからの距離

これはまぁ速く打つためにどうすればいいかを考えると自然に出てくるアイデアではある。同じ指の連続使用のペナルティと、1つ空けたときにペナルティを付与することは考えていた。

distanceについては「その指で前回打ったキーからの距離」とあるが、正確には「その手で前回打ったキーからの距離」なのではないかと思う。例えばCを打った後にRを打つときは大きな移動が必要。←今は同指連続の話をしているのでその定義でOK。

> また、単に運指速度を最小化する配置を機械的に探索すれば最適な配列が出来上がる、という万能ツールではないことを強調しておきます。

これは今ちょうどそのような探索を実装しているところなので、どのような反論があるのかとても気になった。

### Chapter 5: Alt fingering

Alt fingeringは、打ちづらい運指に対して指使いを変えること。日本語で最適化と呼ばれるもの。

### Chapter 6: Scissors
