DROP TABLE IF EXISTS users.tb_users


-- Ejemplo de inserción manual para el primer administrador
INSERT INTO users.tb_users (email, nombre, apellido, password_hash, rol, is_verified) 
VALUES ('admin@admin.com', 'admin', 'principal', 'Milanesa01', 'admin', true);

-- Creamos un tipo personalizado para los roles
CREATE TYPE users.user_role AS ENUM ('admin', 'user');

CREATE TABLE users.tb_users (
    usuario_id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
	apellido TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL, 
    rol users.user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users.tb_presupuestos (
    presupuesto_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    cliente_nombre VARCHAR(100),
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- La "Foto del Momento": Aquí congelamos precios y configuraciones
    ajustes_aplicados JSONB NOT NULL, 
    
    -- Los totales se guardan como columnas fijas para facilitar reportes rápidos
    subtotal DECIMAL(12, 2),
    total DECIMAL(12, 2),
    
    CONSTRAINT fk_usuario 
        FOREIGN KEY(usuario_id) 
        REFERENCES data.usuarios(usuario_id)
        ON DELETE CASCADE
);




CREATE TABLE users.configuraciones_usuario (
    config_id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL, -- Un solo set de ajustes por usuario
    
    -- Ajustes técnicos (puedes agregar los que necesites)
    precio_aluminio_kg DECIMAL(12, 2) DEFAULT 0.00,
    precio_vidrio_m2 DECIMAL(12, 2) DEFAULT 0.00,
    porcentaje_ganancia DECIMAL(5, 2) DEFAULT 1.30, -- Ejemplo: 1.30 es 30%
    valor_dolar_referencia DECIMAL(12, 2) DEFAULT 1.00,
    desperdicio_material DECIMAL(5, 2) DEFAULT 1.10, -- 10% de desperdicio
    
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_config 
        FOREIGN KEY (usuario_id) 
        REFERENCES data.usuarios(usuario_id) 
        ON DELETE CASCADE
);