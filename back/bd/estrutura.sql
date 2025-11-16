DROP DATABASE IF EXISTS motorlab;

CREATE DATABASE IF NOT EXISTS motorlab CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE motorlab;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf CHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(70) NOT NULL,
    email VARCHAR(70) NOT NULL,
    sal CHAR(32) NOT NULL,
    senha CHAR(128) NOT NULL,
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
    placa CHAR(7) NOT NULL UNIQUE,
    chassi CHAR(17) NOT NULL UNIQUE,
    fabricante VARCHAR(30) NOT NULL,
    modelo VARCHAR(70) NOT NULL,
    ano INT NOT NULL,
    quilometragem INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(70) NOT NULL,
    valor_mao_obra DECIMAL(10,2) NOT NULL,
    execucao_minutos INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE tarefa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    servico_id INT NOT NULL,
    descricao VARCHAR(70) NOT NULL,
    ordenacao INT NOT NULL,
    FOREIGN KEY (servico_id) REFERENCES servico(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    titulo VARCHAR(30) NOT NULL, 
    fabricante VARCHAR(30) NOT NULL,
    descricao VARCHAR(70) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL,
    estoque_minimo INT NOT NULL,
    localizacao VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE os (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    veiculo_id INT NOT NULL,
    usuario_criacao INT NOT NULL,
    usuario_responsavel INT NOT NULL,
    status ENUM('PROVISORIA', 'ANDAMENTO', 'ALERTA', 'CONCLUIDA', 'FINALIZADA', 'CANCELADA') NOT NULL,
    data_hora_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_hora_finalizacao DATETIME DEFAULT NULL,
    previsao_entrega_sugerida DATETIME NOT NULL,
    previsao_entrega DATETIME NOT NULL,
    valor_mao_obra_sugerido DECIMAL(10,2) DEFAULT 0.00,
    valor_mao_obra DECIMAL(10,2) DEFAULT 0.00,
    valor_estimado_sugerido DECIMAL(10,2) DEFAULT 0.00,
    valor_estimado DECIMAL(10,2) DEFAULT 0.00,
    valor_final DECIMAL(10,2) DEFAULT 0.00,
    observacoes TEXT,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE RESTRICT,
    FOREIGN KEY (veiculo_id) REFERENCES veiculo(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_criacao) REFERENCES usuario(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_responsavel) REFERENCES usuario(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE os_servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    servico_id INT NOT NULL,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servico(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE os_tarefa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_servico_id INT NOT NULL,
    descricao VARCHAR(70) NOT NULL,
    ordenacao INT NOT NULL,
    FOREIGN KEY (os_servico_id) REFERENCES os_servico(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE os_custo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    item_id INT DEFAULT NULL,
    os_servico_id INT DEFAULT NULL,
    os_tarefa_id INT DEFAULT NULL, 
    tipo ENUM('ITEM', 'EXTRA') NOT NULL,
    descricao VARCHAR(70),
    quantidade INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (os_tarefa_id) REFERENCES os_tarefa(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE laudo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    resumo TEXT NOT NULL,
    recomendacoes TEXT NOT NULL,
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