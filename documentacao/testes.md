# Guia de Testes Automatizados

A estratégia de testes do projeto Adote-Fácil é dividida em duas camadas principais, seguindo as melhores práticas da pirâmide de testes:

1.  **Testes Unitários e de Integração (com Jest):** Uma base sólida de testes rápidos que validam as regras de negócio e a lógica interna da aplicação de forma isolada.
2.  **Testes de Aceitação / Ponta-a-Ponta (com Cypress):** Testes que simulam a jornada completa de um usuário na aplicação, garantindo que os fluxos críticos funcionem como esperado do início ao fim.

---

## 1. Testes Unitários e de Integração (Jest)

Esta camada é responsável por garantir a qualidade e o comportamento esperado da lógica de negócio na camada de serviços (`services`).

### Análise Crítica da Suíte de Testes Existente

A suíte de testes unitários do projeto é de alta qualidade, moderna e segue as melhores práticas de desenvolvimento, como o uso de mocks e injeção de dependência. A análise a seguir detalha os pontos fortes e sugere refinamentos para um nível de excelência ainda maior.

#### Pontos Fortes

* **Isolamento Perfeito com Mocks:** O uso da biblioteca `jest-mock-extended` para simular os repositórios garante que os testes de serviço sejam rápidos, confiáveis e completamente isolados do banco de dados.
* **Aplicação Clara de Injeção de Dependência:** Os serviços recebem suas dependências (repositórios) via construtor, um exemplo claro de Injeção de Dependência que torna o código modular e altamente testável.
* **Cobertura de Casos de Uso:** Os testes validam não apenas o "caminho feliz", mas também regras de negócio importantes e cenários de falha (ex: um usuário tentando criar um chat consigo mesmo).
* **Estrutura Clara e Legível:** A organização dos testes segue o padrão Arrange-Act-Assert e utiliza nomes descritivos, facilitando o entendimento e a manutenção.

#### Sugestões de Melhoria

* **Ampliar a Cobertura para Outras Camadas:** A cobertura de testes atual, embora de 100% para os arquivos testados, foca-se exclusivamente na camada de serviços. Uma melhoria significativa seria a criação de testes para as camadas de `controllers` (validando o tratamento de requisições HTTP) e `repositories` (testes de integração com um banco de dados de teste).
* **Utilizar `beforeEach` para Isolamento Total entre Testes:** Os testes atuais usam `beforeAll`, que é eficiente. O uso de `beforeEach` reiniciaria os mocks antes de cada teste, garantindo 100% de isolamento e prevenindo que um teste possa, acidentalmente, influenciar o resultado de outro.
* **Melhorar a Tipagem dos Mocks:** A presença de comentários `// @ts-expect-error` indica uma pequena divergência de tipos entre os mocks e os objetos reais. A criação de "Mock Factories" (funções que geram objetos de mock com a tipagem correta) poderia resolver isso, tornando os testes ainda mais seguros.

### Como Executar os Testes Unitários

1.  Navegue até a pasta do backend no seu terminal.
    ```bash
    cd backend
    ```
2.  Certifique-se de que as dependências estão instaladas.
    ```bash
    npm install
    ```
3.  Execute a suíte de testes.
    ```bash
    npm test
    ```
4.  Para gerar o relatório de cobertura de código, use a flag `--coverage`.
    ```bash
    npm test -- --coverage
    ```

---

## 2. Testes de Aceitação / Ponta-a-Ponta (Cypress)

Estes testes validam os fluxos principais da aplicação sob a perspectiva do usuário final, utilizando um navegador real automatizado.

### Cenários de Teste (Exemplos)

A seguir, a descrição em linguagem natural dos principais cenários cobertos.

#### Cenário 1: Login de Usuário Bem-Sucedido (`login.cy.js`)
* **Dado** que eu sou um usuário cadastrado
* **E** estou na página de login
* **Quando** eu preencho o campo de e-mail e senha com minhas credenciais válidas
* **E** clico no botão "Entrar"
* **Então** eu devo ser redirecionado para a página inicial de animais
* **E** devo ver uma mensagem de boas-vindas

#### Cenário 1.1: Tentativa de Login com Credenciais Inválidas (cenário alternativo)
* **Dado** que eu sou um usuário cadastrado e estou na página de login
* **Quando** eu preencho o campo de e-mail com um e-mail válido
* **E** preencho o campo de senha com uma senha incorreta
* **E** clico no botão "Entrar"
* **Então** eu devo permanecer na página de login
* **E** devo ver uma mensagem de erro com "A senha deve conter no mínimo 8 caracteres"

#### Cenário 2: Cadastro Bem-Sucedido de um Novo Animal (`cadastroAnimal.cy.js`)
* **Dado** que eu sou um usuário autenticado e estou na página principal
* **Quando** eu clico em "Disponibilizar animal para adoção"
* **E** preencho o formulário de cadastro do animal com dados válidos (nome "Linux", tipo "Cachorro", etc.)
* **E** anexo uma foto do animal
* **E** clico no botão "Cadastrar"
* **Então** o animal "Linux" deve ser listado com sucesso na minha página de "Meus animais disponíveis para adoção"

#### Cenário 2.1: Tentativa de Cadastro com Campo Obrigatório Vazio (cenário alternativo)
* **Dado** que eu sou um usuário autenticado e estou na página de cadastro de animais
* **Quando** eu preencho o formulário, mas deixo o campo "Nome" em branco
* **E** clico no botão "Cadastrar"
* **Então** eu devo permanecer na página de cadastro
* **E** devo ver uma mensagem de erro indicando que o nome é obrigatório

#### Cenário 3: Edição de Dados do Perfil (`editarDados.cy.js`)
* **Dado** que estou logado no sistema
* **E** navego até a minha página de perfil
* **Quando** eu altero meu nome e clico em "Salvar"
* **Então** devo ver uma mensagem de "Dados atualizados com sucesso!"
* **E** o novo nome deve ser exibido na página

#### Cenário 3.1: Tentativa de Edição com Dado Inválido (cenário alternativo)
* **Dado** que estou logado no sistema e na minha página de "Editar dados pessoais"
* **Quando** eu apago o meu nome, deixando o campo em branco
* **E** clico em "Salvar alterações"
* **Então** eu devo permanecer na página de edição
* **E** devo ver uma mensagem de erro indicando que o nome não pode ser vazio.

### Como Executar os Testes E2E

Antes de rodar os testes, é necessário que o sistema possua um usuário de teste cadastrado. Certifique-se de que a aplicação esteja rodando em um terminal separado (`docker compose up`) e crie um usuário com as seguintes credenciais através da interface de cadastro:
- E-mail: `usuario@mail.com`
- Senha: `12345678`

#### Execução 
Diferente dos testes unitários, os comandos do Cypress devem ser executados a partir da pasta raiz do projeto (a pasta `adote-facil`), não da pasta `backend`.


#### 1. Modo Interativo (com interface)
Abre o Cypress Test Runner, onde você pode ver os testes sendo executados no navegador em tempo real:

```bash
npx cypress open
```
Depois, selecione a opção **E2E Testing** e escolha o navegador desejado.

### 2. Modo Headless (sem interface)
Executa todos os testes diretamente no terminal:

```bash
npx cypress run
```
---
## Estrutura de Pastas

- `cypress/e2e/` → contém os testes de ponta a ponta (E2E).
  - `login.cy.js` → testes de login.
  - `cadastroAnimal.cy.js` → testes de cadastro de animal.
  - `editarDados.cy.js` → testes de edição de perfil.
- `cypress/fixtures/` → dados simulados (mock) para usar nos testes.
- `cypress/support/` → configurações e comandos customizados.

---