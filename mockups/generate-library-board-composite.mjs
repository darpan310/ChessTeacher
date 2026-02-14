import fs from 'fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultPieces } from 'react-chessboard';

const dir = '/Users/darpan/Documents/Playground/ChessTeacher/mockups/library-pieces';
fs.mkdirSync(dir, { recursive: true });

for (const code of Object.keys(defaultPieces)) {
  const Piece = defaultPieces[code];
  const svg = renderToStaticMarkup(React.createElement(Piece, { svgStyle: {} }));
  fs.writeFileSync(`${dir}/${code}.svg`, svg, 'utf8');
}

const files = ['a','b','c','d','e','f','g','h'];
const ranks = ['8','7','6','5','4','3','2','1'];
const position = {
  a8:'bR', b8:'bN', c8:'bB', d8:'bQ', e8:'bK', f8:'bB', g8:'bN', h8:'bR',
  a7:'bP', b7:'bP', c7:'bP', d7:'bP', e7:'bP', f7:'bP', g7:'bP', h7:'bP',
  a2:'wP', b2:'wP', c2:'wP', d2:'wP', f2:'wP', g2:'wP', h2:'wP', e4:'wP',
  a1:'wR', b1:'wN', c1:'wB', d1:'wQ', e1:'wK', f1:'wB', g1:'wN', h1:'wR'
};

const placements = [];
for (const [sq, piece] of Object.entries(position)) {
  const file = sq[0];
  const rank = sq[1];
  const c = files.indexOf(file);
  const r = ranks.indexOf(rank);
  const x = 90 + c * 90;
  const y = 90 + r * 90;
  placements.push({ piece, x, y });
}
fs.writeFileSync('/Users/darpan/Documents/Playground/ChessTeacher/mockups/library-placements.json', JSON.stringify(placements, null, 2));
console.log('Generated piece svgs and placements.');
