const fs = require('fs');
const { createCanvas } = require('canvas');

// キャンバスを作成
const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext('2d');

// 背景グラデーション（単色で代用）
ctx.fillStyle = '#FFE4E6';
ctx.fillRect(0, 0, 1200, 630);

// 虹色の枠線（6重）
const colors = ['#FF69B4', '#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'];
for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 8;
    ctx.strokeRect(20 + i * 8, 20 + i * 8, 1200 - 40 - i * 16, 630 - 40 - i * 16);
}

// タイトル
ctx.fillStyle = '#FF69B4';
ctx.font = 'bold 72px Arial, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('🎨 Little Artists Studio ✨', 600, 150);

// サブタイトル（日本語）
ctx.fillStyle = '#4ECDC4';
ctx.font = 'bold 48px Arial, sans-serif';
ctx.fillText('子ども向けAIお絵かきアプリ', 600, 220);

// 説明文
ctx.fillStyle = '#8B4513';
ctx.font = '36px Arial, sans-serif';
ctx.fillText('子どもの絵をAIが褒めてくれる！', 600, 300);
ctx.fillText('小学3年生までの漢字で優しいコメント', 600, 350);
ctx.fillText('『すごいね！』から始まる温かい励まし', 600, 400);

// パレットとブラシのイラスト
// パレット
ctx.fillStyle = '#F5DEB3';
ctx.beginPath();
ctx.ellipse(200, 500, 80, 60, 0, 0, 2 * Math.PI);
ctx.fill();
ctx.strokeStyle = '#8B4513';
ctx.lineWidth = 4;
ctx.stroke();

// パレットの色
const paletteColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
for (let i = 0; i < 5; i++) {
    ctx.fillStyle = paletteColors[i];
    ctx.beginPath();
    const angle = (i * Math.PI * 2) / 5;
    const x = 200 + Math.cos(angle) * 40;
    const y = 500 + Math.sin(angle) * 30;
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fill();
}

// ブラシ
ctx.fillStyle = '#8B4513';
ctx.fillRect(980, 450, 15, 100);
ctx.fillStyle = '#FFD700';
ctx.fillRect(975, 440, 25, 20);
ctx.fillStyle = '#FF69B4';
ctx.beginPath();
ctx.arc(987, 430, 8, 0, 2 * Math.PI);
ctx.fill();

// ハッシュタグ
ctx.fillStyle = '#4ECDC4';
ctx.font = 'bold 24px Arial, sans-serif';
ctx.fillText('#LittleArtistsStudio #子どもお絵かき #AI褒めコメント', 600, 580);

// PNG画像として保存
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('ogp-image.png', buffer);

console.log('OGP画像（PNG）が生成されました: ogp-image.png');
