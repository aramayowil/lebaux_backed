DROP TABLE IF EXISTS users.tb_users


-- Ejemplo de inserción manual para el primer administrador
INSERT INTO users.tb_users (email, nombre, apellido, password_hash, rol, is_verified) 
VALUES ('admin@admin.com', 'admin', 'principal', 'Milanesa01', 'admin', true);

-- Creamos un tipo personalizado para los roles
CREATE TYPE users.user_role AS ENUM ('admin', 'user');

CREATE TABLE users.tb_users (
    -- Datos básicos de identidad
    usuario_id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL, 
    role users.user_role DEFAULT 'user',

    -- Seguridad y Verificación de Email
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    token_expires_at TIMESTAMP,

    -- Control de Experiencia de Usuario (UX)
    welcome_shown BOOLEAN DEFAULT FALSE,
    last_version_seen TEXT DEFAULT '1.0.0',

    -- Tiempos y Auditoría (Estandarizado)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Reemplaza a fecha_creacion
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- LA COLUMNA QUE FALTABA
    last_login TIMESTAMP
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