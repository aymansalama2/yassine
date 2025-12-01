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
  ('Coco Mademoiselle', 'Inspiration', 'femme', 89.9, 'Coco Mademoiselle Chanel Eau de Parfum - KOSMENIA Maroc – Kosmenia/imgi_5_chanel_coco_mademoiselle_eau_de_parfum_a3_1024x1024@2x.jpg'),
  ('La Vie est Belle', 'Inspiration', 'femme', 84.5, 'La Vie Est Belle - Eau de Parfum Rechargeable de LANCÔME ≡ SEPHORA/imgi_70_280465-media_swatch.jpg'),
  ('Evidence', 'Inspiration', 'femme', 59.9, 'evidence parfum - Recherche Google/imgi_210_41-1.jpg'),
  ('Good Girl', 'Inspiration', 'femme', 82.0, 'Good Girlparfum - Recherche Google/imgi_167_CAROLINA_HERRERA_GOOD_GIRL_SUPREME_Eau_De_Parfum_foryou.ma.jpg'),
  ('Hypnotique Poison', 'Inspiration', 'femme', 79.0, 'Hypnotique parfum - Recherche Google/imgi_144_IMG-5216.jpg'),
  ('Scandal', 'Inspiration', 'femme', 78.0, 'Scandalparfum - Recherche Google/imgi_138_e939cecJEANP00000200_4.jpg'),
  ('Libre', 'Inspiration', 'femme', 86.0, 'Libre parfum - Recherche Google/imgi_149_ysl_feminine-fragrance_libre-edp_packshot-still-life-visual_square_rgb_3543x.jpg'),
  ('Burberry Her', 'Inspiration', 'femme', 75.0, 'Burberry Her parfum - Recherche Google/imgi_114_3614227693876BYF_HER_EDP_22_100ml.tif-JPG-300dpi.jpg'),
  ("L'Impératrice", 'Inspiration', 'femme', 69.0, 'Impératrice parfum - Recherche Google/imgi_125_p245901-av-15-zoom.jpg'),
  ('Light Blue', 'Inspiration', 'femme', 72.0, 'Light Blue parfum - Recherche Google/imgi_171_image_c27a2530-8323-4bc3-a44a-a4f7b6d959b0.jpg'),
  ('Escada Taj', 'Inspiration', 'femme', 65.0, 'Escada Taj parfum - Recherche Google/imgi_188_escada-taj-sunset-1646405894_1000x0 (1).jpg'),
  ('Kayali Coco Vanilla 28', 'Inspiration', 'femme', 88.0, 'Kayali Coco Vanilla 28 parfum - Recherche Google/imgi_146_31356731-CD55-45DC-86ED-97A6B68D61E2.png'),
  ('Sauvage', 'Inspiration', 'homme', 92.0, 'Sauvage parfum - Recherche Google/imgi_199_Sauvage_Dior_Sauvage_Eau_de_Parfum_60_ml_Dior_Sauvage.jpg'),
  ('Bleu de Chanel', 'Inspiration', 'homme', 95.0, 'Bleu de Chanel parfum - Recherche Google/imgi_170_F9FD7B76-268F-40AE-9DF5-BCA70DD2B429.jpg'),
  ('Aventus Creed', 'Inspiration', 'homme', 120.0, 'Aventus Creed parfum - Recherche Google/imgi_157_8e01c410-ccfa-40b7-b813-6c5f6c1137a9_75040bb1-1fe1-4c88-bf69-c74b64276ecc.jpg'),
  ('Invictus', 'Inspiration', 'homme', 79.0, 'Invictus parfum - Recherche Google/imgi_125_image_13047919-02ad-4616-874e-4a8a16be1b21.jpg'),
  ('Acqua di Giò', 'Inspiration', 'homme', 80.0, 'Acqua di Giò parfum - Recherche Google/imgi_154_1._acqua_di_gio_le_parfum_packshot_50ml.png'),
  ('Eros Versace', 'Inspiration', 'homme', 85.0, 'Eros Versace parfum - Recherche Google/imgi_147_EROS.png'),
  ('Stronger With You', 'Inspiration', 'homme', 83.0, 'Stronger With You parfum - Recherche Google/imgi_164_design-sans-titre-2024-03-15t154455.793.jpg'),
  ('Ultra Male', 'Inspiration', 'homme', 82.0, 'Ultra Male parfum - Recherche Google/imgi_115_ULTRA_MALE_L_Eau_De_Toilette_intense_JEAN_PAUL_GAULTIER_foryou.ma.jpg'),
  ('Lacoste Noir', 'Inspiration', 'homme', 70.0, 'Lacoste Noir parfum - Recherche Google/imgi_175_lacostenoir-man_0a9b301c-d4c3-4d7b-8cda-550bf86587b9.jpg'),
  ('Imagination', 'Inspiration', 'homme', 115.0, 'Imagination parfum - Recherche Google/imgi_126_IMG-1492.jpg'),
  ("Black XS L'Excès", 'Inspiration', 'homme', 76.0, 'Black XS L'Excès parfum - Recherche Google/imgi_179_pacoblacklexcessed-woman_64d43d3b-8139-49bf-8149-9545a6a7bf26.jpg'),
  ('Azzaro Wanted', 'Inspiration', 'homme', 78.0, 'Azzaro Wanted parfum - Recherche Google/imgi_122_TheMostWantedEDP100ml.png');
