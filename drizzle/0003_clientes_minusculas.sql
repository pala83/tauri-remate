-- SQLite's lower() only handles ASCII, so Spanish capitals are replaced first.
UPDATE clientes SET
  nombre = lower(trim(replace(replace(replace(replace(replace(replace(replace(nombre, 'Á', 'á'), 'É', 'é'), 'Í', 'í'), 'Ó', 'ó'), 'Ú', 'ú'), 'Ü', 'ü'), 'Ñ', 'ñ'))),
  telefono = lower(trim(replace(replace(replace(replace(replace(replace(replace(telefono, 'Á', 'á'), 'É', 'é'), 'Í', 'í'), 'Ó', 'ó'), 'Ú', 'ú'), 'Ü', 'ü'), 'Ñ', 'ñ'))),
  email = lower(trim(replace(replace(replace(replace(replace(replace(replace(email, 'Á', 'á'), 'É', 'é'), 'Í', 'í'), 'Ó', 'ó'), 'Ú', 'ú'), 'Ü', 'ü'), 'Ñ', 'ñ'))),
  referido = lower(trim(replace(replace(replace(replace(replace(replace(replace(referido, 'Á', 'á'), 'É', 'é'), 'Í', 'í'), 'Ó', 'ó'), 'Ú', 'ú'), 'Ü', 'ü'), 'Ñ', 'ñ')));
