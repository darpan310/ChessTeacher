export default {
  "id": "scotch-game",
  "name": "Scotch Game",
  "mainline": {
    "id": "scotch-mainline",
    "name": "Mainline A",
    "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5 Qe7 7.Qe2 Nd5 8.c4 Ba6 9.b3 g6 10.Bb2",
    "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3 g6 10. Bb2",
    "summary": "Immediate central confrontation and open lines.",
    "children": [
      {
        "id": "scotch-mainline-mieses",
        "name": "Mieses Continuation",
        "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5 Qe7 7.Qe2 Nd5 8.c4 Ba6 9.b3 g6 10.Bb2 Bg7 11.g3 O-O 12.Bg2",
        "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3 g6 10. Bb2 Bg7 11. g3 O-O 12. Bg2",
        "summary": "Fianchetto setup to keep central control and king safety."
      },
      {
        "id": "scotch-mainline-castle-break",
        "name": "Castled Center Break",
        "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5 Qe7 7.Qe2 Nd5 8.c4 Ba6 9.b3 g6 10.Bb2 Bg7 11.Nd2 O-O 12.O-O-O",
        "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3 g6 10. Bb2 Bg7 11. Nd2 O-O 12. O-O-O",
        "summary": "Rapid development and opposite-side castling attacking chances."
      }
    ]
  },
  "variations": [
    {
      "id": "scotch-schmidt",
      "name": "Schmidt Variation",
      "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nge7 7.Bc4 O-O 8.O-O d6 9.Nc2 Bb6 10.Bxb6",
      "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 O-O 8. O-O d6 9. Nc2 Bb6 10. Bxb6",
      "summary": "Active piece play with pressure against f2 and central squares.",
      "children": [
        {
          "id": "scotch-schmidt-qg6",
          "name": "Schmidt ...Qg6 Plan",
          "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nge7 7.Bc4 O-O 8.O-O d6 9.Nc2 Bb6 10.Bxb6 axb6 11.f4 Qg6 12.f5",
          "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 O-O 8. O-O d6 9. Nc2 Bb6 10. Bxb6 axb6 11. f4 Qg6 12. f5",
          "summary": "White gains kingside space while Black seeks counterplay."
        },
        {
          "id": "scotch-schmidt-knight-reroute",
          "name": "Schmidt Knight Reroute",
          "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nge7 7.Bc4 O-O 8.O-O d6 9.Nc2 Bb6 10.Bxb6 axb6 11.Nd2 Be6 12.Bxe6",
          "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 O-O 8. O-O d6 9. Nc2 Bb6 10. Bxb6 axb6 11. Nd2 Be6 12. Bxe6",
          "summary": "Both sides improve pieces before central and kingside action."
        }
      ]
    },
    {
      "id": "scotch-gambit",
      "name": "Scotch Gambit",
      "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.O-O Nxe4 6.Re1 d5 7.Bxd5 Qxd5 8.Nc3 Qa5 9.Nxe4 Be6 10.Bg5",
      "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Nf6 5. O-O Nxe4 6. Re1 d5 7. Bxd5 Qxd5 8. Nc3 Qa5 9. Nxe4 Be6 10. Bg5",
      "summary": "Development lead and tactical pressure over quiet structure.",
      "children": [
        {
          "id": "scotch-gambit-bc5",
          "name": "Scotch Gambit ...Bc5",
          "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bc5 5.O-O d6 6.c3 Nf6 7.cxd4 Bb6 8.Nc3 O-O 9.h3 Nxe4 10.Nxe4 d5",
          "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Bc5 5. O-O d6 6. c3 Nf6 7. cxd4 Bb6 8. Nc3 O-O 9. h3 Nxe4 10. Nxe4 d5",
          "summary": "Classic gambit tension with quick central strikes."
        },
        {
          "id": "scotch-gambit-giuoco-transpose",
          "name": "Giuoco Transposition",
          "moves": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bc5 5.c3 Nf6 6.O-O Nxe4 7.cxd4 d5 8.Bb5 Bb6 9.Nc3 O-O 10.Be3",
          "pgn": "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Bc5 5. c3 Nf6 6. O-O Nxe4 7. cxd4 d5 8. Bb5 Bb6 9. Nc3 O-O 10. Be3",
          "summary": "Transposes to Italian-type structures with gambit ideas."
        }
      ]
    }
  ],
  "hint": "Open the center early and coordinate pieces quickly.",
  "sectionId": "white"
};
