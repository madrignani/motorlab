CREATE DATABASE IF NOT EXISTS motorlab CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE motorlab;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf CHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(70) NOT NULL,
    password VARCHAR(255) NOT NULL,
    cargo ENUM('ATENDENTE', 'MECANICO', 'GERENTE') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf CHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(70) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(70) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE veiculo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    placa CHAR(7) NOT NULL,
    chassi CHAR(17) NOT NULL,
    marca VARCHAR(30) NOT NULL,
    modelo VARCHAR(70) NOT NULL,
    ano INT NOT NULL,
    quilometragem INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(30) NOT NULL, 
    descricao VARCHAR(70) NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL,
    estoque_minimo INT NOT NULL,
    localizacao VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE os (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    veiculo_id INT NOT NULL,
    usuario_criacao INT NOT NULL,
    usuario_responsavel INT NOT NULL,
    status ENUM('PROVISORIA', 'ANDAMENTO', 'ALERTA', 'CONCLUIDA', 'FINALIZADA', 'CANCELADA') NOT NULL,
    data_hora_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_estimado DECIMAL(10,2) DEFAULT 0.00,
    valor_final DECIMAL(10,2),
    observacoes TEXT,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE RESTRICT,
    FOREIGN KEY (veiculo_id) REFERENCES veiculo(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_criacao) REFERENCES usuario(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_responsavel) REFERENCES usuario(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE os_custo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    item_id INT DEFAULT NULL,
    tipo ENUM('SERVICO', 'ITEM', 'EXTRA') NOT NULL,
    descricao VARCHAR(70),
    quantidade INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE laudo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    resumo TEXT,
    recomendacoes TEXT,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pagamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    usuario_responsavel INT NOT NULL,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(30) NOT NULL,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_responsavel) REFERENCES usuario(id) ON DELETE RESTRICT
) ENGINE=InnoDB;