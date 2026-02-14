import fs from 'fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultPieces } from 'react-chessboard';

const OUT_SVG = '/Users/darpan/Documents/Playground/ChessTeacher/mockups/board-library-pieces.svg';

const files = ['a','b','c','d','e','f','g','h'];
const ranks = ['8','7','6','5','4','3','2','1'];
const squareSize = 90;
const boardX = 90;
const boardY = 90;

const position = {
  a8:'bR', b8:'bN', c8:'bB', d8:'bQ', e8:'bK', f8:'bB', g8:'bN', h8:'bR',
  a7:'bP', b7:'bP', c7:'bP', d7:'bP', e7:'bP', f7:'bP', g7:'bP', h7:'bP',
  a2:'wP', b2:'wP', c2:'wP', d2:'wP', f2:'wP', g2:'wP', h2:'wP',
  e4:'wP',
  a1:'wR', b1:'wN', c1:'wB', d1:'wQ', e1:'wK', f1:'wB', g1:'wN', h1:'wR'
};

function squareToXY(square) {
  const file = square[0];
  const rank = square[1];
  const col = files.indexOf(file);
  const row = ranks.indexOf(rank);
  return { x: boardX + col * squareSize, y: boardY + row * squareSize };
}

function pieceSvg(pieceCode, x, y) {
  const Piece = defaultPieces[pieceCode];
  let raw = renderToStaticMarkup(React.createElement(Piece, { svgStyle: {} }));
  // normalize root attributes to avoid duplicate width/height
  raw = raw.replace(/\swidth="[^"]*"/gi, '');
  raw = raw.replace(/\sheight="[^"]*"/gi, '');
  return raw.replace('<svg ', `<svg x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" `);
}

let squares = '';
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    const x = boardX + c * squareSize;
    const y = boardY + r * squareSize;
    const light = (r + c) % 2 === 0;
    const color = light ? '#f0d9b5' : '#b58863';
    squares += `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${color}"/>\n`;
  }
}

let pieces = '';
for (const [sq, piece] of Object.entries(position)) {
  const { x, y } = squareToXY(sq);
  pieces += pieceSvg(piece, x, y) + '\n';
}

const fileLabels = files.map((f, i) => `<text x="${boardX + i * squareSize + squareSize/2}" y="856" text-anchor="middle" dominant-baseline="middle" font-size="26" font-family="Avenir, Helvetica, sans-serif" fill="#334155">${f}</text>`).join('\n');
const rankLabels = ranks.map((r, i) => `<text x="48" y="${boardY + i * squareSize + squareSize/2}" text-anchor="middle" dominant-baseline="middle" font-size="26" font-family="Avenir, Helvetica, sans-serif" fill="#334155">${r}</text>`).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#f5f7f2"/>
  <rect x="60" y="60" width="780" height="780" rx="10" fill="#8b6f47"/>
  ${squares}
  <rect x="${boardX + 4*squareSize}" y="${boardY + 6*squareSize}" width="${squareSize}" height="${squareSize}" fill="#fde68a" opacity="0.6"/>
  <rect x="${boardX + 4*squareSize}" y="${boardY + 4*squareSize}" width="${squareSize}" height="${squareSize}" fill="#86efac" opacity="0.6"/>
  ${pieces}
  ${fileLabels}
  ${rankLabels}
  <rect x="90" y="20" width="720" height="44" rx="8" fill="#12324a"/>
  <text x="450" y="50" text-anchor="middle" font-size="24" font-family="Avenir, Helvetica, sans-serif" fill="#e2e8f0">react-chessboard defaultPieces preview</text>
</svg>`;

fs.writeFileSync(OUT_SVG, svg, 'utf8');
console.log(`Wrote ${OUT_SVG}`);
