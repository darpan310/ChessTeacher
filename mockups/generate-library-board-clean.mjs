import fs from 'fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultPieces } from 'react-chessboard';

const out = '/Users/darpan/Documents/Playground/ChessTeacher/mockups/board-library-pieces-clean.svg';

const files = ['a','b','c','d','e','f','g','h'];
const ranks = ['8','7','6','5','4','3','2','1'];
const sq = 90;
const bx = 90;
const by = 90;

const position = {
  a8:'bR', b8:'bN', c8:'bB', d8:'bQ', e8:'bK', f8:'bB', g8:'bN', h8:'bR',
  a7:'bP', b7:'bP', c7:'bP', d7:'bP', e7:'bP', f7:'bP', g7:'bP', h7:'bP',
  a2:'wP', b2:'wP', c2:'wP', d2:'wP', f2:'wP', g2:'wP', h2:'wP',
  e4:'wP',
  a1:'wR', b1:'wN', c1:'wB', d1:'wQ', e1:'wK', f1:'wB', g1:'wN', h1:'wR'
};

function innerSvg(pieceCode) {
  const Piece = defaultPieces[pieceCode];
  const raw = renderToStaticMarkup(React.createElement(Piece, { svgStyle: {} }));
  return raw.replace(/^<svg[^>]*>/i, '').replace(/<\/svg>$/i, '');
}

let squares = '';
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    const x = bx + c * sq;
    const y = by + r * sq;
    const color = ((r + c) % 2 === 0) ? '#f0d9b5' : '#b58863';
    squares += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="${color}"/>\n`;
  }
}

let pieces = '';
for (const [square, pieceCode] of Object.entries(position)) {
  const file = square[0];
  const rank = square[1];
  const c = files.indexOf(file);
  const r = ranks.indexOf(rank);
  const x = bx + c * sq;
  const y = by + r * sq;
  // piece svg uses 45x45 viewbox; scale by 2 to fit 90x90 square
  pieces += `<g transform="translate(${x}, ${y}) scale(2)">${innerSvg(pieceCode)}</g>\n`;
}

const fileLabels = files.map((f, i) => `<text x="${bx + i*sq + 45}" y="856" text-anchor="middle" dominant-baseline="middle" font-size="26" font-family="Avenir, Helvetica, sans-serif" fill="#334155">${f}</text>`).join('\n');
const rankLabels = ranks.map((r, i) => `<text x="48" y="${by + i*sq + 45}" text-anchor="middle" dominant-baseline="middle" font-size="26" font-family="Avenir, Helvetica, sans-serif" fill="#334155">${r}</text>`).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#f5f7f2"/>
  <rect x="60" y="60" width="780" height="780" rx="10" fill="#8b6f47"/>
  ${squares}
  <rect x="450" y="630" width="90" height="90" fill="#fde68a" opacity="0.6"/>
  <rect x="450" y="450" width="90" height="90" fill="#86efac" opacity="0.6"/>
  ${pieces}
  ${fileLabels}
  ${rankLabels}
  <rect x="90" y="20" width="720" height="44" rx="8" fill="#12324a"/>
  <text x="450" y="50" text-anchor="middle" font-size="24" font-family="Avenir, Helvetica, sans-serif" fill="#e2e8f0">react-chessboard defaultPieces preview (clean)</text>
</svg>`;

fs.writeFileSync(out, svg, 'utf8');
console.log(`Wrote ${out}`);
