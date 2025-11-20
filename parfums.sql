-- Script SQLite pour la table de parfums de Zaine Parfum

DROP TABLE IF EXISTS parfums;

CREATE TABLE parfums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  marque TEXT,
  categorie TEXT CHECK (categorie IN ('femme','homme','mixte')) NOT NULL,
  prix REAL NOT NULL,
  image TEXT
);

INSERT INTO parfums (nom, marque, categorie, prix, image) VALUES
  ('Coco Mademoiselle', 'Inspiration', 'femme', 89.9, 'images/coco-mademoiselle.jpg'),
  ('La Vie est Belle', 'Inspiration', 'femme', 84.5, 'images/la-vie-est-belle.jpg'),
  ('Evidence', 'Inspiration', 'femme', 59.9, 'images/evidence.jpg'),
  ('Good Girl', 'Inspiration', 'femme', 82.0, 'images/good-girl.jpg'),
  ('Hypnotique Poison', 'Inspiration', 'femme', 79.0, 'images/hypnotique-poison.jpg'),
  ('Scandal', 'Inspiration', 'femme', 78.0, 'images/scandal.jpg'),
  ('Libre', 'Inspiration', 'femme', 86.0, 'images/libre.jpg'),
  ('Burberry Her', 'Inspiration', 'femme', 75.0, 'images/burberry-her.jpg'),
  ("L'Impératrice", 'Inspiration', 'femme', 69.0, 'images/imperatrice.jpg'),
  ('Light Blue', 'Inspiration', 'femme', 72.0, 'images/light-blue.jpg'),
  ('Escada Taj', 'Inspiration', 'femme', 65.0, 'images/escada-taj.jpg'),
  ('Kayali Coco Vanilla 28', 'Inspiration', 'femme', 88.0, 'images/kayali-coco-vanilla-28.jpg'),
  ('Sauvage', 'Inspiration', 'homme', 92.0, 'images/sauvage.jpg'),
  ('Bleu de Chanel', 'Inspiration', 'homme', 95.0, 'images/bleu-chanel.jpg'),
  ('Aventus Creed', 'Inspiration', 'homme', 120.0, 'images/aventus-creed.jpg'),
  ('Invictus', 'Inspiration', 'homme', 79.0, 'images/invictus.jpg'),
  ('Acqua di Giò', 'Inspiration', 'homme', 80.0, 'images/acqua-di-gio.jpg'),
  ('Eros Versace', 'Inspiration', 'homme', 85.0, 'images/eros-versace.jpg'),
  ('Stronger With You', 'Inspiration', 'homme', 83.0, 'images/stronger-with-you.jpg'),
  ('Ultra Male', 'Inspiration', 'homme', 82.0, 'images/ultra-male.jpg'),
  ('Lacoste Noir', 'Inspiration', 'homme', 70.0, 'images/lacoste-noir.jpg'),
  ('Imagination', 'Inspiration', 'homme', 115.0, 'images/imagination.jpg'),
  ("Black XS L'Excès", 'Inspiration', 'homme', 76.0, 'images/black-xs-lexces.jpg'),
  ('Azzaro Wanted', 'Inspiration', 'homme', 78.0, 'images/azzaro-wanted.jpg');
