Al revisar el código, y validandolo frente a la lógica que implemente al desarrollar el caso, lo encuentro no en el código como tal, si no, más en la forma en que se estructuro el modelo de datos.

El problema de fondo está en tratar status como un dato guardado cuando en realidad es algo que cambia solo con el tiempo, sin que nadie toque el registro, por tanto, el filtro por expiration_date < today funciona bien, pero traer status desde la base de datos asume que ese valor sigue siendo cierto hoy, y eso no siempre es verdad. Una póliza guardada la semana pasada como activa puede estar vencida hoy sin que nadie la haya actualizado.

El estado de una póliza no es un atributo fijo, depende de cuándo se consulta: la misma fecha de vencimiento significa una cosa hoy y otra en 30 días. Guardarlo en la base de datos es guardar una foto de algo que se mueve. Si el asesor ve ese status en pantalla y toma decisiones con él, puede estar trabajando con información incorrecta sin saberlo.

La corrección es simple en concepto: no leer status de la base de datos, calcularlo en el momento de la consulta con la fecha de vencimiento y la fecha actual.