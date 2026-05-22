-- Group stage matches (72 total, match_number 1-72)
-- Each group [T1,T2,T3,T4] plays: T1vT2, T3vT4, T1vT3, T2vT4, T1vT4, T2vT3

-- Group A: México(1), Sudáfrica(2), Corea del Sur(3), Chequia(4)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(1,  'group', 'A', (SELECT id FROM teams WHERE name='México'),       (SELECT id FROM teams WHERE name='Sudáfrica')),
(2,  'group', 'A', (SELECT id FROM teams WHERE name='Corea del Sur'),(SELECT id FROM teams WHERE name='Chequia')),
(3,  'group', 'A', (SELECT id FROM teams WHERE name='México'),       (SELECT id FROM teams WHERE name='Corea del Sur')),
(4,  'group', 'A', (SELECT id FROM teams WHERE name='Sudáfrica'),    (SELECT id FROM teams WHERE name='Chequia')),
(5,  'group', 'A', (SELECT id FROM teams WHERE name='México'),       (SELECT id FROM teams WHERE name='Chequia')),
(6,  'group', 'A', (SELECT id FROM teams WHERE name='Sudáfrica'),    (SELECT id FROM teams WHERE name='Corea del Sur'));

-- Group B: Canadá(5), Bosnia y Herz.(6), Catar(7), Suiza(8)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(7,  'group', 'B', (SELECT id FROM teams WHERE name='Canadá'),       (SELECT id FROM teams WHERE name='Bosnia y Herz.')),
(8,  'group', 'B', (SELECT id FROM teams WHERE name='Catar'),        (SELECT id FROM teams WHERE name='Suiza')),
(9,  'group', 'B', (SELECT id FROM teams WHERE name='Canadá'),       (SELECT id FROM teams WHERE name='Catar')),
(10, 'group', 'B', (SELECT id FROM teams WHERE name='Bosnia y Herz.'),(SELECT id FROM teams WHERE name='Suiza')),
(11, 'group', 'B', (SELECT id FROM teams WHERE name='Canadá'),       (SELECT id FROM teams WHERE name='Suiza')),
(12, 'group', 'B', (SELECT id FROM teams WHERE name='Bosnia y Herz.'),(SELECT id FROM teams WHERE name='Catar'));

-- Group C: Brasil(9), Marruecos(10), Haití(11), Escocia(12)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(13, 'group', 'C', (SELECT id FROM teams WHERE name='Brasil'),       (SELECT id FROM teams WHERE name='Marruecos')),
(14, 'group', 'C', (SELECT id FROM teams WHERE name='Haití'),        (SELECT id FROM teams WHERE name='Escocia')),
(15, 'group', 'C', (SELECT id FROM teams WHERE name='Brasil'),       (SELECT id FROM teams WHERE name='Haití')),
(16, 'group', 'C', (SELECT id FROM teams WHERE name='Marruecos'),    (SELECT id FROM teams WHERE name='Escocia')),
(17, 'group', 'C', (SELECT id FROM teams WHERE name='Brasil'),       (SELECT id FROM teams WHERE name='Escocia')),
(18, 'group', 'C', (SELECT id FROM teams WHERE name='Marruecos'),    (SELECT id FROM teams WHERE name='Haití'));

-- Group D: EE.UU.(13), Paraguay(14), Australia(15), Turquía(16)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(19, 'group', 'D', (SELECT id FROM teams WHERE name='EE.UU.'),       (SELECT id FROM teams WHERE name='Paraguay')),
(20, 'group', 'D', (SELECT id FROM teams WHERE name='Australia'),     (SELECT id FROM teams WHERE name='Turquía')),
(21, 'group', 'D', (SELECT id FROM teams WHERE name='EE.UU.'),       (SELECT id FROM teams WHERE name='Australia')),
(22, 'group', 'D', (SELECT id FROM teams WHERE name='Paraguay'),      (SELECT id FROM teams WHERE name='Turquía')),
(23, 'group', 'D', (SELECT id FROM teams WHERE name='EE.UU.'),       (SELECT id FROM teams WHERE name='Turquía')),
(24, 'group', 'D', (SELECT id FROM teams WHERE name='Paraguay'),      (SELECT id FROM teams WHERE name='Australia'));

-- Group E: Alemania(17), Curaçao(18), Costa de Marfil(19), Ecuador(20)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(25, 'group', 'E', (SELECT id FROM teams WHERE name='Alemania'),      (SELECT id FROM teams WHERE name='Curaçao')),
(26, 'group', 'E', (SELECT id FROM teams WHERE name='Costa de Marfil'),(SELECT id FROM teams WHERE name='Ecuador')),
(27, 'group', 'E', (SELECT id FROM teams WHERE name='Alemania'),      (SELECT id FROM teams WHERE name='Costa de Marfil')),
(28, 'group', 'E', (SELECT id FROM teams WHERE name='Curaçao'),       (SELECT id FROM teams WHERE name='Ecuador')),
(29, 'group', 'E', (SELECT id FROM teams WHERE name='Alemania'),      (SELECT id FROM teams WHERE name='Ecuador')),
(30, 'group', 'E', (SELECT id FROM teams WHERE name='Curaçao'),       (SELECT id FROM teams WHERE name='Costa de Marfil'));

-- Group F: Países Bajos(21), Japón(22), Suecia(23), Túnez(24)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(31, 'group', 'F', (SELECT id FROM teams WHERE name='Países Bajos'),  (SELECT id FROM teams WHERE name='Japón')),
(32, 'group', 'F', (SELECT id FROM teams WHERE name='Suecia'),        (SELECT id FROM teams WHERE name='Túnez')),
(33, 'group', 'F', (SELECT id FROM teams WHERE name='Países Bajos'),  (SELECT id FROM teams WHERE name='Suecia')),
(34, 'group', 'F', (SELECT id FROM teams WHERE name='Japón'),         (SELECT id FROM teams WHERE name='Túnez')),
(35, 'group', 'F', (SELECT id FROM teams WHERE name='Países Bajos'),  (SELECT id FROM teams WHERE name='Túnez')),
(36, 'group', 'F', (SELECT id FROM teams WHERE name='Japón'),         (SELECT id FROM teams WHERE name='Suecia'));

-- Group G: Bélgica(25), Egipto(26), Irán(27), Nueva Zelanda(28)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(37, 'group', 'G', (SELECT id FROM teams WHERE name='Bélgica'),       (SELECT id FROM teams WHERE name='Egipto')),
(38, 'group', 'G', (SELECT id FROM teams WHERE name='Irán'),          (SELECT id FROM teams WHERE name='Nueva Zelanda')),
(39, 'group', 'G', (SELECT id FROM teams WHERE name='Bélgica'),       (SELECT id FROM teams WHERE name='Irán')),
(40, 'group', 'G', (SELECT id FROM teams WHERE name='Egipto'),        (SELECT id FROM teams WHERE name='Nueva Zelanda')),
(41, 'group', 'G', (SELECT id FROM teams WHERE name='Bélgica'),       (SELECT id FROM teams WHERE name='Nueva Zelanda')),
(42, 'group', 'G', (SELECT id FROM teams WHERE name='Egipto'),        (SELECT id FROM teams WHERE name='Irán'));

-- Group H: España(29), Cabo Verde(30), Arabia Saudí(31), Uruguay(32)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(43, 'group', 'H', (SELECT id FROM teams WHERE name='España'),        (SELECT id FROM teams WHERE name='Cabo Verde')),
(44, 'group', 'H', (SELECT id FROM teams WHERE name='Arabia Saudí'),  (SELECT id FROM teams WHERE name='Uruguay')),
(45, 'group', 'H', (SELECT id FROM teams WHERE name='España'),        (SELECT id FROM teams WHERE name='Arabia Saudí')),
(46, 'group', 'H', (SELECT id FROM teams WHERE name='Cabo Verde'),    (SELECT id FROM teams WHERE name='Uruguay')),
(47, 'group', 'H', (SELECT id FROM teams WHERE name='España'),        (SELECT id FROM teams WHERE name='Uruguay')),
(48, 'group', 'H', (SELECT id FROM teams WHERE name='Cabo Verde'),    (SELECT id FROM teams WHERE name='Arabia Saudí'));

-- Group I: Francia(33), Senegal(34), Irak(35), Noruega(36)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(49, 'group', 'I', (SELECT id FROM teams WHERE name='Francia'),       (SELECT id FROM teams WHERE name='Senegal')),
(50, 'group', 'I', (SELECT id FROM teams WHERE name='Irak'),          (SELECT id FROM teams WHERE name='Noruega')),
(51, 'group', 'I', (SELECT id FROM teams WHERE name='Francia'),       (SELECT id FROM teams WHERE name='Irak')),
(52, 'group', 'I', (SELECT id FROM teams WHERE name='Senegal'),       (SELECT id FROM teams WHERE name='Noruega')),
(53, 'group', 'I', (SELECT id FROM teams WHERE name='Francia'),       (SELECT id FROM teams WHERE name='Noruega')),
(54, 'group', 'I', (SELECT id FROM teams WHERE name='Senegal'),       (SELECT id FROM teams WHERE name='Irak'));

-- Group J: Argentina(37), Argelia(38), Austria(39), Jordania(40)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(55, 'group', 'J', (SELECT id FROM teams WHERE name='Argentina'),     (SELECT id FROM teams WHERE name='Argelia')),
(56, 'group', 'J', (SELECT id FROM teams WHERE name='Austria'),       (SELECT id FROM teams WHERE name='Jordania')),
(57, 'group', 'J', (SELECT id FROM teams WHERE name='Argentina'),     (SELECT id FROM teams WHERE name='Austria')),
(58, 'group', 'J', (SELECT id FROM teams WHERE name='Argelia'),       (SELECT id FROM teams WHERE name='Jordania')),
(59, 'group', 'J', (SELECT id FROM teams WHERE name='Argentina'),     (SELECT id FROM teams WHERE name='Jordania')),
(60, 'group', 'J', (SELECT id FROM teams WHERE name='Argelia'),       (SELECT id FROM teams WHERE name='Austria'));

-- Group K: Portugal(41), RD Congo(42), Uzbekistán(43), Colombia(44)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(61, 'group', 'K', (SELECT id FROM teams WHERE name='Portugal'),      (SELECT id FROM teams WHERE name='RD Congo')),
(62, 'group', 'K', (SELECT id FROM teams WHERE name='Uzbekistán'),    (SELECT id FROM teams WHERE name='Colombia')),
(63, 'group', 'K', (SELECT id FROM teams WHERE name='Portugal'),      (SELECT id FROM teams WHERE name='Uzbekistán')),
(64, 'group', 'K', (SELECT id FROM teams WHERE name='RD Congo'),      (SELECT id FROM teams WHERE name='Colombia')),
(65, 'group', 'K', (SELECT id FROM teams WHERE name='Portugal'),      (SELECT id FROM teams WHERE name='Colombia')),
(66, 'group', 'K', (SELECT id FROM teams WHERE name='RD Congo'),      (SELECT id FROM teams WHERE name='Uzbekistán'));

-- Group L: Inglaterra(45), Croacia(46), Ghana(47), Panamá(48)
INSERT INTO matches (match_number, phase, group_letter, home_team_id, away_team_id) VALUES
(67, 'group', 'L', (SELECT id FROM teams WHERE name='Inglaterra'),    (SELECT id FROM teams WHERE name='Croacia')),
(68, 'group', 'L', (SELECT id FROM teams WHERE name='Ghana'),         (SELECT id FROM teams WHERE name='Panamá')),
(69, 'group', 'L', (SELECT id FROM teams WHERE name='Inglaterra'),    (SELECT id FROM teams WHERE name='Ghana')),
(70, 'group', 'L', (SELECT id FROM teams WHERE name='Croacia'),       (SELECT id FROM teams WHERE name='Panamá')),
(71, 'group', 'L', (SELECT id FROM teams WHERE name='Inglaterra'),    (SELECT id FROM teams WHERE name='Panamá')),
(72, 'group', 'L', (SELECT id FROM teams WHERE name='Croacia'),       (SELECT id FROM teams WHERE name='Ghana'));

-- Round of 32 (match_number 73-88)
INSERT INTO matches (match_number, phase, home_slot, away_slot) VALUES
(73,  'r32', '2A',    '2B'),
(74,  'r32', '1E',    '3rd_1'),
(75,  'r32', '1F',    '2C'),
(76,  'r32', '1C',    '2F'),
(77,  'r32', '1I',    '3rd_2'),
(78,  'r32', '2E',    '2I'),
(79,  'r32', '1A',    '3rd_3'),
(80,  'r32', '1L',    '3rd_4'),
(81,  'r32', '1D',    '3rd_5'),
(82,  'r32', '1G',    '3rd_6'),
(83,  'r32', '2K',    '2L'),
(84,  'r32', '1H',    '2J'),
(85,  'r32', '1B',    '3rd_7'),
(86,  'r32', '1J',    '2H'),
(87,  'r32', '1K',    '3rd_8'),
(88,  'r32', '2D',    '2G');

-- Round of 16 (match_number 89-96)
INSERT INTO matches (match_number, phase, home_slot, away_slot) VALUES
(89,  'r16', 'W73',   'W77'),
(90,  'r16', 'W74',   'W75'),
(91,  'r16', 'W76',   'W78'),
(92,  'r16', 'W79',   'W80'),
(93,  'r16', 'W83',   'W84'),
(94,  'r16', 'W81',   'W82'),
(95,  'r16', 'W86',   'W88'),
(96,  'r16', 'W85',   'W87');

-- Quarter-finals (match_number 97-100)
INSERT INTO matches (match_number, phase, home_slot, away_slot) VALUES
(97,  'qf',  'W89',   'W90'),
(98,  'qf',  'W93',   'W94'),
(99,  'qf',  'W91',   'W92'),
(100, 'qf',  'W95',   'W96');

-- Semi-finals (match_number 101-102)
INSERT INTO matches (match_number, phase, home_slot, away_slot) VALUES
(101, 'sf',  'W97',   'W98'),
(102, 'sf',  'W99',   'W100');

-- Third place (match_number 103)
INSERT INTO matches (match_number, phase, home_slot, away_slot) VALUES
(103, 'third', 'L101', 'L102');

-- Final (match_number 104)
INSERT INTO matches (match_number, phase, home_slot, away_slot) VALUES
(104, 'final', 'W101', 'W102');
