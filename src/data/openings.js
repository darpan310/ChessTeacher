export const OPENING_SECTIONS = [
  {
    id: "white",
    title: "Play as White",
    subtitle: "Choose your first-move repertoire",
    openings: [
      {
        id: "italian-game",
        name: "Italian Game",
        mainline: {
          id: "italian-mainline",
          name: "Mainline A",
          moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Re1 a6 8.Bb3 Ba7 9.Nbd2 h6 10.Nf1 Re8",
          pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. Bb3 Ba7 9. Nbd2 h6 10. Nf1 Re8",
          summary: "Fast development with pressure on f7.",
        },
        variations: [
          {
            id: "italian-two-knights",
            name: "Two Knights Defense",
            moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 Bc5 5.c3 d6 6.O-O O-O 7.Bb3 a6 8.Re1 Ba7 9.Nbd2 h6 10.Nf1",
            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Bc5 5. c3 d6 6. O-O O-O 7. Bb3 a6 8. Re1 Ba7 9. Nbd2 h6 10. Nf1",
            summary: "Handle early ...Nf6 and keep initiative.",
          },
          {
            id: "italian-giuoco",
            name: "Giuoco Piano",
            moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Nc3 Bxc3+ 8.bxc3 d5 9.exd5 Nxd5 10.O-O O-O",
            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 Bxc3+ 8. bxc3 d5 9. exd5 Nxd5 10. O-O O-O",
            summary: "Solid setup with gradual central expansion.",
          },
          {
            id: "italian-early-nf6",
            name: "Early ...Nf6 Deviation",
            moves: "1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3 Be7 7.O-O O-O 8.c4 c6 9.Nc3 Nxc3 10.bxc3",
            pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Be7 7. O-O O-O 8. c4 c6 9. Nc3 Nxc3 10. bxc3",
            summary: "Simple practical response in fast games.",
          },
        ],
        hint: "Develop quickly and create pressure on f7 before central expansion.",
      },
      {
        id: "london-system",
        name: "London System",
        mainline: {
          id: "london-mainline",
          name: "Mainline A",
          moves: "1.d4 d5 2.Nf3 Nf6 3.Bf4 e6 4.e3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.Bg3 O-O 8.Bd3 Re8 9.Ne5 Qc7 10.f4",
          pgn: "1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 Re8 9. Ne5 Qc7 10. f4",
          summary: "Flexible setup with clear development plan.",
        },
        variations: [
          {
            id: "london-c5",
            name: "...c5 Challenge",
            moves: "1.d4 d5 2.Bf4 c5 3.e3 Nc6 4.c3 Nf6 5.Nd2 e6 6.Bd3 Bd6 7.Bg3 O-O 8.Ngf3 b6 9.Ne5 Bb7 10.f4",
            pgn: "1. d4 d5 2. Bf4 c5 3. e3 Nc6 4. c3 Nf6 5. Nd2 e6 6. Bd3 Bd6 7. Bg3 O-O 8. Ngf3 b6 9. Ne5 Bb7 10. f4",
            summary: "Keep center stable and avoid early overextension.",
          },
          {
            id: "london-qb6",
            name: "...Qb6 Pressure",
            moves: "1.d4 d5 2.Bf4 Nf6 3.e3 c5 4.c3 Nc6 5.Nd2 cxd4 6.exd4 Qb6 7.Nb3 Bf5 8.Nf3 e6 9.Bd3 Bxd3 10.Qxd3",
            pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 cxd4 6. exd4 Qb6 7. Nb3 Bf5 8. Nf3 e6 9. Bd3 Bxd3 10. Qxd3",
            summary: "Defend b2 cleanly while continuing development.",
          },
        ],
        hint: "Keep your structure clean and aim for easy development.",
      },
      {
        id: "queens-gambit",
        name: "Queen's Gambit",
        mainline: {
          id: "qg-mainline",
          name: "Mainline A",
          moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5 exd5",
          pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5",
          summary: "Play with space and central tension.",
        },
        variations: [
          {
            id: "qg-qga",
            name: "QGA",
            moves: "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6 7.Qe2 b5 8.Bb3 Bb7 9.Rd1 Nbd7 10.Nc3",
            pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. Qe2 b5 8. Bb3 Bb7 9. Rd1 Nbd7 10. Nc3",
            summary: "Recover pawn with active development, not pawn rushing.",
          },
          {
            id: "qg-slav",
            name: "Slav Defense",
            moves: "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O Nbd7 9.Qe2 Bg6 10.e4",
            pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O Nbd7 9. Qe2 Bg6 10. e4",
            summary: "Use cxd5 moments and piece activity carefully.",
          },
        ],
        hint: "Use pawn tension to gain central space and active piece play.",
      },
    ],
  },
  {
    id: "black-e4",
    title: "Play as Black vs 1.e4",
    subtitle: "Build practical responses to king pawn openings",
    openings: [
      {
        id: "sicilian-defense",
        name: "Sicilian Defense",
        mainline: {
          id: "sicilian-mainline",
          name: "Mainline A",
          moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 Be7 8.Qf3 Qc7 9.O-O-O Nbd7 10.g4 b5",
          pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5",
          summary: "Challenge center and develop naturally.",
        },
        variations: [
          {
            id: "sicilian-alapin",
            name: "Alapin (2.c3)",
            moves: "1.e4 c5 2.c3 Nf6 3.e5 Nd5 4.d4 cxd4 5.Nf3 Nc6 6.cxd4 d6 7.Bc4 Nb6 8.Bb3 dxe5 9.Nxe5 Nxe5 10.dxe5",
            pgn: "1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6 7. Bc4 Nb6 8. Bb3 dxe5 9. Nxe5 Nxe5 10. dxe5",
            summary: "Hit center immediately and simplify plans.",
          },
          {
            id: "sicilian-smith-morra",
            name: "Smith-Morra",
            moves: "1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O Nf6 8.Qe2 Be7 9.Rd1 e5 10.h3",
            pgn: "1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Nxc3 Nc6 5. Nf3 d6 6. Bc4 e6 7. O-O Nf6 8. Qe2 Be7 9. Rd1 e5 10. h3",
            summary: "Decline complications with practical setup.",
          },
          {
            id: "sicilian-closed",
            name: "Closed Sicilian",
            moves: "1.e4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.f4 e6 7.Nf3 Nge7 8.O-O O-O 9.Be3 Nd4 10.Qd2",
            pgn: "1. e4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. d3 d6 6. f4 e6 7. Nf3 Nge7 8. O-O O-O 9. Be3 Nd4 10. Qd2",
            summary: "Build queenside play and control d4 break.",
          },
        ],
        hint: "Counter in the center and queenside; don't rush pawn grabs.",
      },
      {
        id: "caro-kann",
        name: "Caro-Kann Defense",
        mainline: {
          id: "caro-mainline",
          name: "Mainline A",
          moves: "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 8.h5 Bh7 9.Bd3 Bxd3 10.Qxd3",
          pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3",
          summary: "Solid center and clear development priorities.",
        },
        variations: [
          {
            id: "caro-advance",
            name: "Advance Variation",
            moves: "1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2 c5 6.Be3 Nc6 7.O-O Qb6 8.Nc3 cxd4 9.Nxd4 Nxd4 10.Bxd4",
            pgn: "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Nc6 7. O-O Qb6 8. Nc3 cxd4 9. Nxd4 Nxd4 10. Bxd4",
            summary: "Break with ...c5 and pressure d4 chain.",
          },
          {
            id: "caro-exchange",
            name: "Exchange Variation",
            moves: "1.e4 c6 2.d4 d5 3.exd5 cxd5 4.Bd3 Nc6 5.c3 Nf6 6.Bf4 Bg4 7.Qb3 Qd7 8.Nd2 e6 9.Ngf3 Bd6 10.Bxd6",
            pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 7. Qb3 Qd7 8. Nd2 e6 9. Ngf3 Bd6 10. Bxd6",
            summary: "Develop harmoniously and use minority pressure plans.",
          },
        ],
        hint: "Solid structure first, then activate your bishop carefully.",
      },
    ],
  },
  {
    id: "black-d4",
    title: "Play as Black vs 1.d4",
    subtitle: "Choose your structure-based defense",
    openings: [
      {
        id: "qgd",
        name: "Queen's Gambit Declined",
        mainline: {
          id: "qgd-mainline",
          name: "Mainline A",
          moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5",
          pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5",
          summary: "Compact setup with timely ...c5 break.",
        },
        variations: [
          {
            id: "qgd-exchange",
            name: "Exchange QGD",
            moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.e3 Bf5 7.Qf3 Bg6 8.Bxf6 Qxf6 9.Qxf6 gxf6 10.Nge2",
            pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Bf5 7. Qf3 Bg6 8. Bxf6 Qxf6 9. Qxf6 gxf6 10. Nge2",
            summary: "Understand isolated pawn vs hanging pawn plans.",
          },
          {
            id: "qgd-orthodox",
            name: "Orthodox",
            moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7",
            pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 10. Bxe7",
            summary: "Neutralize pin pressure and complete development.",
          },
        ],
        hint: "Stay compact and challenge the center with timely ...c5.",
      },
      {
        id: "kings-indian",
        name: "King's Indian Defense",
        mainline: {
          id: "kid-mainline",
          name: "Mainline A",
          moves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Nd3",
          pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Nd3",
          summary: "Flexible setup before central counterplay.",
        },
        variations: [
          {
            id: "kid-classical",
            name: "Classical",
            moves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3",
            pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3",
            summary: "Prepare ...e5 break and kingside initiative.",
          },
          {
            id: "kid-fianchetto",
            name: "Fianchetto",
            moves: "1.d4 Nf6 2.c4 g6 3.Nf3 Bg7 4.g3 O-O 5.Bg2 d6 6.O-O Nc6 7.Nc3 e5 8.d5 Ne7 9.e4 Nd7 10.Ne1",
            pgn: "1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 O-O 5. Bg2 d6 6. O-O Nc6 7. Nc3 e5 8. d5 Ne7 9. e4 Nd7 10. Ne1",
            summary: "Choose structure and avoid overcommitting too early.",
          },
        ],
        hint: "Allow center space, then counterattack with ...e5 or ...c5.",
      },
    ],
  },
];


export const ALL_OPENINGS = OPENING_SECTIONS.flatMap((section) =>
  section.openings.map((opening) => ({ ...opening, sectionId: section.id }))
);
