#!/usr/bin/env ruby
require 'rexml/document'

# XMLファイル名
# filename = "/Users/tekihei2317/Downloads/TypeLighter/ワード/TypeWell/TWJR219/2-カタカナ語 (3177).tpl"
filename = "/Users/tekihei2317/ghq/github.com/tekihei2317/typing-keyboard-layout-wiki/words/typewelljr/1-基本常用語 (2155).tpl"

# XML読み込み
xml = File.read(filename)
doc = REXML::Document.new(xml)

# 集計ハッシュ
counts = Hash.new(0)

# Word要素を順に処理
doc.elements.each("//Word") do |word_node|
  word = word_node.attributes["word"]
  next unless word

  chars = word.chars
  chars.each_with_index do |ch, i|
    # if ch == "ッ" && chars[i+1] || ch == "っ" && chars[i+1]
    if ch == "っ" && chars[i+1]
      next_char = chars[i+1]
      counts[next_char] += 1
    end
  end
end

# 出力（出現数が多い順）
counts.sort_by { |char, count| -count }.each do |char, count|
  puts "#{char}: #{count}"
end

# かきくけこ
# さしすせそ
# たちつてと
# ぱぴぷぺ

# はふ
# ぐ
# じず
# だど

# ロールシャッハ
# ワッフル、スタッフ
# ブルドッグ、バッグ
# バッジ、ブリッジ
# グッズ、オッズ
# ヘッダー、ブッダ
# ハリウッド、ピラミッド

# ド、グが結構多いですね。

# ク: 153
# ト: 115
# プ: 74
# シ: 46
# チ: 30
# ド: 21
# グ: 13
# カ: 10
# キ: 9
# ケ: 7
# サ: 6
# ピ: 6
# ツ: 6
# タ: 5
# セ: 5
# テ: 5
# フ: 5
# ジ: 4
# パ: 4
# コ: 3
# ズ: 2
# ス: 2
# ソ: 2
# ハ: 1
# ダ: 1
# ペ: 1