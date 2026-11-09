-- A lot with its sale registered can't be deleted: first the sale is removed.
-- A lot sold with another also has a buyer, so it's covered too.
CREATE TRIGGER `lotes_vendidos_no_se_borran` BEFORE DELETE ON `lotes`
WHEN OLD.`comprador_id` IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'lote vendido');
END;
