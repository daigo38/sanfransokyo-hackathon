# 動画からマニュアル生成アプリ

動画ファイルからタイムスタンプ焼き込み済みの画像群を生成し、AIを使用してMarkdownマニュアルを自動生成するWebアプリケーションです。

## 機能

- **動画アップロード**: ローカルの動画ファイル（mp4など）をアップロード
- **フレーム抽出**: 1fpsでフレームを抽出し、512px幅に自動リサイズ
- **タイムスタンプ焼き込み**: 各画像の左下にMM:SS形式のタイムスタンプを自動で焼き込み
- **AIマニュアル生成**: OpenAI APIを使用して、画像から手順書を自動生成
- **プレビュー表示**: 生成されたMarkdownをブラウザ上でプレビュー表示
- **ファイル出力**: `export/{sessionId}/` ディレクトリにMarkdownと画像を保存

## 必要な環境

- Node.js 20.19.5以上
- npm または yarn
- OpenAI APIキー

## インストール

```bash
npm install
```

## セットアップ

1. プロジェクトルートに`.env`ファイルを作成：

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

2. `OPENAI_API_KEY`にOpenAI APIキーを設定してください。

## 使い方

1. サーバーを起動：

```bash
npm start
```

開発モード（ファイル変更を自動検知）：

```bash
npm run dev
```

2. ブラウザで `http://localhost:3000` にアクセス

3. 動画ファイルを選択して「Submit」ボタンをクリック

4. 処理が完了すると、右側に生成されたMarkdownマニュアルが表示されます

5. 生成されたファイルは `export/{sessionId}/` ディレクトリに保存されます

## 技術スタック

### バックエンド
- **Node.js 20.19.5+**: ランタイム環境
- **Express**: Webサーバーフレームワーク
- **multer**: ファイルアップロード処理
- **fluent-ffmpeg**: 動画処理（フレーム抽出）
- **ffmpeg-static**: FFmpegの静的バイナリ（ローカルインストール不要）
- **sharp**: 画像処理（タイムスタンプ焼き込み）
- **OpenAI SDK**: AI API呼び出し
- **dotenv**: 環境変数管理

### フロントエンド
- **HTML/CSS/JavaScript**: バニラJSで実装
- **marked**: Markdownレンダリング
- **DOMPurify**: XSS対策

## プロジェクト構造

```
.
├── server.js              # ExpressサーバーとAPIエンドポイント
├── public/
│   └── index.html         # フロントエンドUI
├── export/                # 生成されたファイルの出力先
│   └── {sessionId}/
│       ├── images/        # タイムスタンプ焼き込み済み画像
│       └── manual.md     # 生成されたMarkdownマニュアル
├── uploads/               # アップロードされた動画の一時保存先
├── .env                   # 環境変数（.gitignoreに含まれています）
├── package.json
└── README.md
```

## 処理フロー

1. **動画アップロード**: クライアントから動画ファイルを受信
2. **セッション作成**: 一意のセッションIDを生成
3. **フレーム抽出**: FFmpegで1fps、512px幅にリサイズしてフレームを抽出
4. **タイムスタンプ焼き込み**: Sharpを使用して各画像にMM:SS形式のタイムスタンプを合成
5. **AI処理**: 焼き込み済み画像をOpenAI APIに送信してMarkdownを生成
6. **ファイル保存**: `export/{sessionId}/` にMarkdownと画像を保存
7. **レスポンス返却**: 生成されたMarkdownと画像URLをクライアントに返却

## 出力仕様

### ディレクトリ構造

```
export/{sessionId}/
├── images/
│   ├── frame-00001.jpg    # タイムスタンプ焼き込み済み
│   ├── frame-00002.jpg
│   └── ...
└── manual.md              # Markdownマニュアル
```

### 画像仕様

- **解像度**: 幅512px（アスペクト比維持）
- **フレームレート**: 1fps
- **フォーマット**: JPEG
- **タイムスタンプ**: 左下、白文字＋黒縁、MM:SS形式

### Markdown仕様

- ステップ見出し（Step 1, Step 2, ...）
- 各ステップに1-2枚の代表画像を埋め込み
- 各ステップの開始〜終了時刻を記載
- 画像は相対パスで参照（`images/frame-00001.jpg`）

## API

### POST /api/convert

動画ファイルをアップロードしてマニュアルを生成します。

**リクエスト**:
- Content-Type: `multipart/form-data`
- Body: `file` (動画ファイル)

**レスポンス**:
```json
{
  "markdown": "生成されたMarkdownテキスト",
  "images": ["images/frame-00001.jpg", "images/frame-00002.jpg", ...],
  "sessionId": "セッションID"
}
```

## エラー処理

- 動画ファイルが選択されていない場合: 400エラー
- APIキーが設定されていない場合: エラーメッセージを表示
- 処理中にエラーが発生した場合: 500エラー、セッションディレクトリを自動削除

## 注意事項

- 長い動画の場合、処理に時間がかかる場合があります
- OpenAI APIの使用量に応じて費用が発生します
- 生成されたファイルは `export/` ディレクトリに保存されます（手動で削除してください）

## ライセンス

ISC

