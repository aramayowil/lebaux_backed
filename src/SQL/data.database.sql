CREATE SCHEMA IF NOT EXISTS data;

ALTER TABLE IF EXISTS data."LINEAS"
    OWNER to postgres;

-- 1. Tabla de Líneas
CREATE TABLE lineas (
    id SERIAL PRIMARY KEY, -- Índice automático (B-Tree)
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE data.aberturas (
    -- ID único y autoincremental
    abertura_id SERIAL PRIMARY KEY,
    
    -- Relación con la línea (Modena, A30, etc.)
    linea_id INTEGER NOT NULL,
    
    -- Nombre técnico del producto
    denominacion VARCHAR(100) NOT NULL, 
    
    -- Código corto único (ej: VC, PF, PR)
    codigo_tecnico VARCHAR(10) UNIQUE NOT NULL,

    -- Restricciones de integridad
    CONSTRAINT fk_lineas_aberturas 
        FOREIGN KEY (linea_id) 
        REFERENCES data.lineas(id) 
        ON DELETE CASCADE
);

-- Índice para optimizar la búsqueda por familia de productos
CREATE INDEX idx_aberturas_linea_fk ON data.aberturas(linea_id);

-- El índice también se vuelve más descriptivo
CREATE INDEX idx_aberturas_linea_fk ON data.aberturas(linea_id);

-- 3. Tabla de Variantes
CREATE TABLE data.variantes (
    -- ID específico para evitar confusiones en JOINs
    variante_id SERIAL PRIMARY KEY,
    
    -- Relación técnica con la tabla de aberturas
    abertura_id INTEGER NOT NULL,
    
    -- 'tab_label' es un nombre muy de frontend. 
    -- 'denominacion' o 'nombre_tecnico' es más apropiado para la DB.
    nombre_tecnico VARCHAR(100) NOT NULL,
    
    -- Detalles técnicos extensos
    descripcion TEXT NOT NULL,
    
    -- Ruta de la imagen o plano técnico
    imagen_url TEXT NOT NULL,

    -- Clave Foránea (Foreign Key)
    CONSTRAINT fk_aberturas_variantes 
        FOREIGN KEY (abertura_id) 
        REFERENCES data.aberturas(abertura_id) 
        ON DELETE CASCADE
);

-- Índice para acelerar la carga de variantes de una abertura
CREATE INDEX idx_variantes_abertura_fk ON data.variantes(abertura_id);