-- Bảng roles
CREATE TABLE roles (
                       id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Bảng projects
CREATE TABLE projects (
                          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          project_name VARCHAR(255) NOT NULL,
                          application_domain VARCHAR(255) NOT NULL,
                          description TEXT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng domains (thêm project_id thay cho project_domains)
CREATE TABLE domains (
                         id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                         project_id INT REFERENCES projects(id) ON DELETE CASCADE,
                         domain_name VARCHAR(255) NOT NULL UNIQUE,
                         description TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng promts (liên kết trực tiếp với projects)
CREATE TABLE promts (
                        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        promt_name VARCHAR(255) NOT NULL,
                        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
                        promt_status INT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bot_configurations
CREATE TABLE bot_configurations (
                                    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                    promts_id INT REFERENCES promts(id) ON DELETE CASCADE,
                                    personality VARCHAR(255),
                                    start_suggestions TEXT,
                                    greeting TEXT,
                                    application_domains TEXT[],
                                    header_title VARCHAR(255),
                                    header_title_color VARCHAR(7),
                                    background_color VARCHAR(7),
                                    logo VARCHAR(255),
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng file_uploads
CREATE TABLE file_uploads (
                              id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                              promt_id INT REFERENCES promts(id) ON DELETE CASCADE,
                              file_name VARCHAR(255) NOT NULL,
                              file_size INT,
                              status VARCHAR(50),
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng users
CREATE TABLE users (
                       id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       role_id INT REFERENCES roles(id) ON DELETE SET NULL,
                       project_id INT REFERENCES user_projects(id) ON DELETE SET NULL,
                       gender INT,
                       birth TIMESTAMP,
                       image VARCHAR(500),
                       phone_number VARCHAR(500),
                       status_id INT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng access_logs
CREATE TABLE access_logs (
                             id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                             user_id INT REFERENCES users(id) ON DELETE CASCADE,
                             ip_address INET NOT NULL,
                             message TEXT,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tokens
CREATE TABLE tokens (
                        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        user_id INT REFERENCES users(id) ON DELETE CASCADE,
                        refresh_token VARCHAR(1000) NOT NULL,
                        expired_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);
